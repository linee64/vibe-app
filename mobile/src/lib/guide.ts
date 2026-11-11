/**
 * Первый заход: Бипи ведёт один урок (u1-1, тот же id, что FIRST_LESSON_ID в src/flow.ts),
 * потом короткую домашку-репетицию. introSeen — «проводка закончена», дальше уроки сами.
 */
export const GUIDED_LESSON_ID = 'u1-1'
/** Те же три упражнения, что FIRST_RUN_PICK в src/flow.ts: выбор, «чему нельзя верить», порядок шагов */
export const GUIDED_PICK = [0, 3, 2] as const

export type CoachBeat = 'welcome' | 'after' | 'tokens'
export type StartRoute = '/guide' | '/(tabs)/learn' | `/lesson/${typeof GUIDED_LESSON_ID}`

export function isGuidedLesson(p: { introSeen?: boolean; completed: string[] }, lessonId: string) {
  return lessonId === GUIDED_LESSON_ID && !p.introSeen && !p.completed.includes(GUIDED_LESSON_ID)
}

/** Урок уже сдан, проводка ещё нет — показать домашку и механики, даже если приложение закрыли на экране награды */
export function needsGuide(p: { introSeen?: boolean; completed: string[]; homework: string[] }) {
  return !p.introSeen && p.homework.length === 0 && p.completed.length === 1 && p.completed[0] === GUIDED_LESSON_ID
}

/**
 * Куда вести после входа. synced=false — облако ещё не ответило, на путь (не в урок 1:
 * это может быть возвращающийся ученик).
 */
export function startRoute(p: { introSeen?: boolean; completed: string[]; homework: string[] }, synced: boolean): StartRoute {
  if (!synced) return '/(tabs)/learn'
  if (needsGuide(p)) return '/guide'
  if (p.completed.length === 0 && p.homework.length === 0) return `/lesson/${GUIDED_LESSON_ID}`
  return '/(tabs)/learn'
}

/** Реплика Бипи внутри первого урока. dismissed — id уже закрытых реплик. */
export function coachBeat(input: { guided: boolean; pos: number; status: 'idle' | 'correct' | 'wrong'; dismissed: readonly string[] }): CoachBeat | null {
  if (!input.guided) return null
  const seen = new Set(input.dismissed)
  if (input.pos === 0 && input.status === 'idle' && !seen.has('welcome')) return 'welcome'
  if (input.pos === 0 && input.status !== 'idle' && !seen.has('after')) return 'after'
  if (input.pos >= 1 && input.status === 'idle' && !seen.has('tokens')) return 'tokens'
  return null
}
