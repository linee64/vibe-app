/**
 * Точка входа i18n: ядро (t, плюралы, Intl, язык) + контент курса.
 * Модули данных (src/data/*) импортируют только './core', чтобы не было циклов с контентом.
 */
import { registerLocaleLoader } from './core'
import { loadLocaleContent } from './content/index'

export * from './core'

registerLocaleLoader(loadLocaleContent)
