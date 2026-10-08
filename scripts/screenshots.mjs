// Снимает скриншоты прототипа: node scripts/screenshots.mjs [baseUrl]
import { chromium } from 'playwright'

const BASE = process.argv[2] || 'http://localhost:5173'
const OUT = new URL('../screenshots/', import.meta.url).pathname
const errors = []

const browser = await chromium.launch()

function watch(page) {
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
}
const shot = async (page, name) => {
  await page.waitForTimeout(450)
  await page.screenshot({ path: OUT + name })
  console.log('saved', name)
}
const btn = (page, name) => page.getByRole('button', { name, exact: typeof name === 'string' })

async function login(page) {
  await page.goto(BASE + '/#/login')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForSelector('text=С возвращением!')
}

// ---------- Desktop ----------
const desk = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 })
const p = await desk.newPage()
watch(p)
await login(p)
await shot(p, '01-login.png')
await btn(p, 'Войти').click()
await shot(p, '01b-login-validation.png')
await p.getByPlaceholder('you@example.com').fill('aidar@example.com')
await p.getByPlaceholder('••••••••').fill('secret123')
await btn(p, 'Войти').click()
await p.waitForSelector('text=Первый промпт')
await p.waitForTimeout(600)
await shot(p, '02-home.png')

await p.getByRole('button', { name: 'Итерации вместо «с нуля»' }).click()
await shot(p, '02b-home-popover.png')
await btn(p, 'Начать +15 XP').click()
await p.waitForSelector('text=Какой промпт лучше?')

// 1. choice
await p.getByRole('button', { name: /одностраничный сайт/ }).click()
await shot(p, '03-lesson-question.png')
await btn(p, 'Проверить').click()
await shot(p, '04-lesson-feedback.png')
await btn(p, 'Продолжить').click()

// 2. arrange — сначала намеренно неверно
await p.waitForSelector('text=Собери понятный промпт')
await btn(p, 'Создай компонент формы входа').click()
await btn(p, 'Ты — опытный React-разработчик.').click()
await btn(p, 'Сделай как-нибудь.').click()
await shot(p, '03b-lesson-arrange.png')
await btn(p, 'Проверить').click()
await shot(p, '04b-lesson-feedback-wrong.png')
await btn(p, 'Понятно').click()

// 3. fill
await p.waitForSelector('text=Заполни пропуск')
await btn(p, 'итерировать').click()
await shot(p, '03c-lesson-fill.png')
await btn(p, 'Проверить').click()
await btn(p, 'Продолжить').click()

// 4. choice
await p.getByRole('button', { name: /Создание софта/ }).click()
await btn(p, 'Проверить').click()
await btn(p, 'Продолжить').click()

// 5. bug
await p.waitForSelector('text=Найди строку с ошибкой')
await p.getByRole('button', { name: /i <= prices.length/ }).click()
await shot(p, '03d-lesson-bug.png')
await btn(p, 'Проверить').click()
await shot(p, '04c-lesson-bug-correct.png')
await btn(p, 'Продолжить').click()

// повтор arrange — теперь верно
for (const t of ['Ты — опытный React-разработчик.', 'Создай компонент формы входа', 'с полями email и пароль', 'и показывай ошибки под полями.']) {
  await btn(p, t).click()
}
await btn(p, 'Проверить').click()
await btn(p, 'Продолжить').click()
await p.waitForSelector('text=Урок пройден!')
await p.waitForTimeout(900)
await shot(p, '05-lesson-complete.png')
await btn(p, 'Продолжить').click()
await p.waitForSelector('text=Первый промпт')
await shot(p, '02c-home-after-lesson.png')

await p.evaluate(() => (location.hash = '/leaderboard'))
await p.waitForSelector('text=Аметистовая лига')
await shot(p, '06-leaderboard.png')
await p.evaluate(() => (location.hash = '/profile'))
await p.waitForSelector('text=Достижения')
await shot(p, '06-profile.png')
await p.evaluate(() => (location.hash = '/quests'))
await shot(p, '06b-quests-soon.png')

// ---------- Mobile ----------
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const m = await mob.newPage()
watch(m)
await login(m)
await shot(m, '07b-login-mobile.png')
await m.getByPlaceholder('you@example.com').fill('aidar@example.com')
await m.getByPlaceholder('••••••••').fill('secret123')
await btn(m, 'Войти').click()
await m.waitForSelector('text=Первый промпт')
await m.waitForTimeout(600)
await shot(m, '07-home-mobile.png')
await m.getByRole('button', { name: 'Итерации вместо «с нуля»' }).click()
await btn(m, 'Начать +15 XP').click()
await m.getByRole('button', { name: /одностраничный сайт/ }).click()
await btn(m, 'Проверить').click()
await shot(m, '07c-lesson-mobile.png')

await browser.close()
console.log(errors.length ? 'CONSOLE ISSUES:\n' + errors.join('\n') : 'No console errors/warnings')
