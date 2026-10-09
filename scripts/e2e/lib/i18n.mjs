// Язык для Playwright-скриптов: VAIBIK_LANG=en node scripts/e2e/playthrough.mjs [baseUrl]
// Грузит тот же контент и UI-каталог, что и приложение, и переводит русские подписи кнопок/текстов в выбранный язык.
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
export const LANG = process.env.VAIBIK_LANG || 'ru'
const core = await jiti.import('../../../src/i18n/index.ts')
await jiti.import('../../../src/i18n/runtime.ts') // регистрирует подмену данных курса при смене языка
if (!core.isLocale(LANG)) throw new Error(`VAIBIK_LANG=${LANG}: неизвестный язык`)
await core.setLocale(LANG, { persist: false })
// данные курса — уже на выбранном языке (тот же экземпляр модулей jiti)
export const course = await jiti.import('../../../src/data/course.ts')
export const homework = await jiti.import('../../../src/data/homework.ts')
export const tiers = await jiti.import('../../../src/data/tiers.ts')

const { ru } = await jiti.import('../../../src/i18n/ui/ru.ts')
const rev = new Map()
for (const [k, v] of Object.entries(ru)) if (typeof v === 'string' && !rev.has(v)) rev.set(v, k)

/** Перевод по ключу на язык прогона */
export const T = (key, params) => core.t(key, params, LANG)
/** Русская строка интерфейса → та же строка на языке прогона (по точному совпадению в ru-каталоге) */
export function L(s) {
  if (LANG === 'ru') return s
  const k = rev.get(s)
  if (!k) throw new Error(`i18n.mjs: нет ключа для «${s}»`)
  return core.t(k, undefined, LANG)
}
export const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
/** Без тегов-заглушек <0/> и обёрток <0>…</0> */
export const plain = (s) => s.replace(/<\/?\d+\/?>/g, '').replace(/\s+/g, ' ').trim()
