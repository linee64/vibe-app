import { describe, expect, it, vi } from 'vitest'
import { bumpStreak, expireStreak, mergeStreak, shiftDay } from '../../src/data/streak'

vi.mock('../../src/store', () => ({ LAST_LESSON_KEY: 'x' }))
vi.mock('../../src/router', () => ({ navigate: vi.fn() }))
const { nextStep, FIRST_RUN_PICK, FIRST_LESSON_ID, isNewLearner } = await import('../../src/flow')
const { findLesson } = await import('../../src/data/course')

const at = (day: string) => new Date(`${day}T12:00:00`)

describe('деплой-серия', () => {
  it('первый урок начинает серию с 1; второй урок в тот же день её не меняет', () => {
    const a = bumpStreak({ streak: 0 }, at('2026-10-28'))
    expect(a).toEqual({ streak: 1, streakDay: '2026-10-28' })
    expect(bumpStreak(a, at('2026-10-28'))).toEqual(a)
  })
  it('на следующий день серия растёт, через пропуск — начинается заново', () => {
    expect(bumpStreak({ streak: 1, streakDay: '2026-10-28' }, at('2026-10-29'))).toEqual({ streak: 2, streakDay: '2026-10-29' })
    expect(bumpStreak({ streak: 7, streakDay: '2026-10-20' }, at('2026-10-29'))).toEqual({ streak: 1, streakDay: '2026-10-29' })
  })
  it('старые данные без даты не обнуляются', () => {
    expect(bumpStreak({ streak: 12 }, at('2026-10-29'))).toEqual({ streak: 13, streakDay: '2026-10-29' })
  })
  it('shiftDay переходит через границу месяца', () => {
    expect(shiftDay('2026-11-01', -1)).toBe('2026-10-31')
    expect(shiftDay('2026-12-31', 1)).toBe('2027-01-01')
  })
  it('пропущенный день сжигает серию, вчерашняя — жива', () => {
    expect(expireStreak({ streak: 4, streakDay: '2026-10-27' }, at('2026-10-29')).streak).toBe(0)
    expect(expireStreak({ streak: 4, streakDay: '2026-10-28' }, at('2026-10-29')).streak).toBe(4)
    expect(expireStreak({ streak: 12 }, at('2026-10-29')).streak).toBe(12)
  })
  it('слияние: свежий день побеждает, в один день — максимум', () => {
    expect(mergeStreak({ streak: 3, streakDay: '2026-10-27' }, { streak: 1, streakDay: '2026-10-28' })).toEqual({ streak: 1, streakDay: '2026-10-28' })
    expect(mergeStreak({ streak: 3, streakDay: '2026-10-28' }, { streak: 5, streakDay: '2026-10-28' }).streak).toBe(5)
    expect(mergeStreak({ streak: 3 }, { streak: 5 })).toEqual({ streak: 5 })
  })
})

describe('первый запуск', () => {
  it('короткая версия первого урока берёт существующие упражнения', () => {
    const n = findLesson(FIRST_LESSON_ID)!.exercises.length
    expect(FIRST_RUN_PICK.length).toBeLessThan(n)
    for (const i of FIRST_RUN_PICK) expect(i).toBeLessThan(n)
    expect(FIRST_RUN_PICK[0]).toBe(0) // самый простой вопрос — первым
  })
  it('isNewLearner: нет ни уроков, ни домашек', () => {
    expect(isNewLearner({ completed: [], homework: [] })).toBe(true)
    expect(isNewLearner({ completed: ['u1-1'], homework: [] })).toBe(false)
  })
  it('nextStep: после урока 1 ведёт в урок 2; в Pro-раздел напрямую не зовёт', () => {
    const base = { completed: ['u1-1'], homework: [], tiersByTest: [], tiersCelebrated: [], unlockAll: false }
    expect(nextStep(base)?.to).toBe('/lesson/u1-2')
    const endU1 = { ...base, completed: ['u1-1', 'u1-2', 'u1-3', 'u1-4', 'u1-5', 'u1-6'], homework: ['hw1'], tiersCelebrated: ['novice'] }
    expect(nextStep(endU1)).toBeNull()
  })
})
