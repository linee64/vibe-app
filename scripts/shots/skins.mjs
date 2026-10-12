// Гардероб Бипи: магазин, покупка, примерка, Pro-пейвол, Бипи в вещах на пути и в уроке. node scripts/shots/skins.mjs [baseUrl]
import { chromium } from 'playwright'
import { login, openLessonFromPath, playLesson, watch } from '../e2e/lib/solver.mjs'
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
const prog = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('vaibik.progress')))

for (const [w, h, tag] of [
  [1280, 800, 'desktop'],
  [375, 812, 'mobile'],
]) {
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: w < 500, hasTouch: w < 500 })
  const p = await ctx.newPage()
  watch(p, errors)
  await login(p)
  // 260 токенов, кепка уже куплена
  await p.evaluate(() => {
    const cur = JSON.parse(localStorage.getItem('vaibik.progress'))
    localStorage.setItem('vaibik.progress', JSON.stringify({ ...cur, gems: 260, placementSeen: true, introSeen: true, skins: { owned: ['cap'], equipped: { head: 'cap' } } }))
  })
  await p.evaluate(() => (location.hash = '/wardrobe'))
  await p.reload()
  await p.waitForSelector('[data-wardrobe]')

  // без баланса: корона (500) — «не хватает», токены не тратятся
  await p.click('[data-skin="crown"]')
  await p.waitForSelector('[data-wardrobe-action="need"]')

  // покупка худи (150): списано ровно 150, вещь надета; двойной клик не спишет дважды
  await p.click('[data-skin="hoodie"]')
  await p.locator('[data-wardrobe-action="buy"]').dblclick()
  await p.waitForSelector('[data-skin="hoodie"][data-skin-state="equipped"]')
  let pr = await prog(p)
  if (pr.gems !== 110) fail('после покупки худи ожидалось 110 токенов, а их ' + pr.gems)
  if (!pr.skins.owned.includes('hoodie') || pr.skins.equipped.body !== 'hoodie') fail('худи не сохранилось: ' + JSON.stringify(pr.skins))

  // пиксельные очки (50) → 60 токенов
  await p.click('[data-skin="pixel-shades"]')
  await p.click('[data-wardrobe-action="buy"]')
  await p.waitForSelector('[data-skin="pixel-shades"][data-skin-state="equipped"]')
  pr = await prog(p)
  if (pr.gems !== 60) fail('ожидалось 60 токенов, а их ' + pr.gems)

  // примерка короны (не куплена) — превью, но не надето
  await p.click('[data-skin="wizard-hat"]')
  await p.waitForTimeout(2700) // тост «теперь у Бипи» исчезает
  await p.evaluate(() => window.scrollTo(0, 0))
  await shot(p, `135-skins-shop-${tag}.png`, { fullPage: tag === 'desktop' })

  // Pro-вещь без подписки → пейвол, закрыть → обратно в гардероб
  await p.click('[data-skin="astro-helmet"]')
  await p.click('[data-wardrobe-action="pro"]')
  await p.waitForSelector('[data-paywall]')
  if (tag === 'desktop') await shot(p, `135-skins-paywall-${tag}.png`)
  await p.getByRole('button', { name: 'Вернуться к бесплатному' }).click()
  await p.waitForSelector('[data-wardrobe]')
  if ((await prog(p)).skins.owned.includes('astro-helmet')) fail('Pro-вещь купилась без подписки')

  // снять/надеть кепку
  await p.click('[data-skin="cap"]')
  await p.click('[data-wardrobe-action="unequip"]')
  await p.waitForSelector('[data-skin="cap"][data-skin-state="owned"]')
  await p.click('[data-wardrobe-action="equip"]')
  await p.waitForSelector('[data-skin="cap"][data-skin-state="equipped"]')

  // Бипи в вещах: путь (блок «Исследуй дальше» / совет Бипи) и урок
  await p.evaluate(() => (location.hash = '/learn'))
  await p.waitForSelector('[data-explore]')
  if (tag === 'desktop') {
    await shot(p, `135-skins-home-${tag}.png`)
  } else {
    await p.locator('[data-explore]').scrollIntoViewIfNeeded()
    await shot(p, `135-skins-home-${tag}.png`)
  }
  if (!(await p.locator('[data-skin-art="hoodie"]').count())) fail('на пути Бипи без худи')

  await p.evaluate(() => (location.hash = '/learn'))
  await openLessonFromPath(p, 'u1-1')
  await playLesson(p, 'u1-1')
  await p.waitForTimeout(600)
  if (!(await p.locator('[data-skin-art="pixel-shades"]').count())) fail('в уроке Бипи без очков')
  await shot(p, `135-skins-lesson-done-${tag}.png`)
  await ctx.close()
}

await browser.close()
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
