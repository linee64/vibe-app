// Проверка переводов: npx jiti scripts/validate/i18n.ts [--write-fingerprints]
//
// Контент (src/i18n/content/<loc>/u1..u5.ts, homework.ts, tiers.ts, economy.ts):
//  • накладка повторяет форму русского источника: нет лишних ключей, служебные поля не трогаются,
//    массивы той же длины, у каждого урока есть перевод каждого упражнения (lesson id + индекс);
//  • правильные ответы, их позиции и число вариантов совпадают с русской версией после перемешивания;
//  • код не меняется: строки кода без кириллицы — байт в байт, префиксы диффа (+/-/пробел) те же;
//  • покрытие: в en/es/zh после наложения не осталось кириллицы, в kk — нет непереведённых русских строк,
//    нет «латиницы вместо казахского» и длинных строк без казахских букв (похоже на русский);
//  • отпечатки русского текста (fingerprints.ts) совпадают — иначе источник поменялся после перевода;
//  • домашки: «правильный путь» на каждом языке выполняет все требования в локализованном симуляторе,
//    а расплывчатый промпт — нет.
// UI (src/i18n/ui/<loc>.ts): те же ключи, что в ru.ts, те же плейсхолдеры, нужные формы множественного числа.
import { writeFileSync } from 'node:fs'
import { UNITS } from '../../src/data/course'
import { HOMEWORKS } from '../../src/data/homework'
import { TIERS, SOON_TOPICS } from '../../src/data/tiers'
import { SHOP } from '../../src/data/economy'
import type { Exercise, Unit } from '../../src/data/types'
import { LOCALES, type Locale } from '../../src/i18n/locales'
import { applyTr, collectStrings, fingerprint, hasCyrillic, replaceExact } from '../../src/i18n/content/overlay'
import type { ContentPack, Tr, UnitTr } from '../../src/i18n/content/types'
import { RAW_UNITS, getLocalizedUnit, getLocalizedHomework, registerContentPack } from '../../src/i18n/content/index'
import { runHomeworkSolution } from '../../src/i18n/homework/run'
import { PLURAL_CATEGORIES, placeholders, type Catalog, type Msg } from '../../src/i18n/index'

const WRITE = process.argv.includes('--write-fingerprints')
const TARGETS = LOCALES.filter((l) => l !== 'ru') as Exclude<Locale, 'ru'>[]
const errors: string[] = []
const warns: string[] = []
const err = (m: string) => errors.push(m)

/** Поля, которые накладка не имеет права менять */
const PROTECTED = new Set(['kind', 't', 'tone', 'theme', 'type', 'from', 'mode', 'color', 'id', 'unitId', 'size', 'align', 'cols', 'emoji', 'action', 'url', 'num'])
/** Поля с кодом/путями: строки без кириллицы должны совпадать с источником байт в байт */
const CODE_KEYS = new Set(['code', 'lines', 'file'])
/** Кириллица, которую можно оставить в en/es/zh */
const ALLOWED_CYR = /^(Русский|Қазақша|Вайбик)$/
const KK_LETTERS = /[әғқңөұүһіӘҒҚҢӨҰҮҺІ]/
/** Сколько кириллических букв в строке (код и латиница не считаются) */
const cyrCount = (s: string) => (s.match(/\p{Script=Cyrillic}/gu) ?? []).length
/** Строки, которые в казахском законно совпадают с русскими (имена, слова-заимствования, код) */
const KK_SAME = new Set(['Ноутбук → телефон', '// фронтенд', '// сервер', 'Лотос', '🪷 Лотос', '🥐 Пышка', '-  <a href="/catalog">Каталог</a>', 'Термос 7 500 ₸'])

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)

/* ------------------------------------------------------------------ структура накладки */

function checkShape(src: unknown, tr: Tr | undefined, path: string, key = '') {
  if (tr === undefined) return
  // в решении домашки «type» — это текст, который ученик печатает, его переводим
  if (PROTECTED.has(key) && !(key === 'type' && /\.solution\[\d+\]\.type$/.test(path))) return err(`${path}: служебное поле «${key}» нельзя переводить`)
  if (typeof src === 'string') {
    if (typeof tr !== 'string') return err(`${path}: ожидалась строка`)
    if (!tr.trim()) return err(`${path}: пустая строка`)
    if (tr !== tr.trim() && src === src.trimEnd() && src === src.trimStart()) err(`${path}: лишние пробелы по краям`)
    return
  }
  if (Array.isArray(src)) {
    if (Array.isArray(tr)) {
      if (tr.length !== src.length) err(`${path}: длина массива ${tr.length}, в источнике ${src.length}`)
      tr.forEach((v, i) => checkShape(src[i], v, `${path}[${i}]`, CODE_KEYS.has(key) ? key : ''))
    } else if (isObj(tr)) {
      for (const k of Object.keys(tr)) {
        const i = Number(k)
        if (!Number.isInteger(i) || i < 0 || i >= src.length) err(`${path}: индекс ${k} вне массива (длина ${src.length})`)
        else checkShape(src[i], tr[k], `${path}[${i}]`, CODE_KEYS.has(key) ? key : '')
      }
    } else err(`${path}: ожидался массив или объект с индексами`)
    if (CODE_KEYS.has(key)) codeLines(src, tr, path)
    return
  }
  if (isObj(src)) {
    if (!isObj(tr)) return err(`${path}: ожидался объект`)
    for (const k of Object.keys(tr)) {
      if (!(k in src)) err(`${path}.${k}: такого поля нет в источнике`)
      else checkShape(src[k], tr[k], `${path}.${k}`, k)
    }
    return
  }
  err(`${path}: в источнике не текст (${typeof src}) — переводить нечего`)
}

/** Код: строки без кириллицы не меняются, префиксы диффа сохраняются */
function codeLines(src: unknown[], tr: Tr, path: string) {
  const get = (i: number) => (Array.isArray(tr) ? tr[i] : (tr as Record<string, Tr>)[String(i)])
  src.forEach((line, i) => {
    const t = get(i)
    if (typeof line !== 'string' || typeof t !== 'string') return
    if (!hasCyrillic(line) && t !== line) err(`${path}[${i}]: строка кода без русского текста изменена: «${t}»`)
    if (/^[+\- ]/.test(line) && /^[+-]/.test(line) !== /^[+-]/.test(t)) err(`${path}[${i}]: префикс диффа изменён`)
    if (/^[+-]/.test(line) && line[0] !== t[0]) err(`${path}[${i}]: префикс диффа «${line[0]}» → «${t[0]}»`)
  })
}

/* ------------------------------------------------------------------ покрытие (кириллица) */

function coverage(loc: Locale, src: unknown, out: unknown, where: string) {
  const a = collectStrings(src)
  const b = collectStrings(out)
  if (a.length !== b.length) return err(`${where}: форма после наложения не совпала (${a.length} ≠ ${b.length} строк)`)
  let missing = 0
  a.forEach((s, i) => {
    const t = b[i]
    if (!hasCyrillic(s)) return
    if (loc === 'kk') {
      if (t === s && !KK_SAME.has(s) && !(s.length <= 30 && s.split(/\s+/).filter((w) => /\p{Script=Cyrillic}/u.test(w)).length <= 1)) {
        missing++
        if (missing <= 5) err(`${where}: kk не переведено: «${s.slice(0, 70)}»`)
      } else if (!hasCyrillic(t) && t.length > 3) err(`${where}: kk без кириллицы (латиница вместо казахского?): «${t.slice(0, 70)}»`)
      else if (cyrCount(t) >= 30 && !KK_LETTERS.test(t)) err(`${where}: kk без казахских букв — похоже на русский: «${t.slice(0, 70)}»`)
    } else if (hasCyrillic(t) && !ALLOWED_CYR.test(t)) {
      missing++
      if (missing <= 5) err(`${where}: ${loc} осталась кириллица: «${t.slice(0, 70)}»`)
    }
  })
  if (missing > 5) err(`${where}: … и ещё ${missing - 5} непереведённых строк`)
  return missing
}

/* ------------------------------------------------------------------ инварианты ответов */

function answerShape(e: Exercise) {
  switch (e.kind) {
    case 'choice':
    case 'nextmove':
      return { n: e.options.length, c: e.correct }
    case 'predict':
      return { n: e.outcomes.length, c: e.correct }
    case 'bug':
      return { n: e.code.length, c: e.correct }
    case 'duel':
      return { n: e.reasons.length, c: e.reason, w: e.winner, p: e.sides.map((s) => s.prompt.length > 0) }
    case 'upgrade':
      return { n: e.chips.length, traps: e.chips.map((c) => !!c.trap), pw: e.chips.map((c) => c.power) }
    case 'diff':
      return { n: e.hunks.length, bad: e.hunks.map((h) => !!h.harmful) }
    case 'pipeline':
      return { n: e.steps.length, x: e.extra?.length ?? 0 }
  }
}

/* ------------------------------------------------------------------ загрузка */

async function load<T>(path: string, name: string): Promise<T | undefined> {
  try {
    const m = await import(path)
    return (m[name] ?? m.default) as T
  } catch (e) {
    if (String(e).includes('Cannot find module') || String(e).includes('ENOENT') || String(e).includes('Failed to load')) return undefined
    throw e
  }
}

const fpNow: Record<string, string> = {}
for (const u of RAW_UNITS) for (const l of u.lessons) l.exercises.forEach((ex, i) => (fpNow[`${l.id}#${i}`] = fingerprint(ex)))
for (const u of RAW_UNITS) fpNow[u.id] = fingerprint({ t: u.title, s: u.subtitle, d: u.description, l: u.lessons.map((l) => l.title) })
for (const h of HOMEWORKS) fpNow[h.id] = fingerprint(h)
fpNow.tiers = fingerprint({ TIERS, SOON_TOPICS })
fpNow.economy = fingerprint(SHOP)

if (WRITE) {
  const body = Object.entries(fpNow).map(([k, v]) => `  '${k}': '${v}',`).join('\n')
  writeFileSync(
    new URL('../../src/i18n/content/fingerprints.ts', import.meta.url),
    `// Сгенерировано: npx jiti scripts/validate/i18n.ts --write-fingerprints\n// Отпечатки русского текста, с которого сделаны переводы. Не править вручную.\nexport const FINGERPRINTS: Record<string, string> = {\n${body}\n}\n`,
  )
  console.log(`Записаны отпечатки: ${Object.keys(fpNow).length}`)
}
const fpSaved = (await load<Record<string, string>>('../../src/i18n/content/fingerprints.ts', 'FINGERPRINTS')) ?? {}
for (const [k, v] of Object.entries(fpNow))
  if (fpSaved[k] && fpSaved[k] !== v) err(`${k}: русский источник изменился после перевода — обнови переводы во всех языках и запусти --write-fingerprints`)
if (!Object.keys(fpSaved).length) warns.push('нет src/i18n/content/fingerprints.ts — запусти с --write-fingerprints')

/* ------------------------------------------------------------------ контент */

const stats: Record<string, { lessons: number; exercises: number; homework: number; ui: number; uiTotal: number }> = {}
const exTotal = UNITS.reduce((n, u) => n + u.lessons.reduce((m, l) => m + l.exercises.length, 0), 0)
const lessonTotal = UNITS.reduce((n, u) => n + u.lessons.length, 0)

for (const loc of TARGETS) {
  const st = (stats[loc] = { lessons: 0, exercises: 0, homework: 0, ui: 0, uiTotal: 0 })
  const units: Partial<Record<string, UnitTr>> = {}
  for (const raw of RAW_UNITS) {
    const tr = await load<UnitTr>(`../../src/i18n/content/${loc}/${raw.id}.ts`, raw.id)
    if (!tr) {
      err(`${loc}/${raw.id}.ts: нет файла перевода`)
      continue
    }
    units[raw.id] = tr
    for (const f of ['title', 'subtitle', 'description'] as const) if (!tr[f]?.trim()) err(`${loc}/${raw.id}: нет ${f}`)
    for (const id of Object.keys(tr.lessons)) if (!raw.lessons.some((l) => l.id === id)) err(`${loc}/${raw.id}: лишний урок ${id}`)
  }
  const kit = (await load<Record<string, string>>(`../../src/i18n/content/${loc}/kit.ts`, 'kit')) ?? {}
  const homework = await load<ContentPack['homework']>(`../../src/i18n/content/${loc}/homework.ts`, 'homework')
  const tiers = await load<ContentPack['tiers']>(`../../src/i18n/content/${loc}/tiers.ts`, 'tiers')
  const economy = await load<ContentPack['economy']>(`../../src/i18n/content/${loc}/economy.ts`, 'economy')
  registerContentPack(loc, {
    units: units as ContentPack['units'],
    homework: homework ?? ({} as ContentPack['homework']),
    tiers: tiers ?? { tiers: {} as ContentPack['tiers']['tiers'], soon: [] },
    economy: economy ?? ({ shop: {} } as ContentPack['economy']),
    kit,
  })

  for (const raw of RAW_UNITS) {
    const tr = units[raw.id]
    if (!tr) continue
    const ru = UNITS.find((u) => u.id === raw.id)!
    const locUnit = getLocalizedUnit(raw.id, loc) as Unit
    coverage(loc, { t: raw.title, s: raw.subtitle, d: raw.description }, { t: locUnit.title, s: locUnit.subtitle, d: locUnit.description }, `${loc}/${raw.id}`)
    raw.lessons.forEach((l, li) => {
      const lt = tr.lessons[l.id]
      const where = `${loc}/${l.id}`
      if (!lt) return err(`${where}: нет перевода урока`)
      if (!lt.title?.trim()) err(`${where}: нет названия урока`)
      else coverage(loc, l.title, lt.title, `${where} title`)
      if (!Array.isArray(lt.ex) || lt.ex.length !== l.exercises.length) err(`${where}: упражнений ${lt.ex?.length ?? 0}, в источнике ${l.exercises.length}`)
      let lessonOk = !!lt.title?.trim() && lt.ex?.length === l.exercises.length
      l.exercises.forEach((ex, i) => {
        const w = `${where} #${i + 1} (${ex.kind})`
        const et = lt.ex?.[i]
        if (!et) {
          lessonOk = false
          return err(`${w}: нет перевода`)
        }
        const before = errors.length
        checkShape(ex, et, w)
        const applied = replaceExact(applyTr(ex, et), kit)
        const miss = coverage(loc, ex, applied, w) ?? 1
        const a = answerShape(locUnit.lessons[li].exercises[i])
        const b = answerShape(ru.lessons[li].exercises[i])
        if (JSON.stringify(a) !== JSON.stringify(b)) err(`${w}: ответы/позиции не совпадают с ru: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`)
        if (errors.length === before && miss === 0) st.exercises++
        else lessonOk = false
      })
      if (lessonOk) st.lessons++
    })
  }

  /* домашки */
  if (!homework) err(`${loc}/homework.ts: нет файла`)
  else
    for (const hw of HOMEWORKS) {
      const tr = homework[hw.id as keyof typeof homework]
      const w = `${loc}/${hw.id}`
      if (!tr) {
        err(`${w}: нет перевода`)
        continue
      }
      const before = errors.length
      checkShape(hw, tr, w)
      const loch = getLocalizedHomework(hw.id, loc)!
      coverage(loc, hw, loch, w)
      for (const step of loch.solution)
        if ('block' in step && !loch.blocks.some((b) => b.label === step.block)) err(`${w}: шаг решения ссылается на блок «${step.block}», которого нет`)
      if (new Set(loch.blocks.map((b) => b.label)).size !== loch.blocks.length) err(`${w}: одинаковые подписи блоков`)
      const good = runHomeworkSolution(loch, loc, loch.solution)
      const bad = Object.entries(good.checks).filter(([, v]) => !v).map(([k]) => k)
      if (bad.length) err(`${w}: правильный путь не выполняет: ${bad.join(', ')}\n${good.log.join('\n')}`)
      const vague = runHomeworkSolution(loch, loc, [{ type: loch.vague }, { send: true }])
      if (Object.values(vague.checks).every(Boolean)) err(`${w}: расплывчатый промпт «${loch.vague}» засчитан`)
      if (errors.length === before) st.homework++
    }

  /* тиры и экономика */
  if (!tiers) err(`${loc}/tiers.ts: нет файла`)
  else {
    for (const t of TIERS) {
      const tt = tiers.tiers[t.id]
      if (!tt) {
        err(`${loc}/tiers: нет ${t.id}`)
        continue
      }
      checkShape({ name: t.name, outcome: t.outcome, skills: t.skills }, tt as unknown as Tr, `${loc}/tiers.${t.id}`)
      coverage(loc, { name: t.name, outcome: t.outcome, skills: t.skills }, applyTr({ name: t.name, outcome: t.outcome, skills: t.skills }, tt as unknown as Tr), `${loc}/tiers.${t.id}`)
    }
    checkShape(SOON_TOPICS, tiers.soon, `${loc}/tiers.soon`)
    coverage(loc, SOON_TOPICS, applyTr(SOON_TOPICS, tiers.soon), `${loc}/tiers.soon`)
  }
  if (!economy) err(`${loc}/economy.ts: нет файла`)
  else {
    if (!economy.vp?.trim()) err(`${loc}/economy: нет vp`)
    for (const k of ['charge', 'tokens', 'streak', 'vibePoints'] as const) if (!economy.terms?.[k]?.trim()) err(`${loc}/economy.terms: нет ${k}`)
    for (const s of SHOP) {
      const tr = economy.shop?.[s.id as keyof typeof economy.shop]
      if (!tr) err(`${loc}/economy.shop: нет ${s.id}`)
      else {
        checkShape({ title: s.title, desc: s.desc }, tr as unknown as Tr, `${loc}/economy.shop.${s.id}`)
        coverage(loc, { title: s.title, desc: s.desc }, tr, `${loc}/economy.shop.${s.id}`)
      }
    }
    if (loc !== 'kk' && hasCyrillic(economy.vp)) err(`${loc}/economy.vp: кириллица`)
  }
  for (const [k, v] of Object.entries(kit)) {
    if (!v.trim()) err(`${loc}/kit «${k}»: пусто`)
    coverage(loc, k, v, `${loc}/kit`)
  }
}

/* ------------------------------------------------------------------ UI */

const ruUi = await load<Catalog>('../../src/i18n/ui/ru.ts', 'ru')
if (!ruUi) err('src/i18n/ui/ru.ts: нет файла')
else {
  const keys = Object.keys(ruUi)
  const forms = (m: Msg) => (typeof m === 'string' ? [m] : Object.values(m))
  const phSet = (m: Msg) => [...new Set(forms(m).flatMap(placeholders))].sort().join(',')
  for (const k of keys) for (const f of forms(ruUi[k])) if (!f.trim()) err(`ui/ru ${k}: пусто`)
  for (const loc of TARGETS) {
    const cat = await load<Catalog>(`../../src/i18n/ui/${loc}.ts`, loc)
    if (!cat) {
      err(`ui/${loc}.ts: нет файла`)
      continue
    }
    const st = stats[loc]
    st.uiTotal = keys.length
    for (const k of Object.keys(cat)) if (!(k in ruUi)) err(`ui/${loc}: лишний ключ ${k}`)
    for (const k of keys) {
      const m = cat[k]
      const w = `ui/${loc} ${k}`
      if (m === undefined) {
        err(`${w}: нет перевода`)
        continue
      }
      const before = errors.length
      const src = ruUi[k]
      if (typeof src === 'string' !== (typeof m === 'string')) err(`${w}: строка vs формы множественного числа не совпадают с ru`)
      if (typeof m !== 'string') {
        const need = PLURAL_CATEGORIES[loc]
        for (const c of need) if (!(m as Record<string, string>)[c]?.trim()) err(`${w}: нет формы «${c}»`)
        for (const c of Object.keys(m)) if (!need.includes(c as never)) err(`${w}: лишняя форма «${c}»`)
      }
      for (const f of forms(m)) if (!f.trim()) err(`${w}: пустая строка`)
      if (phSet(m) !== phSet(src)) err(`${w}: плейсхолдеры {${phSet(m)}} ≠ ru {${phSet(src)}}`)
      const tagSet = (x: Msg) => [...new Set(forms(x).flatMap((f) => f.match(/<\/?\d+\/?>/g) ?? []))].sort().join('')
      if (tagSet(m) !== tagSet(src)) err(`${w}: теги ${tagSet(m)} ≠ ru ${tagSet(src)}`)
      for (const f of forms(m)) {
        if (loc === 'kk') {
          if (forms(src).includes(f) && hasCyrillic(f) && /\s/.test(f.trim()) && f.length > 15) err(`${w}: kk совпадает с ru: «${f}»`)
          if (hasCyrillic(forms(src).join('')) && !hasCyrillic(f) && f.replace(/\{\w+\}/g, '').trim().length > 3 && /[a-z]{4}/i.test(f) && !/^[\w\s.,:·@/+-]*$/.test(f.replace(/[A-Z][\w.]+/g, ''))) err(`${w}: kk латиницей: «${f}»`)
          if (cyrCount(f) >= 30 && !KK_LETTERS.test(f)) err(`${w}: kk без казахских букв: «${f}»`)
        } else if (hasCyrillic(f.replace(/Русский|Қазақша|Вайбик/g, ''))) err(`${w}: кириллица в ${loc}: «${f}»`)
      }
      if (errors.length === before) st.ui++
    }
  }
}

/* ------------------------------------------------------------------ отчёт */

console.log(`Источник: ${lessonTotal} уроков, ${exTotal} упражнений, ${HOMEWORKS.length} домашек${ruUi ? `, ${Object.keys(ruUi).length} UI-ключей` : ''}`)
for (const [loc, s] of Object.entries(stats))
  console.log(`  ${loc}: уроки ${s.lessons}/${lessonTotal} · упражнения ${s.exercises}/${exTotal} · домашки ${s.homework}/${HOMEWORKS.length} · UI ${s.ui}/${s.uiTotal}`)
for (const w of warns) console.log('⚠ ' + w)
if (errors.length) {
  console.log(`\n✗ Ошибок: ${errors.length}`)
  for (const e of errors.slice(0, Number(process.env.MAX ?? 80))) console.log('  ' + e)
  process.exit(1)
}
console.log('\n✓ Переводы в порядке')
