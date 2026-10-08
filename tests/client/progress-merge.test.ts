import { describe, expect, it, vi } from 'vitest'

vi.mock('../../src/lib/supabase', () => ({ getSupabase: async () => null }))
const { mergeProgress, sanitizeRemote } = await import('../../src/lib/progressSync')
import type { Progress } from '../../src/store'

const base = (o: Partial<Progress> = {}): Progress => ({
  completed: [],
  xp: 0,
  gems: 0,
  hearts: 5,
  streak: 0,
  todayXp: 0,
  perfectToday: 0,
  lessonsToday: 0,
  lastDay: '2026-10-08',
  homework: [],
  tiersByTest: [],
  tiersCelebrated: [],
  unlockAll: false,
  placementSeen: false,
  portfolioUrl: '',
  ...o,
})

describe('mergeProgress', () => {
  it('объединяет множества и берёт максимум счётчиков', () => {
    const local = base({ completed: ['u1-1', 'u1-2'], xp: 100, gems: 10, streak: 3, homework: ['hw1'] })
    const remote = { completed: ['u1-2', 'u1-3'], xp: 80, gems: 50, streak: 5, homework: ['hw2'], tiersByTest: ['novice'] }
    const m = mergeProgress(local, remote)
    expect(m.completed.sort()).toEqual(['u1-1', 'u1-2', 'u1-3'])
    expect(m.homework.sort()).toEqual(['hw1', 'hw2'])
    expect(m.tiersByTest).toEqual(['novice'])
    expect(m.xp).toBe(100)
    expect(m.gems).toBe(50)
    expect(m.streak).toBe(5)
  })
  it('дневные счётчики — от более свежего дня; в тот же день — максимум', () => {
    const local = base({ lastDay: '2026-10-07', todayXp: 90, lessonsToday: 9 })
    expect(mergeProgress(local, { lastDay: '2026-10-08', todayXp: 10, lessonsToday: 1 })).toMatchObject({ lastDay: '2026-10-08', todayXp: 10, lessonsToday: 1 })
    const same = base({ todayXp: 30, lessonsToday: 1 })
    expect(mergeProgress(same, { lastDay: '2026-10-08', todayXp: 20, lessonsToday: 4 })).toMatchObject({ todayXp: 30, lessonsToday: 4 })
  })
  it('unlockAll из облака не берётся, портфолио не теряется', () => {
    const m = mergeProgress(base({ unlockAll: false }), { portfolioUrl: 'https://x.dev', placementSeen: true } as Partial<Progress>)
    expect(m.unlockAll).toBe(false)
    expect(m.portfolioUrl).toBe('https://x.dev')
    expect(m.placementSeen).toBe(true)
  })
  it('null из облака — локальный прогресс без изменений', () => {
    const l = base({ xp: 7 })
    expect(mergeProgress(l, null)).toBe(l)
  })
})

describe('sanitizeRemote', () => {
  it('отбрасывает мусор и неверные типы', () => {
    const r = sanitizeRemote({ xp: -5, gems: 'много', completed: ['u1-1', 3, null], lastDay: 'вчера', unlockAll: true, evil: 1 })!
    expect(r.xp).toBe(0)
    expect(r.gems).toBe(0)
    expect(r.completed).toEqual(['u1-1'])
    expect(r.lastDay).toBe('')
    expect('unlockAll' in r).toBe(false)
    expect('evil' in r).toBe(false)
  })
  it('не объект → null', () => {
    expect(sanitizeRemote([1, 2])).toBeNull()
    expect(sanitizeRemote('x')).toBeNull()
  })
})
