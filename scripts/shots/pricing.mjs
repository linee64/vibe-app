// Скриншоты тарифов и FAQ: node scripts/shots/pricing.mjs [baseUrl] [reviewDir]
import { chromium } from 'playwright'
import { OUT } from './out.mjs'

const BASE = process.argv[2] || 'http://localhost:5173'
const REVIEW = process.argv[3] || null
const errors = []
const browser = await chromium.launch()

function watch(page) {
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
}

async function open(ctx) {
  const p = await ctx.newPage()
  watch(p)
  await p.goto(BASE + '/#/login')
  await p.evaluate(() => localStorage.clear())
  await p.goto(BASE + '/')
  await p.waitForSelector('text=Три шага до первого приложения')
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(500)
  return p
}

async function revealAll(p) {
  await p.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto'
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
  })
  await p.waitForTimeout(900)
}

// ---------- Desktop 1280 ----------
const desk = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
const d = await open(desk)
await revealAll(d)
const pricing = d.locator('#pricing')
await pricing.getByRole('tab', { name: 'Помесячно' }).click()
await d.waitForTimeout(300)
await pricing.screenshot({ path: OUT + '14-pricing-monthly.png' })
console.log('saved 14-pricing-monthly.png')
await pricing.getByRole('tab', { name: /На год/ }).click()
await d.waitForTimeout(300)
await pricing.screenshot({ path: OUT + '14-pricing-annual.png' })
console.log('saved 14-pricing-annual.png')

// FAQ: открыт вопрос о пробном периоде
const faq = d.locator('#faq')
await faq.getByRole('button', { name: 'Как работает пробный период?' }).click()
await d.waitForTimeout(500)
// секция выше экрана — прячем липкую шапку, чтобы она не легла поверх снимка
await d.evaluate(() => (document.querySelector('header').style.visibility = 'hidden'))
await faq.screenshot({ path: OUT + '16-faq.png' })
console.log('saved 16-faq.png')
await d.evaluate(() => (document.querySelector('header').style.visibility = ''))

// CTA пробного периода ведёт на вход
await pricing.getByRole('button', { name: 'Попробовать 3 дня бесплатно' }).click()
await d.waitForSelector('text=Войти', { timeout: 5000 })
console.log('trial CTA ->', new URL(d.url()).hash)

// ---------- Mobile 390 ----------
const mob = await browser.newContext({ locale: 'ru-RU', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const m = await open(mob)
await revealAll(m)
const width = await m.evaluate(() => document.documentElement.scrollWidth)
console.log('mobile scrollWidth', width)
await m.locator('#pricing').screenshot({ path: OUT + '15-pricing-mobile.png' })
console.log('saved 15-pricing-mobile.png')
if (REVIEW) await m.locator('#faq').screenshot({ path: `${REVIEW}/faq-mobile.png` })

// ---------- В приложении: карточка Pro в профиле -> /pricing ----------
if (REVIEW) {
  const app = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
  const a = await open(app)
  await a.goto(BASE + '/#/login')
  await a.fill('input[type=email]', 'demo@vaibik.dev')
  await a.fill('input[type=password]', 'demo1234')
  await a.keyboard.press('Enter')
  await a.waitForTimeout(800)
  await a.goto(BASE + '/#/profile')
  await a.waitForTimeout(600)
  await a.screenshot({ path: `${REVIEW}/profile.png`, fullPage: true })
  await a.getByRole('button', { name: 'Попробовать Pro' }).click()
  await a.waitForTimeout(1200)
  console.log('profile CTA ->', new URL(a.url()).hash, 'scrollY', await a.evaluate(() => Math.round(window.scrollY)))
  await a.screenshot({ path: `${REVIEW}/pricing-from-profile.png` })
  await a.locator('#pricing').getByRole('button', { name: 'Попробовать 3 дня бесплатно' }).click()
  await a.waitForTimeout(400)
  await a.screenshot({ path: `${REVIEW}/pricing-loggedin-toast.png` })
  const pm = await browser.newContext({ locale: 'ru-RU', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true })
  const pmp = await pm.newPage(); watch(pmp)
  await pmp.goto(BASE + '/#/profile'); await pmp.evaluate((s) => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v) }, await a.evaluate(() => ({ ...localStorage })))
  await pmp.reload(); await pmp.waitForTimeout(500); await pmp.goto(BASE + '/#/profile'); await pmp.waitForTimeout(800)
  await pmp.screenshot({ path: `${REVIEW}/profile-mobile.png`, fullPage: true })
}

await browser.close()
console.log(errors.length ? 'CONSOLE ERRORS:\n' + errors.join('\n') : 'no console errors')
