/**
 * Связка языка с данными приложения: при смене языка подменяем «живые» данные курса
 * (UNITS/ALL_LESSONS/HOMEWORKS/TIERS/SHOP/VP) на локализованные и ставим <html lang>.
 * Импортируется один раз из main.tsx (веб) и из корневого layout мобильного приложения.
 */
import { setCourseContent, UNITS_RU, DEMO_EXERCISE } from '../data/course'
import { setHomeworkContent, HOMEWORKS_RU } from '../data/homework'
import { setTierContent, TIERS_RU, SOON_TOPICS_RU } from '../data/tiers'
import { setEconomyContent, SHOP_RU, VP_RU } from '../data/economy'
import { applyHtmlLang, detectLocale, getLocale, registerLocaleApplier, setLocale, t, type Locale } from './index'
import {
  getLocalizedDemoExercise,
  getLocalizedHomeworks,
  getLocalizedShop,
  getLocalizedSoonTopics,
  getLocalizedTiers,
  getLocalizedUnits,
  getVpLabel,
} from './content/index'

const DEMO_RU = DEMO_EXERCISE

export function applyContent(l: Locale) {
  if (l === 'ru') {
    setCourseContent(UNITS_RU, DEMO_RU)
    setHomeworkContent(HOMEWORKS_RU)
    setTierContent(TIERS_RU, SOON_TOPICS_RU)
    setEconomyContent(VP_RU, SHOP_RU)
  } else {
    setCourseContent(getLocalizedUnits(l), getLocalizedDemoExercise(l) as typeof DEMO_RU)
    setHomeworkContent(getLocalizedHomeworks(l))
    setTierContent(getLocalizedTiers(l), getLocalizedSoonTopics(l))
    setEconomyContent(getVpLabel(l), getLocalizedShop(l))
  }
  applyHtmlLang(l)
  if (typeof document !== 'undefined') document.title = t('meta.title')
}

registerLocaleApplier(applyContent)

const changeListeners = new Set<(l: Locale, prev: Locale) => void>()
/** Подписка на смену языка пользователем (аналитика, синхронизация профиля) */
export const onUserLocaleChange = (fn: (l: Locale, prev: Locale) => void) => {
  changeListeners.add(fn)
  return () => void changeListeners.delete(fn)
}

/** Старт: сохранённый выбор → язык системы → en. Не запоминаем автоопределение — только явный выбор. */
export async function initLocale(env?: Parameters<typeof detectLocale>[0]): Promise<Locale> {
  const l = detectLocale(env)
  try {
    await setLocale(l, { persist: false })
  } catch {
    await setLocale('ru', { persist: false }) // чанк не загрузился (офлайн) — русский встроен
  }
  return getLocale()
}

/** Явная смена языка из переключателя */
export async function changeLocale(l: Locale): Promise<void> {
  const prev = getLocale()
  await setLocale(l)
  if (prev !== l) changeListeners.forEach((fn) => fn(l, prev))
}
