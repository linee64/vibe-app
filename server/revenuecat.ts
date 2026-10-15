/**
 * RevenueCat (подписки App Store / Google Play из приложения) — для сайта.
 *   POST /api/billing/status → { store: {...} | null, configured: boolean }
 *
 * Приложение делает Purchases.logIn(<id пользователя Supabase>), поэтому app_user_id в RevenueCat = user.id.
 * Сервер спрашивает GET https://api.revenuecat.com/v1/subscribers/{app_user_id} секретным ключом
 * REVENUECAT_SECRET_API_KEY (необязателен: без него сайт знает только о подписке Polar, ответ { store: null, configured: false }).
 * Отдаём только то, что нужно экрану: активна ли, продлится ли, даты, магазин, продукт. Polar-подписку клиент читает сам (RLS).
 */
import { isRevenueCatConfigured, isSupabaseServerConfigured, serverEnv } from './env.js'
import { bearerToken, fail, forbiddenOrigin, isSameOrigin, json, methodNotAllowed } from './http.js'
import { userFromToken, type Db } from './db.js'

export interface StatusDeps {
  db: Db
  fetchImpl?: typeof fetch
  now?: () => number
}

/** Тот же вид, что StoreEntitlementLike в src/data/proStatus.ts */
export interface StoreEntitlement {
  isActive: boolean
  willRenew: boolean
  periodType: string | null
  expirationDate: string | null
  store: string | null
  productIdentifier: string | null
  billingIssueDetectedAt: string | null
}

interface RcEntitlement {
  expires_date?: string | null
  grace_period_expires_date?: string | null
  product_identifier?: string
}
interface RcSubscription {
  expires_date?: string | null
  grace_period_expires_date?: string | null
  period_type?: string
  store?: string
  unsubscribe_detected_at?: string | null
  billing_issues_detected_at?: string | null
  refunded_at?: string | null
}
interface RcSubscriber {
  entitlements?: Record<string, RcEntitlement>
  subscriptions?: Record<string, RcSubscription>
}

const norm = (k: string) => k.toLowerCase().replace(/[\s_-]+/g, '')
const ALIASES = ['vaibikpro', 'pro']

/** Активный entitlement Pro из ответа RevenueCat (null — нет или истёк) */
export function storeEntitlementOf(sub: RcSubscriber | null | undefined, entitlementId: string, now: number): StoreEntitlement | null {
  const ents = sub?.entitlements ?? {}
  const want = norm(entitlementId)
  const key = Object.keys(ents).find((k) => norm(k) === want) ?? Object.keys(ents).find((k) => ALIASES.includes(norm(k)))
  if (!key) return null
  const e = ents[key]
  const until = (d?: string | null) => (d ? Date.parse(d) : NaN)
  const exp = e.expires_date ?? null
  const grace = until(e.grace_period_expires_date)
  const active = exp === null || until(exp) > now || grace > now
  if (!active) return null
  const productId = e.product_identifier ?? null
  const s = productId ? (sub?.subscriptions?.[productId] ?? null) : null
  if (s?.refunded_at) return null
  return {
    isActive: true,
    willRenew: !!s && !s.unsubscribe_detected_at,
    periodType: s?.period_type ?? null,
    expirationDate: exp,
    store: s?.store ?? null,
    productIdentifier: productId,
    billingIssueDetectedAt: s?.billing_issues_detected_at ?? null,
  }
}

export function createStatusHandler(deps: StatusDeps) {
  return async function handle(req: Request): Promise<Response> {
    if (req.method !== 'POST') return methodNotAllowed('POST')
    if (!isSameOrigin(req)) return forbiddenOrigin()
    if (!isSupabaseServerConfigured()) return fail(503, 'billing_not_configured', 'Оплата ещё не подключена.')
    const user = await userFromToken(deps.db, bearerToken(req))
    if (!user) return fail(401, 'unauthorized', 'Войди в аккаунт.')
    if (!isRevenueCatConfigured()) return json({ store: null, configured: false })

    const f = deps.fetchImpl ?? fetch
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 10_000)
    try {
      const res = await f(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${serverEnv.revenuecatSecretKey()}`, Accept: 'application/json' },
        signal: ctrl.signal,
      })
      if (res.status === 404) return json({ store: null, configured: true })
      if (!res.ok) {
        console.warn(`[billing/status] revenuecat status=${res.status}`)
        return fail(502, 'billing_failed', 'Не получилось проверить подписку. Попробуй позже.')
      }
      const data = (await res.json().catch(() => null)) as { subscriber?: RcSubscriber } | null
      const store = storeEntitlementOf(data?.subscriber, serverEnv.revenuecatEntitlement(), deps.now?.() ?? Date.now())
      return json({ store, configured: true })
    } catch {
      return fail(504, 'billing_timeout', 'Платёжный сервис не ответил. Попробуй ещё раз.')
    } finally {
      clearTimeout(timer)
    }
  }
}
