// Pro скрывает карточку тарифа: Профиль, «Ещё», Настройки (веб и Expo web) с демо-Pro вкл/выкл, 390×844.
//   node scripts/shots/pro-state.mjs <webBase> <mobileBase> [outDir]
// Сначала: npm run build && раздать dist; cd mobile && npx expo export --platform web --output-dir /tmp/mweb и раздать как SPA.
// Демо-Pro включается ключом localStorage vaibik.demoPro=1 (та же кнопка «Демо: включить Pro» в профиле).
import { chromium } from 'playwright'
import fs from 'node:fs'

const WEB = process.argv[2] || 'http://localhost:4173'
const MOB = process.argv[3] || 'http://localhost:8090'
const OUT = (process.argv[4] || '.artifacts/screenshots/pro-state').replace(/\/?$/, '/')
fs.mkdirSync(OUT, { recursive: true })
const errors = []
const browser = await chromium.launch()
const newPage = async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ru-RU' })
  // локально нет /_vercel/insights (Vercel Analytics) — не даём статическому серверу подсунуть index.html вместо скрипта
  await ctx.route('**/_vercel/**', (r) => r.fulfill({ status: 404, body: '' }))
  const p = await ctx.newPage()
  p.on('pageerror', (e) => errors.push(`${String(e)} @ ${p.url()}`))
  return p
}
const shot = async (p, name) => {
  await p.waitForTimeout(900)
  await p.screenshot({ path: OUT + name })
  console.log('saved', name)
}

// ---------------------------------------------------------------- веб
async function web(pro) {
  const p = await newPage()
  const tag = pro ? 'pro' : 'free'
  await p.goto(WEB + '/#/login')
  await p.evaluate((on) => {
    localStorage.clear()
    localStorage.setItem('vaibik.locale', 'ru')
    if (on) localStorage.setItem('vaibik.demoPro', '1')
  }, pro)
  await p.reload()
  await p.getByPlaceholder('you@example.com').fill('aidar@example.com')
  await p.getByPlaceholder('••••••••').fill('secret123')
  await p.getByRole('button', { name: 'Войти', exact: true }).click()
  await p.waitForSelector('[data-lesson]')
  await p.evaluate(() => document.fonts.ready)
  const go = async (hash) => {
    await p.evaluate((h) => (location.hash = h), hash)
    await p.waitForTimeout(700)
  }
  await go('/profile')
  await p.locator('[data-plan]').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  if ((await p.locator(`[data-plan="${tag}"]`).count()) !== 1) errors.push(`web profile: нет [data-plan="${tag}"]`)
  await shot(p, `web-profile-${tag}.png`)
  await go('/more')
  await p.evaluate(() => window.scrollTo(0, 0))
  await shot(p, `web-more-${tag}.png`)
  await go('/settings')
  const target = pro ? '[data-settings-subscription]' : '[data-settings-account]'
  await p.locator(target).evaluate((el) => el.scrollIntoView({ block: 'center' }))
  if (pro !== ((await p.locator('[data-settings-subscription]').count()) === 1)) errors.push(`web settings ${tag}: блок подписки`)
  await shot(p, `web-settings-${tag}.png`)
  await go('/pricing')
  await p.waitForTimeout(800)
  await shot(p, `web-pricing-${tag}.png`)
  await p.context().close()
}

// ---------------------------------------------------------------- приложение (Expo web)
async function mobile(pro) {
  const p = await newPage()
  const tag = pro ? 'pro' : 'free'
  const id = (t) => p.locator(`[data-testid="${t}"]`)
  await p.goto(MOB + '/')
  await p.evaluate((on) => {
    localStorage.clear()
    if (on) localStorage.setItem('vaibik.demoPro', '1')
  }, pro)
  await p.reload()
  await id('email').waitFor({ timeout: 30000 })
  await id('email').fill('aidar@example.com')
  await id('submit').click()
  await id('path').waitFor({ timeout: 30000 })
  const tab = async (name) => {
    await id(`tab-${name}`).click()
    await p.waitForTimeout(500)
  }
  await tab('profile')
  await id('profile-screen').waitFor()
  await id(`plan-${tag}`).scrollIntoViewIfNeeded()
  await id(`plan-${tag}`).evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await shot(p, `mobile-profile-${tag}.png`)
  await tab('more')
  await id('more-screen').waitFor()
  await shot(p, `mobile-more-${tag}.png`)
  await id('more-settings').click()
  await id('settings-screen').waitFor()
  if (pro) await id('settings-subscription').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  else await id('delete-account').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  if (pro !== ((await id('settings-subscription').count()) === 1)) errors.push(`mobile settings ${tag}: блок подписки`)
  await shot(p, `mobile-settings-${tag}.png`)
  await p.context().close()
}

for (const pro of [false, true]) {
  await web(pro)
  await mobile(pro)
}
await browser.close()
console.log(errors.length ? 'ERRORS:\n' + [...new Set(errors)].join('\n') : 'No errors')
process.exit(errors.length ? 1 : 0)
