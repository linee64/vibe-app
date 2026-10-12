/**
 * Личные настройки на этом устройстве (localStorage): дневная цель в XP и вечерние напоминания.
 * Без сервера — как и «Звуки» (src/lib/sound.ts).
 */
import { useSyncExternalStore } from 'react'

export const GOAL_OPTIONS = [10, 20, 30, 50] as const
export type DailyGoal = (typeof GOAL_OPTIONS)[number]
export const DEFAULT_GOAL: DailyGoal = 20

export const GOAL_KEY = 'vaibik.dailyGoal'
export const REMIND_KEY = 'vaibik.reminders'
export const REMIND_SHOWN_KEY = 'vaibik.reminderShown'
/** С какого часа (местного) напоминать, если сегодня ещё не занимались */
export const REMIND_HOUR = 18

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  window.addEventListener('storage', l)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', l)
  }
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function write(key: string, v: string) {
  try {
    localStorage.setItem(key, v)
  } catch {
    /* приватный режим — живём без сохранения */
  }
  emit()
}

export function parseGoal(v: string | null): DailyGoal {
  const n = Number(v)
  return (GOAL_OPTIONS as readonly number[]).includes(n) ? (n as DailyGoal) : DEFAULT_GOAL
}
export const getDailyGoal = () => parseGoal(read(GOAL_KEY))
export const setDailyGoal = (g: DailyGoal) => write(GOAL_KEY, String(g))
export const useDailyGoal = () => useSyncExternalStore(subscribe, getDailyGoal, () => DEFAULT_GOAL)

export const getRemindersOn = () => read(REMIND_KEY) === 'on'
export const setRemindersOn = (on: boolean) => write(REMIND_KEY, on ? 'on' : 'off')
export const useRemindersOn = () => useSyncExternalStore(subscribe, getRemindersOn, () => false)

/** Пора ли показать напоминание: включено, вечер, сегодня ни XP, и сегодня ещё не напоминали */
export function shouldRemind(o: { on: boolean; todayXp: number; now: Date; lastShown: string | null; day: string }) {
  return o.on && o.todayXp === 0 && o.now.getHours() >= REMIND_HOUR && o.lastShown !== o.day
}

/** Ссылка на приложение для приглашений */
export const INVITE_URL = 'https://vaibik.site'
export const SUPPORT_EMAIL = 'support@vaibik.site'

export function mailto(subject?: string, body?: string) {
  const q = [subject && `subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`].filter(Boolean).join('&')
  return `mailto:${SUPPORT_EMAIL}${q ? `?${q}` : ''}`
}

/**
 * Поделиться ссылкой: Web Share API, если есть; иначе — копируем в буфер.
 * 'shared' | 'copied' | 'cancelled' | 'failed'
 */
export async function shareInvite(data: { title: string; text: string; url: string }): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined
  if (nav?.share) {
    try {
      await nav.share(data)
      return 'shared'
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'cancelled'
      // share недоступен в этом контексте — пробуем буфер
    }
  }
  try {
    await nav!.clipboard.writeText(`${data.text} ${data.url}`)
    return 'copied'
  } catch {
    return 'failed'
  }
}
