/**
 * Ядро i18n Вайбика без зависимостей (без контента курса — его подключает src/i18n/index.ts).
 *
 *   t('lesson.check')                         → «Проверить» / “Check” …
 *   t('home.streakDays', { n: 5 })            → плюралы по правилам языка (ru: one/few/many, kk/en/es: one/other, zh: other)
 *   t('profile.hello', { name: 'Аида' })      → подстановка {name}
 *
 * Каталоги UI — src/i18n/ui/<locale>.ts (ru.ts — источник, ключи плоские «экран.что»).
 * Контент курса (уроки, домашки, тиры) — отдельно, в src/i18n/content (переводы как данные).
 * Цены всегда в USD: formatUsd() только форматирует число по-местному.
 */
import { FALLBACK_LOCALE, LOCALES, LOCALE_META, LOCALE_STORAGE_KEY, SOURCE_LOCALE, isLocale, type Locale } from './locales'
import { ru } from './ui/ru'

export * from './locales'

export type PluralCategory = 'one' | 'few' | 'many' | 'other'
export type PluralForms = Partial<Record<PluralCategory, string>>
export type Msg = string | PluralForms
export type Catalog = Record<string, Msg>
export type UIKey = keyof typeof ru
export type Params = Record<string, string | number>

/** Какие формы обязаны быть у плюральной строки в каждом языке */
export const PLURAL_CATEGORIES: Record<Locale, PluralCategory[]> = {
  ru: ['one', 'few', 'many'],
  kk: ['one', 'other'],
  en: ['one', 'other'],
  es: ['one', 'other'],
  zh: ['other'],
}

/** Правила множественного числа (свои, чтобы не зависеть от ICU-данных в окружении) */
export function pluralCategory(locale: Locale, n: number): PluralCategory {
  const abs = Math.abs(n)
  switch (locale) {
    case 'ru': {
      if (!Number.isInteger(abs)) return 'few' // 1,5 токена
      const a = abs % 100
      const b = a % 10
      if (a > 10 && a < 20) return 'many'
      if (b === 1) return 'one'
      if (b >= 2 && b <= 4) return 'few'
      return 'many'
    }
    case 'kk':
    case 'en':
    case 'es':
      return abs === 1 ? 'one' : 'other'
    case 'zh':
      return 'other'
  }
}

/** {name} → значение; неизвестные плейсхолдеры остаются как есть (их ловит валидатор) */
export const interpolate = (s: string, params?: Params) => (params ? s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m)) : s)

/** Имена плейсхолдеров в строке */
export const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1])

/* ---------------------------------------------------------------- каталоги и текущий язык */

const LOADERS: Record<Exclude<Locale, 'ru'>, () => Promise<Catalog>> = {
  en: () => import('./ui/en').then((m) => m.en),
  kk: () => import('./ui/kk').then((m) => m.kk),
  es: () => import('./ui/es').then((m) => m.es),
  zh: () => import('./ui/zh').then((m) => m.zh),
}

const catalogs = new Map<Locale, Catalog>([['ru', ru]])
let current: Locale = SOURCE_LOCALE
const listeners = new Set<(l: Locale) => void>()

export const getLocale = () => current
export const isLocaleLoaded = (l: Locale) => catalogs.has(l)
export const registerCatalog = (l: Locale, c: Catalog) => void catalogs.set(l, c)

/** Подписка на смену языка (для useSyncExternalStore в React) */
export function onLocaleChange(cb: (l: Locale) => void) {
  listeners.add(cb)
  return () => void listeners.delete(cb)
}

/** Загрузить UI-каталог и контент курса языка (отдельные чанки) */
export async function loadLocale(l: Locale): Promise<void> {
  if (!catalogs.has(l) && l !== 'ru') catalogs.set(l, await LOADERS[l]())
  for (const fn of extraLoaders) await fn(l)
}

/** Дополнительные загрузчики языка (контент курса и т.п.) — регистрирует src/i18n/index.ts */
const extraLoaders: ((l: Locale) => Promise<void>)[] = []
export const registerLocaleLoader = (fn: (l: Locale) => Promise<void>) => void extraLoaders.push(fn)

/** Сменить язык: загрузить, запомнить в localStorage, оповестить подписчиков */
export async function setLocale(l: Locale, opts: { persist?: boolean } = {}): Promise<void> {
  await loadLocale(l)
  current = l
  for (const fn of beforeNotify) fn(l)
  if (opts.persist !== false) {
    try {
      globalThis.localStorage?.setItem(LOCALE_STORAGE_KEY, l)
    } catch {
      /* приватный режим */
    }
  }
  listeners.forEach((cb) => cb(l))
}

const beforeNotify: ((l: Locale) => void)[] = []
/** Синхронный хук «язык сменился» до оповещения подписчиков (переключение данных курса) */
export const registerLocaleApplier = (fn: (l: Locale) => void) => void beforeNotify.push(fn)

/** <html lang> — вызывать после setLocale (веб) */
export function applyHtmlLang(l: Locale = current) {
  if (typeof document !== 'undefined') document.documentElement.lang = LOCALE_META[l].tag
}

/**
 * Язык по умолчанию: сохранённый выбор → язык браузера → en.
 * ru/uk/be → ru, kk → kk, en → en, es → es, zh (любой вариант) → zh; остальные → en.
 */
export function detectLocale(env: { stored?: string | null; languages?: readonly string[] } = {}): Locale {
  let stored = env.stored
  if (stored === undefined) {
    try {
      stored = globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY) ?? null
    } catch {
      stored = null
    }
  }
  if (isLocale(stored)) return stored
  const nav = (globalThis as { navigator?: { languages?: readonly string[]; language?: string } }).navigator
  const langs = env.languages ?? nav?.languages ?? (nav?.language ? [nav.language] : [])
  for (const tag of langs) {
    const base = tag.toLowerCase().split(/[-_]/)[0]
    if (base === 'ru' || base === 'uk' || base === 'be') return 'ru'
    if (isLocale(base)) return base
  }
  return FALLBACK_LOCALE
}

/** Перевод по ключу. Фолбэк: текущий язык → русский → сам ключ. */
export function t(key: UIKey, params?: Params, locale: Locale = current): string {
  const msg = catalogs.get(locale)?.[key] ?? (ru as Catalog)[key]
  if (msg === undefined) return key
  if (typeof msg === 'string') return interpolate(msg, params)
  const n = Number(params?.n ?? params?.count ?? 0)
  const cat = pluralCategory(locale === current || catalogs.get(locale)?.[key] ? locale : SOURCE_LOCALE, n)
  const form = msg[cat] ?? msg.other ?? msg.many ?? msg.one ?? ''
  return interpolate(form, { ...params, n: formatNumber(n, locale) })
}

/** Строка сообщения без подстановок (для tx); плюральная — по n */
export function rawMessage(key: UIKey, n?: number, locale: Locale = current): string {
  const own = catalogs.get(locale)?.[key]
  const msg = own ?? (ru as Catalog)[key]
  if (msg === undefined) return key
  if (typeof msg === 'string') return msg
  const form = msg[pluralCategory(own ? locale : SOURCE_LOCALE, n ?? 0)] ?? msg.other ?? msg.many ?? msg.one ?? ''
  return form.replace(/\{n\}/g, formatNumber(n ?? 0, locale))
}

/* ---------------------------------------------------------------- Intl */

const nf = new Map<string, Intl.NumberFormat>()
function getNf(locale: Locale, opts: Intl.NumberFormatOptions) {
  const k = locale + JSON.stringify(opts)
  let f = nf.get(k)
  if (!f) {
    f = new Intl.NumberFormat(LOCALE_META[locale].tag, opts)
    nf.set(k, f)
  }
  return f
}

/** 12000 → «12 000» (ru/kk), «12,000» (en/zh), «12.000» (es) */
export const formatNumber = (n: number, locale: Locale = current) => getNf(locale, { maximumFractionDigits: 2 }).format(n)

/** Центы → цена в долларах по-местному: 999 → «$9.99» (en), «9,99 $» (ru), «US$9.99» (zh)… Целые — без копеек. */
export function formatUsd(cents: number, locale: Locale = current) {
  const whole = cents % 100 === 0
  return getNf(locale, { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol', minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(cents / 100)
}

/** 0.5 → «50 %» / «50%» */
export const formatPercent = (x: number, locale: Locale = current) => getNf(locale, { style: 'percent', maximumFractionDigits: 0 }).format(x)

export const ALL_LOCALES = LOCALES

/** Дата по-местному: formatDate(iso, { day: 'numeric', month: 'long' }) → «5 октября» / “October 5” / «5 de octubre» / “10月5日” */
export const formatDate = (d: string | number | Date, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }, locale: Locale = current) =>
  new Date(d).toLocaleDateString(LOCALE_META[locale].tag, opts)
