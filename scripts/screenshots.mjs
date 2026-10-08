// Снимает скриншоты прототипа: node scripts/screenshots.mjs [baseUrl]
// Ответы берутся из данных курса (scripts/lib/solver.mjs), поэтому скрипт не ломается при правке текстов.
import { chromium } from 'playwright'
import { BASE, watch, playLesson, openLessonFromPath, pick, findLesson } from './lib/solver.mjs'

const OUT = new URL('../screenshots/', import.meta.url).pathname
const errors = []

const browser = await chromium.launch()

const shot = async (page, name) => {
  await page.waitForTimeout(450)
  await page.screenshot({ path: OUT + name })
  console.log('saved', name)
}
const btn = (page, name) => page.getByRole('button', { name, exact: typeof name === 'string' })

async function openLogin(page) {
  await page.goto(BASE + '/#/login')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()
  await page.waitForSelector('text=С возвращением!')
}

// ---------- Desktop ----------
const desk = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 })
const p = await desk.newPage()
watch(p, errors)
await openLogin(p)
await shot(p, '01-login.png')
await btn(p, 'Войти').click()
await shot(p, '01b-login-validation.png')
await p.getByPlaceholder('you@example.com').fill('aidar@example.com')
await p.getByPlaceholder('••••••••').fill('secret123')
await btn(p, 'Войти').click()
await p.waitForSelector('[data-lesson]')
await p.waitForTimeout(600)
await shot(p, '02-home.png')

// Попап текущего урока
await p.locator('[data-lesson="u1-4"] > div > button').click()
await shot(p, '02b-home-popover.png')
await p.keyboard.press('Escape')

// Итоговый тест раздела 1 — в нём все 4 типа упражнений. Арранж (шаг 1) — намеренно неверно.
const seen = new Set()
await openLessonFromPath(p, 'u1-6')
await playLesson(p, 'u1-6', {
  wrongAt: [1],
  hooks: {
    beforeCheck: async (ex, step, wrong) => {
      const key = ex.kind + (wrong ? '-wrong' : '')
      if (seen.has('b:' + key)) return
      seen.add('b:' + key)
      if (ex.kind === 'choice') await shot(p, '03-lesson-question.png')
      if (ex.kind === 'arrange' && wrong) await shot(p, '03b-lesson-arrange.png')
      if (ex.kind === 'fill') await shot(p, '03c-lesson-fill.png')
      if (ex.kind === 'bug') await shot(p, '03d-lesson-bug.png')
    },
    afterCheck: async (ex, step, wrong) => {
      const key = ex.kind + (wrong ? '-wrong' : '')
      if (seen.has('a:' + key)) return
      seen.add('a:' + key)
      if (ex.kind === 'choice') await shot(p, '04-lesson-feedback.png')
      if (ex.kind === 'arrange' && wrong) await shot(p, '04b-lesson-feedback-wrong.png')
      if (ex.kind === 'bug') await shot(p, '04c-lesson-bug-correct.png')
    },
  },
})
await p.getByText(/^(Урок пройден!|Безупречно!)$/).waitFor()
await p.waitForTimeout(900)
await shot(p, '05-lesson-complete.png')
await btn(p, 'Продолжить').click()
await p.waitForSelector('[data-lesson]')
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
watch(m, errors)
await openLogin(m)
await shot(m, '07b-login-mobile.png')
await m.getByPlaceholder('you@example.com').fill('aidar@example.com')
await m.getByPlaceholder('••••••••').fill('secret123')
await btn(m, 'Войти').click()
await m.waitForSelector('[data-lesson]')
await m.waitForTimeout(600)
await shot(m, '07-home-mobile.png')
await openLessonFromPath(m, 'u1-4')
const first = findLesson('u1-4').exercises[0]
await pick(m, first)
await btn(m, 'Проверить').click()
await shot(m, '07c-lesson-mobile.png')

await browser.close()
console.log(errors.length ? 'CONSOLE ISSUES:\n' + errors.join('\n') : 'No console errors/warnings')
