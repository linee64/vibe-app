// Мобильное приложение на других языках (Expo web, 390×844): node scripts/shots/mobile-i18n.mjs [baseUrl]
// Сначала: cd mobile && npx expo export --platform web --output-dir /tmp/mweb && npx serve -s /tmp/mweb -l 8090
// 87 — путь на английском (язык телефона en-US), 88 — профиль: переключение en → 中文 переключателем, затем урок на zh.
import { chromium } from 'playwright'
import { OUT } from './out.mjs'

const BASE = process.argv[2] || 'http://localhost:8090'
const errors = []
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'en-US' })
const p = await ctx.newPage()
p.on('console', (m) => (m.type() === 'error' ? errors.push(m.text()) : null))
p.on('pageerror', (e) => errors.push(String(e)))
const id = (t) => p.locator(`[data-testid="${t}"]`)
const shot = async (name) => {
  await p.waitForTimeout(800)
  await p.screenshot({ path: OUT + name })
  console.log('saved', name)
}
const noCyrillic = async (where) => {
  const m = await p.evaluate(() => document.body.innerText.replace(/Русский|Қазақша/g, '').match(/[А-Яа-яЁё][^\n]{0,40}/)?.[0] ?? null)
  if (m) errors.push(`${where}: кириллица «${m}»`)
}

await p.goto(BASE + '/')
await id('email').waitFor({ timeout: 20000 })
const lang = await p.evaluate(() => document.documentElement.lang)
console.log('html lang (en-US phone):', lang)
await noCyrillic('login en')
await id('email').fill('aidar@example.com')
await id('submit').click()
await p.getByRole('tab', { name: /Path/ }).waitFor({ timeout: 20000 })
await noCyrillic('learn en')
await shot('87-mobile-en.png')

await p.getByRole('tab', { name: /Profile/ }).click()
await id('lang-switcher').waitFor()
await id('lang-switcher').scrollIntoViewIfNeeded()
await id('lang-zh').click()
await p.getByRole('tab', { name: /我的/ }).waitFor({ timeout: 15000 })
await id('lang-switcher').waitFor()
await id('lang-switcher').scrollIntoViewIfNeeded()
console.log('html lang after switch:', await p.evaluate(() => document.documentElement.lang))
console.log('stored:', await p.evaluate(() => localStorage.getItem('vaibik.locale')))
await noCyrillic('profile zh')
await shot('88-mobile-zh.png')
await p.getByRole('tab', { name: /路线/ }).click()
await p.waitForTimeout(500)
await noCyrillic('learn zh')
await shot('88b-mobile-zh-learn.png')

await browser.close()
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console errors')
if (errors.length) process.exitCode = 1
