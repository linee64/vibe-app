/**
 * Отзывы учеников: общие константы и правила (веб, мобильное приложение через @web/data/feedback, тесты).
 * Чистый TypeScript без браузера — хранилище для микро-опросов передаётся снаружи.
 */

export type FeedbackSource = 'manual' | 'first_lesson' | 'paywall_exit' | 'homework'
export type FeedbackCategory = 'bug' | 'idea' | 'hard' | 'other' | 'price' | 'try_first' | 'no_value'

export const FEEDBACK_SOURCES: readonly FeedbackSource[] = ['manual', 'first_lesson', 'paywall_exit', 'homework']
export const FEEDBACK_CATEGORIES: readonly FeedbackCategory[] = ['bug', 'idea', 'hard', 'other', 'price', 'try_first', 'no_value']

/** Чипы обычной формы «Отзыв» */
export const MANUAL_CATEGORIES: { id: FeedbackCategory; label: string; emoji: string }[] = [
  { id: 'bug', label: 'Баг', emoji: '🐞' },
  { id: 'idea', label: 'Идея', emoji: '💡' },
  { id: 'hard', label: 'Сложно/непонятно', emoji: '🤯' },
  { id: 'other', label: 'Другое', emoji: '💬' },
]

/** Чипы после закрытия пейвола без покупки («Что остановило?») */
export const PAYWALL_REASONS: { id: FeedbackCategory; label: string }[] = [
  { id: 'price', label: 'Дорого' },
  { id: 'try_first', label: 'Хочу сначала попробовать' },
  { id: 'no_value', label: 'Не вижу ценности' },
  { id: 'other', label: 'Другое' },
]

export const FEEDBACK_MAX_MESSAGE = 1000
export const FEEDBACK_MAX_EMAIL = 254

/** Технические детали, которые приложение прикладывает к отзыву (если ученик не выключил переключатель) */
export interface FeedbackContext {
  route?: string
  lesson_id?: string
  homework_id?: string
  app_version?: string
  platform?: 'web' | 'ios' | 'android'
  viewport?: string
  locale?: string
  browser?: string
  os?: string
}

export interface FeedbackPayload {
  rating: number | null
  category: FeedbackCategory | null
  message: string
  email?: string
  source: FeedbackSource
  context: FeedbackContext
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const isValidEmail = (s: string) => s.length <= FEEDBACK_MAX_EMAIL && EMAIL_RE.test(s)

/** Можно ли отправить: нужна оценка, категория или текст; email — только корректный */
export function canSubmitFeedback(p: Pick<FeedbackPayload, 'rating' | 'category' | 'message' | 'email'>): boolean {
  if (p.message.length > FEEDBACK_MAX_MESSAGE) return false
  if (p.email && !isValidEmail(p.email.trim())) return false
  return p.rating !== null || p.category !== null || p.message.trim().length > 0
}

/** id урока/домашки из маршрута вида /lesson/u1-2 или /homework/hw3 */
export function idsFromRoute(route: string): Pick<FeedbackContext, 'lesson_id' | 'homework_id'> {
  const m = /^\/(lesson|homework)\/([a-z0-9-]{1,40})/i.exec(route)
  if (!m) return {}
  return m[1] === 'lesson' ? { lesson_id: m[2] } : { homework_id: m[2] }
}

// ---------------------------------------------------------------- микро-опросы (не чаще, чем нужно)

export type MicroPromptKind = Exclude<FeedbackSource, 'manual'>

export interface MicroPromptState {
  /** Что показать при следующей возможности (не во время урока) */
  pending: MicroPromptKind | null
  pendingAt: number
  /** Когда последний раз что-то показывали */
  lastShownAt: number
  /** Сколько раз показывали каждый вид */
  shown: Partial<Record<MicroPromptKind, number>>
  /** Последний показ каждого вида */
  shownAt: Partial<Record<MicroPromptKind, number>>
}

const HOUR = 3_600_000
const DAY = 24 * HOUR

export const MICRO_RULES = {
  /** Пауза между любыми двумя микро-опросами */
  cooldownMs: 20 * HOUR,
  /** Запрос «устаревает», если его не успели показать */
  pendingTtlMs: 2 * HOUR,
  /** Сколько раз максимум и как часто для каждого вида */
  perKind: {
    first_lesson: { max: 1, everyMs: 0 },
    homework: { max: 1, everyMs: 0 },
    paywall_exit: { max: 2, everyMs: 7 * DAY },
  } satisfies Record<MicroPromptKind, { max: number; everyMs: number }>,
}

export const emptyMicroState = (): MicroPromptState => ({ pending: null, pendingAt: 0, lastShownAt: 0, shown: {}, shownAt: {} })

export function parseMicroState(raw: string | null): MicroPromptState {
  if (!raw) return emptyMicroState()
  try {
    const o = JSON.parse(raw) as Partial<MicroPromptState>
    const kinds = Object.keys(MICRO_RULES.perKind) as MicroPromptKind[]
    const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : 0)
    const rec = (x: unknown) => {
      const out: Partial<Record<MicroPromptKind, number>> = {}
      if (x && typeof x === 'object') for (const k of kinds) if (num((x as Record<string, unknown>)[k])) out[k] = num((x as Record<string, unknown>)[k])
      return out
    }
    return {
      pending: kinds.includes(o.pending as MicroPromptKind) ? (o.pending as MicroPromptKind) : null,
      pendingAt: num(o.pendingAt),
      lastShownAt: num(o.lastShownAt),
      shown: rec(o.shown),
      shownAt: rec(o.shownAt),
    }
  } catch {
    return emptyMicroState()
  }
}

/** Разрешено ли вообще спрашивать этот вид (лимиты на вид и общий кулдаун) */
export function microAllowed(s: MicroPromptState, kind: MicroPromptKind, now: number): boolean {
  const rule = MICRO_RULES.perKind[kind]
  if ((s.shown[kind] ?? 0) >= rule.max) return false
  const last = s.shownAt[kind]
  if (rule.everyMs && last !== undefined && now - last < rule.everyMs) return false
  return !s.lastShownAt || now - s.lastShownAt >= MICRO_RULES.cooldownMs
}

/** Поставить опрос в очередь (одновременно — только один; уже ждущий не вытесняем) */
export function queueMicro(s: MicroPromptState, kind: MicroPromptKind, now: number): MicroPromptState {
  if (!microAllowed(s, kind, now)) return s
  if (s.pending && now - s.pendingAt < MICRO_RULES.pendingTtlMs) return s
  return { ...s, pending: kind, pendingAt: now }
}

/** Что показать сейчас (null — ничего) */
export function microToShow(s: MicroPromptState, now: number): MicroPromptKind | null {
  if (!s.pending) return null
  if (now - s.pendingAt > MICRO_RULES.pendingTtlMs) return null
  // кулдаун проверяется по lastShownAt, а не по времени постановки в очередь
  return microAllowed(s, s.pending, now) ? s.pending : null
}

/** Опрос показан: снимаем из очереди, считаем показ (повторно этот же не всплывёт) */
export function markMicroShown(s: MicroPromptState, kind: MicroPromptKind, now: number): MicroPromptState {
  return {
    ...s,
    pending: s.pending === kind ? null : s.pending,
    pendingAt: s.pending === kind ? 0 : s.pendingAt,
    lastShownAt: now,
    shown: { ...s.shown, [kind]: (s.shown[kind] ?? 0) + 1 },
    shownAt: { ...s.shownAt, [kind]: now },
  }
}

export const MICRO_STORAGE_KEY = 'vaibik.fb.micro'
export const FEEDBACK_OUTBOX_KEY = 'vaibik.fb.outbox'
export const FEEDBACK_LOCAL_KEY = 'vaibik.fb.local'
