/**
 * Локализованный контент курса: переводы — это данные (src/i18n/content/<locale>/*), а не машинный перевод.
 *
 * Как устроено:
 *  1. Берём СЫРОЙ русский раздел (src/data/units/*.ts, до перемешивания вариантов).
 *  2. Накладываем перевод урока по стабильному ключу «id урока + индекс упражнения» (applyTr) —
 *     с фолбэком на русский по каждому полю.
 *  3. Перемешиваем варианты тем же seed, что и course.ts (`${lessonId}:${i}:${РУССКИЙ title}`),
 *     поэтому позиции правильных ответов во всех языках совпадают с русской версией.
 *
 * Паки загружаются лениво (`await loadLocaleContent('en')`), синхронные геттеры до загрузки
 * отдают русский текст. Русский пак не нужен — это исходник.
 */
import type { Exercise, Lesson, Unit } from '../../data/types'
import { prepareExercise } from '../../data/exerciseLogic'
import { HOMEWORKS_RU as HOMEWORKS, type HomeworkDef } from '../../data/homework'
import { TIERS_RU as TIERS, SOON_TOPICS_RU as SOON_TOPICS, type Tier } from '../../data/tiers'
import { SHOP_RU as SHOP, VP_RU as VP, type ShopItem } from '../../data/economy'
import { unit1, DEMO_EXERCISE } from '../../data/units/u1-first-prompt'
import { unit2 } from '../../data/units/u2-landing'
import { unit3 } from '../../data/units/u3-debugging'
import { unit4 } from '../../data/units/u4-backend'
import { unit5 } from '../../data/units/u5-launch'
import { SOURCE_LOCALE, type Locale } from '../locales'
import { applyTr, replaceExact } from './overlay'
import type { ContentPack, UnitTr } from './types'

export type { ContentPack } from './types'

/** Сырые (неперемешанные) русские разделы — источник для накладок */
export const RAW_UNITS: Unit[] = [unit1, unit2, unit3, unit4, unit5]
export type UnitId = 'u1' | 'u2' | 'u3' | 'u4' | 'u5'

const LOADERS: Record<Exclude<Locale, 'ru'>, () => Promise<{ default: ContentPack }>> = {
  en: () => import('./en'),
  kk: () => import('./kk'),
  es: () => import('./es'),
  zh: () => import('./zh'),
}

const packs = new Map<Locale, ContentPack>()
const unitCache = new Map<string, Unit>()

/** Зарегистрировать пак вручную (тесты, валидатор, SSR) */
export function registerContentPack(locale: Locale, pack: ContentPack) {
  packs.set(locale, pack)
  for (const k of [...unitCache.keys()]) if (k.startsWith(locale + ':')) unitCache.delete(k)
}

/** Ленивая загрузка пака языка (отдельный чанк). Для ru — ничего не делает. */
export async function loadLocaleContent(locale: Locale): Promise<void> {
  if (locale === 'ru' || packs.has(locale)) return
  const mod = await LOADERS[locale]()
  registerContentPack(locale, mod.default)
}

export const isLocaleContentLoaded = (locale: Locale) => locale === SOURCE_LOCALE || packs.has(locale)
export const getContentPack = (locale: Locale) => packs.get(locale)

/** Тот же seed, что в course.ts — по русскому названию, чтобы порядок вариантов не зависел от языка */
const seedOf = (lessonId: string, i: number, ruTitle: string) => `${lessonId}:${i}:${ruTitle}`

function localizeUnitRaw(raw: Unit, tr: UnitTr | undefined, kit: Record<string, string>): Unit {
  return {
    ...applyTr(raw, tr ? { title: tr.title, subtitle: tr.subtitle, description: tr.description } : undefined),
    lessons: raw.lessons.map((l): Lesson => {
      const lt = tr?.lessons[l.id]
      return {
        ...l,
        title: applyTr(l.title, lt?.title),
        exercises: l.exercises.map((ex, i) => {
          const loc = replaceExact(applyTr(ex, lt?.ex[i]), kit)
          return prepareExercise(loc, seedOf(l.id, i, ex.title))
        }),
      }
    }),
  }
}

/** Раздел на нужном языке (с перемешанными вариантами, как UNITS в course.ts). Неизвестный id → undefined. */
export function getLocalizedUnit(unitId: string, locale: Locale): Unit | undefined {
  const raw = RAW_UNITS.find((u) => u.id === unitId)
  if (!raw) return undefined
  const pack = locale === SOURCE_LOCALE ? undefined : packs.get(locale)
  const key = `${pack ? locale : SOURCE_LOCALE}:${unitId}`
  let u = unitCache.get(key)
  if (!u) {
    u = localizeUnitRaw(raw, pack?.units[unitId as UnitId], pack?.kit ?? {})
    unitCache.set(key, u)
  }
  return u
}

export const getLocalizedUnits = (locale: Locale): Unit[] => RAW_UNITS.map((u) => getLocalizedUnit(u.id, locale)!)

export function getLocalizedLesson(lessonId: string, locale: Locale): Lesson | undefined {
  const unitId = lessonId.split('-')[0]
  return getLocalizedUnit(unitId, locale)?.lessons.find((l) => l.id === lessonId)
}

export const getLocalizedExercise = (lessonId: string, index: number, locale: Locale): Exercise | undefined =>
  getLocalizedLesson(lessonId, locale)?.exercises[index]

/** Демо-упражнение лендинга (= u1-2 #0) без перемешивания — как DEMO_EXERCISE */
export function getLocalizedDemoExercise(locale: Locale) {
  const pack = locale === SOURCE_LOCALE ? undefined : packs.get(locale)
  return applyTr(DEMO_EXERCISE, pack?.units.u1.lessons['u1-2']?.ex[0])
}

/* ---------------------------------------------------------------- Домашки, тиры, экономика */

export function getLocalizedHomework(id: string, locale: Locale): HomeworkDef | undefined {
  const hw = HOMEWORKS.find((h) => h.id === id)
  if (!hw) return undefined
  const pack = locale === SOURCE_LOCALE ? undefined : packs.get(locale)
  return applyTr(hw, pack?.homework[id as keyof ContentPack['homework']])
}

export const getLocalizedHomeworks = (locale: Locale): HomeworkDef[] => HOMEWORKS.map((h) => getLocalizedHomework(h.id, locale)!)

export function getLocalizedTiers(locale: Locale): Tier[] {
  const pack = locale === SOURCE_LOCALE ? undefined : packs.get(locale)
  return TIERS.map((t) => applyTr(t, pack?.tiers.tiers[t.id] as never))
}

export function getLocalizedSoonTopics(locale: Locale): string[] {
  const pack = locale === SOURCE_LOCALE ? undefined : packs.get(locale)
  return applyTr(SOON_TOPICS, pack?.tiers.soon)
}

export function getLocalizedShop(locale: Locale): ShopItem[] {
  const pack = locale === SOURCE_LOCALE ? undefined : packs.get(locale)
  return SHOP.map((s) => applyTr(s, pack?.economy.shop[s.id as keyof ContentPack['economy']['shop']]))
}

/** «ВП» / «VP» */
export function getVpLabel(locale: Locale): string {
  const pack = locale === SOURCE_LOCALE ? undefined : packs.get(locale)
  return pack?.economy.vp || VP
}
