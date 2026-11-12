import { findLesson } from '@web/data/course'
import { coachBeat, GUIDED_LESSON_ID, GUIDED_PICK, isGuidedLesson, needsGuide, startRoute } from '../lib/guide'
import { parseAuthCallback } from '../lib/authCallback'

describe('parseAuthCallback', () => {
  it('читает код PKCE из query', () => {
    expect(parseAuthCallback('vaibik://callback?code=abc')).toEqual({ code: 'abc' })
  })
  it('читает токены из hash', () => {
    expect(parseAuthCallback('vaibik://callback#access_token=a&refresh_token=r')).toEqual({ accessToken: 'a', refreshToken: 'r' })
  })
  it('отдаёт ошибку провайдера и игнорирует обычные адреса', () => {
    expect(parseAuthCallback('vaibik://callback?error_description=access_denied')).toEqual({ error: 'access_denied' })
    expect(parseAuthCallback('vaibik://callback')).toBeNull()
    expect(parseAuthCallback('not a url')).toBeNull()
  })
})

describe('первый заход', () => {
  const fresh = { completed: [] as string[], homework: [] as string[] }
  it('первый урок курса существует и длиннее проводки', () => {
    expect(GUIDED_LESSON_ID).toBe('u1-1')
    const n = findLesson('u1-1')!.exercises.length
    expect(n).toBeGreaterThan(GUIDED_PICK.length)
    expect([...GUIDED_PICK]).toEqual([0, 3, 2])
    for (const i of GUIDED_PICK) expect(i).toBeLessThan(n)
  })
  it('новичка после входа ведёт в урок, а не на путь', () => {
    expect(startRoute(fresh, true)).toBe('/lesson/u1-1')
    expect(startRoute(fresh, false)).toBe('/(tabs)/learn')
    expect(isGuidedLesson(fresh, 'u1-1')).toBe(true)
    expect(isGuidedLesson(fresh, 'u1-2')).toBe(false)
  })
  it('после урока показывает проводку и больше не ведёт за руку', () => {
    const done = { completed: ['u1-1'], homework: [] as string[] }
    expect(needsGuide(done)).toBe(true)
    expect(startRoute(done, true)).toBe('/guide')
    expect(isGuidedLesson(done, 'u1-1')).toBe(false)
    expect(needsGuide({ ...done, introSeen: true })).toBe(false)
    expect(startRoute({ completed: ['u1-1', 'u1-2'], homework: [] }, true)).toBe('/(tabs)/learn')
  })
  it('Бипи говорит в начале, после ответа и про токены', () => {
    const base = { guided: true, dismissed: [] as string[] }
    expect(coachBeat({ ...base, pos: 0, status: 'idle' })).toBe('welcome')
    expect(coachBeat({ ...base, pos: 0, status: 'correct' })).toBe('after')
    expect(coachBeat({ ...base, pos: 1, status: 'idle' })).toBe('tokens')
    expect(coachBeat({ ...base, pos: 1, status: 'idle', dismissed: ['tokens'] })).toBeNull()
    expect(coachBeat({ ...base, guided: false, pos: 0, status: 'idle' })).toBeNull()
  })
})
