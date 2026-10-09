// Скриншоты тиров и домашек (30…39-*.png):
// node scripts/shots/homework.mjs [baseUrl]
// Как и e2e, рассчитан на сборку с VITE_REVIEW_MODE=false (закрытые тиры и «Тест на уровень»).
import { chromium } from 'playwright'
import { BASE, watch, login } from '../e2e/lib/solver.mjs'
import { playHomework, playPlacement, unlockAll, send, doAction, readProgress } from '../e2e/lib/vibe.mjs'
import { OUT } from './out.mjs'

const errors = []
const browser = await chromium.launch()

const save = async (page, name, opts = {}) => {
  await page.waitForTimeout(600)
  await page.screenshot({ path: OUT + name, ...opts })
  console.log('saved', name)
}
const go = (page, hash) => page.evaluate((h) => (location.hash = h), hash)
const instant = (page) => page.evaluate(() => (document.documentElement.style.scrollBehavior = 'auto'))
const scrollToEl = (page, sel, offset = 0) =>
  page.evaluate(
    ([q, off]) => {
      document.documentElement.style.scrollBehavior = 'auto'
      const el = document.querySelector(q)
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off)
    },
    [sel, offset],
  )
async function noOverflow(page, where) {
  const w = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
  if (w[0] > w[1]) errors.push(`[overflow] ${where}: ${w[0]} > ${w[1]}`)
}
const chatToBottom = (page) => page.evaluate(() => document.querySelector('[data-chat]')?.scrollTo(0, 1e6))

// ---------- 30–32: путь с тирами, попап закрытого узла, тест на уровень (десктоп) ----------
const desk = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 })
const p = await desk.newPage()
watch(p, errors)
await login(p)
await instant(p)
// высокий кадр: конец тира Новичок (домашка + сундук), баннер закрытого тира Средний и серые узлы раздела 3
await p.setViewportSize({ width: 1280, height: 1180 })
await scrollToEl(p, '[data-lesson="hw2"]', 300)
await noOverflow(p, 'desktop tiers')
await save(p, '30-tiers-path.png')
await p.setViewportSize({ width: 1280, height: 800 })

await scrollToEl(p, '[data-lesson="u3-2"]', 260)
await p.locator('[data-lesson="u3-2"] > div > button').click()
await save(p, '31-locked-popover.png')
await p.keyboard.press('Escape')

await p.locator('[data-tier="mid"]').getByRole('button', { name: 'Тест на уровень' }).click()
await p.waitForSelector('[data-placement="intro"]')
await playPlacement(p, 'mid', {
  correct: 8,
  hooks: {
    beforeCheck: async (ex, i) => {
      if (i === 2) await save(p, '32-placement-test.png')
    },
  },
})
await noOverflow(p, 'placement result')
await save(p, '32b-placement-passed.png')

// ---------- 33–37: домашки (десктоп, высокий экран) ----------
const tall = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1280, height: 960 }, deviceScaleFactor: 2 })
const t = await tall.newPage()
watch(t, errors)
await login(t)
await unlockAll(t)
await instant(t)

// 33: старт домашки «Лендинг кофейни» — расплывчатый промпт → серый шаблон и разбор Бипи
await go(t, '/homework/hw2')
await t.waitForSelector('[data-homework="hw2"]')
await t.locator('#hw-prompt').fill('Сделай сайт')
await send(t)
await t.locator('[data-blocks] button').filter({ hasText: /^\+ Лендинг кофейни$/ }).click()
await t.locator('[data-blocks] button').filter({ hasText: /^\+ Меню с ценами$/ }).click()
await t.evaluate(() => window.scrollTo(0, 0))
await chatToBottom(t)
await noOverflow(t, 'hw2 start')
await save(t, '33-homework-landing-start.png')

// 34: всё выполнено — богатое превью (десктопный режим после проверки на телефоне)
await t.getByRole('button', { name: '↺ Заново' }).click()
await playHomework(t, 'hw2', { submit: false })
await t.locator('section[aria-label="Превью результата"]').getByRole('button', { name: '🖥 Компьютер' }).click()
await t.evaluate(() => window.scrollTo(0, 0))
await chatToBottom(t)
await noOverflow(t, 'hw2 done')
await save(t, '34-homework-landing-done.png')

// 35: отладка — ИИ просит код, затем чинит; превью работает
await go(t, '/homework/hw3')
await t.waitForSelector('[data-homework="hw3"]')
await playHomework(t, 'hw3', { submit: false })
await t.evaluate(() => window.scrollTo(0, 0))
await chatToBottom(t)
await noOverflow(t, 'hw3')
await save(t, '35-homework-debug.png')

// 36: форма + таблица, с «утечкой» ключа по дороге
await go(t, '/homework/hw4')
await t.waitForSelector('[data-homework="hw4"]')
for (const b of ['Форма отзывов', 'Поля формы', 'Таблица feedback', 'Валидация', 'Вставить мой ключ']) await t.locator('[data-blocks] button').filter({ hasText: new RegExp(`^\\+ ${b}$`) }).click()
await send(t)
await t.locator('#hw-prompt').fill('Убери ключ из кода: ключ Supabase бери из переменной окружения в .env, не пиши его в коде.')
await send(t)
await doAction(t, 'submitForm')
const pv = t.locator('section[aria-label="Превью результата"]')
await pv.getByLabel('Имя', { exact: true }).fill('Лиза')
await pv.getByLabel('Email', { exact: true }).fill('liza@example.com')
await pv.getByLabel('Сообщение', { exact: true }).fill('Уютно и вкусно')
await pv.getByRole('button', { name: 'Отправить отзыв' }).click()
await t.evaluate(() => window.scrollTo(0, 0))
await chatToBottom(t)
await noOverflow(t, 'hw4')
await save(t, '36-homework-backend.png')

// 37: деплой — живой сайт на своём домене
await go(t, '/homework/hw5')
await t.waitForSelector('[data-homework="hw5"]')
await playHomework(t, 'hw5', { submit: false })
await pv.getByLabel('Ссылка на мой проект').fill('https://zerno-coffee.vercel.app')
await pv.getByRole('button', { name: 'Сохранить' }).click()
await t.evaluate(() => window.scrollTo(0, 0))
await chatToBottom(t)
await noOverflow(t, 'hw5')
await save(t, '37-homework-deploy.png')

// ---------- 38: домашка на телефоне ----------
const mob = await browser.newContext({ locale: 'ru-RU', viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const m = await mob.newPage()
watch(m, errors)
await login(m)
await unlockAll(m)
await instant(m)
await go(m, '/homework/hw2')
await m.waitForSelector('[data-homework="hw2"]')
for (const b of ['Лендинг кофейни', 'Первый экран', 'Меню с ценами', 'Кнопка брони']) await m.locator('[data-blocks] button').filter({ hasText: new RegExp(`^\\+ ${b}$`) }).click()
await send(m)
await doAction(m, 'viewMobile')
await m.evaluate(() => window.scrollTo(0, 0))
await chatToBottom(m)
await noOverflow(m, 'hw2 mobile')
await save(m, '38-homework-mobile.png', { fullPage: true })

// ---------- 39: экран «Тир пройден!» (по-честному: досдаём последнюю домашку тира Новичок) ----------
const tu = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 })
const u = await tu.newPage()
watch(u, errors)
await login(u)
await u.evaluate(() => {
  const pr = JSON.parse(localStorage.getItem('vaibik.progress'))
  const lessons = ['u1-1', 'u1-2', 'u1-3', 'u1-4', 'u1-5', 'u1-6', 'u2-1', 'u2-2', 'u2-3', 'u2-4', 'u2-5', 'u2-6']
  localStorage.setItem('vaibik.progress', JSON.stringify({ ...pr, completed: lessons, homework: ['hw1'], placementSeen: true }))
})
await u.reload()
await u.waitForSelector('[data-lesson]')
await go(u, '/homework/hw2')
await playHomework(u, 'hw2')
await u.locator('footer').getByRole('button', { name: 'Продолжить', exact: true }).click()
await u.waitForSelector('[data-tier-up="novice"]')
await noOverflow(u, 'tier-up')
await save(u, '39-tier-up.png')
await u.locator('footer').getByRole('button').click()
await u.waitForSelector('[data-lesson]')
const pr = await readProgress(u)
if (!pr.tiersCelebrated.includes('novice')) errors.push('tier-up: novice not celebrated')

await browser.close()
console.log(errors.length ? 'CONSOLE/LAYOUT ISSUES:\n' + errors.join('\n') : 'No console errors/warnings, no overflow')
console.log('base', BASE)
