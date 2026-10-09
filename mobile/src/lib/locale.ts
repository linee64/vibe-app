/**
 * Язык мобильного приложения: те же каталоги и контент, что в вебе (@web/i18n).
 * Старт: сохранённый выбор (AsyncStorage) → язык телефона (expo-localization) → en.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocales } from 'expo-localization'
import { LOCALE_STORAGE_KEY, type Locale } from '@web/i18n/core'
import { changeLocale, initLocale, onUserLocaleChange } from '@web/i18n/runtime'

/** Куда вернуться после смены языка (дерево экранов пересоздаётся) */
let returnTo: string | null = null
export const takeReturnRoute = () => {
  const r = returnTo
  returnTo = null
  return r
}

export async function initMobileLocale(): Promise<Locale> {
  let stored: string | null = null
  try {
    stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY)
  } catch {
    stored = null
  }
  let languages: string[] = []
  try {
    languages = getLocales().map((l) => l.languageTag)
  } catch {
    languages = []
  }
  return initLocale({ stored, languages })
}

onUserLocaleChange((l) => {
  void AsyncStorage.setItem(LOCALE_STORAGE_KEY, l).catch(() => {})
})

/** Явная смена языка из профиля; после пересоздания дерева вернёмся на route */
export async function switchLocale(l: Locale, route?: string) {
  returnTo = route ?? null
  await changeLocale(l)
}
