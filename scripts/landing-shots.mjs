// Скриншоты лендинга: node scripts/landing-shots.mjs [baseUrl] [reviewDir]
import { chromium } from 'playwright'

const BASE = process.argv[2] || 'http://localhost:5173'
const REVIEW = process.argv[3] || null
const OUT = new URL('../screenshots/', import.meta.url).pathname
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
  await p.waitForTimeout(700)
  return p
}

async function revealAll(p) {
  await p.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto'
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    window.scrollTo(0, 0)
  })
  await p.waitForTimeout(900)
}

// ---------- Desktop ----------
const desk = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 })
const d = await open(desk)
await d.screenshot({ path: OUT + '10-landing-hero.png' })
console.log('saved 10-landing-hero.png')
await revealAll(d)

const deskFull = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
const df = await open(deskFull)
await revealAll(df)
await df.screenshot({ path: OUT + '11-landing-full.png', fullPage: true })
console.log('saved 11-landing-full.png')

if (REVIEW) {
  for (const id of ['how', 'program', 'demo', 'features', 'pricing', 'faq']) {
    await d.locator('#' + id).screenshot({ path: `${REVIEW}/sec-${id}.png` })
  }
  await d.locator('footer').screenshot({ path: `${REVIEW}/sec-footer.png` })
}

// interactive demo
await d.locator('#demo').scrollIntoViewIfNeeded()
await d.locator('#demo').getByRole('button', { name: /одностраничный сайт/ }).click()
await d.locator('#demo').getByRole('button', { name: 'Проверить' }).click()
await d.waitForTimeout(500)
await d.locator('#demo').screenshot({ path: OUT + '13-landing-demo.png' })
console.log('saved 13-landing-demo.png')

// FAQ accordion toggling
await d.getByRole('button', { name: 'Нужно ли уметь программировать?' }).click()
await d.waitForTimeout(400)

// CTA -> login
await d.evaluate(() => window.scrollTo(0, 0))
await d.getByRole('button', { name: 'Начать бесплатно' }).first().click()
await d.waitForSelector('text=С возвращением!')
console.log('CTA → login OK')

// ---------- Mobile ----------
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const m = await open(mob)
await m.screenshot({ path: OUT + '12b-landing-mobile-hero.png' })
await revealAll(m)
await m.screenshot({ path: OUT + '12-landing-mobile.png', fullPage: true })
console.log('saved 12-landing-mobile.png, 12b-landing-mobile-hero.png')

await browser.close()
console.log(errors.length ? 'CONSOLE ISSUES:\n' + errors.join('\n') : 'No console errors/warnings')
