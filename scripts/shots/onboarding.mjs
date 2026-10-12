// Вводный тур «Как это работает» и словарик. node scripts/shots/onboarding.mjs [baseUrl]
import { chromium } from 'playwright'
import { BASE, login, watch } from '../e2e/lib/solver.mjs'
import { OUT } from './out.mjs'

const errors = []
const browser = await chromium.launch()
const shot = async (page, name, opts = {}) => {
  await page.waitForTimeout(400)
  await page.screenshot({ path: OUT + name, ...opts })
  console.log('saved', name)
}
const fail = (m) => {
  throw new Error(m)
}
const fresh = (p) =>
  p.evaluate(() => {
    const pr = JSON.parse(localStorage.getItem('vaibik.progress') || '{}')
    localStorage.setItem('vaibik.progress', JSON.stringify({ ...pr, completed: [], homework: [], introSeen: false, placementSeen: true }))
  })

for (const [w, h, tag] of [
  [375, 812, 'mobile'],
  [1280, 800, 'desktop'],
]) {
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: w < 500, hasTouch: w < 500 })
  const p = await ctx.newPage()
  watch(p, errors)
  await login(p)
  await fresh(p)
  // новичок открывает первый урок → сначала тур
  await p.goto(BASE + '/#/lesson/u1-1')
  await p.reload()
  await p.waitForSelector('[data-intro]')
  const steps = ['ai', 'prompt', 'vibe', 'build', 'how', 'warmup']
  for (const [i, s] of steps.entries()) {
    await p.waitForSelector(`[data-intro-step="${s}"]`)
    if (tag === 'mobile' || s === 'ai' || s === 'prompt') await shot(p, `132-intro-${i + 1}-${s}-${tag}.png`)
    if (s !== 'warmup') {
      // на телефоне листаем свайпом, на десктопе — кнопкой
      if (tag === 'mobile' && i === 0) {
        await p.locator('main').dispatchEvent('touchstart', { touches: [{ identifier: 1, clientX: 320, clientY: 400 }], changedTouches: [{ identifier: 1, clientX: 320, clientY: 400 }] })
        await p.locator('main').dispatchEvent('touchend', { touches: [], changedTouches: [{ identifier: 1, clientX: 80, clientY: 410 }] })
      } else await p.click('[data-intro-next]')
    }
  }
  await p.click('[data-intro-warmup] [data-option="1"]')
  await p.waitForSelector('[data-intro-feedback]')
  await shot(p, `132-intro-7-warmup-answered-${tag}.png`)
  await p.click('[data-intro-finish]')

  // первый урок со словариком
  await p.waitForSelector('main h1')
  const seen = await p.evaluate(() => JSON.parse(localStorage.getItem('vaibik.progress')).introSeen)
  if (!seen) fail('introSeen не сохранился')
  const terms = await p.locator('[data-gloss]').evaluateAll((els) => els.map((e) => e.getAttribute('data-gloss')))
  console.log('термины на первом экране:', terms.join(', '))
  if (!terms.includes('vibe')) fail('«вайб-кодинг» не подсвечен')
  await shot(p, `133-glossary-lesson-${tag}.png`)
  await p.click('[data-gloss="vibe"]')
  await p.waitForSelector('[data-gloss-tip="vibe"]')
  await shot(p, `133-glossary-tip-${tag}.png`)
  await p.click('[data-gloss-all]')
  await p.waitForSelector('[data-glossary-sheet]')
  await shot(p, `133-glossary-sheet-${tag}.png`)
  await p.keyboard.press('Escape')

  // повторно тур не показывается
  await p.evaluate(() => (location.hash = '/learn'))
  await p.waitForSelector('[data-lesson]')
  await p.evaluate(() => (location.hash = '/lesson/u1-2'))
  await p.waitForSelector('main h1')
  if (await p.locator('[data-intro]').count()) fail('тур показан второй раз')

  // профиль: «Как это работает» и «Словарик»
  await p.evaluate(() => (location.hash = '/profile'))
  await p.waitForSelector('[data-profile-basics]')
  await p.locator('[data-profile-basics]').scrollIntoViewIfNeeded()
  await p.evaluate(() => window.scrollBy(0, -120))
  await shot(p, `132-intro-profile-entry-${tag}.png`)
  await p.click('[data-profile-link="glossary"]')
  await p.waitForSelector('[data-glossary-screen]')
  await shot(p, `133-glossary-profile-${tag}.png`, { fullPage: tag === 'desktop' })
  await p.evaluate(() => (location.hash = '/profile'))
  await p.click('[data-profile-link="intro"]')
  await p.waitForSelector('[data-intro]')
  await p.click('[data-intro-skip]')
  await p.waitForSelector('[data-profile-basics]')
  await ctx.close()
}

await browser.close()
console.log(errors.length ? 'CONSOLE ISSUES:\n' + errors.join('\n') : 'No console errors/warnings')
