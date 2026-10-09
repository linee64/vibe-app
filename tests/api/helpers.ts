import { vi } from 'vitest'
import type { Db, FeedbackRow, SubscriptionRow } from '../../server/db.js'

export const USER = { id: '11111111-2222-4333-8444-555555555555', email: 'aidar@example.com' }
export const TOKEN = 'header.payload.signature-of-a-valid-looking-token'

export function mockDb(over: Partial<Db> & { sub?: SubscriptionRow | null; usage?: number[] } = {}) {
  const counts = new Map<string, number>()
  const seen = new Set<string>()
  const db = {
    getUser: vi.fn(async (t: string) => (t === TOKEN ? USER : null)),
    getSubscription: vi.fn(async () => over.sub ?? null),
    bumpAiUsage: vi.fn(async (u: string, day: string, limit: number, delta = 1) => {
      const k = `${u}:${day}`
      const cur = counts.get(k) ?? 0
      if (delta > 0 && cur >= limit) return -1
      const next = Math.max(0, cur + delta)
      counts.set(k, next)
      return next
    }),
    applySubscription: vi.fn(async () => true),
    webhookSeen: vi.fn(async (id: string) => seen.has(id)),
    markWebhook: vi.fn(async (id: string) => {
      seen.add(id)
    }),
    insertFeedback: vi.fn(async (_row: FeedbackRow) => {}),
    ...over,
  }
  return { db: db as unknown as Db & typeof db, counts }
}

export function setEnv(vars: Record<string, string | undefined>) {
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
}

export const BASE_ENV = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SECRET_KEY: 'sb_secret_test',
  DEEPSEEK_API_KEY: 'sk-test-not-real',
  DEEPSEEK_BASE_URL: undefined,
  DEEPSEEK_MODEL: undefined,
  AI_DAILY_LIMIT_FREE: '2',
  AI_DAILY_LIMIT_PRO: '5',
  POLAR_ACCESS_TOKEN: 'polar_oat_test',
  POLAR_SERVER: 'sandbox',
  POLAR_API_VERSION: undefined,
  POLAR_PRODUCT_MONTHLY_ID: 'prod-monthly-0000',
  POLAR_PRODUCT_ANNUAL_ID: 'prod-annual-0000',
  POLAR_WEBHOOK_SECRET: undefined,
  APP_URL: 'https://vaibik.example.app',
}

export function req(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`https://vaibik.example.app${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${TOKEN}`, ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })
}
