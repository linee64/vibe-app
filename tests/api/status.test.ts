import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStatusHandler, storeEntitlementOf } from '../../server/revenuecat.js'
import { BASE_ENV, USER, jsonResponse, mockDb, req, setEnv } from './helpers.js'

const NOW = Date.parse('2026-10-15T06:00:00Z')
const FUTURE = '2026-11-15T06:00:00Z'
const SUBSCRIBER = {
  subscriber: {
    entitlements: { 'Vaibik Pro': { expires_date: FUTURE, product_identifier: 'com.vaibik.app.pro.monthly' } },
    subscriptions: {
      'com.vaibik.app.pro.monthly': { expires_date: FUTURE, period_type: 'normal', store: 'app_store', unsubscribe_detected_at: '2026-10-10T00:00:00Z', billing_issues_detected_at: null },
    },
  },
}

beforeEach(() => {
  setEnv({ ...BASE_ENV, REVENUECAT_SECRET_API_KEY: 'sk_test_rc', REVENUECAT_ENTITLEMENT_ID: undefined })
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('POST /api/billing/status (RevenueCat)', () => {
  it('спрашивает RevenueCat по id пользователя и отдаёт entitlement', async () => {
    const { db } = mockDb()
    const fetchImpl = vi.fn(async () => jsonResponse(SUBSCRIBER))
    const res = await createStatusHandler({ db, fetchImpl, now: () => NOW })(req('/api/billing/status', {}))
    expect(res.status).toBe(200)
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`https://api.revenuecat.com/v1/subscribers/${USER.id}`)
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer sk_test_rc')
    expect(await res.json()).toEqual({
      configured: true,
      store: { isActive: true, willRenew: false, periodType: 'normal', expirationDate: FUTURE, store: 'app_store', productIdentifier: 'com.vaibik.app.pro.monthly', billingIssueDetectedAt: null },
    })
  })

  it('без ключа RevenueCat — 200 { store: null, configured: false }, в RevenueCat не ходим', async () => {
    setEnv({ REVENUECAT_SECRET_API_KEY: undefined })
    const { db } = mockDb()
    const fetchImpl = vi.fn()
    const res = await createStatusHandler({ db, fetchImpl })(req('/api/billing/status', {}))
    expect(await res.json()).toEqual({ store: null, configured: false })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('401 без входа, 403 с чужого сайта, 502 при ошибке RevenueCat', async () => {
    const { db } = mockDb()
    const fetchImpl = vi.fn(async () => jsonResponse({}, 500))
    const h = createStatusHandler({ db, fetchImpl })
    expect((await h(req('/api/billing/status', {}, { authorization: '' }))).status).toBe(401)
    expect((await h(req('/api/billing/status', {}, { origin: 'https://evil.example' }))).status).toBe(403)
    expect((await h(req('/api/billing/status', {}))).status).toBe(502)
  })

  it('storeEntitlementOf: истёкший / возвращённый / чужой entitlement → null', () => {
    expect(storeEntitlementOf({ entitlements: { 'Vaibik Pro': { expires_date: '2026-10-01T00:00:00Z', product_identifier: 'x' } } }, 'Vaibik Pro', NOW)).toBeNull()
    expect(storeEntitlementOf({ entitlements: { other: { expires_date: FUTURE } } }, 'Vaibik Pro', NOW)).toBeNull()
    expect(
      storeEntitlementOf({ entitlements: { pro: { expires_date: FUTURE, product_identifier: 'p' } }, subscriptions: { p: { refunded_at: '2026-10-12T00:00:00Z' } } }, 'Vaibik Pro', NOW),
    ).toBeNull()
    expect(storeEntitlementOf({ entitlements: { vaibik_pro: { expires_date: FUTURE, product_identifier: 'p' } }, subscriptions: { p: { store: 'play_store' } } }, 'Vaibik Pro', NOW)).toMatchObject({ isActive: true, willRenew: true, store: 'play_store' })
  })
})
