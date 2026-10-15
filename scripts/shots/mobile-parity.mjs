// Паритет мобильного приложения (Expo web, 390×844) с вебом: node scripts/shots/mobile-parity.mjs [baseUrl] [outDir]
// Сначала: cd mobile && npx expo export --platform web --output-dir /tmp/mweb, затем раздать /tmp/mweb как SPA (порт 8090).
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = process.argv[2] || 'http://localhost:8090'
const OUT = (process.argv[3] || '.artifacts/screenshots/mobile-parity').replace(/\/?$/, '/')
const ONLY = process.argv[4] ? process.argv[4].split(',') : null
fs.mkdirSync(OUT, { recursive: true })
const errors = []
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ru-RU' })
const p = await ctx.newPage()
p.on('console', (m) => (m.type() === 'error' ? errors.push(m.text()) : null))
p.on('pageerror', (e) => errors.push(String(e)))
const id = (t) => p.locator(`[data-testid="${t}"]`)
const want = (n) => !ONLY || ONLY.includes(n)
const shot = async (name) => {
  await p.waitForTimeout(900)
  await p.screenshot({ path: OUT + name })
  console.log('saved', name)
}

await p.goto(BASE + '/')
await id('email').waitFor({ timeout: 30000 })
await id('email').fill('aidar@example.com')
await id('submit').click()
await id('path').waitFor({ timeout: 30000 })
if (want('path')) await shot('mobile-path.png')
const tab = async (name) => {
  await id(`tab-${name}`).click()
  await p.waitForTimeout(400)
}
if (want('quests')) { await tab('quests'); await id('quests-screen').waitFor(); await shot('mobile-quests.png') }
if (want('league')) { await tab('league'); await id('league-screen').waitFor(); await shot('mobile-league.png') }
if (want('profile')) { await tab('profile'); await id('profile-screen').waitFor(); await shot('mobile-profile.png') }
if (want('more')) { await tab('more'); await id('more-screen').waitFor(); await shot('mobile-more.png') }
if (want('paywall')) {
  // как в вебе: Pro-вещь в гардеробе → тот же пейвол, что на Pro-разделе
  await tab('profile')
  await id('profile-wardrobe').click()
  await id('skin-hacker-hood').scrollIntoViewIfNeeded()
  await id('skin-hacker-hood').click()
  await id('wardrobe-pro').scrollIntoViewIfNeeded()
  await id('wardrobe-pro').click()
  await id('paywall').waitFor()
  await shot('mobile-paywall.png')
  await id('paywall-close').click()
  await p.waitForTimeout(1500)
  // «Что остановило?» после закрытия пейвола — снимок и закрыть
  if (await id('micro-paywall_exit').count()) {
    await shot('mobile-paywall-exit-prompt.png')
    await p.locator('[data-testid="micro-paywall_exit"] [aria-label]').first().click()
    await p.waitForTimeout(400)
  }
}
if (want('extra')) {
  // остальные экраны: гардероб, словарик, настройки, помощь, тур, экран урока «готово»
  await tab('profile'); await id('profile-wardrobe').click(); await id('wardrobe-screen').waitFor(); await shot('mobile-wardrobe.png')
  await tab('profile'); await id('profile-glossary').scrollIntoViewIfNeeded(); await id('profile-glossary').click(); await id('glossary-screen').waitFor(); await shot('mobile-glossary.png')
  await tab('more'); await id('more-settings').click(); await id('settings-screen').waitFor(); await shot('mobile-settings.png')
  await tab('more'); await id('more-help').click(); await id('help-screen').waitFor(); await shot('mobile-help.png')
  await tab('profile'); await id('profile-intro').scrollIntoViewIfNeeded(); await id('profile-intro').click(); await id('intro').waitFor(); await shot('mobile-intro.png')
  await id('intro-skip').click(); await p.waitForTimeout(500)
}
if (want('lesson')) {
  await tab('learn')
  await id('node-btn-u1-4').scrollIntoViewIfNeeded()
  await id('node-btn-u1-4').click()
  await id('popover-go').click()
  await id('lesson-screen').waitFor({ timeout: 30000 })
  await shot('mobile-lesson.png')
}
await browser.close()
console.log(errors.length ? 'ERRORS:\n' + [...new Set(errors)].join('\n') : 'No console errors')
