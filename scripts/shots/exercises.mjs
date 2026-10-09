// Скриншоты фирменных упражнений и новой экономики (40…53-*.png):
// node scripts/shots/exercises.mjs [baseUrl]
import { chromium } from 'playwright'
import { BASE, watch, login, findLesson, currentExercise, pick, check, proceed } from '../e2e/lib/solver.mjs'
import { unlockAll } from '../e2e/lib/vibe.mjs'
import { OUT } from './out.mjs'

const errors = []
const browser = await chromium.launch()

const save = async (page, name, opts = {}) => {
  await page.waitForTimeout(650)
  await page.screenshot({ path: OUT + name, ...opts })
  console.log('saved', name)
}
const go = (page, hash) => page.evaluate((h) => (location.hash = h), hash)
const setProgress = async (page, patch) => {
  await page.evaluate((x) => {
    const p = JSON.parse(localStorage.getItem('vaibik.progress') || '{}')
    localStorage.setItem('vaibik.progress', JSON.stringify({ ...p, ...x }))
  }, patch)
  await page.reload()
  await page.waitForSelector('[data-lesson], main h1')
}
const at = (page, attr, i) => page.locator(`main [${attr}="${i}"]`).first()

/** Открыть урок и дойти (правильными ответами) до упражнения: по заголовку или по типу ({ kind }) */
async function goTo(page, lessonId, target) {
  const lesson0 = findLesson(lessonId)
  const title = typeof target === 'string' ? target : lesson0.exercises.find((e) => e.kind === target.kind && (!target.text || e.mode === 'text')).title
  await go(page, '/learn')
  await page.waitForSelector('[data-lesson]')
  await go(page, `/lesson/${lessonId}`)
  await page.waitForSelector('main h1')
  const lesson = findLesson(lessonId)
  for (let i = 0; i < 10; i++) {
    const ex = await currentExercise(page, lesson)
    if (ex.title === title) return ex
    await pick(page, ex)
    await check(page)
    await proceed(page)
    await page.waitForTimeout(150)
  }
  throw new Error(`Не дошёл до «${title}» в ${lessonId}`)
}
const top = (page) => page.evaluate(() => document.querySelector('main').scrollTo(0, 0))

// ---------- Desktop ----------
const desk = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 })
const p = await desk.newPage()
watch(p, errors)
await login(p)
await unlockAll(p)

// 40. Дуэль промптов: сторона и причина выбраны
let ex = await goTo(p, 'u1-3', { kind: 'duel' })
await at(p, 'data-side', ex.winner).click()
await at(p, 'data-reason', ex.reason).click()
await save(p, '40-ex-duel.png')

// 41. Предскажи результат
ex = await goTo(p, 'u1-1', { kind: 'predict' })
await at(p, 'data-outcome', ex.correct).click()
await save(p, '41-ex-predict.png')

// 42. Прокачай промпт: два улучшения из четырёх — стрелка Вайб-метра на полпути
ex = await goTo(p, 'u1-2', 'Прокачай промпт для кофейни')
const good = ex.chips.map((c, i) => (c.trap ? -1 : i)).filter((i) => i >= 0)
for (const i of good.slice(0, 2)) await at(p, 'data-chip', i).click()
await save(p, '42-ex-upgrade.png')

// 43. Следующий ход
ex = await goTo(p, 'u1-5', findLesson('u1-5').exercises[0].title)
await at(p, 'data-option', ex.correct).click()
await save(p, '43-ex-nextmove.png')

// 44. Ревью правок ИИ — после проверки (видно, почему правка опасна)
ex = await goTo(p, 'u4-2', 'Миграция от ИИ')
await pick(p, ex)
await check(p)
await top(p)
await save(p, '44-ex-diff-review.png')

// 45. Найди баг (код) и «Красный флаг» (текст ИИ)
ex = await goTo(p, 'u4-5', '«Спасибо!», а в таблице пусто')
await at(p, 'data-line', ex.correct).click()
await save(p, '45-ex-bug.png')
ex = await goTo(p, 'u5-3', 'Замочек в браузере')
await at(p, 'data-line', ex.correct).click()
await save(p, '45b-ex-red-flag.png')

// 46. Собери пайплайн: два шага уже на треке
ex = await goTo(p, 'u3-1', findLesson('u3-1').exercises.find((e) => e.kind === 'pipeline').title)
for (const c of [0, 1]) await p.locator(`main [data-bank] [data-card="${c}"]`).click()
await save(p, '46-ex-pipeline.png')

// ---------- Экономика (desktop) ----------
// 50. Подсказка за токены (Бипи пометил ловушку)
await setProgress(p, { hearts: 5, gems: 120 })
ex = await goTo(p, 'u2-1', findLesson('u2-1').exercises[0].title)
await p.locator('[data-hint-btn]').click()
await p.locator('main [data-hint]').waitFor()
await save(p, '50-eco-hint.png')

// 51. Мини-магазин токенов на главной
await go(p, '/learn')
await p.waitForSelector('[data-lesson]')
await p.locator('[data-eco="tokens"]:visible').first().click()
await save(p, '51-eco-shop.png')
await p.keyboard.press('Escape')

// 52–53. «Бипи на нуле» и разбор ошибки
await setProgress(p, { hearts: 1 })
ex = await goTo(p, 'u1-4', findLesson('u1-4').exercises[0].title)
await pick(p, ex, { wrong: true })
await check(p)
await p.locator('footer').getByRole('button', { name: 'Понятно', exact: true }).click()
await p.getByText('Бипи на нуле').waitFor()
await save(p, '52-eco-empty.png')
await p.locator('[data-empty="review"]').click()
await save(p, '53-eco-review.png')
await p.locator('[data-empty="done"]').click()

// 48. Лендинг: демо «Прокачай промпт»
const land = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 })
const l = await land.newPage()
watch(l, errors)
await l.goto(BASE + '/#/landing')
await l.waitForSelector('#demo')
await l.evaluate(() => document.fonts.ready)
await l.evaluate(async () => {
  document.documentElement.style.scrollBehavior = 'auto'
  const el = document.getElementById('demo')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 10)
  await new Promise((r) => setTimeout(r, 900))
})
const demo = findLesson('u1-2').exercises[0]
const dGood = demo.chips.map((c, i) => (c.trap ? -1 : i)).filter((i) => i >= 0)
for (const i of dGood.slice(0, 3)) await l.locator(`[data-demo] [data-chip="${i}"]`).click()
await l.evaluate(() => {
  document.querySelector('header').style.display = 'none' // липкая шапка перекрыла бы карточку
  document.getElementById('demo').scrollIntoView({ block: 'start' })
})
await l.waitForTimeout(700)
await save(l, '48-landing-demo.png')

// ---------- Mobile 375 ----------
const mob = await browser.newContext({ locale: 'ru-RU', viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const m = await mob.newPage()
watch(m, errors)
await login(m)
await unlockAll(m)
// 47. Мобильный экран с обратной связью (ошибка: выбрана ловушка)
ex = await goTo(m, 'u2-5', findLesson('u2-5').exercises.find((e) => e.kind === 'upgrade').title)
await pick(m, ex, { wrong: true })
await check(m)
await save(m, '47-ex-mobile.png')
// 49. Шапка экономики на телефоне: заряд 2 из 5, открыта панель заряда
await go(m, '/learn')
await setProgress(m, { hearts: 2 })
await m.waitForSelector('[data-lesson]')
await m.locator('[data-eco="charge"]:visible').first().click()
await save(m, '49-eco-header.png')
const w = await m.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
if (w[0] > w[1]) errors.push(`[overflow] mobile header: ${w[0]} > ${w[1]}`)

await browser.close()
console.log(errors.length ? 'CONSOLE/LAYOUT ISSUES:\n' + errors.join('\n') : 'No console errors/warnings, no overflow')
