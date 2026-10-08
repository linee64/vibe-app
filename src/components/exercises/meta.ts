// Константы и чистые функции для упражнений (отдельно от компонентов — ради fast refresh)
import type { ExerciseKind } from '../../data/types'
import type { Answer, Status } from '../../data/exerciseLogic'

export const KIND_META: Record<ExerciseKind | 'flag', { name: string; icon: string; color: string; bg: string }> = {
  duel: { name: 'Дуэль промптов', icon: '⚔️', color: '#5B2FD6', bg: '#EFE9FF' },
  predict: { name: 'Предскажи результат', icon: '🔮', color: '#0E9C8C', bg: '#DCF8F3' },
  upgrade: { name: 'Прокачай промпт', icon: '🎛️', color: '#E0573A', bg: '#FFE9E2' },
  nextmove: { name: 'Следующий ход', icon: '💬', color: '#3E1A9E', bg: '#E8E0FF' },
  diff: { name: 'Ревью правок ИИ', icon: '🔍', color: '#B86A00', bg: '#FFF1D9' },
  bug: { name: 'Найди баг', icon: '🐞', color: '#E0573A', bg: '#FFE9E2' },
  flag: { name: 'Красный флаг', icon: '🚩', color: '#E0573A', bg: '#FFE9E2' },
  pipeline: { name: 'Собери пайплайн', icon: '🛤️', color: '#0E9C8C', bg: '#DCF8F3' },
  choice: { name: 'Ситуация', icon: '🧭', color: '#B86A00', bg: '#FFF1D9' },
}

/** Состояние варианта ответа после проверки */
export function optState(i: number, answer: Answer, status: Status, correct: number) {
  if (status === 'idle') return answer === i ? 'is-selected' : ''
  if (i === correct) return 'is-correct'
  if (answer === i) return 'is-wrong'
  return 'opacity-55'
}

export function vibeMood(value: number, target: number) {
  if (value >= target) return { text: 'Вайб пойман!', emoji: '✨', color: '#0E9C8C' }
  if (value >= target * 0.6) return { text: 'Уже теплее', emoji: '🙂', color: '#B86A00' }
  return { text: 'Мутновато', emoji: '😶', color: '#E0573A' }
}
