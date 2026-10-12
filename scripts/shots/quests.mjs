// Задания (квесты): правая колонка, экран «Задания», награда забрана. node scripts/shots/quests.mjs [baseUrl]
// Прогресс заданий набирается настоящими событиями — проходим урок через «решатель».
import { chromium } from 'playwright'
import { BASE, login, openLessonFromPath, playLesson, watch } from '../e2e/lib/solver.mjs'
import { OUT } from './out.mjs'

const errors = []
const browser = await chromium.launch()
const shot = async (page, name, opts = {}) => {
  await page.waitForTimeout(450)
  await page.screenshot({ path: OUT + name, ...opts })
  console.log('saved', name)
}
const fail = (m) => {
  throw new Error(m)
}

for (const [w, h, tag] of [
  [1280, 800, 'desktop'],
  [375, 812, 'mobile'],
]) {
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: w < 500, hasTouch: w < 500 })
  const p = await ctx.newPage()
  watch(p, errors)
  await login(p)
  await p.waitForTimeout(500)

  // старой карточки «Скоро: новые разделы» на пути больше нет
  if (await p.locator('[data-soon]').count()) fail('на пути осталась карточка «Скоро»')

  // урок без ошибок → «Двойной релиз» 1/2, «Чистый билд», верные ответы подряд
  await openLessonFromPath(p, 'u1-4')
  await playLesson(p, 'u1-4')
  await p.getByRole('button', { name: 'Продолжить' }).click()
  await p.waitForSelector('[data-lesson]')
  const q = await p.evaluate(() => JSON.parse(localStorage.getItem('vaibik.progress')).quests)
  if (!q || q.daily.lessons !== 1 || q.daily.correct < 3) fail('счётчики заданий не обновились: ' + JSON.stringify(q))
  await p.evaluate(() => window.scrollTo(0, 0))
  await shot(p, `131-after-home-${tag}.png`)
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await shot(p, `131-after-home-bottom-${tag}.png`)

  // ещё один урок — «Двойной релиз» выполнен, можно забрать
  await p.evaluate(() => (location.hash = '/lesson/u1-5'))
  await playLesson(p, 'u1-5')
  await p.getByRole('button', { name: 'Продолжить' }).click()
  await p.waitForSelector('[data-lesson]')
  await p.evaluate(() => (location.hash = '/quests'))
  await p.waitForSelector('[data-quests-screen]')
  const ready = p.locator('[data-quest-state="ready"]')
  if (!(await ready.count())) fail('нет выполненного задания')
  if (!(await p.locator('[data-quests-badge]').count())) fail('нет бейджа наград в навигации')
  await shot(p, `131-after-quests-${tag}.png`, { fullPage: tag === 'desktop' })

  const gemsBefore = await p.evaluate(() => JSON.parse(localStorage.getItem('vaibik.progress')).gems)
  const id = await ready.first().getAttribute('data-quest')
  await p.click(`[data-quest-claim="${id}"]`)
  await p.waitForSelector(`[data-quest="${id}"][data-quest-state="claimed"]`)
  const gemsAfter = await p.evaluate(() => JSON.parse(localStorage.getItem('vaibik.progress')).gems)
  if (gemsAfter <= gemsBefore) fail(`токены не начислены: ${gemsBefore} → ${gemsAfter}`)
  const sound = await p.evaluate(() => window.__vaibikLastSound)
  console.log(`claimed ${id}: токены ${gemsBefore} → ${gemsAfter}, звук: ${sound}`)
  await p.waitForTimeout(300)
  await shot(p, `131-after-quest-claimed-${tag}.png`, { fullPage: tag === 'desktop' })
  // второй клик невозможен: кнопки больше нет
  if (await p.locator(`[data-quest-claim="${id}"]`).count()) fail('кнопка «Забрать» осталась')
  await ctx.close()
}

await browser.close()
console.log(errors.length ? 'CONSOLE ISSUES:\n' + errors.join('\n') : 'No console errors/warnings')
