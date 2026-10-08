/**
 * Тиры курса: Новичок (разделы 1–2) → Средний (3–4) → Продвинутый (5).
 * Тир открывается, когда предыдущий пройден: сданы итоговые тесты (сундук/кубок) и домашки всех его разделов —
 * или засчитан «Тестом на уровень». Внутри открытого тира все узлы доступны, как раньше.
 */
import type { Exercise, Lesson, Unit, UnitColor } from './types'
import { UNITS } from './course'
import { HOMEWORKS, homeworkForUnit } from './homework'

export type TierId = 'novice' | 'mid' | 'pro'

export interface Tier {
  id: TierId
  num: number
  name: string
  /** id разделов, входящих в тир */
  units: string[]
  color: UnitColor
  /** Что ты сможешь после тира (баннер на пути) */
  outcome: string
  /** Короткие навыки для экрана «Новый тир!» и лендинга */
  skills: string[]
}

export const TIERS: Tier[] = [
  {
    id: 'novice',
    num: 1,
    name: 'Новичок',
    units: ['u1', 'u2'],
    color: 'brand',
    outcome: 'Ясно ставить задачу ИИ и собрать свой первый лендинг',
    skills: ['Промпт из 5 частей', 'Лендинг за вечер', 'Правки уточнениями'],
  },
  {
    id: 'mid',
    num: 2,
    name: 'Средний',
    units: ['u3', 'u4'],
    color: 'teal',
    outcome: 'Чинить баги вместе с ИИ и подключить к приложению базу данных',
    skills: ['Отладка по ошибке', 'Таблицы и формы', 'Ключи в секрете'],
  },
  {
    id: 'pro',
    num: 3,
    name: 'Продвинутый',
    units: ['u5'],
    color: 'amber',
    outcome: 'Выложить проект в интернет на своём домене и найти первых пользователей',
    skills: ['GitHub и деплой', 'Свой домен', 'Аналитика'],
  },
]

/** Будущие разделы — тизер после последнего тира */
export const SOON_TOPICS = ['ИИ-агенты', 'Оплата в своём приложении']

/** Минимум, что нужно знать о прогрессе (совместимо с Progress из store.tsx) */
export interface TierProgress {
  completed: string[]
  homework: string[]
  tiersByTest: string[]
  tiersCelebrated: string[]
  unlockAll: boolean
}

const isReward = (l: Lesson) => l.kind === 'chest' || l.kind === 'trophy'

/** Итоговый тест раздела — последний узел-сундук/кубок (или просто последний урок) */
export function checkpointOf(unit: Unit): Lesson {
  return [...unit.lessons].reverse().find(isReward) ?? unit.lessons[unit.lessons.length - 1]
}

export const findTier = (id: string) => TIERS.find((t) => t.id === id)
export const tierOfUnit = (unitId: string) => TIERS.find((t) => t.units.includes(unitId)) ?? TIERS[TIERS.length - 1]
export const unitsOf = (tier: Tier) => tier.units.map((id) => UNITS.find((u) => u.id === id)).filter((u): u is Unit => !!u)

export interface TierItem {
  kind: 'test' | 'homework'
  id: string
  label: string
  done: boolean
}

/** Что нужно сделать, чтобы пройти тир: итоговый тест + домашка каждого раздела */
export function tierItems(tier: Tier, p: TierProgress): TierItem[] {
  return unitsOf(tier).flatMap((u) => {
    const cp = checkpointOf(u)
    const hw = homeworkForUnit(u.id)
    const items: TierItem[] = [{ kind: 'test', id: cp.id, label: `${cp.title} · ${u.title}`, done: p.completed.includes(cp.id) }]
    if (hw) items.push({ kind: 'homework', id: hw.id, label: `Домашка «${hw.short}»`, done: p.homework.includes(hw.id) })
    return items
  })
}

/** Все узлы тира (уроки + домашки) — для общего прогресса «7/14» */
export function tierNodeProgress(tier: Tier, p: TierProgress) {
  const units = unitsOf(tier)
  const lessons = units.flatMap((u) => u.lessons.map((l) => l.id))
  const hws = HOMEWORKS.filter((h) => tier.units.includes(h.unitId)).map((h) => h.id)
  const done = lessons.filter((id) => p.completed.includes(id)).length + hws.filter((id) => p.homework.includes(id)).length
  return { done, total: lessons.length + hws.length }
}

export const isTierComplete = (tier: Tier, p: TierProgress) => tierItems(tier, p).every((i) => i.done)
export const isTierPassedByTest = (tier: Tier, p: TierProgress) => !isTierComplete(tier, p) && p.tiersByTest.includes(tier.id)
export const isTierPassed = (tier: Tier, p: TierProgress) => isTierComplete(tier, p) || p.tiersByTest.includes(tier.id)

/** Тир открыт по-честному (без демо-кнопки): первый всегда, остальные — когда пройден предыдущий */
export function isTierOpenByProgress(tier: Tier, p: TierProgress) {
  const i = TIERS.findIndex((t) => t.id === tier.id)
  return i <= 0 || isTierPassed(TIERS[i - 1], p)
}

export const isTierUnlocked = (tier: Tier, p: TierProgress) => p.unlockAll || isTierOpenByProgress(tier, p)
export const isUnitLocked = (unitId: string, p: TierProgress) => !isTierUnlocked(tierOfUnit(unitId), p)

// ---------------------------------------------------------------- Free / Pro

/** Бесплатно навсегда: раздел 1 (+ его домашка) и «Тест на уровень». Остальные разделы — Pro или пробный период. */
export const FREE_UNIT_IDS = ['u1']
export const needsPro = (unitId: string) => !FREE_UNIT_IDS.includes(unitId)

/** Текущий тир — последний честно открытый */
export function currentTier(p: TierProgress): Tier {
  return [...TIERS].reverse().find((t) => isTierOpenByProgress(t, p)) ?? TIERS[0]
}

/** Тир, который только что пройден, но экран «Новый тир!» ещё не показан */
export function pendingTierUp(p: TierProgress): Tier | null {
  return TIERS.find((t) => isTierComplete(t, p) && !p.tiersCelebrated.includes(t.id)) ?? null
}

/** Следующий тир после данного */
export const nextTier = (tier: Tier) => TIERS[TIERS.findIndex((t) => t.id === tier.id) + 1] ?? null

// ---------------------------------------------------------------- Тест на уровень

export const PLACEMENT_SIZE = 8
export const PLACEMENT_PASS = 6

/** Тиры, которые засчитает успешный тест на открытие тира target (все предыдущие) */
export function tiersBefore(target: TierId): TierId[] {
  const i = TIERS.findIndex((t) => t.id === target)
  return TIERS.slice(0, Math.max(0, i)).map((t) => t.id)
}

/**
 * 8 вопросов из итоговых тестов разделов всех предыдущих тиров (поровну на раздел).
 * Порядок детерминированный — скрипты проверки знают, какие вопросы будут.
 */
export function placementQuestions(target: TierId): Exercise[] {
  const units = tiersBefore(target).flatMap((id) => unitsOf(findTier(id)!))
  if (!units.length) return []
  const per = Math.ceil(PLACEMENT_SIZE / units.length)
  const out: Exercise[] = []
  units.forEach((u, ui) => {
    const pool = [...checkpointOf(u).exercises, ...u.lessons.filter((l) => !isReward(l)).flatMap((l) => l.exercises)]
    // чередуем типы: берём первые вопросы итогового теста, начиная с разных позиций у разных разделов
    const picked: Exercise[] = []
    for (let k = 0; picked.length < per && k < pool.length; k++) {
      const ex = pool[(k + ui) % pool.length]
      if (!out.concat(picked).some((e) => e.title === ex.title)) picked.push(ex)
    }
    out.push(...picked)
  })
  return out.slice(0, PLACEMENT_SIZE)
}
