/**
 * Рисует картинку Бипи для писем: public/email/bipi.png (240×240, 2× для показа 120×120).
 * Источник — тот же SVG-компонент, что в приложении (src/components/Mascot.tsx), на светлом
 * круглом «значке»: в тёмной теме почтовика робот не теряется на тёмном фоне.
 * Запуск: node scripts/email/mascot.mjs
 */
import { createJiti } from 'jiti'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const out = resolve(root, 'public/email/bipi.png')
const jiti = createJiti(import.meta.url, { jsx: { runtime: 'automatic' } })
const { createElement } = await import('react')
const { renderToStaticMarkup } = await import('react-dom/server')
const { Mascot } = await jiti.import(resolve(root, 'src/components/Mascot.tsx'))

const svg = renderToStaticMarkup(createElement(Mascot, { mood: 'happy', size: 92 }))
const html = `<!doctype html><html><body style="margin:0;background:transparent">
<div id="b" style="width:120px;height:120px;border-radius:50%;background:#F1ECFF;box-shadow:inset 0 0 0 4px #E2D8FF;
display:flex;align-items:center;justify-content:center;overflow:hidden">
<div style="margin-top:6px">${svg}</div></div></body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 200, height: 200 } })
await page.setContent(html)
mkdirSync(dirname(out), { recursive: true })
await page.locator('#b').screenshot({ path: out, omitBackground: true })
await browser.close()
console.log('✓', out)
