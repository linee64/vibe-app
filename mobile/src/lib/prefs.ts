/**
 * Личные настройки на устройстве (AsyncStorage) — дневная цель в XP. Варианты, ключ и разбор — из веба
 * (src/lib/prefs.ts), хранилище — своё: в приложении нет localStorage.
 */
import { useSyncExternalStore } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DEFAULT_GOAL, GOAL_KEY, parseGoal, type DailyGoal } from '@web/lib/prefs'

export { GOAL_OPTIONS, INVITE_URL, SUPPORT_EMAIL, mailto, type DailyGoal } from '@web/lib/prefs'

let goal: DailyGoal = DEFAULT_GOAL
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
void AsyncStorage.getItem(GOAL_KEY)
  .then((v) => {
    goal = parseGoal(v)
    emit()
  })
  .catch(() => {})

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}
export const getDailyGoal = () => goal
export function setDailyGoal(g: DailyGoal) {
  goal = g
  void AsyncStorage.setItem(GOAL_KEY, String(g)).catch(() => {})
  emit()
}
export const useDailyGoal = () => useSyncExternalStore(subscribe, getDailyGoal, getDailyGoal)
