/**
 * Курс «Вайб-кодинг»: 5 разделов, в каждом — уроки (узлы на пути) со своими упражнениями.
 * Контент лежит в src/data/units/*.ts, типы — в src/data/types.ts.
 */
import type { Exercise, Unit } from './types'
import { seededShuffle } from './exerciseLogic'
import { unit1 } from './units/u1-first-prompt'
import { unit2 } from './units/u2-landing'
import { unit3 } from './units/u3-debugging'
import { unit4 } from './units/u4-backend'
import { unit5 } from './units/u5-launch'

export * from './types'
export { DEMO_EXERCISE } from './units/u1-first-prompt'

/**
 * В данных правильный вариант часто стоит первым — так удобнее писать контент.
 * Перед показом детерминированно перемешиваем варианты (порядок стабилен между рендерами).
 */
function shuffleOptions(ex: Exercise, seed: string): Exercise {
  if (ex.kind !== 'choice' && ex.kind !== 'fill') return ex
  // правильный вариант ставим на позицию по хешу seed, остальные — в перемешанном порядке
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const target = (h >>> 0) % ex.options.length
  const others = seededShuffle(ex.options.map((_, i) => i).filter((i) => i !== ex.correct), seed)
  const order = [...others.slice(0, target), ex.correct, ...others.slice(target)]
  return { ...ex, options: order.map((i) => ex.options[i]), correct: order.indexOf(ex.correct) }
}

const prepare = (u: Unit): Unit => ({
  ...u,
  lessons: u.lessons.map((l) => ({ ...l, exercises: l.exercises.map((ex, i) => shuffleOptions(ex, `${l.id}:${i}:${ex.title}`)) })),
})

export const UNITS: Unit[] = [unit1, unit2, unit3, unit4, unit5].map(prepare)

export const ALL_LESSONS = UNITS.flatMap((u) => u.lessons.map((l, i) => ({ ...l, unit: u, index: i })))

export const TOTAL_EXERCISES = ALL_LESSONS.reduce((n, l) => n + l.exercises.length, 0)

export function findLesson(id: string) {
  return ALL_LESSONS.find((l) => l.id === id)
}

/** Текущий урок — первый непройденный по порядку пути */
export function currentLessonId(completed: string[]) {
  return ALL_LESSONS.find((l) => !completed.includes(l.id))?.id ?? null
}
