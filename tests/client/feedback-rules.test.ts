import { describe, expect, it } from 'vitest'
import {
  MICRO_RULES,
  canSubmitFeedback,
  emptyMicroState,
  idsFromRoute,
  markMicroShown,
  microToShow,
  parseMicroState,
  queueMicro,
} from '../../src/data/feedback'

const H = 3_600_000
/** реальное время (мс с 1970) — как Date.now() в приложении */
const T = 1_790_000_000_000

describe('микро-опросы: по одному, не часто', () => {
  it('первый урок: ставится в очередь и показывается один раз', () => {
    let s = queueMicro(emptyMicroState(), 'first_lesson', T + 1000)
    expect(microToShow(s, T + 2000)).toBe('first_lesson')
    s = markMicroShown(s, 'first_lesson', T + 2000)
    expect(microToShow(s, T + 3000)).toBeNull()
    s = queueMicro(s, 'first_lesson', T + 100 * H)
    expect(microToShow(s, T + 100 * H)).toBeNull()
  })

  it('общий кулдаун: после показа другой опрос не всплывает раньше чем через 20 часов', () => {
    let s = markMicroShown(queueMicro(emptyMicroState(), 'first_lesson', T), 'first_lesson', T)
    s = queueMicro(s, 'homework', T + 1 * H)
    expect(microToShow(s, T + 1 * H)).toBeNull()
    s = queueMicro(s, 'homework', T + MICRO_RULES.cooldownMs + 1)
    expect(microToShow(s, T + MICRO_RULES.cooldownMs + 2)).toBe('homework')
  })

  it('одновременно ждёт только один; устаревший запрос не показывается', () => {
    let s = queueMicro(emptyMicroState(), 'paywall_exit', T)
    s = queueMicro(s, 'homework', T + 1000)
    expect(s.pending).toBe('paywall_exit')
    expect(microToShow(s, T + MICRO_RULES.pendingTtlMs + 1)).toBeNull()
  })

  it('пейвол: не больше 2 раз и не чаще раза в неделю', () => {
    const D = 24 * H
    let s = emptyMicroState()
    s = markMicroShown(queueMicro(s, 'paywall_exit', T), 'paywall_exit', T)
    expect(microToShow(queueMicro(s, 'paywall_exit', T + 2 * D), T + 2 * D)).toBeNull()
    s = queueMicro(s, 'paywall_exit', T + 8 * D)
    expect(microToShow(s, T + 8 * D)).toBe('paywall_exit')
    s = markMicroShown(s, 'paywall_exit', T + 8 * D)
    expect(s.shown.paywall_exit).toBe(2)
    expect(microToShow(queueMicro(s, 'paywall_exit', T + 30 * D), T + 30 * D)).toBeNull()
  })

  it('битое состояние в localStorage не ломает приложение', () => {
    expect(parseMicroState('{bad')).toEqual(emptyMicroState())
    expect(parseMicroState(JSON.stringify({ pending: 'evil', shown: { homework: 'x', first_lesson: 1 } }))).toMatchObject({ pending: null, shown: { first_lesson: 1 } })
  })
})

describe('форма отзыва', () => {
  it('нужна оценка, тема или текст; почта — корректная; до 1000 символов', () => {
    expect(canSubmitFeedback({ rating: null, category: null, message: '  ' })).toBe(false)
    expect(canSubmitFeedback({ rating: 3, category: null, message: '' })).toBe(true)
    expect(canSubmitFeedback({ rating: null, category: 'bug', message: '' })).toBe(true)
    expect(canSubmitFeedback({ rating: null, category: null, message: 'привет' })).toBe(true)
    expect(canSubmitFeedback({ rating: 3, category: null, message: '', email: 'nope' })).toBe(false)
    expect(canSubmitFeedback({ rating: 3, category: null, message: 'x'.repeat(1001) })).toBe(false)
  })
  it('id урока и домашки из маршрута', () => {
    expect(idsFromRoute('/lesson/u2-3')).toEqual({ lesson_id: 'u2-3' })
    expect(idsFromRoute('/homework/hw4')).toEqual({ homework_id: 'hw4' })
    expect(idsFromRoute('/learn')).toEqual({})
  })
})
