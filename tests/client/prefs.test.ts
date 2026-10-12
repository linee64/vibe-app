import { describe, expect, it } from 'vitest'
import { DEFAULT_GOAL, mailto, parseGoal, shouldRemind } from '../../src/lib/prefs'

describe('настройки на устройстве', () => {
  it('дневная цель: только из списка, иначе по умолчанию', () => {
    expect(parseGoal('30')).toBe(30)
    expect(parseGoal('7')).toBe(DEFAULT_GOAL)
    expect(parseGoal(null)).toBe(DEFAULT_GOAL)
  })

  it('напоминание: вечером, без XP за день и не чаще раза в день', () => {
    const evening = new Date(2026, 9, 12, 19, 0)
    const base = { on: true, todayXp: 0, now: evening, lastShown: null, day: '2026-10-12' }
    expect(shouldRemind(base)).toBe(true)
    expect(shouldRemind({ ...base, on: false })).toBe(false)
    expect(shouldRemind({ ...base, todayXp: 10 })).toBe(false)
    expect(shouldRemind({ ...base, lastShown: '2026-10-12' })).toBe(false)
    expect(shouldRemind({ ...base, now: new Date(2026, 9, 12, 9, 0) })).toBe(false)
  })

  it('mailto в поддержку кодирует тему и текст', () => {
    expect(mailto()).toBe('mailto:support@vaibik.site')
    expect(mailto('Удаление аккаунта', 'a b')).toBe(`mailto:support@vaibik.site?subject=${encodeURIComponent('Удаление аккаунта')}&body=a%20b`)
  })
})
