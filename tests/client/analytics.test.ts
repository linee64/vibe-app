import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanRoute, createAnalytics, type AnalyticsClient } from '../../src/lib/analyticsCore'
import { sanitizeProps, scrubDeep, scrubString } from '../../src/lib/scrub'

const fakeClient = () => {
  const c = { capture: vi.fn(), identify: vi.fn(), reset: vi.fn() }
  return c as typeof c & AnalyticsClient
}
const UID = '11111111-2222-4333-8444-555555555555'

describe('analytics: no-op без ключа', () => {
  it('ничего не грузит и не отправляет; в dev пишет в консоль', async () => {
    const load = vi.fn(async () => fakeClient())
    const log = vi.fn()
    const a = createAnalytics({ apiKey: '', load, debug: true, log })
    expect(a.enabled).toBe(false)
    a.track('lesson_completed', { lesson_id: 'u1-1', mistakes: 0 })
    a.identify(UID)
    a.reset()
    a.page('/learn')
    await a.flush()
    expect(load).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith('[analytics] lesson_completed', { lesson_id: 'u1-1', mistakes: 0 })
  })

  it('в production без ключа — полная тишина', () => {
    const log = vi.fn()
    createAnalytics({ apiKey: ' ', load: vi.fn(), debug: false, log }).track('landing_viewed')
    expect(log).not.toHaveBeenCalled()
  })
})

describe('analytics: с ключом', () => {
  it('ленивая загрузка один раз, очередь до загрузки, базовые свойства', async () => {
    const client = fakeClient()
    const load = vi.fn(async () => client)
    const a = createAnalytics({ apiKey: 'phc_test', load, base: { platform: 'web', app_version: '1.0.0' } })
    a.track('signup_started', { entry: 'landing' })
    a.track('lesson_started', { lesson_id: 'u1-1', unit: 1 })
    expect(load).toHaveBeenCalledTimes(1)
    await a.flush()
    expect(client.capture).toHaveBeenNthCalledWith(1, 'signup_started', { platform: 'web', app_version: '1.0.0', entry: 'landing' })
    expect(client.capture).toHaveBeenNthCalledWith(2, 'lesson_started', { platform: 'web', app_version: '1.0.0', lesson_id: 'u1-1', unit: 1 })
    a.track('lesson_completed', { lesson_id: 'u1-1', mistakes: 2, duration_s: 95 })
    expect(client.capture).toHaveBeenCalledTimes(3)
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('identify только с id Supabase (не email), без повторов; reset при выходе', async () => {
    const client = fakeClient()
    const a = createAnalytics({ apiKey: 'phc_test', load: async () => client })
    a.identify('aidar@example.com')
    a.identify(UID)
    a.identify(UID)
    a.reset()
    await a.flush()
    expect(client.identify).toHaveBeenCalledTimes(1)
    expect(client.identify).toHaveBeenCalledWith(UID)
    expect(client.reset).toHaveBeenCalledTimes(1)
  })

  it('PII и промпты не уходят: email, prompt/message/text, длинные строки, токены', async () => {
    const client = fakeClient()
    const a = createAnalytics({ apiKey: 'phc_test', load: async () => client })
    a.track('homework_submitted', {
      homework_id: 'hw1',
      ai_or_sim: 'ai',
      prompt: 'Сделай карточку товара…',
      message: 'hi',
      email: 'aidar@example.com',
      note: 'пиши на aidar@example.com',
      blob: 'x'.repeat(200),
      'Bad Key': 1,
      ok: true,
      n: Number.NaN,
    })
    await a.flush()
    expect(client.capture).toHaveBeenCalledWith('homework_submitted', { homework_id: 'hw1', ai_or_sim: 'ai', ok: true })
  })

  it('SDK не загрузился — приложение не падает, события тихо теряются', async () => {
    const a = createAnalytics({ apiKey: 'phc_test', load: async () => Promise.reject(new Error('blocked by adblock')) })
    a.track('landing_viewed')
    await a.flush()
    expect(() => a.track('landing_viewed')).not.toThrow()
  })

  it('page: маршрут без query и длинных сегментов; screen() у мобильного SDK', async () => {
    const web = fakeClient()
    const a = createAnalytics({ apiKey: 'k', load: async () => web })
    a.page('/lesson/u1-2?code=secret')
    await a.flush()
    expect(web.capture).toHaveBeenCalledWith('$pageview', { route: '/lesson/u1-2' })
    const mobile = { ...fakeClient(), screen: vi.fn() }
    const m = createAnalytics({ apiKey: 'k', load: async () => mobile })
    m.page('/homework/hw1')
    await m.flush()
    expect(mobile.screen).toHaveBeenCalledWith('/homework/hw1', {})
    expect(cleanRoute('/x/' + 'a'.repeat(60))).toBe('/x/:long')
  })
})

describe('scrub', () => {
  it('scrubString убирает почту, JWT, ключи Supabase/Polar/DeepSeek, токен бота и query-секреты', () => {
    const s = scrubString(
      'a@b.co eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijk sb_secret_abcdef1234 polar_oat_abcdef123 sk-abcdefabcdefabcdef 123456789:AAEexampleexampleexampleexampleexample https://x.io/?code=abc&ok=1',
    )
    expect(s).toBe('[email] [jwt] [supabase-key] [polar-key] [api-key] [bot-token] https://x.io/?code=[redacted]&ok=1')
  })
  it('scrubDeep фильтрует чувствительные ключи вглубь', () => {
    expect(scrubDeep({ a: { prompt: 'секрет', list: ['me@x.io'] }, password: 'p', n: 1 })).toEqual({ a: { prompt: '[filtered]', list: ['[email]'] }, password: '[filtered]', n: 1 })
  })
  it('sanitizeProps пропускает null/boolean/number', () => {
    expect(sanitizeProps({ rating: null, correct: false, score: 7, undef: undefined })).toEqual({ rating: null, correct: false, score: 7 })
  })
})

describe('src/lib/analytics (веб-обёртка)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    vi.doUnmock('posthog-js')
  })

  it('без VITE_POSTHOG_KEY — no-op, posthog-js не импортируется', async () => {
    const init = vi.fn()
    vi.doMock('posthog-js', () => ({ default: { init, capture: vi.fn(), identify: vi.fn(), reset: vi.fn() } }))
    vi.stubEnv('VITE_POSTHOG_KEY', '')
    vi.spyOn(console, 'info').mockImplementation(() => {})
    const m = await import('../../src/lib/analytics')
    m.track('landing_viewed', { section: 'top' })
    m.identify(UID)
    await new Promise((r) => setTimeout(r, 10))
    expect(init).not.toHaveBeenCalled()
  })

  it('с VITE_POSTHOG_KEY — init без автосбора и записи сессий, события с platform=web', async () => {
    const ph = { init: vi.fn(), capture: vi.fn(), identify: vi.fn(), reset: vi.fn() }
    vi.doMock('posthog-js', () => ({ default: ph }))
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key')
    vi.stubEnv('VITE_POSTHOG_HOST', 'https://eu.i.posthog.com/')
    const m = await import('../../src/lib/analytics')
    m.track('feedback_submitted', { rating: 5, category: 'idea', source: 'manual' })
    m.identify(UID)
    await new Promise((r) => setTimeout(r, 20))
    expect(ph.init).toHaveBeenCalledTimes(1)
    const [key, cfg] = ph.init.mock.calls[0]
    expect(key).toBe('phc_test_key')
    expect(cfg).toMatchObject({ api_host: 'https://eu.i.posthog.com', autocapture: false, disable_session_recording: true, person_profiles: 'identified_only' })
    expect(cfg.session_recording.maskAllInputs).toBe(true)
    expect(ph.capture).toHaveBeenCalledWith('feedback_submitted', expect.objectContaining({ platform: 'web', rating: 5, category: 'idea', source: 'manual' }))
    expect(ph.identify).toHaveBeenCalledWith(UID)
  })

  it('VITE_POSTHOG_SESSION_RECORDING=true включает запись (по желанию владельца)', async () => {
    const ph = { init: vi.fn(), capture: vi.fn(), identify: vi.fn(), reset: vi.fn() }
    vi.doMock('posthog-js', () => ({ default: ph }))
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key')
    vi.stubEnv('VITE_POSTHOG_SESSION_RECORDING', 'true')
    const m = await import('../../src/lib/analytics')
    m.track('landing_viewed')
    await new Promise((r) => setTimeout(r, 20))
    expect(ph.init.mock.calls[0][1].disable_session_recording).toBe(false)
  })
})
