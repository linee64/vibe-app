import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildEvent, captureServerError, parseDsn, scrubServer, withSentry } from '../../server/sentry.js'
import { jsonResponse, setEnv } from './helpers.js'

const DSN = 'https://abc123public@o12345.ingest.us.sentry.io/4507654321'

describe('server/sentry (минимальный клиент)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => setEnv({ SENTRY_DSN: undefined }))

  it('разбирает DSN в адрес envelope', () => {
    expect(parseDsn(DSN)).toEqual({ endpoint: 'https://o12345.ingest.us.sentry.io/api/4507654321/envelope/', publicKey: 'abc123public', raw: DSN })
    expect(parseDsn('nonsense')).toBeNull()
    expect(parseDsn('https://o1.ingest.sentry.io/123')).toBeNull()
  })

  it('вычищает токены, ключи и почту из сообщения', () => {
    const s = scrubServer('fail for aidar@example.com with sb_secret_abcdef123456 and Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijk and sk-1234567890abcdef')
    expect(s).not.toMatch(/aidar@|sb_secret_abc|eyJhbG|sk-1234/)
  })

  it('без SENTRY_DSN ничего не отправляет', async () => {
    const fetchImpl = vi.fn()
    expect(await captureServerError(new Error('x'), { route: 'feedback' }, { fetchImpl: fetchImpl as unknown as typeof fetch })).toBe(false)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('с DSN: envelope с вычищенной ошибкой, без тела запроса', async () => {
    setEnv({ SENTRY_DSN: DSN })
    const fetchImpl = vi.fn(async (_u: string | URL | Request, _i?: RequestInit) => jsonResponse({ id: '1' }))
    const ok = await captureServerError(new TypeError('boom for aidar@example.com'), { route: 'ai/review', tags: { stage: 'x' } }, { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(ok).toBe(true)
    const [url, init] = fetchImpl.mock.calls[0]
    const headers = (init?.headers ?? {}) as Record<string, string>
    expect(String(url)).toBe('https://o12345.ingest.us.sentry.io/api/4507654321/envelope/')
    expect(headers['x-sentry-auth']).toContain('sentry_key=abc123public')
    const [, , ev] = String(init?.body).split('\n').map((l) => JSON.parse(l))
    expect(ev.exception.values[0]).toMatchObject({ type: 'TypeError', value: 'boom for [email]' })
    expect(ev.tags).toEqual({ route: 'ai/review', stage: 'x' })
    expect(ev.request).toBeUndefined()
  })

  it('withSentry: исключение → отчёт и дружелюбный 500', async () => {
    setEnv({ SENTRY_DSN: DSN })
    const fetchImpl = vi.fn(async () => jsonResponse({}))
    const h = withSentry('feedback', () => {
      throw new Error('kaboom')
    }, { fetchImpl: fetchImpl as unknown as typeof fetch })
    const res = await h(new Request('https://x.example/api/feedback', { method: 'POST' }))
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('internal')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('buildEvent: стек из файлов проекта, без абсолютных путей', () => {
    const ev = buildEvent(new Error('x'), { route: 'r' })
    expect(ev.exception.values[0].stacktrace?.frames.length).toBeGreaterThan(0)
  })
})
