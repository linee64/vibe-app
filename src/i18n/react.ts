import { createElement, Fragment, useSyncExternalStore, type ReactNode } from 'react'
import { getLocale, onLocaleChange, type Locale } from './core'

/** Текущий язык; компонент перерисуется при смене */
export const useLocale = (): Locale => useSyncExternalStore(onLocaleChange, getLocale, getLocale)

/** Пересоздаёт поддерево при смене языка — все t() и данные курса перечитываются */
export function LocaleKeyed({ children }: { children: ReactNode }) {
  const locale = useLocale()
  return createElement(Fragment, { key: locale }, children)
}
