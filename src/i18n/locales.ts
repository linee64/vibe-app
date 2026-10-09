/**
 * Языки продукта. Русский — исходный (source of truth), остальные — переводы поверх него.
 * Коды папок короткие (zh), а для html lang / Intl используем полные теги (zh-CN).
 */
export const LOCALES = ['ru', 'en', 'kk', 'es', 'zh'] as const
export type Locale = (typeof LOCALES)[number]

export const SOURCE_LOCALE: Locale = 'ru'
/** Для неизвестных языков браузера */
export const FALLBACK_LOCALE: Locale = 'en'
export const LOCALE_STORAGE_KEY = 'vaibik.locale'

export interface LocaleMeta {
  /** Название на самом языке — для переключателя */
  native: string
  /** Название по-английски — для логов/аналитики */
  english: string
  /** <html lang> и BCP-47 тег для Intl */
  tag: string
  /** Бренд в этом языке */
  brand: string
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  ru: { native: 'Русский', english: 'Russian', tag: 'ru', brand: 'Вайбик' },
  en: { native: 'English', english: 'English', tag: 'en', brand: 'Vaibik' },
  kk: { native: 'Қазақша', english: 'Kazakh', tag: 'kk', brand: 'Вайбик' },
  es: { native: 'Español', english: 'Spanish', tag: 'es', brand: 'Vaibik' },
  zh: { native: '中文', english: 'Chinese (Simplified)', tag: 'zh-CN', brand: 'Vaibik' },
}

export const isLocale = (x: unknown): x is Locale => typeof x === 'string' && (LOCALES as readonly string[]).includes(x)

/** Порядок в переключателе языка (веб и мобильное приложение) */
export const SWITCHER_ORDER: readonly Locale[] = ['en', 'kk', 'es', 'zh', 'ru']
