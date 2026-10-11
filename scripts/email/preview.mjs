/**
 * Превью писем: каждый шаблон × каждый язык → .artifacts/email/<file>-<locale>.html (+ index.html)
 * и скриншоты Playwright (600px десктоп, 375px мобильный, тёмная тема).
 *
 *   npm run email:preview                 # HTML + основные скриншоты в .artifacts/email/
 *   npm run email:preview -- --all        # + десктоп-скриншот каждого шаблона на каждом языке
 *   SHOTS_DIR=… npm run email:preview     # куда класть скриншоты 99-email-*.png
 *   EMAIL_ASSET_BASE_URL=https://…        # откуда грузить bipi.png (по умолчанию — локальный public/)
 *
 * Шаблоны рендерит мини-рендерер Go-шаблонов (scripts/email/render.mjs) с примерными данными.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ASSET_LINE_RE, LOCALES, TEMPLATES_DIR, assetLine } from './build.mjs'
import { renderGoTemplate } from './render.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const OUT = resolve(root, '.artifacts/email')
const SHOTS = resolve(process.env.SHOTS_DIR || OUT)
const asset = (process.env.EMAIL_ASSET_BASE_URL || pathToFileURL(resolve(root, 'public')).href).replace(/\/+$/, '')
const all = process.argv.includes('--all')

const subjects = JSON.parse(readFileSync(resolve(TEMPLATES_DIR, 'subjects.json'), 'utf8'))
const sample = (locale) => ({
  SiteURL: 'https://vaibik.site',
  ConfirmationURL: 'https://abcdefghijklmnop.supabase.co/auth/v1/verify?token=pkce_3f9a1c7e2b&type=signup&redirect_to=https://vaibik.site/',
  RedirectTo: 'https://vaibik.site/',
  Token: '482915',
  TokenHash: 'pkce_3f9a1c7e2b',
  Email: 'aidar@example.com',
  NewEmail: 'aidar.new@example.com',
  Data: { display_name: 'Айдар', locale },
})

mkdirSync(OUT, { recursive: true })
mkdirSync(SHOTS, { recursive: true })
const rows = []
for (const [key, { file, subject }] of Object.entries(subjects)) {
  const src = readFileSync(resolve(TEMPLATES_DIR, file), 'utf8').replace(ASSET_LINE_RE, assetLine(asset))
  for (const locale of LOCALES) {
    const name = `${file.replace(/\.html$/, '')}-${locale}.html`
    writeFileSync(resolve(OUT, name), renderGoTemplate(src, sample(locale)))
    rows.push(`<li><a href="${name}">${name}</a> — ${renderGoTemplate(subject, sample(locale))} <small>(${key})</small></li>`)
  }
}
writeFileSync(resolve(OUT, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Письма Вайбика</title><ul>${rows.join('\n')}</ul>`)
console.log(`✓ ${rows.length} писем → ${OUT}`)

const { chromium } = await import('playwright')
const browser = await chromium.launch()
async function shot(html, png, { width = 600, dark = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 2, colorScheme: dark ? 'dark' : 'light' })
  const page = await ctx.newPage()
  await page.goto(pathToFileURL(resolve(OUT, html)).href)
  await page.waitForLoadState('networkidle')
  const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || !i.naturalWidth).map((i) => i.src))
  if (broken.length) console.warn('⚠ картинка не загрузилась:', broken.join(', '))
  await page.screenshot({ path: resolve(SHOTS, png), fullPage: true })
  await ctx.close()
  console.log('✓', resolve(SHOTS, png))
}

await shot('confirm-signup-ru.html', '99-email-confirm-ru.png')
await shot('confirm-signup-en.html', '99-email-confirm-en.png')
await shot('reset-password-ru.html', '99-email-reset-ru-mobile.png', { width: 375 })
await shot('confirm-signup-zh.html', '99-email-confirm-zh.png')
await shot('confirm-signup-ru.html', '99-email-dark.png', { dark: true })
if (all)
  for (const { file } of Object.values(subjects))
    for (const l of LOCALES) await shot(`${file.replace(/\.html$/, '')}-${l}.html`, `99-email-${file.replace(/\.html$/, '')}-${l}.png`)
await browser.close()
