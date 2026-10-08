import { createHmac } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCheckoutHandler, createPortalHandler, createWebhookHandler, verifyWebhook } from '../../server/polar.js'
import { BASE_ENV, USER, jsonResponse, mockDb, req, setEnv } from './helpers.js'

beforeEach(() => {
  setEnv(BASE_ENV)
  vi.spyOn(console, 'info').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('POST /api/billing/checkout', () => {
  it('создаёт Checkout Session в sandbox с external_customer_id и email', async () => {
    const { db } = mockDb()
    const fetchImpl = vi.fn(async () => jsonResponse({ id: 'chk', url: 'https://sandbox.polar.sh/checkout/abc' }, 201))
    const res = await createCheckoutHandler({ db, fetchImpl })(req('/api/billing/checkout', { plan: 'annual' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ url: 'https://sandbox.polar.sh/checkout/abc' })
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://sandbox-api.polar.sh/v1/checkouts/')
    const h = init.headers as Record<string, string>
    expect(h.Authorization).toBe('Bearer polar_oat_test')
    expect(h['Polar-Version']).toBe('2026-10')
    const body = JSON.parse(String(init.body))
    expect(body).toMatchObject({
      products: ['prod-annual-0000'],
      external_customer_id: USER.id,
      customer_email: USER.email,
      success_url: 'https://vaibik.example.app/?checkout_id={CHECKOUT_ID}#/profile',
      return_url: 'https://vaibik.example.app/#/pricing',
      metadata: { user_id: USER.id, plan: 'annual' },
    })
  })

  it('production → api.polar.sh', async () => {
    setEnv({ POLAR_SERVER: 'production' })
    const { db } = mockDb()
    const fetchImpl = vi.fn(async () => jsonResponse({ url: 'https://polar.sh/checkout/x' }, 201))
    await createCheckoutHandler({ db, fetchImpl })(req('/api/billing/checkout', { plan: 'monthly' }))
    expect((fetchImpl.mock.calls[0] as unknown as [string])[0]).toBe('https://api.polar.sh/v1/checkouts/')
  })

  it('401 без входа, 400 на неверный план, 503 без настроек, 409 если уже Pro', async () => {
    const { db } = mockDb()
    const h = createCheckoutHandler({ db, fetchImpl: vi.fn() })
    expect((await h(req('/api/billing/checkout', { plan: 'annual' }, { authorization: '' }))).status).toBe(401)
    expect((await h(req('/api/billing/checkout', { plan: 'lifetime' }))).status).toBe(400)
    const pro = mockDb({ sub: { status: 'active', plan: 'annual', current_period_end: null, trial_end: null, polar_customer_id: 'c' } })
    expect((await createCheckoutHandler({ db: pro.db, fetchImpl: vi.fn() })(req('/api/billing/checkout', { plan: 'annual' }))).status).toBe(409)
    setEnv({ POLAR_ACCESS_TOKEN: undefined })
    expect((await h(req('/api/billing/checkout', { plan: 'annual' }))).status).toBe(503)
  })

  it('ошибка Polar → 502 с дружелюбным текстом', async () => {
    const { db } = mockDb()
    const fetchImpl = vi.fn(async () => jsonResponse({ detail: [{ loc: ['body', 'products'], msg: 'bad' }] }, 422))
    const res = await createCheckoutHandler({ db, fetchImpl })(req('/api/billing/checkout', { plan: 'monthly' }))
    expect(res.status).toBe(502)
    expect((await res.json()).error.message).toMatch(/оплат/)
  })
})

describe('POST /api/billing/portal', () => {
  it('создаёт Customer Session по external_customer_id', async () => {
    const { db } = mockDb()
    const fetchImpl = vi.fn(async () => jsonResponse({ token: 't', customer_portal_url: 'https://sandbox.polar.sh/org/portal?token=t' }, 201))
    const res = await createPortalHandler({ db, fetchImpl })(req('/api/billing/portal', {}))
    expect(res.status).toBe(200)
    expect((await res.json()).url).toContain('/portal')
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://sandbox-api.polar.sh/v1/customer-sessions/')
    expect(JSON.parse(String(init.body))).toEqual({ external_customer_id: USER.id, return_url: 'https://vaibik.example.app/#/profile' })
  })
  it('нет клиента в Polar → 404 no_customer', async () => {
    const { db } = mockDb()
    const res = await createPortalHandler({ db, fetchImpl: vi.fn(async () => jsonResponse({ detail: 'Not found' }, 404)) })(req('/api/billing/portal', {}))
    expect(res.status).toBe(404)
    expect((await res.json()).error.code).toBe('no_customer')
  })
})

// ---------------------------------------------------------------- webhook
const STD_SECRET = 'whsec_' + Buffer.from('a-very-secret-standard-webhooks-key!').toString('base64')
const NOW = 1_791_000_000

function sign(body: string, key: Buffer, id = 'msg_1', ts = NOW) {
  const sig = createHmac('sha256', key).update(`${id}.${ts}.${body}`).digest('base64')
  return { 'webhook-id': id, 'webhook-timestamp': String(ts), 'webhook-signature': `v1,${sig}` }
}
const stdKey = (secret: string) => Buffer.from(secret.slice(6), 'base64')

const subEvent = (over: Record<string, unknown> = {}, type = 'subscription.created') =>
  JSON.stringify({
    type,
    timestamp: '2026-10-08T18:00:00Z',
    api_version: '2026-10',
    data: {
      id: 'sub_123',
      status: 'trialing',
      current_period_end: '2026-10-11T18:00:00Z',
      trial_end: '2026-10-11T18:00:00Z',
      cancel_at_period_end: false,
      modified_at: '2026-10-08T18:00:01Z',
      customer_id: 'cus_1',
      product_id: 'prod-monthly-0000',
      recurring_interval: 'month',
      metadata: { user_id: USER.id },
      customer: { id: 'cus_1', external_id: USER.id, email: USER.email },
      ...over,
    },
  })

function webhookReq(body: string, headers: Record<string, string>) {
  return new Request('https://vaibik.example.app/api/billing/webhook', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body })
}

describe('verifyWebhook (Standard Webhooks)', () => {
  it('принимает подпись по Standard Webhooks ключу (base64 после whsec_)', () => {
    const body = subEvent()
    expect(verifyWebhook(body, new Headers(sign(body, stdKey(STD_SECRET))), STD_SECRET, NOW).ok).toBe(true)
  })
  it('принимает старую схему Polar HMAC (UTF-8 байты всей строки секрета)', () => {
    const body = subEvent()
    expect(verifyWebhook(body, new Headers(sign(body, Buffer.from(STD_SECRET, 'utf8'))), STD_SECRET, NOW).ok).toBe(true)
  })
  it('отклоняет чужую подпись, изменённое тело и просроченный timestamp', () => {
    const body = subEvent()
    const good = sign(body, stdKey(STD_SECRET))
    expect(verifyWebhook(body, new Headers(sign(body, Buffer.from('other-key'))), STD_SECRET, NOW).ok).toBe(false)
    expect(verifyWebhook(body.replace('trialing', 'active'), new Headers(good), STD_SECRET, NOW).ok).toBe(false)
    expect(verifyWebhook(body, new Headers(good), STD_SECRET, NOW + 600).ok).toBe(false)
    expect(verifyWebhook(body, new Headers({}), STD_SECRET, NOW).ok).toBe(false)
  })
  it('понимает несколько подписей в заголовке (ротация секрета)', () => {
    const body = subEvent()
    const h = sign(body, stdKey(STD_SECRET))
    h['webhook-signature'] = `v1,AAAA ${h['webhook-signature']}`
    expect(verifyWebhook(body, new Headers(h), STD_SECRET, NOW).ok).toBe(true)
  })
})

describe('POST /api/billing/webhook', () => {
  beforeEach(() => setEnv({ POLAR_WEBHOOK_SECRET: STD_SECRET }))
  const handler = (db: ReturnType<typeof mockDb>['db']) => createWebhookHandler({ db, nowSec: () => NOW })

  it('403 на неверную подпись, ничего не пишет', async () => {
    const { db } = mockDb()
    const body = subEvent()
    const res = await handler(db)(webhookReq(body, sign(body, Buffer.from('nope'))))
    expect(res.status).toBe(403)
    expect(db.applySubscription).not.toHaveBeenCalled()
  })

  it('subscription.created (trialing) → upsert subscriptions', async () => {
    const { db } = mockDb()
    const body = subEvent()
    const res = await handler(db)(webhookReq(body, sign(body, stdKey(STD_SECRET))))
    expect(res.status).toBe(202)
    expect(db.applySubscription).toHaveBeenCalledWith({
      userId: USER.id,
      customerId: 'cus_1',
      subscriptionId: 'sub_123',
      status: 'trialing',
      plan: 'monthly',
      periodEnd: '2026-10-11T18:00:00Z',
      trialEnd: '2026-10-11T18:00:00Z',
      cancelAtPeriodEnd: false,
      sourceAt: '2026-10-08T18:00:01Z',
    })
  })

  it.each(['subscription.updated', 'subscription.active', 'subscription.canceled', 'subscription.revoked'])('%s обрабатывается', async (type) => {
    const { db } = mockDb()
    const status = type === 'subscription.revoked' ? 'canceled' : 'active'
    const body = subEvent({ status, cancel_at_period_end: type === 'subscription.canceled', product_id: 'prod-annual-0000', recurring_interval: 'year' }, type)
    const res = await handler(db)(webhookReq(body, sign(body, stdKey(STD_SECRET), `msg_${type}`)))
    expect(res.status).toBe(202)
    expect(db.applySubscription).toHaveBeenCalledWith(expect.objectContaining({ status, plan: 'annual', cancelAtPeriodEnd: type === 'subscription.canceled' }))
  })

  it('идемпотентность: повтор того же webhook-id не применяется второй раз', async () => {
    const { db } = mockDb()
    const body = subEvent()
    const headers = sign(body, stdKey(STD_SECRET), 'msg_dup')
    expect((await handler(db)(webhookReq(body, headers))).status).toBe(202)
    const second = await handler(db)(webhookReq(body, headers))
    expect(second.status).toBe(202)
    expect((await second.json()).duplicate).toBe(true)
    expect(db.applySubscription).toHaveBeenCalledTimes(1)
  })

  it('событие без связанного пользователя пропускается (202)', async () => {
    const { db } = mockDb()
    const body = subEvent({ customer: { id: 'cus_1', external_id: null }, metadata: {} })
    const res = await handler(db)(webhookReq(body, sign(body, stdKey(STD_SECRET), 'msg_nouser')))
    expect(res.status).toBe(202)
    expect(db.applySubscription).not.toHaveBeenCalled()
  })

  it('не subscription.* события подтверждаются и игнорируются', async () => {
    const { db } = mockDb()
    const body = JSON.stringify({ type: 'order.paid', data: {} })
    const res = await handler(db)(webhookReq(body, sign(body, stdKey(STD_SECRET), 'msg_order')))
    expect(res.status).toBe(202)
    expect(db.applySubscription).not.toHaveBeenCalled()
  })

  it('ошибка БД → 500, чтобы Polar повторил доставку, и событие не помечено обработанным', async () => {
    const { db } = mockDb({ applySubscription: vi.fn(async () => { throw new Error('db down') }) })
    const body = subEvent()
    const headers = sign(body, stdKey(STD_SECRET), 'msg_retry')
    expect((await handler(db)(webhookReq(body, headers))).status).toBe(500)
    expect(db.markWebhook).not.toHaveBeenCalled()
  })
})
