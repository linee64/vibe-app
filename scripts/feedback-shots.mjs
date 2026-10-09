// Скриншоты отзывов и экрана ошибки: node scripts/feedback-shots.mjs [baseUrl]
// 70 — лист «Отзыв» (десктоп), 71 — он же на 375px, 72 — микро-опрос после первого урока,
// 73 — «Что остановило?» после пейвола, 74 — экран «Бипи споткнулся».
import { chromium } from 'playwright'
import { BASE, login, playLesson, watch } from './lib/solver.mjs'

const OUT = new URL('../screenshots/', import.meta.url).pathname
const errors = []
const browser = await chromium.launch()
const shot = async (page, name, opts = {}) => {
  await page.waitForTimeout(500)
  await page.screenshot({ path: OUT + name, ...opts })
  console.log('saved', name)
}
const noMicro = (page) => page.evaluate(() => localStorage.setItem('vaibik.fb.micro', JSON.stringify({ pending: null, pendingAt: 0, shown: {}, lastShownAt: Date.now() })))

// ---------- 70: десктоп ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 })
  const p = await ctx.newPage()
  watch(p, errors)
  await login(p)
  await noMicro(p)
  await p.click('[data-feedback-open="sidebar"]')
  await p.waitForSelector('[data-feedback-sheet]')
  await p.click('[data-rating="4"]')
  await p.click('[data-chip="idea"]')
  await p.fill('[data-feedback-text]', 'Хочу больше упражнений про деплой и тёмную тему для вечерних уроков 🙂')
  await p.getByText('что это?').click()
  await shot(p, '70-feedback-sheet.png')
  await p.click('[data-feedback-send]')
  await p.waitForSelector('[data-feedback-thanks]')
  const stored = await p.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('vaibik.fb')))
  console.log('demo storage keys:', stored.join(', '))

  // ---------- 74: экран ошибки ----------
  await p.evaluate(() => localStorage.setItem('vaibik.debug', '1'))
  await p.goto(BASE + '/#/debug/crash')
  await p.reload()
  await p.waitForSelector('[data-error-fallback]')
  await shot(p, '74-error-fallback.png')
  await p.evaluate(() => localStorage.removeItem('vaibik.debug'))
  await ctx.close()
}

// ---------- 71, 72, 73: телефон 375 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const p = await ctx.newPage()
  watch(p, errors)
  await login(p)
  await noMicro(p)
  await p.click('[data-feedback-open="header"]')
  await p.waitForSelector('[data-feedback-sheet]')
  await p.click('[data-rating="2"]')
  await p.click('[data-chip="hard"]')
  await p.fill('[data-feedback-text]', 'В уроке про пайплайн не понял, почему тесты идут до деплоя.')
  await shot(p, '71-feedback-mobile-web.png')

  // 72: первый урок с нуля → микро-опрос на пути
  await p.evaluate(() => {
    const pr = JSON.parse(localStorage.getItem('vaibik.progress') || '{}')
    pr.completed = []
    pr.perfect = []
    localStorage.setItem('vaibik.progress', JSON.stringify(pr))
    localStorage.removeItem('vaibik.fb.micro')
  })
  await p.goto(BASE + '/#/lesson/u1-1')
  await p.reload()
  await playLesson(p, 'u1-1')
  if (await p.locator('[data-micro-prompt]').count()) throw new Error('микро-опрос показан во время урока')
  await p.getByRole('button', { name: /Продолжить/ }).first().click()
  await p.waitForSelector('[data-micro-prompt="first_lesson"]', { timeout: 8000 })
  await p.click('[data-micro-prompt] [data-rating="5"]')
  await shot(p, '72-feedback-first-lesson.png')
  await p.getByRole('button', { name: 'Закрыть опрос' }).click()

  // 73: закрыли пейвол без покупки → «Что остановило?»
  await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('vaibik.fb.micro') || '{}')
    localStorage.setItem('vaibik.fb.micro', JSON.stringify({ ...s, pending: 'paywall_exit', pendingAt: Date.now(), lastShownAt: 0 }))
  })
  await p.goto(BASE + '/#/learn')
  await p.reload()
  await p.waitForSelector('[data-micro-prompt="paywall_exit"]', { timeout: 8000 })
  await p.click('[data-micro-prompt] [data-chip="price"]')
  await shot(p, '73-feedback-paywall-exit.png')
  await ctx.close()
}

await browser.close()
// намеренная ошибка #/debug/crash (React логирует её) — не считается
const real = errors.filter((e) => !e.includes('#/debug/crash') && !e.includes('CrashTest'))
if (real.length) {
  console.log('console errors:\n' + real.join('\n'))
  process.exit(1)
}
console.log('ok')
