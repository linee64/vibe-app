// Конец пути без «финиша»: блок «Исследуй дальше» и праздник последнего тира. node scripts/shots/explore.mjs [baseUrl]
// Прогресс подкладываем в localStorage: середина пути и «всё пройдено» (тир pro ещё не отпразднован).
import { chromium } from 'playwright'
import { login, watch } from '../e2e/lib/solver.mjs'
import { OUT } from './out.mjs'

const errors = []
const browser = await chromium.launch()
const shot = async (page, name, opts = {}) => {
  await page.waitForTimeout(500)
  await page.screenshot({ path: OUT + name, ...opts })
  console.log('saved', name)
}
const fail = (m) => {
  throw new Error(m)
}
const lessons = (units) => units.flatMap((u) => [1, 2, 3, 4, 5, 6].map((i) => `u${u}-${i}`))
const range = (n) => Array.from({ length: n }, (_, i) => i + 1)

async function seed(p, patch) {
  await p.evaluate((patch) => {
    const cur = JSON.parse(localStorage.getItem('vaibik.progress'))
    localStorage.setItem('vaibik.progress', JSON.stringify({ ...cur, placementSeen: true, introSeen: true, ...patch }))
  }, patch)
  await p.reload()
}

const noEnd = async (p, where) => {
  const text = await p.locator('body').innerText()
  for (const bad of ['Финиш', 'весь курс', 'Скоро:', '54 уроков', 'из 54']) if (text.includes(bad)) fail(`${where}: осталось «${bad}»`)
}

for (const [w, h, tag] of [
  [1280, 800, 'desktop'],
  [375, 812, 'mobile'],
]) {
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: w < 500, hasTouch: w < 500 })
  const p = await ctx.newPage()
  watch(p, errors)
  await login(p)

  // середина пути: блок в конце, действия ведут на урок / задания / домашку
  await seed(p, { completed: lessons([1, 2, 3]), homework: ['hw1', 'hw2'], tiersCelebrated: ['novice'] })
  await p.waitForSelector('[data-explore]')
  await noEnd(p, 'путь')
  for (const a of ['practice', 'quests', 'homework', 'suggest']) if (!(await p.locator(`[data-explore-action="${a}"]`).count())) fail('нет действия ' + a)
  await p.locator('[data-explore]').scrollIntoViewIfNeeded()
  await p.evaluate(() => window.scrollBy(0, 200))
  await shot(p, `134-explore-path-end-${tag}.png`)

  await p.click('[data-explore-action="quests"]')
  await p.waitForSelector('[data-quests-screen]')
  await p.goBack()
  await p.waitForSelector('[data-explore]')

  // всё пройдено → праздник последнего тира без «курс пройден»
  await seed(p, { completed: lessons(range(9)), homework: range(9).map((i) => `hw${i}`), tiersCelebrated: ['novice', 'mid'] })
  await p.evaluate(() => (location.hash = '/tier-up/pro'))
  await p.waitForSelector('[data-tier-up="pro"] [data-explore-next]')
  await noEnd(p, 'праздник')
  await shot(p, `134-explore-celebration-${tag}.png`)

  // кнопка «Исследуй дальше» прокручивает к блоку на пути
  await p.getByRole('button', { name: 'Исследуй дальше' }).click()
  await p.waitForSelector('[data-explore]')
  // путь прокручивается плавно (scroll-behavior: smooth) — ждём, пока блок окажется на экране
  await p
    .waitForFunction(() => {
      const r = document.querySelector('[data-explore]').getBoundingClientRect()
      return r.top >= -1 && r.top < innerHeight / 2
    }, null, { timeout: 8000 })
    .catch(() => fail('после праздника путь не прокрутился к «Исследуй дальше»'))
  await noEnd(p, 'путь (всё пройдено)')
  await shot(p, `134-explore-path-done-${tag}.png`)
  await ctx.close()
}

await browser.close()
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
