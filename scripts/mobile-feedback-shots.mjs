// Скриншоты мобильного приложения (Expo web, 390×844): node scripts/mobile-feedback-shots.mjs [baseUrl]
// Сначала: cd mobile && npx expo export --platform web --output-dir /tmp/mweb && npx serve -s /tmp/mweb -l 8090
// 75 — лист «Отзыв», 76 — пейвол: «3 дня бесплатно» бирюзовым (#13C2AE).
import { chromium } from 'playwright'

const BASE = process.argv[2] || 'http://localhost:8090'
const OUT = new URL('../screenshots/', import.meta.url).pathname
const errors = []
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const p = await ctx.newPage()
p.on('console', (m) => (m.type() === 'error' ? errors.push(m.text()) : null))
p.on('pageerror', (e) => errors.push(String(e)))
const id = (t) => p.locator(`[data-testid="${t}"]`)
const shot = async (name) => {
  await p.waitForTimeout(700)
  await p.screenshot({ path: OUT + name })
  console.log('saved', name)
}

await p.goto(BASE + '/')
await id('email').waitFor()
await id('email').fill('aidar@example.com')
await id('submit').click()
await id('feedback-header').waitFor({ timeout: 15000 })

await id('feedback-header').click()
await id('feedback-sheet').waitFor()
await id('rating-4').click()
await id('chip-idea').click()
await id('feedback-text').fill('Добавьте напоминание о деплой-серии вечером 🙂')
await shot('75-mobile-feedback.png')
await id('feedback-send').click()
await id('feedback-thanks').waitFor()
await p.getByText('Готово', { exact: true }).click()

await p.getByRole('tab', { name: /Профиль/ }).click()
await id('open-paywall').click()
await id('trial-annual').waitFor({ timeout: 15000 })
const color = await id('trial-annual').evaluate((el) => getComputedStyle(el).color)
console.log('trial color:', color)
if (color !== 'rgb(19, 194, 174)') throw new Error('«дня бесплатно» не #13C2AE: ' + color)
await shot('76-mobile-paywall-teal.png')

// закрыли пейвол без покупки → «Что остановило?» на пути
await id('paywall-close').click()
await id('micro-paywall_exit').waitFor({ timeout: 8000 })
console.log('micro prompt after paywall close: ok')

await browser.close()
if (errors.length) {
  console.log('console errors:\n' + errors.join('\n'))
  process.exit(1)
}
console.log('ok')
