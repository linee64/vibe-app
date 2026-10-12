/**
 * Задания (квесты) Вайбика: 3 дневных + 2 недельных. Чистая логика без DOM — общая для веба и мобилки.
 *
 *  • Счётчики копятся из настоящих событий стора: урок пройден, ответ проверен, домашка сдана.
 *  • День и неделя — по МЕСТНОМУ времени ученика (неделя начинается с понедельника).
 *    Новый день/неделя — счётчики и отметки «забрал» обнуляются сами (rollQuests).
 *  • Набор дневных заданий меняется каждый день: детерминированно из пула по дате,
 *    так что на всех устройствах ученика в один день — одни и те же задания.
 *  • Награда — токены (progress.gems), забирается кнопкой; повторно забрать нельзя.
 *  • Состояние лежит в progress.quests и синхронизируется с облаком (sanitizeQuests / mergeQuests).
 */

export type QuestPeriod = 'day' | 'week'
/** Что считаем */
export type QuestMetric = 'lessons' | 'xp' | 'perfect' | 'combo' | 'correct' | 'homework' | 'activeDays'

export interface QuestDef {
  id: string
  period: QuestPeriod
  metric: QuestMetric
  goal: number
  /** награда в токенах */
  reward: number
  /** эмодзи-иконка (подписи — в UI-каталогах: quests.<id>.title / .desc) */
  icon: string
}

/** Пул дневных заданий: каждый день берём DAILY_COUNT из них */
export const DAILY_POOL: QuestDef[] = [
  { id: 'd-ship2', period: 'day', metric: 'lessons', goal: 2, reward: 10, icon: '🚀' },
  { id: 'd-combo10', period: 'day', metric: 'combo', goal: 10, reward: 15, icon: '⚡' },
  { id: 'd-vibe50', period: 'day', metric: 'xp', goal: 50, reward: 10, icon: '✨' },
  { id: 'd-clean1', period: 'day', metric: 'perfect', goal: 1, reward: 15, icon: '🧼' },
  { id: 'd-checks20', period: 'day', metric: 'correct', goal: 20, reward: 10, icon: '✅' },
]
export const DAILY_COUNT = 3

export const WEEKLY: QuestDef[] = [
  { id: 'w-streak5', period: 'week', metric: 'activeDays', goal: 5, reward: 40, icon: '🔥' },
  { id: 'w-review1', period: 'week', metric: 'homework', goal: 1, reward: 30, icon: '🏠' },
]

export const ALL_QUESTS: QuestDef[] = [...DAILY_POOL, ...WEEKLY]
export const findQuest = (id: string) => ALL_QUESTS.find((q) => q.id === id)

export interface QuestCounters {
  lessons: number
  xp: number
  perfect: number
  /** лучшая серия верных ответов подряд за период */
  combo: number
  correct: number
  homework: number
}

export interface QuestState {
  /** местный день YYYY-MM-DD, к которому относятся дневные счётчики */
  day: string
  /** понедельник текущей недели YYYY-MM-DD */
  week: string
  daily: QuestCounters
  weekly: QuestCounters
  /** дни недели, когда был пройден урок или сдана домашка */
  activeDays: string[]
  /** текущая серия верных ответов подряд (сбрасывается ошибкой) */
  run: number
  /** забранные награды текущего дня/недели (id заданий) */
  claimed: string[]
  /** о выполнении уже сообщили (аналитика quest_completed) */
  notified: string[]
}

const pad = (n: number) => String(n).padStart(2, '0')
/** Местная дата YYYY-MM-DD */
export function localDay(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
/** Понедельник недели (местное время) */
export function localWeek(d: Date = new Date()): string {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7))
  return localDay(m)
}

const zero = (): QuestCounters => ({ lessons: 0, xp: 0, perfect: 0, combo: 0, correct: 0, homework: 0 })

export function emptyQuests(now: Date = new Date()): QuestState {
  return { day: localDay(now), week: localWeek(now), daily: zero(), weekly: zero(), activeDays: [], run: 0, claimed: [], notified: [] }
}

const isDaily = (id: string) => id.startsWith('d-')

/** Новый день/неделя: обнуляем то, что относится к прошедшему периоду */
export function rollQuests(s: QuestState | undefined, now: Date = new Date()): QuestState {
  if (!s) return emptyQuests(now)
  const day = localDay(now)
  const week = localWeek(now)
  if (s.day === day && s.week === week) return s
  const newWeek = s.week !== week
  const keep = (id: string) => (newWeek ? false : !isDaily(id))
  return {
    day,
    week,
    daily: s.day === day ? s.daily : zero(),
    weekly: newWeek ? zero() : s.weekly,
    activeDays: newWeek ? [] : s.activeDays,
    // серия ответов переживает полночь, если ученик занимается без перерыва — но не неделю
    run: newWeek ? 0 : s.run,
    claimed: s.claimed.filter(keep),
    notified: s.notified.filter(keep),
  }
}

/** Простой детерминированный хеш строки (FNV-1a) */
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Дневные задания на этот день: DAILY_COUNT разных из пула, порядок — как в пуле */
export function dailyQuestsFor(day: string): QuestDef[] {
  const ranked = DAILY_POOL.map((q) => ({ q, r: hash(day + ':' + q.id) })).sort((a, b) => a.r - b.r)
  const pick = new Set(ranked.slice(0, DAILY_COUNT).map((x) => x.q.id))
  return DAILY_POOL.filter((q) => pick.has(q.id))
}

export interface QuestView extends QuestDef {
  value: number
  done: boolean
  claimed: boolean
}

function valueOf(q: QuestDef, s: QuestState): number {
  if (q.metric === 'activeDays') return s.activeDays.length
  return (q.period === 'day' ? s.daily : s.weekly)[q.metric]
}

/** Задания на сейчас с прогрессом (сначала дневные, потом недельные) */
export function questBoard(state: QuestState | undefined, now: Date = new Date()): { daily: QuestView[]; weekly: QuestView[] } {
  const s = rollQuests(state, now)
  const view = (q: QuestDef): QuestView => {
    const value = Math.min(valueOf(q, s), q.goal)
    return { ...q, value, done: value >= q.goal, claimed: s.claimed.includes(q.id) }
  }
  return { daily: dailyQuestsFor(s.day).map(view), weekly: WEEKLY.map(view) }
}

/** Сколько наград можно забрать прямо сейчас (бейдж в навигации) */
export function claimableCount(state: QuestState | undefined, now: Date = new Date()): number {
  const b = questBoard(state, now)
  return [...b.daily, ...b.weekly].filter((q) => q.done && !q.claimed).length
}

/** Выполненные, но ещё не отмеченные задания (для аналитики quest_completed) */
export function newlyCompleted(state: QuestState | undefined, now: Date = new Date()): QuestView[] {
  const s = rollQuests(state, now)
  const b = questBoard(s, now)
  return [...b.daily, ...b.weekly].filter((q) => q.done && !s.notified.includes(q.id))
}

/* ------------------------------------------------------------------ события */

export type QuestEvent =
  | { type: 'lesson'; xp: number; perfect: boolean }
  | { type: 'homework'; xp: number }
  | { type: 'answer'; correct: boolean }

const add = (c: QuestCounters, patch: Partial<QuestCounters>): QuestCounters => {
  const out = { ...c }
  for (const [k, v] of Object.entries(patch) as [keyof QuestCounters, number][]) out[k] = k === 'combo' ? Math.max(out.combo, v) : out[k] + v
  return out
}

/** Применить событие к состоянию заданий (чистая функция) */
export function applyQuestEvent(state: QuestState | undefined, e: QuestEvent, now: Date = new Date()): QuestState {
  const s = rollQuests(state, now)
  const today = localDay(now)
  const active = s.activeDays.includes(today) ? s.activeDays : [...s.activeDays, today]
  switch (e.type) {
    case 'lesson': {
      const patch = { lessons: 1, xp: e.xp, perfect: e.perfect ? 1 : 0 }
      return { ...s, daily: add(s.daily, patch), weekly: add(s.weekly, patch), activeDays: active }
    }
    case 'homework': {
      const patch = { homework: 1, xp: e.xp }
      return { ...s, daily: add(s.daily, patch), weekly: add(s.weekly, patch), activeDays: active }
    }
    case 'answer': {
      if (!e.correct) return { ...s, run: 0 }
      const run = s.run + 1
      const patch = { correct: 1, combo: run }
      return { ...s, run, daily: add(s.daily, patch), weekly: add(s.weekly, patch) }
    }
  }
}

/** Забрать награду: null — нельзя (не выполнено, уже забрано или задания нет сегодня) */
export function claimQuest(state: QuestState | undefined, id: string, now: Date = new Date()): { state: QuestState; reward: number; quest: QuestView } | null {
  const s = rollQuests(state, now)
  const b = questBoard(s, now)
  const q = [...b.daily, ...b.weekly].find((x) => x.id === id)
  if (!q || !q.done || q.claimed) return null
  return {
    state: { ...s, claimed: [...s.claimed, id], notified: s.notified.includes(id) ? s.notified : [...s.notified, id] },
    reward: q.reward,
    quest: q,
  }
}

export function markNotified(state: QuestState | undefined, ids: string[], now: Date = new Date()): QuestState {
  const s = rollQuests(state, now)
  return { ...s, notified: [...new Set([...s.notified, ...ids])] }
}

/* ------------------------------------------------------------------ синхронизация */

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/
const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.min(Math.floor(v), 100_000) : 0)
const ids = (v: unknown) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && x.length <= 32))].slice(0, 40) : [])
const counters = (v: unknown): QuestCounters => {
  const r = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>
  return { lessons: n(r.lessons), xp: n(r.xp), perfect: n(r.perfect), combo: n(r.combo), correct: n(r.correct), homework: n(r.homework) }
}

/** Аккуратно читаем состояние заданий из облака/хранилища (там может оказаться что угодно) */
export function sanitizeQuests(raw: unknown): QuestState | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const r = raw as Record<string, unknown>
  if (typeof r.day !== 'string' || !DAY_RE.test(r.day) || typeof r.week !== 'string' || !DAY_RE.test(r.week)) return undefined
  return {
    day: r.day,
    week: r.week,
    daily: counters(r.daily),
    weekly: counters(r.weekly),
    activeDays: ids(r.activeDays).filter((d) => DAY_RE.test(d)).slice(0, 7),
    run: n(r.run),
    claimed: ids(r.claimed),
    notified: ids(r.notified),
  }
}

const maxC = (a: QuestCounters, b: QuestCounters): QuestCounters => ({
  lessons: Math.max(a.lessons, b.lessons),
  xp: Math.max(a.xp, b.xp),
  perfect: Math.max(a.perfect, b.perfect),
  combo: Math.max(a.combo, b.combo),
  correct: Math.max(a.correct, b.correct),
  homework: Math.max(a.homework, b.homework),
})
const union = (a: string[], b: string[]) => [...new Set([...a, ...b])]

/**
 * Слияние с двух устройств «ничего не теряем»: более свежий день/неделя побеждает,
 * в одном периоде — счётчики максимум, «забрал» — объединение (награду нельзя забрать дважды).
 */
export function mergeQuests(local: QuestState | undefined, remote: QuestState | undefined): QuestState | undefined {
  if (!local) return remote
  if (!remote) return local
  const week = local.week >= remote.week ? local.week : remote.week
  const day = local.day >= remote.day ? local.day : remote.day
  const inWeek = (s: QuestState) => s.week === week
  const inDay = (s: QuestState) => s.day === day
  const pickC = (f: (s: QuestState) => boolean, get: (s: QuestState) => QuestCounters) =>
    f(local) && f(remote) ? maxC(get(local), get(remote)) : f(local) ? get(local) : get(remote)
  const keepIds = (s: QuestState, list: string[]) => list.filter((id) => (isDaily(id) ? inDay(s) : inWeek(s)))
  return {
    day,
    week,
    daily: pickC(inDay, (s) => s.daily),
    weekly: pickC(inWeek, (s) => s.weekly),
    activeDays: union(inWeek(local) ? local.activeDays : [], inWeek(remote) ? remote.activeDays : []),
    run: Math.max(inWeek(local) ? local.run : 0, inWeek(remote) ? remote.run : 0),
    claimed: union(keepIds(local, local.claimed), keepIds(remote, remote.claimed)),
    notified: union(keepIds(local, local.notified), keepIds(remote, remote.notified)),
  }
}
