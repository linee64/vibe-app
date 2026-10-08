/**
 * Прогресс в AsyncStorage — та же форма JSON, что веб кладёт в localStorage под ключом `vaibik.progress`.
 * Поэтому строка в Supabase (таблица progress, jsonb) совместима: слияние делает общий веб-модуль
 * src/lib/progressSync.ts (mergeProgress, sanitizeRemote).
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CHARGE_MAX, RECHARGE_MS } from '@web/data/economy'
import { loadRemoteProgress, mergeProgress, recordHomeworkSubmission, saveRemoteProgress } from '@web/lib/progressSync'
import type { Progress as WebProgress, Session as WebSession } from '@web/store'
import { DEMO_MODE, REVIEW_MODE } from '../lib/env'

/** Та же форма, что в вебе (src/store.tsx) — тип берём оттуда, чтобы не разъехались */
export type Progress = WebProgress
export type Session = WebSession

export const SESSION_KEY = 'vaibik.session'
export const PROGRESS_KEY = 'vaibik.progress'
const OWNER_KEY = 'vaibik.progress.owner'
const CHARGE_AT_KEY = 'vaibik.chargeAt'
const REVIEW_FLAG = 'vaibik.reviewUnlock.v1'

export const today = () => new Date().toISOString().slice(0, 10)

export const demoProgress = (): Progress => ({
  completed: ['u1-1', 'u1-2', 'u1-3'],
  xp: 1240,
  gems: 505,
  hearts: CHARGE_MAX,
  streak: 12,
  todayXp: 20,
  perfectToday: 1,
  lessonsToday: 1,
  lastDay: today(),
  homework: [],
  tiersByTest: [],
  tiersCelebrated: [],
  unlockAll: REVIEW_MODE,
  placementSeen: false,
  portfolioUrl: '',
})

export const freshProgress = (): Progress => ({ ...demoProgress(), completed: [], xp: 0, gems: 0, streak: 0, todayXp: 0, perfectToday: 0, lessonsToday: 0 })

export const defaultProgress = () => (DEMO_MODE ? demoProgress() : freshProgress())

export const rollDay = (p: Progress): Progress => (p.lastDay !== today() ? { ...p, todayXp: 0, perfectToday: 0, lessonsToday: 0, lastDay: today() } : p)

const STR_FIELDS = ['completed', 'homework', 'tiersByTest', 'tiersCelebrated'] as const
const NUM_FIELDS = ['xp', 'gems', 'hearts', 'streak', 'todayXp', 'perfectToday', 'lessonsToday'] as const

/** Добираем поля, которых нет в старых сохранениях, и отбрасываем мусор */
export function normalizeProgress(raw: Partial<Progress> | null | undefined, base: Progress = defaultProgress()): Progress {
  const p: Progress = { ...base }
  if (!raw || typeof raw !== 'object') return rollDay(p)
  for (const k of STR_FIELDS) if (Array.isArray(raw[k])) p[k] = raw[k].filter((x): x is string => typeof x === 'string').slice(0, 500)
  for (const k of NUM_FIELDS) if (typeof raw[k] === 'number' && Number.isFinite(raw[k]) && raw[k] >= 0) p[k] = Math.floor(raw[k])
  if (typeof raw.lastDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.lastDay)) p.lastDay = raw.lastDay
  if (typeof raw.unlockAll === 'boolean') p.unlockAll = raw.unlockAll
  if (raw.placementSeen === true) p.placementSeen = true
  if (typeof raw.portfolioUrl === 'string') p.portfolioUrl = raw.portfolioUrl.slice(0, 300)
  p.hearts = Math.min(CHARGE_MAX, p.hearts)
  return rollDay(p)
}

/** Сколько делений заряда накопилось с момента chargeAt (локальный таймер, в облако не уходит) */
export function accruedCharge(hearts: number, chargeAt: number | null, now = Date.now()) {
  if (hearts >= CHARGE_MAX || !chargeAt || chargeAt > now) return { hearts, chargeAt: hearts >= CHARGE_MAX ? null : chargeAt }
  const n = Math.floor((now - chargeAt) / RECHARGE_MS)
  if (n <= 0) return { hearts, chargeAt }
  const add = Math.min(n, CHARGE_MAX - hearts)
  const nextHearts = hearts + add
  const at = chargeAt + n * RECHARGE_MS
  return { hearts: nextHearts, chargeAt: nextHearts >= CHARGE_MAX ? null : at }
}

export function nameFromEmail(email: string) {
  const first = (email.split('@')[0] ?? '').replace(/[._-]+/g, ' ').trim().split(' ')[0] || 'Друг'
  return first.charAt(0).toUpperCase() + first.slice(1)
}

/**
 * Загрузка и слияние облачного прогресса через общий веб-модуль (loadRemoteProgress + mergeProgress).
 * Бросает при сетевой ошибке — вызывающий код повторит.
 */
export async function pullProgress(userId: string, local: Progress): Promise<Progress> {
  const remote = await loadRemoteProgress(userId)
  const owner = await AsyncStorage.getItem(OWNER_KEY)
  // локальные данные другого аккаунта (или демо-данные) не смешиваем с этим аккаунтом
  const base = owner === userId ? local : { ...freshProgress(), unlockAll: local.unlockAll && REVIEW_MODE }
  const merged = rollDay(mergeProgress(base, remote))
  await AsyncStorage.setItem(OWNER_KEY, userId)
  return merged
}

/** Сохранение в облако — общий веб-модуль (unlockAll в облако не пишет) */
export const pushProgress = (userId: string, p: Progress) => saveRemoteProgress(userId, p)

export { recordHomeworkSubmission }
export { CHARGE_AT_KEY, OWNER_KEY, REVIEW_FLAG }
