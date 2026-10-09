// Скриншоты локализации: node scripts/i18n-shots.mjs [baseUrl]  → screenshots/80–86
import { chromium } from 'playwright'

const BASE = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'http://localhost:5173'
const OUT = new URL('../screenshots/', import.meta.url).pathname
const browser = await chromium.launch()
const mobile = { viewport: { width: 375, height: 760 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
const desktop = { viewport: { width: 1280, height: 800 } }

async function open(opts, lang, hash = '/') {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  await page.goto(BASE + '/#/')
  await page.evaluate((l) => {
    localStorage.clear()
    localStorage.setItem('vaibik.locale', l)
  }, lang)
  await page.goto(BASE + '/#' + hash)
  await page.reload()
  await page.evaluate(() => document.fonts.ready)
  return { ctx, page }
}
async function signIn(page) {
  await page.evaluate(() => (location.hash = '/login'))
  await page.locator('input[type=email]').fill('aidar@example.com')
  await page.locator('input[type=password]').fill('secret123')
  await page.locator('form button[type=submit]').click()
  await page.waitForSelector('[data-lesson]')
  const card = page.locator('[data-first-run] button').first()
  if (await card.count()) await card.click()
}

// 80 — переключатель: профиль (список) на en, рядом раскрытый select не снять — показываем профиль + шапку лендинга
{
  const { ctx, page } = await open(mobile, 'en')
  await signIn(page)
  await page.evaluate(() => (location.hash = '/profile'))
  await page.waitForSelector('[data-testid="lang-switcher"]')
  await page.evaluate(() => document.querySelector('[data-testid="lang-switcher"]').closest('section').scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(300)
  await page.screenshot({ path: OUT + '80-lang-switcher.png' })
  await ctx.close()
}
// 81 — лендинг en, десктоп
{
  const { ctx, page } = await open(desktop, 'en')
  await page.waitForSelector('h1')
  await page.waitForTimeout(500)
  await page.screenshot({ path: OUT + '81-landing-en.png' })
  await ctx.close()
}
// 82 — урок en (упражнение «Прокачай промпт» на 2-м шаге, с ответом)
{
  const { ctx, page } = await open(mobile, 'en')
  await signIn(page)
  await page.evaluate(() => (location.hash = '/lesson/u1-2'))
  await page.waitForSelector('main h1')
  await page.waitForTimeout(400)
  await page.screenshot({ path: OUT + '82-lesson-en.png' })
  await ctx.close()
}
// 86 — домашка en: блоки, ответ ИИ-ментора (офлайн-симуляция), чек-лист
{
  const { ctx, page } = await open(mobile, 'en')
  await signIn(page)
  await page.evaluate(() => (location.hash = '/homework/hw1'))
  await page.waitForSelector('[data-homework="hw1"]')
  for (const label of ['You’re a copywriter', 'Write a card', 'Product facts', 'Who it’s for']) await page.locator('[data-blocks] button').filter({ hasText: label }).first().click()
  await page.locator('#hw-prompt').fill((await page.locator('#hw-prompt').inputValue()) + ' Keep it under 60 words. Format: a headline and 3 bullet points.')
  await page.getByRole('button', { name: 'Send to AI', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('[data-homework]')?.getAttribute('data-hw-busy') === '0', null, { timeout: 8000 })
  await page.waitForTimeout(600)
  await page.evaluate(() => document.querySelector('[data-homework] [data-ai-mode]')?.scrollIntoView({ block: 'start' }))
  await page.screenshot({ path: OUT + '86-homework-en-ai.png' })
  await ctx.close()
}
await browser.close()
console.log('ok')
