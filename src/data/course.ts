/**
 * Курс «Вайб-кодинг»: 5 разделов, в каждом — уроки (узлы на пути) со своими упражнениями.
 * Контент лежит в src/data/units/*.ts, типы — в src/data/types.ts.
 */
import type { Unit } from './types'
import { prepareExercise } from './exerciseLogic'
import { unit1 } from './units/u1-first-prompt'
import { unit2 } from './units/u2-landing'
import { unit3 } from './units/u3-debugging'
import { unit4 } from './units/u4-backend'
import { unit5 } from './units/u5-launch'

export * from './types'
export { DEMO_EXERCISE } from './units/u1-first-prompt'

const prepare = (u: Unit): Unit => ({
  ...u,
  lessons: u.lessons.map((l) => ({ ...l, exercises: l.exercises.map((ex, i) => prepareExercise(ex, `${l.id}:${i}:${ex.title}`)) })),
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
