// Константы и чистые функции для упражнений (отдельно от компонентов — ради fast refresh)
import type { ExerciseKind } from '../../data/types'
import type { Answer, Status } from '../../data/exerciseLogic'
import { t } from '../../i18n/core'

export const KIND_META: Record<ExerciseKind | 'flag', { name: string; icon: string; color: string; bg: string }> = {
  duel: { get name() { return t('x1ruxacc') }, icon: '⚔️', color: '#5B2FD6', bg: '#EFE9FF' },
  predict: { get name() { return t('x1j6q7o8') }, icon: '🔮', color: '#0E9C8C', bg: '#DCF8F3' },
  upgrade: { get name() { return t('x1i7xid0') }, icon: '🎛️', color: '#E0573A', bg: '#FFE9E2' },
  nextmove: { get name() { return t('x1cj1r1q') }, icon: '💬', color: '#3E1A9E', bg: '#E8E0FF' },
  diff: { get name() { return t('x02cbprh') }, icon: '🔍', color: '#B86A00', bg: '#FFF1D9' },
  bug: { get name() { return t('x0tedhet') }, icon: '🐞', color: '#E0573A', bg: '#FFE9E2' },
  flag: { get name() { return t('x0fa8tst') }, icon: '🚩', color: '#E0573A', bg: '#FFE9E2' },
  pipeline: { get name() { return t('x1pt9m4m') }, icon: '🛤️', color: '#0E9C8C', bg: '#DCF8F3' },
  choice: { get name() { return t('x0mg5v7s') }, icon: '🧭', color: '#B86A00', bg: '#FFF1D9' },
}

/** Состояние варианта ответа после проверки */
export function optState(i: number, answer: Answer, status: Status, correct: number) {
  if (status === 'idle') return answer === i ? 'is-selected' : ''
  if (i === correct) return 'is-correct'
  if (answer === i) return 'is-wrong'
  return 'opacity-55'
}

export function vibeMood(value: number, target: number) {
  if (value >= target) return { text: t('x00ng15j'), emoji: '✨', color: '#0E9C8C' }
  if (value >= target * 0.6) return { text: t('x0wbe6e4'), emoji: '🙂', color: '#B86A00' }
  return { text: t('x1aimq4b'), emoji: '😶', color: '#E0573A' }
}
