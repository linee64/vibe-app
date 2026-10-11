/**
 * Собирает письма Supabase Auth: supabase/templates/<file>.html + supabase/templates/subjects.json.
 * Тексты — scripts/email/copy.mjs, вёрстка — здесь. Результат — обычные Go-шаблоны Supabase:
 * их можно вставить в Dashboard как есть или отправить через scripts/email/apply.mjs.
 *
 * Язык письма — user_metadata.locale ({{ .Data.locale }}): ru, kk, es, zh — свои тексты,
 * всё остальное (нет locale, en, неизвестный код) — английский.
 * Хост картинки — ОДНА строка в начале каждого шаблона: {{ $asset := "https://…" }}.
 *
 * Запуск: npm run email:build
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { COMMON, EMAILS } from './copy.mjs'

export const DEFAULT_ASSET_BASE_URL = 'https://vaibik.site'
export const LOCALES = ['ru', 'en', 'kk', 'es', 'zh']
const ORDER = ['ru', 'kk', 'es', 'zh'] // en — ветка else (и для неизвестных языков)

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const TEMPLATES_DIR = resolve(root, 'supabase/templates')

/** Локаль из user_metadata → $l (всегда строка: printf защищает eq от не-строк и пустых данных) */
const PRELUDE = '{{- $l := "" -}}{{- with .Data -}}{{- with .locale -}}{{- $l = printf "%v" . -}}{{- end -}}{{- end -}}'
/** Единственное место с адресом картинок. apply.mjs подменяет его на EMAIL_ASSET_BASE_URL. */
export const assetLine = (base = DEFAULT_ASSET_BASE_URL) => `{{- $asset := "${base}" -}}`
export const ASSET_LINE_RE = /\{\{- \$asset := "([^"]*)" -\}\}/

/** {ru,en,kk,es,zh} → {{ if eq $l "ru" }}…{{ else if … }}{{ else }}en{{ end }} */
export function L(m) {
  for (const l of LOCALES) if (!(l in m)) throw new Error(`нет перевода ${l}: ${JSON.stringify(m)}`)
  if (LOCALES.every((l) => m[l] === m.en)) return m.en
  return ORDER.map((l, i) => `{{ ${i ? 'else if' : 'if'} eq $l "${l}" }}${m[l]}`).join('') + `{{ else }}${m.en}{{ end }}`
}

// ---------------------------------------------------------------- стиль
const INK = '#2F2A47'
const TEXT = '#4A4566'
const MUTED = '#8A84A8'
const V = '#7C4DFF'
const VD = '#5B2FD6'
const CORAL = '#FF7A59'
const TEAL = '#13C2AE'
const BG = '#F4F0FF'
const FONT = "'Nunito','Segoe UI','Helvetica Neue',Helvetica,Arial,'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans SC',sans-serif"

const DARK_CSS = `
:root { color-scheme: light dark; supported-color-schemes: light dark; }
body { margin:0; padding:0; }
a { text-decoration:none; }
.fallback a { word-break:break-all; }
@media (max-width: 600px) {
  .px { padding-left:22px !important; padding-right:22px !important; }
  .h1 { font-size:24px !important; }
}
@media (prefers-color-scheme: dark) {
  .bg { background-color:#16132A !important; }
  .card { background-color:#221E3B !important; border-color:#3A3366 !important; }
  .h1, .ink { color:#FFFFFF !important; }
  .txt { color:#DCD6F5 !important; }
  .muted { color:#A49DC7 !important; }
  .lnk { color:#B9A1FF !important; }
  .code { background-color:#2E2852 !important; color:#FFFFFF !important; border-color:#4A4180 !important; }
}
[data-ogsc] .h1, [data-ogsc] .ink { color:#FFFFFF !important; }
[data-ogsc] .txt { color:#DCD6F5 !important; }
[data-ogsc] .lnk { color:#B9A1FF !important; }
`.trim()

function button(e) {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;border-collapse:separate;">
<tr><td align="center" bgcolor="${V}" style="background-color:${V};border-radius:18px;border-bottom:5px solid ${VD};">
<a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:16px 34px;font-family:${FONT};font-size:18px;line-height:22px;font-weight:800;color:#FFFFFF;text-decoration:none;border-radius:18px;">${L(e.button)}</a>
</td></tr></table>`
}

function codeBox() {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;border-collapse:separate;">
<tr><td class="code" align="center" bgcolor="#F4F0FF" style="background-color:#F4F0FF;border:2px dashed #C9B8FF;border-radius:18px;padding:14px 28px;font-family:'SFMono-Regular',Menlo,Consolas,'Courier New',monospace;font-size:32px;line-height:38px;font-weight:700;letter-spacing:8px;color:${INK};">{{ .Token }}</td></tr></table>`
}

function render(e, asset = DEFAULT_ASSET_BASE_URL) {
  const fallback = `<tr><td class="px fallback" style="padding:22px 40px 0 40px;font-family:${FONT};font-size:13px;line-height:20px;color:${MUTED};" align="center">
<span class="muted" style="color:${MUTED};">${L(COMMON.fallback)}</span><br>
<a class="lnk" href="{{ .ConfirmationURL }}" target="_blank" style="color:${V};text-decoration:underline;word-break:break-all;">{{ .ConfirmationURL }}</a>
</td></tr>
<tr><td class="px muted" style="padding:12px 40px 0 40px;font-family:${FONT};font-size:13px;line-height:20px;color:${MUTED};" align="center">${L(COMMON.expires)}</td></tr>`
  const note = e.note
    ? `<tr><td class="px muted" style="padding:18px 40px 0 40px;font-family:${FONT};font-size:13px;line-height:20px;color:${MUTED};" align="center">${L(e.note)}</td></tr>`
    : ''
  const preheaderPad = '&#8199;&#65279;&#847; '.repeat(40)

  return `${PRELUDE}
${assetLine(asset)}
<!DOCTYPE html>
<html lang="${L({ ru: 'ru', en: 'en', kk: 'kk', es: 'es', zh: 'zh' })}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${L(e.subject)}</title>
<style>
${DARK_CSS}
</style>
</head>
<body class="bg" style="margin:0;padding:0;background-color:${BG};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${BG};">${L(e.preheader)}${preheaderPad}</div>
<table role="presentation" class="bg" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${BG}" style="background-color:${BG};width:100%;">
<tr><td align="center" style="padding:28px 12px 32px 12px;">

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" style="width:560px;max-width:100%;">
<tr><td align="center" class="ink" style="padding:0 0 16px 0;font-family:${FONT};font-size:22px;line-height:28px;font-weight:900;color:${V};letter-spacing:-0.3px;">
<span style="color:${V};">${L(COMMON.brand)}</span>
</td></tr>
<tr><td>

<table role="presentation" class="card" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" style="width:100%;background-color:#FFFFFF;border:3px solid #E4DAFF;border-radius:28px;border-collapse:separate;overflow:hidden;">
<tr><td style="padding:0;font-size:0;line-height:0;">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;">
<tr>
<td width="34%" height="10" bgcolor="${V}" style="background-color:${V};border-radius:25px 0 0 0;height:10px;font-size:0;line-height:0;">&nbsp;</td>
<td width="33%" height="10" bgcolor="${CORAL}" style="background-color:${CORAL};height:10px;font-size:0;line-height:0;">&nbsp;</td>
<td width="33%" height="10" bgcolor="${TEAL}" style="background-color:${TEAL};border-radius:0 25px 0 0;height:10px;font-size:0;line-height:0;">&nbsp;</td>
</tr></table>
</td></tr>
<tr><td align="center" style="padding:30px 40px 6px 40px;" class="px">
<img src="{{ $asset }}/email/bipi.png" width="120" height="120" alt="${L(COMMON.mascotAlt)}" style="display:block;width:120px;height:120px;max-width:120px;border:0;outline:none;text-decoration:none;font-family:${FONT};font-size:13px;color:${MUTED};">
</td></tr>
<tr><td align="center" class="px h1" style="padding:14px 40px 0 40px;font-family:${FONT};font-size:28px;line-height:34px;font-weight:900;color:${INK};">${L(e.title)}</td></tr>
<tr><td align="center" class="px txt" style="padding:12px 40px 0 40px;font-family:${FONT};font-size:17px;line-height:26px;color:${TEXT};">${L(e.body)}</td></tr>
<tr><td align="center" class="px" style="padding:28px 40px 0 40px;">
${e.code ? codeBox() : button(e)}
</td></tr>
${e.code ? note : fallback}
<tr><td style="padding:30px 0 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>

</td></tr>
<tr><td align="center" class="px" style="padding:22px 32px 0 32px;font-family:${FONT};font-size:13px;line-height:20px;color:${MUTED};">
<span class="ink" style="font-weight:800;color:${INK};">${L(COMMON.brand)}</span><span class="muted" style="color:${MUTED};"> — ${L(COMMON.tagline)}</span><br>
<span class="muted" style="color:${MUTED};">${L(e.reason)}</span>
</td></tr>
</table>

</td></tr>
</table>
</body>
</html>
`
}

/** Тема письма (одна строка: Supabase рендерит её как Go-шаблон с теми же данными, что и тело) */
export const subjectTemplate = (e) => `${PRELUDE}${L(e.subject)}`

export function build() {
  mkdirSync(TEMPLATES_DIR, { recursive: true })
  const subjects = {}
  for (const e of EMAILS) {
    writeFileSync(resolve(TEMPLATES_DIR, `${e.file}.html`), render(e))
    subjects[e.key] = { file: `${e.file}.html`, subject: subjectTemplate(e) }
  }
  writeFileSync(resolve(TEMPLATES_DIR, 'subjects.json'), JSON.stringify(subjects, null, 2) + '\n')
  return EMAILS.map((e) => `${e.file}.html`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const f of build()) console.log('✓ supabase/templates/' + f)
  console.log('✓ supabase/templates/subjects.json')
}
