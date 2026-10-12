import { describe, expect, it, vi } from 'vitest'
import {
  DAILY_COUNT,
  DAILY_POOL,
  WEEKLY,
  applyQuestEvent,
  claimQuest,
  claimableCount,
  dailyQuestsFor,
  emptyQuests,
  localDay,
  localWeek,
  mergeQuests,
  newlyCompleted,
  questBoard,
  rollQuests,
  sanitizeQuests,
  type QuestState,
} from '../../src/data/quests'
import { ru } from '../../src/i18n/ui/ru'

vi.mock('../../src/lib/supabase', () => ({ getSupabase: async () => null }))
const { mergeProgress, sanitizeRemote } = await import('../../src/lib/progressSync')

// понедельник 12 октября 2026, местное время
const MON = new Date(2026, 9, 12, 10, 0)
const at = (day: number, h = 10) => new Date(2026, 9, day, h, 0)

const lesson = (s: QuestState | undefined, now = MON, perfect = false, xp = 10) => applyQuestEvent(s, { type: 'lesson', xp, perfect }, now)
const answers = (s: QuestState | undefined, n: number, now = MON) => {
  let q = s
  for (let i = 0; i < n; i++) q = applyQuestEvent(q, { type: 'answer', correct: true }, now)
  return q!
}
const view = (s: QuestState, id: string, now = MON) => {
  const b = questBoard(s, now)
  return [...b.daily, ...b.weekly].find((q) => q.id === id)
}

describe('даты по местному времени', () => {
  it('localDay / localWeek (неделя с понедельника)', () => {
    expect(localDay(MON)).toBe('2026-10-12')
    expect(localWeek(MON)).toBe('2026-10-12')
    expect(localWeek(at(18, 23))).toBe('2026-10-12') // воскресенье
    expect(localWeek(at(19, 0))).toBe('2026-10-19')
    expect(localDay(new Date(2026, 9, 12, 23, 59))).toBe('2026-10-12')
  })
})

describe('набор заданий', () => {
  it('каждый день — DAILY_COUNT разных заданий, детерминированно', () => {
    for (let d = 1; d <= 28; d++) {
      const day = `2026-10-${String(d).padStart(2, '0')}`
      const a = dailyQuestsFor(day)
      expect(a).toHaveLength(DAILY_COUNT)
      expect(new Set(a.map((q) => q.id)).size).toBe(DAILY_COUNT)
      expect(dailyQuestsFor(day).map((q) => q.id)).toEqual(a.map((q) => q.id))
    }
  })
  it('за месяц встречаются все задания пула', () => {
    const seen = new Set<string>()
    for (let d = 1; d <= 28; d++) dailyQuestsFor(`2026-10-${String(d).padStart(2, '0')}`).forEach((q) => seen.add(q.id))
    expect(seen.size).toBe(DAILY_POOL.length)
  })
  it('у каждого задания есть подписи в каталоге', () => {
    for (const q of [...DAILY_POOL, ...WEEKLY]) {
      expect(ru).toHaveProperty(`quests.${q.id}.title`)
      expect(ru).toHaveProperty(`quests.${q.id}.desc`)
    }
  })
  it('награды разумные: за день не больше ~2 подзарядок', () => {
    const maxDaily = [...DAILY_POOL].sort((a, b) => b.reward - a.reward).slice(0, DAILY_COUNT).reduce((n, q) => n + q.reward, 0)
    expect(maxDaily).toBeLessThanOrEqual(60)
    expect(WEEKLY.reduce((n, q) => n + q.reward, 0)).toBeLessThanOrEqual(100)
  })
})

describe('события', () => {
  // 10 октября в наборе дня: d-ship2, d-combo10, d-clean1
  const SAT = at(10)
  it('урок: уроки, ВП, без ошибок, активный день — и в дне, и в неделе', () => {
    expect(dailyQuestsFor('2026-10-10').map((q) => q.id)).toEqual(['d-ship2', 'd-combo10', 'd-clean1'])
    const s = lesson(lesson(undefined, SAT), SAT, true, 15)
    expect(s.daily).toMatchObject({ lessons: 2, xp: 25, perfect: 1 })
    expect(s.weekly).toMatchObject({ lessons: 2, xp: 25, perfect: 1 })
    expect(s.activeDays).toEqual(['2026-10-10'])
    expect(view(s, 'd-ship2', SAT)).toMatchObject({ value: 2, done: true })
    expect(view(s, 'd-clean1', SAT)).toMatchObject({ value: 1, done: true })
  })
  it('комбо: ошибка сбрасывает серию, но лучший результат дня остаётся', () => {
    let s = answers(undefined, 6, SAT)
    s = applyQuestEvent(s, { type: 'answer', correct: false }, SAT)
    s = answers(s, 4, SAT)
    expect(s.run).toBe(4)
    expect(s.daily.combo).toBe(6)
    expect(s.daily.correct).toBe(10)
    s = answers(s, 6, SAT)
    expect(s.daily.combo).toBe(10)
    expect(view(s, 'd-combo10', SAT)?.done).toBe(true)
  })
  it('домашка засчитывается в недельное задание', () => {
    const s = applyQuestEvent(undefined, { type: 'homework', xp: 50 }, MON)
    expect(view(s, 'w-review1')).toMatchObject({ value: 1, done: true })
    expect(s.daily.xp).toBe(50)
  })
  it('деплой-неделя: разные дни, повтор в тот же день не считается', () => {
    let s: QuestState | undefined
    for (const d of [12, 12, 13, 15, 16]) s = lesson(s, at(d))
    expect(view(s!, 'w-streak5', at(16))?.value).toBe(4)
    s = lesson(s, at(18))
    expect(view(s, 'w-streak5', at(18))?.done).toBe(true)
  })
})

describe('сброс по дням и неделям', () => {
  it('новый день обнуляет дневное и отметки дневных, неделя — остаётся', () => {
    let s = lesson(lesson(undefined))
    s = { ...s, claimed: ['d-ship2', 'w-review1'], notified: ['d-ship2'] }
    const next = rollQuests(s, at(13))
    expect(next.day).toBe('2026-10-13')
    expect(next.daily.lessons).toBe(0)
    expect(next.weekly.lessons).toBe(2)
    expect(next.claimed).toEqual(['w-review1'])
    expect(next.notified).toEqual([])
  })
  it('новая неделя обнуляет всё', () => {
    const s = { ...lesson(undefined), claimed: ['w-review1'] }
    const next = rollQuests(s, at(19))
    expect(next.weekly.lessons).toBe(0)
    expect(next.activeDays).toEqual([])
    expect(next.claimed).toEqual([])
  })
  it('доска показывает свежий день, даже если событий ещё не было', () => {
    const s = lesson(lesson(undefined))
    expect(questBoard(s, at(13)).daily.every((q) => q.value === 0 || q.metric === 'activeDays')).toBe(true)
  })
})

describe('награды', () => {
  it('забрать можно только выполненное и только один раз', () => {
    let s = lesson(lesson(undefined))
    expect(claimQuest(s, 'w-review1', MON)).toBeNull()
    s = applyQuestEvent(s, { type: 'homework', xp: 50 }, MON)
    const res = claimQuest(s, 'w-review1', MON)
    expect(res?.reward).toBe(WEEKLY.find((q) => q.id === 'w-review1')!.reward)
    expect(claimQuest(res!.state, 'w-review1', MON)).toBeNull()
    expect(view(res!.state, 'w-review1')?.claimed).toBe(true)
  })
  it('задание не из сегодняшнего набора забрать нельзя', () => {
    const today = dailyQuestsFor('2026-10-12').map((q) => q.id)
    const other = DAILY_POOL.find((q) => !today.includes(q.id))!
    const s = answers(lesson(lesson(undefined, MON, true, 30), MON, true, 30), 25)
    expect(claimQuest(s, other.id, MON)).toBeNull()
  })
  it('claimableCount и newlyCompleted', () => {
    const s = applyQuestEvent(undefined, { type: 'homework', xp: 50 }, MON)
    expect(claimableCount(s, MON)).toBeGreaterThanOrEqual(1)
    expect(newlyCompleted(s, MON).map((q) => q.id)).toContain('w-review1')
    const claimed = claimQuest(s, 'w-review1', MON)!.state
    expect(newlyCompleted(claimed, MON).map((q) => q.id)).not.toContain('w-review1')
  })
})

describe('синхронизация', () => {
  it('sanitizeQuests отбрасывает мусор', () => {
    expect(sanitizeQuests(null)).toBeUndefined()
    expect(sanitizeQuests({ day: 'x', week: '2026-10-12' })).toBeUndefined()
    const s = sanitizeQuests({ day: '2026-10-12', week: '2026-10-12', daily: { lessons: -3, xp: 'a', combo: 4 }, claimed: ['d-ship2', 42], activeDays: ['2026-10-12', 'bad'] })
    expect(s?.daily).toMatchObject({ lessons: 0, xp: 0, combo: 4 })
    expect(s?.claimed).toEqual(['d-ship2'])
    expect(s?.activeDays).toEqual(['2026-10-12'])
  })
  it('mergeQuests: тот же день — максимум и объединение «забрал»', () => {
    const a = { ...lesson(lesson(undefined)), claimed: ['d-ship2'] }
    const b = { ...answers(undefined, 12), claimed: ['w-review1'] }
    const m = mergeQuests(a, b)!
    expect(m.daily.lessons).toBe(2)
    expect(m.daily.combo).toBe(12)
    expect(m.claimed.sort()).toEqual(['d-ship2', 'w-review1'])
  })
  it('mergeQuests: более свежий день побеждает, неделя сохраняется', () => {
    const old = { ...lesson(lesson(undefined)), claimed: ['d-ship2', 'w-review1'] }
    const fresh = lesson(undefined, at(13))
    const m = mergeQuests(old, fresh)!
    expect(m.day).toBe('2026-10-13')
    expect(m.daily.lessons).toBe(1)
    expect(m.weekly.lessons).toBe(2)
    expect(m.claimed).toEqual(['w-review1'])
    expect(m.activeDays.sort()).toEqual(['2026-10-12', '2026-10-13'])
  })
  it('progressSync переносит задания и introSeen', () => {
    const q = lesson(undefined)
    const remote = sanitizeRemote({ completed: [], quests: q, introSeen: true })
    expect(remote?.quests?.daily.lessons).toBe(1)
    expect(remote?.introSeen).toBe(true)
    const local = { completed: [], xp: 0, gems: 0, hearts: 5, streak: 0, todayXp: 0, perfectToday: 0, lessonsToday: 0, lastDay: '2026-10-12', homework: [], tiersByTest: [], tiersCelebrated: [], unlockAll: false, placementSeen: false, portfolioUrl: '' }
    const m = mergeProgress(local, remote)
    expect(m.quests?.daily.lessons).toBe(1)
    expect(m.introSeen).toBe(true)
    expect(emptyQuests(MON).day).toBe('2026-10-12')
  })
})
