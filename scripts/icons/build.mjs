/**
 * Рисует иконки мобильного приложения с весёлым Бипи (стиль src/components/Mascot.tsx, mood=happy).
 * Выход: mobile/assets/{icon,android-icon-foreground,android-icon-monochrome,splash-icon,favicon}.png
 * Запуск: node scripts/icons/build.mjs
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const A = (f) => resolve(root, 'mobile/assets', f)
const INK = '#2F2A47', V = '#7C4DFF', VD = '#5B2FD6', TEAL = '#13C2AE', CORAL = '#FF7A59', LIGHT = '#F1ECFF'

// Голова Бипи в координатах Mascot (x 25..175, y 7..142), счастливая
const head = (mono = false) => mono ? `
  <mask id="m"><rect x="0" y="0" width="200" height="200" fill="#fff"/>
    <g stroke="#000" stroke-width="5.5" stroke-linecap="round" fill="none">
      <path d="M68 89 Q78 75 88 89"/><path d="M112 89 Q122 75 132 89"/></g>
    <path d="M82 100 H118 Q117 119 100 119 Q83 119 82 100 Z" fill="#000"/></mask>
  <g fill="#fff"><path d="M100 42 V22" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    <circle cx="100" cy="17" r="10"/><rect x="25" y="70" width="19" height="36" rx="9.5"/>
    <rect x="156" y="70" width="19" height="36" rx="9.5"/>
    <rect x="37" y="37" width="126" height="105" rx="38" mask="url(#m)"/></g>` : `
  <path d="M100 42 V22" stroke="${VD}" stroke-width="6" stroke-linecap="round"/>
  <circle cx="100" cy="17" r="10" fill="${CORAL}"/>
  <circle cx="96.5" cy="13.5" r="3.2" fill="#fff" opacity=".75"/>
  <rect x="25" y="70" width="19" height="36" rx="9.5" fill="${TEAL}"/>
  <rect x="156" y="70" width="19" height="36" rx="9.5" fill="${TEAL}"/>
  <rect x="29" y="76" width="5" height="12" rx="2.5" fill="#fff" opacity=".45"/>
  <rect x="37" y="44" width="126" height="98" rx="38" fill="${VD}"/>
  <rect x="37" y="37" width="126" height="98" rx="38" fill="${V}"/>
  <rect x="56" y="45" width="36" height="9" rx="4.5" fill="#fff" opacity=".22"/>
  <rect x="53" y="57" width="94" height="64" rx="26" fill="#F4F0FF"/>
  <g stroke="${INK}" stroke-width="5.5" stroke-linecap="round" fill="none">
    <path d="M68 89 Q78 75 88 89"/><path d="M112 89 Q122 75 132 89"/></g>
  <ellipse cx="65" cy="104" rx="8.5" ry="5" fill="#FF9C85" opacity=".9"/>
  <ellipse cx="135" cy="104" rx="8.5" ry="5" fill="#FF9C85" opacity=".9"/>
  <path d="M82 99 H118 Q117 118 100 118 Q83 118 82 99 Z" fill="${INK}"/>
  <ellipse cx="100" cy="113" rx="8" ry="4" fill="${CORAL}"/>`

// голова центрируется: центр (100,79), масштаб s, в холсте 200x200
const place = (s, mono) => `<g transform="translate(100 100) scale(${s}) translate(-100 -79)">${head(mono)}</g>`
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">${body}</svg>`

const jobs = [
  // iOS: квадрат без прозрачности и скруглений
  ['icon.png', 1024, false, svg(`<defs><radialGradient id="g" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#9670FF"/><stop offset="1" stop-color="${V}"/></radialGradient></defs>
    <rect width="200" height="200" fill="url(#g)"/><circle cx="100" cy="102" r="80" fill="${LIGHT}"/>${place(0.88)}`)],
  ['android-icon-foreground.png', 1024, true, svg(`<circle cx="100" cy="101" r="54" fill="${LIGHT}"/>${place(0.6)}`)],
  ['android-icon-monochrome.png', 1024, true, svg(place(0.6, true))],
  ['splash-icon.png', 512, true, svg(`<circle cx="100" cy="102" r="96" fill="${LIGHT}"/>${place(1.08)}`)],
  ['favicon.png', 64, true, svg(`<rect width="200" height="200" rx="44" fill="${LIGHT}"/>${place(1.12)}`)],
]

const browser = await chromium.launch()
for (const [name, px, transparent, s] of jobs) {
  const page = await browser.newPage({ viewport: { width: px, height: px } })
  await page.setContent(`<html><body style="margin:0;background:transparent"><div style="width:${px}px;height:${px}px">${s}</div></body></html>`)
  await page.screenshot({ path: A(name), omitBackground: transparent, clip: { x: 0, y: 0, width: px, height: px } })
  await page.close()
  console.log('✓', name)
}
await browser.close()
