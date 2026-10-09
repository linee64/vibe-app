/**
 * Мобильные адаптеры наблюдаемости: аналитика без ключа — no-op, отзывы (локально / сервер / исходящие),
 * микро-опросы по общим правилам и вычистка событий Sentry.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FEEDBACK_LOCAL_KEY, FEEDBACK_OUTBOX_KEY, MICRO_STORAGE_KEY } from '@web/data/feedback'
import { track, identify, resetAnalytics } from '../lib/analytics'
import { collectContext, requestMicroPrompt, submitFeedback, takeMicroPrompt } from '../lib/feedback'
import { scrubMobileEvent } from '../lib/sentry'

// jest.mock поднимается babel-jest над импортами
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  setUser: jest.fn(),
  withScope: jest.fn(),
}))

const T = 1_790_000_000_000
const payload = { rating: 4, category: 'idea' as const, message: '  Хочу тёмную тему  ', source: 'manual' as const, context: { route: '/learn' } }
const res = (status: number, body: unknown = {}) => ({ ok: status < 300, status, json: async () => body }) as Response

beforeEach(async () => {
  await AsyncStorage.clear()
})

describe('аналитика без EXPO_PUBLIC_POSTHOG_KEY', () => {
  it('track/identify/reset — no-op и не падают', () => {
    expect(() => {
      track('lesson_started', { lesson_id: 'u1-1', unit: 1 })
      identify('2b1f0c1e-1111-4222-8333-444455556666')
      resetAnalytics()
    }).not.toThrow()
  })
})

describe('отзывы', () => {
  it('без бэкенда — сохраняются на устройстве, без почты', async () => {
    const r = await submitFeedback({ ...payload, email: 'me@example.com' }, { apiEnabled: false })
    expect(r).toEqual({ ok: true, stored: 'local' })
    const saved = JSON.parse((await AsyncStorage.getItem(FEEDBACK_LOCAL_KEY)) ?? '[]')
    expect(saved).toHaveLength(1)
    expect(saved[0].message).toBe('Хочу тёмную тему')
    expect(saved[0].email).toBeUndefined()
  })

  it('с бэкендом — POST /api/feedback с JSON', async () => {
    const fetchImpl = jest.fn(async () => res(201, { ok: true }))
    const r = await submitFeedback(payload, { apiEnabled: true, fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(r).toEqual({ ok: true, stored: 'server' })
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toMatch(/\/api\/feedback$/)
    expect(JSON.parse(String(init.body))).toMatchObject({ rating: 4, category: 'idea', source: 'manual' })
  })

  it('сеть/5xx — в исходящие; 400 — понятная ошибка', async () => {
    const down = jest.fn(async () => res(503))
    expect(await submitFeedback(payload, { apiEnabled: true, fetchImpl: down as unknown as typeof fetch })).toEqual({ ok: true, stored: 'outbox' })
    expect(JSON.parse((await AsyncStorage.getItem(FEEDBACK_OUTBOX_KEY)) ?? '[]')).toHaveLength(1)
    const bad = jest.fn(async () => res(400, { error: { message: 'Слишком длинный текст' } }))
    expect(await submitFeedback(payload, { apiEnabled: true, fetchImpl: bad as unknown as typeof fetch })).toEqual({ ok: false, message: 'Слишком длинный текст' })
  })

  it('контекст: маршрут без query, id урока, без личных данных', () => {
    const c = collectContext('/lesson/u1-2?token=abc')
    expect(c.route).toBe('/lesson/u1-2')
    expect(c.lesson_id).toBe('u1-2')
    expect(JSON.stringify(c)).not.toMatch(/abc|@/)
  })
})

describe('микро-опросы', () => {
  it('один раз после первого урока, затем пауза', async () => {
    await requestMicroPrompt('first_lesson', T)
    expect(await takeMicroPrompt(T + 1000)).toBe('first_lesson')
    expect(await takeMicroPrompt(T + 2000)).toBeNull()
    await requestMicroPrompt('first_lesson', T + 3000)
    expect(await takeMicroPrompt(T + 4000)).toBeNull()
    expect(await AsyncStorage.getItem(MICRO_STORAGE_KEY)).toContain('first_lesson')
  })

  it('не чаще одного опроса за кулдаун', async () => {
    await requestMicroPrompt('homework', T)
    expect(await takeMicroPrompt(T)).toBe('homework')
    await requestMicroPrompt('paywall_exit', T + 60_000)
    expect(await takeMicroPrompt(T + 60_000)).toBeNull()
  })
})

describe('Sentry: вычистка', () => {
  it('убирает почту, токены, query и переменные стека', () => {
    const e = scrubMobileEvent({
      message: 'fail for me@example.com Bearer abcdefghij.klmnop.qrstuv',
      user: { id: 'u1', email: 'me@example.com', ip_address: '1.2.3.4' },
      request: { url: 'https://x.dev/api?token=secret', headers: { authorization: 'x' } },
      exception: { values: [{ value: 'key sk-1234567890abcdef', stacktrace: { frames: [{ vars: { prompt: 'секрет' } }] } }] },
      breadcrumbs: [{ category: 'console', message: 'log' }, { category: 'fetch', data: { url: 'https://x.dev/a?x=1' } }],
    })
    const s = JSON.stringify(e)
    expect(s).not.toMatch(/me@example\.com|1\.2\.3\.4|secret|sk-1234|секрет|abcdefghij/)
    expect(e.user).toEqual({ id: 'u1' })
    expect(e.breadcrumbs).toHaveLength(1)
  })
})
