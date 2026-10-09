import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFeedbackHandler, defaultFeedbackLimiter, feedbackSummary, forwardFeedback, validateFeedback, FEEDBACK_CATEGORIES, FEEDBACK_SOURCES } from '../../server/feedback.js'
import { FEEDBACK_CATEGORIES as CLIENT_CATEGORIES, FEEDBACK_SOURCES as CLIENT_SOURCES } from '../../src/data/feedback.js'
import { BASE_ENV, TOKEN, USER, jsonResponse, mockDb, req, setEnv } from './helpers.js'

const GOOD = {
  rating: 4,
  category: 'bug',
  message: 'Кнопка «Проверить» не нажимается на телефоне',
  source: 'manual',
  context: { route: '/lesson/u1-2', lesson_id: 'u1-2', app_version: '1.0.0+abc1234', platform: 'web', viewport: '375x740', browser: 'Chrome 140', os: 'Android', evil: 'x' },
}

const anon = (body: unknown, headers: Record<string, string> = {}) => req('/api/feedback', body, { authorization: '', ...headers })
const TG = 'https://api.telegram.org/bot123456789:AAEexampleexampleexampleexampleexample/sendMessage?chat_id=-1001234567'

describe('POST /api/feedback', () => {
  beforeEach(() => {
    setEnv({ ...BASE_ENV, FEEDBACK_WEBHOOK_URL: undefined, SENTRY_DSN: undefined })
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('категории и источники на сервере совпадают с клиентскими', () => {
    expect([...FEEDBACK_CATEGORIES]).toEqual([...CLIENT_CATEGORIES])
    expect([...FEEDBACK_SOURCES]).toEqual([...CLIENT_SOURCES])
  })

  it('гость: сохраняет в таблицу, почту оставляет, контекст — только из белого списка', async () => {
    const { db } = mockDb()
    const res = await createFeedbackHandler({ db })(anon({ ...GOOD, email: '  Guest@Example.com ' }))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ ok: true, stored: true, forwarded: false })
    expect(db.insertFeedback).toHaveBeenCalledTimes(1)
    const row = vi.mocked(db.insertFeedback).mock.calls[0][0]
    expect(row).toMatchObject({ user_id: null, email: 'guest@example.com', rating: 4, category: 'bug', source: 'manual' })
    expect(row.context).toEqual({ route: '/lesson/u1-2', lesson_id: 'u1-2', app_version: '1.0.0+abc1234', platform: 'web', viewport: '375x740', browser: 'Chrome 140', os: 'Android' })
  })

  it('ученик с токеном: user_id из Supabase, почту из тела не сохраняем', async () => {
    const { db } = mockDb()
    const res = await createFeedbackHandler({ db })(req('/api/feedback', { ...GOOD, email: 'other@example.com' }))
    expect(res.status).toBe(201)
    expect(db.getUser).toHaveBeenCalledWith(TOKEN)
    expect(vi.mocked(db.insertFeedback).mock.calls[0][0]).toMatchObject({ user_id: USER.id, email: null })
  })

  it('валидация: оценка, категория, источник, длина, почта, пустой отзыв', async () => {
    const { db } = mockDb()
    const h = createFeedbackHandler({ db })
    const cases: unknown[] = [
      { ...GOOD, rating: 6 },
      { ...GOOD, rating: 2.5 },
      { ...GOOD, rating: '5' },
      { ...GOOD, category: 'hack' },
      { ...GOOD, source: 'spam' },
      { ...GOOD, message: 'x'.repeat(1001) },
      { ...GOOD, message: 42 },
      { ...GOOD, email: 'not-an-email' },
      { rating: null, category: null, message: '   ', source: 'manual' },
      { ...GOOD, context: 'route=/' },
      [],
    ]
    for (const body of cases) {
      const res = await h(anon(body))
      expect(res.status, JSON.stringify(body).slice(0, 80)).toBe(400)
      expect((await res.json()).error.code).toBe('bad_request')
    }
    expect(db.insertFeedback).not.toHaveBeenCalled()
  })

  it('принимает микро-опрос без оценки (пейвол: только причина) и ровно 1000 символов', async () => {
    const { db } = mockDb()
    const h = createFeedbackHandler({ db })
    expect((await h(anon({ category: 'price', source: 'paywall_exit' }))).status).toBe(201)
    expect((await h(anon({ rating: 3, message: 'я'.repeat(1000), source: 'first_lesson' }))).status).toBe(201)
  })

  it('чистит управляющие символы и пустые строки в тексте', () => {
    const v = validateFeedback({ message: 'a\u0000b\r\n\n\n\n\nc  ', source: 'manual' })
    expect(v.ok && v.input.message).toBe('ab\n\n\nc')
  })

  it('размер, тип и Origin как у остальных /api', async () => {
    const { db } = mockDb()
    const h = createFeedbackHandler({ db })
    expect((await h(anon('x'.repeat(9000)))).status).toBe(413)
    expect((await h(anon(GOOD, { 'content-type': 'text/plain' }))).status).toBe(415)
    expect((await h(anon(GOOD, { origin: 'https://evil.example' }))).status).toBe(403)
    expect((await h(anon(GOOD, { origin: 'https://vaibik.example.app' }))).status).toBe(201)
    expect((await h(new Request('https://vaibik.example.app/api/feedback', { method: 'GET' }))).status).toBe(405)
  })

  it('лимит по IP: 5 отзывов за 10 минут, потом 429 с Retry-After; другой IP проходит; через 10 минут — снова можно', async () => {
    const { db } = mockDb()
    let now = 1_000_000
    const h = createFeedbackHandler({ db, limiter: defaultFeedbackLimiter(), now: () => now })
    const ip = (a: string) => ({ 'x-forwarded-for': `${a}, 10.0.0.1` })
    for (let i = 0; i < 5; i++) expect((await h(anon(GOOD, ip('1.1.1.1')))).status).toBe(201)
    const res = await h(anon(GOOD, ip('1.1.1.1')))
    expect(res.status).toBe(429)
    expect((await res.json()).error.code).toBe('rate_limited')
    expect(Number(res.headers.get('retry-after'))).toBeGreaterThan(0)
    expect((await h(anon(GOOD, ip('2.2.2.2')))).status).toBe(201)
    now += 10 * 60_000 + 1
    expect((await h(anon(GOOD, ip('1.1.1.1')))).status).toBe(201)
  })

  it('лимит по аккаунту: смена IP не помогает', async () => {
    const { db } = mockDb()
    const h = createFeedbackHandler({ db })
    for (let i = 0; i < 5; i++) expect((await h(req('/api/feedback', GOOD, { 'x-forwarded-for': `9.9.9.${i}` }))).status).toBe(201)
    expect((await h(req('/api/feedback', GOOD, { 'x-forwarded-for': '9.9.9.99' }))).status).toBe(429)
  })

  it('без Supabase и без вебхука (демо) — 503, клиент оставит отзыв у себя', async () => {
    setEnv({ SUPABASE_URL: undefined, SUPABASE_SECRET_KEY: undefined })
    const { db } = mockDb()
    const res = await createFeedbackHandler({ db })(anon(GOOD))
    expect(res.status).toBe(503)
    expect((await res.json()).error.code).toBe('feedback_not_configured')
    expect(db.insertFeedback).not.toHaveBeenCalled()
  })

  it('без Supabase, но с вебхуком — отзыв уходит в Telegram, в базу не пишем', async () => {
    setEnv({ SUPABASE_URL: undefined, SUPABASE_SECRET_KEY: undefined, FEEDBACK_WEBHOOK_URL: TG })
    const { db } = mockDb()
    const fetchImpl = vi.fn(async () => jsonResponse({ ok: true }))
    const res = await createFeedbackHandler({ db, fetchImpl })(req('/api/feedback', GOOD))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ ok: true, stored: false, forwarded: true })
    expect(db.insertFeedback).not.toHaveBeenCalled()
    expect(db.getUser).not.toHaveBeenCalled()
  })

  it('вебхук Telegram: chat_id в теле, обычный текст, без почты гостя', async () => {
    setEnv({ FEEDBACK_WEBHOOK_URL: TG })
    const { db } = mockDb()
    const fetchImpl = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => jsonResponse({ ok: true }))
    const res = await createFeedbackHandler({ db, fetchImpl: fetchImpl as unknown as typeof fetch })(anon({ ...GOOD, email: 'guest@example.com' }))
    expect(await res.json()).toEqual({ ok: true, stored: true, forwarded: true })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0]
    expect(String(url)).toBe('https://api.telegram.org/bot123456789:AAEexampleexampleexampleexampleexample/sendMessage')
    const body = JSON.parse(String(init?.body))
    expect(body.chat_id).toBe('-1001234567')
    expect(body.parse_mode).toBeUndefined()
    expect(body.text).toContain('Оценка: 4/5')
    expect(body.text).toContain('Тема: Баг')
    expect(body.text).toContain('Кнопка «Проверить» не нажимается')
    expect(body.text).toContain('/lesson/u1-2')
    expect(body.text).not.toContain('guest@example.com')
    expect(body.text).toContain('оставил почту')
  })

  it('вебхук упал — отзыв всё равно сохранён (201); база упала, а вебхук нет — тоже 201; упало всё — 502', async () => {
    setEnv({ FEEDBACK_WEBHOOK_URL: TG })
    const failing = vi.fn(async () => new Response('nope', { status: 500 }))
    let { db } = mockDb()
    let res = await createFeedbackHandler({ db, fetchImpl: failing })(anon(GOOD))
    expect(await res.json()).toEqual({ ok: true, stored: true, forwarded: false })

    ;({ db } = mockDb({ insertFeedback: vi.fn(async () => Promise.reject(new Error('db down'))) }))
    res = await createFeedbackHandler({ db, fetchImpl: vi.fn(async () => jsonResponse({ ok: true })) })(anon(GOOD))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ ok: true, stored: false, forwarded: true })

    ;({ db } = mockDb({ insertFeedback: vi.fn(async () => Promise.reject(new Error('db down'))) }))
    res = await createFeedbackHandler({ db, fetchImpl: failing })(anon(GOOD))
    expect(res.status).toBe(502)
  })

  it('ловушка для ботов (website) — делаем вид, что приняли, но ничего не пишем', async () => {
    const { db } = mockDb()
    const res = await createFeedbackHandler({ db })(anon({ ...GOOD, website: 'http://spam.example' }))
    expect(res.status).toBe(201)
    expect(db.insertFeedback).not.toHaveBeenCalled()
  })
})

describe('forwardFeedback: форматы вебхуков', () => {
  const input = { rating: 5, category: 'idea', message: 'Добавьте тёмную тему', email: null, source: 'manual' as const, context: {} }
  const capture = () => {
    const fetchImpl = vi.fn(async (_u: string | URL | Request, _i?: RequestInit) => jsonResponse({ ok: true }))
    return { fetchImpl, body: () => JSON.parse(String(fetchImpl.mock.calls[0][1]?.body)), url: () => String(fetchImpl.mock.calls[0][0]) }
  }

  it('Discord — content без упоминаний', async () => {
    const c = capture()
    expect(await forwardFeedback('https://discord.com/api/webhooks/1/abc', 'текст', input, c.fetchImpl as unknown as typeof fetch)).toBe(true)
    expect(c.body()).toEqual({ content: 'текст', allowed_mentions: { parse: [] } })
  })

  it('Slack — text', async () => {
    const c = capture()
    await forwardFeedback('https://hooks.slack.com/services/T/B/x', 'текст', input, c.fetchImpl as unknown as typeof fetch)
    expect(c.body()).toEqual({ text: 'текст' })
  })

  it('свой вебхук — text + оценка/тема/источник; http и Telegram без chat_id отклоняются', async () => {
    const c = capture()
    await forwardFeedback('https://example.com/hook', 'текст', input, c.fetchImpl as unknown as typeof fetch)
    expect(c.body()).toEqual({ text: 'текст', rating: 5, category: 'idea', source: 'manual' })
    const never = vi.fn()
    expect(await forwardFeedback('http://example.com/hook', 't', input, never as unknown as typeof fetch)).toBe(false)
    expect(await forwardFeedback('https://api.telegram.org/botX/sendMessage', 't', input, never as unknown as typeof fetch)).toBe(false)
    expect(await forwardFeedback('not a url', 't', input, never as unknown as typeof fetch)).toBe(false)
    expect(never).not.toHaveBeenCalled()
  })

  it('сводка: длинный текст обрезается, ученик/гость различаются', () => {
    const s = feedbackSummary({ ...input, message: 'я'.repeat(900) }, 'user')
    expect(s).toContain('…')
    expect(s.length).toBeLessThan(1000)
    expect(s).toContain('ученик с аккаунтом')
    expect(feedbackSummary({ ...input, category: 'price', rating: null, source: 'paywall_exit' }, 'guest')).toContain('Тема: Дорого · Откуда: закрыл пейвол')
  })
})
