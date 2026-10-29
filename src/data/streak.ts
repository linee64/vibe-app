/**
 * Деплой-серия: дни подряд, когда пройден хотя бы один урок или домашка.
 * День — локальный (в часовом поясе ученика), хранится в progress.streakDay (YYYY-MM-DD).
 */
export interface StreakState {
  streak: number
  /** последний день, за который серия засчитана; нет — старые данные без даты */
  streakDay?: string
}

const pad = (n: number) => String(n).padStart(2, '0')
export const localDay = (d: Date = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** День со сдвигом (−1 — вчера). Через конструктор Date, чтобы переход на летнее время ничего не ломал */
export function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return localDay(new Date(y, m - 1, d + delta))
}

/** Урок/домашка пройдены сейчас: серия продолжается, начинается заново или остаётся (уже считали сегодня) */
export function bumpStreak(p: StreakState, now: Date = new Date()): Required<StreakState> {
  const today = localDay(now)
  if (p.streakDay === today) return { streak: Math.max(1, p.streak), streakDay: today }
  if (p.streakDay === shiftDay(today, -1)) return { streak: p.streak + 1, streakDay: today }
  // старые данные: серия была, а даты нет — продолжаем, не обнуляя
  if (!p.streakDay && p.streak > 0) return { streak: p.streak + 1, streakDay: today }
  return { streak: 1, streakDay: today }
}

/** Пропущен целый день — серия сгорела (показываем 0 до следующего урока) */
export function expireStreak<T extends StreakState>(p: T, now: Date = new Date()): T {
  if (p.streak > 0 && p.streakDay && p.streakDay < shiftDay(localDay(now), -1)) return { ...p, streak: 0 }
  return p
}

/** Слияние локальной и облачной серии: побеждает более свежий день, в один день — больший счёт */
export function mergeStreak(local: StreakState, remote: Partial<StreakState>): StreakState {
  const l = local.streakDay ?? ''
  const r = remote.streakDay ?? ''
  const rs = remote.streak ?? 0
  if (r > l) return { streak: rs, streakDay: r }
  if (r === l) return { streak: Math.max(local.streak, rs), ...(l ? { streakDay: l } : {}) }
  return { streak: local.streak, streakDay: l }
}
