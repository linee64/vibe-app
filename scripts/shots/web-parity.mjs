// Те же экраны веб-приложения на 390×844 для сравнения с мобильным: node scripts/shots/web-parity.mjs [baseUrl] [outDir]
import { chromium } from 'playwright'
import fs from 'node:fs'
import { login, openLessonFromPath } from '../e2e/lib/solver.mjs'

const OUT = (process.argv[3] || '.artifacts/screenshots/mobile-parity').replace(/\/?$/, '/')
fs.mkdirSync(OUT, { recursive: true })
const errors = []
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ru-RU' })
const p = await ctx.newPage()
p.on('pageerror', (e) => errors.push(String(e)))
const shot = async (name) => {
  await p.waitForTimeout(900)
  await p.screenshot({ path: OUT + name })
  console.log('saved', name)
}
const go = async (hash) => {
  await p.evaluate((h) => (location.hash = h), hash)
  await p.waitForTimeout(600)
  await p.evaluate(() => window.scrollTo(0, 0))
}

await login(p)
await p.evaluate(() => window.scrollTo(0, 0))
await shot('web-path.png')
await go('/quests')
await shot('web-quests.png')
await go('/leaderboard')
await shot('web-league.png')
await go('/profile')
await shot('web-profile.png')
await go('/more')
await shot('web-more.png')
// пейвол веба (демо): через Pro-вещь в гардеробе — тот же PaywallScreen, что и на разделе Pro
await go('/wardrobe')
await p.locator('[data-skin]').filter({ hasText: 'Pro' }).first().click()
await p.locator('[data-wardrobe-action="pro"]').click()
await p.waitForSelector('[data-paywall]')
await shot('web-paywall.png')
await p.getByRole('button', { name: 'Вернуться к бесплатному' }).click()
await go('/learn')
await openLessonFromPath(p, 'u1-4')
await shot('web-lesson.png')
await browser.close()
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No page errors')
