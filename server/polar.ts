/**
 * Polar (polar.sh) — оплата Pro.
 *   POST /api/billing/checkout  { plan: 'monthly' | 'annual' } → { url }   (Checkout Session API)
 *   POST /api/billing/portal                                    → { url }   (Customer Session → портал клиента)
 *   POST /api/billing/webhook   события subscription.* → таблица subscriptions (Standard Webhooks подпись)
 *
 * Ходим в REST API напрямую (fetch), версия API закреплена заголовком Polar-Version (POLAR_API_VERSION, по умолчанию 2026-10).
 * Базовый адрес: sandbox-api.polar.sh (POLAR_SERVER=sandbox) или api.polar.sh (production).
 */
import { createHmac, timingSafeEqual } from 'node:crypto'
import { isBillingConfigured, isSupabaseServerConfigured, polarBaseUrl, serverEnv } from './env.js'
import { UUID_RE, appBaseUrl, bearerToken, fail, forbiddenOrigin, isSameOrigin, json, methodNotAllowed, readJson } from './http.js'
import { isProRow, userFromToken, type AuthUser, type Db } from './db.js'

export interface BillingDeps {
  db: Db
  fetchImpl?: typeof fetch
  nowSec?: () => number
}

async function polarPost(deps: BillingDeps, path: string, body: unknown): Promise<{ status: number; data: Record<string, unknown> | null }> {
  const f = deps.fetchImpl ?? fetch
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15_000)
  try {
    const res = await f(`${polarBaseUrl()}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serverEnv.polarToken()}`,
        'Polar-Version': serverEnv.polarApiVersion(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null
    return { status: res.status, data }
  } finally {
    clearTimeout(timer)
  }
}

/** В логи — только места ошибок валидации, без значений */
const errLocs = (data: Record<string, unknown> | null) =>
  Array.isArray(data?.detail) ? (data.detail as { loc?: unknown[] }[]).map((d) => (d.loc ?? []).join('.')).join(', ') : String(data?.error ?? '')

async function authUser(req: Request, deps: BillingDeps): Promise<{ res: Response; user?: undefined } | { user: AuthUser; res?: undefined }> {
  if (!isSameOrigin(req)) return { res: forbiddenOrigin() }
  if (!isSupabaseServerConfigured() || !isBillingConfigured()) return { res: fail(503, 'billing_not_configured', 'Оплата ещё не подключена.') }
  const user = await userFromToken(deps.db, bearerToken(req))
  if (!user) return { res: fail(401, 'unauthorized', 'Войди в аккаунт, чтобы оформить Pro.') }
  return { user }
}

// ---------------------------------------------------------------- checkout
export function createCheckoutHandler(deps: BillingDeps) {
  return async function handle(req: Request): Promise<Response> {
    if (req.method !== 'POST') return methodNotAllowed('POST')
    const a = await authUser(req, deps)
    if (!a.user) return a.res
    const body = await readJson(req, 2_000)
    if (!body.ok) return body.res
    const plan = (body.data as { plan?: unknown } | null)?.plan
    if (plan !== 'monthly' && plan !== 'annual') return fail(400, 'bad_plan', 'Выбери тариф: помесячно или за год.')

    try {
      if (isProRow(await deps.db.getSubscription(a.user.id))) {
        return fail(409, 'already_subscribed', 'У тебя уже есть Pro — управлять подпиской можно в профиле.')
      }
    } catch {
      /* не смогли проверить — пусть Polar решает */
    }

    const base = appBaseUrl(req)
    const productId = plan === 'monthly' ? serverEnv.polarProductMonthly() : serverEnv.polarProductAnnual()
    const payload: Record<string, unknown> = {
      products: [productId],
      external_customer_id: a.user.id,
      success_url: `${base}/?checkout_id={CHECKOUT_ID}#/profile`,
      return_url: `${base}/#/pricing`,
      metadata: { user_id: a.user.id, plan },
      locale: 'ru',
    }
    if (a.user.email) payload.customer_email = a.user.email
    try {
      const r = await polarPost(deps, '/v1/checkouts/', payload)
      const url = typeof r.data?.url === 'string' ? r.data.url : null
      if (r.status >= 300 || !url) {
        console.warn(`[billing/checkout] polar status=${r.status} ${errLocs(r.data)}`)
        return fail(502, 'billing_failed', 'Не получилось открыть оплату. Попробуй ещё раз через минуту.')
      }
      return json({ url })
    } catch {
      return fail(504, 'billing_timeout', 'Платёжный сервис не ответил. Попробуй ещё раз.')
    }
  }
}

// ---------------------------------------------------------------- customer portal
export function createPortalHandler(deps: BillingDeps) {
  return async function handle(req: Request): Promise<Response> {
    if (req.method !== 'POST') return methodNotAllowed('POST')
    const a = await authUser(req, deps)
    if (!a.user) return a.res
    try {
      const r = await polarPost(deps, '/v1/customer-sessions/', {
        external_customer_id: a.user.id,
        return_url: `${appBaseUrl(req)}/#/profile`,
      })
      const url = typeof r.data?.customer_portal_url === 'string' ? r.data.customer_portal_url : null
      if (r.status === 404 || r.status === 422) return fail(404, 'no_customer', 'Подписки пока нет — оформить Pro можно на странице тарифов.')
      if (r.status >= 300 || !url) {
        console.warn(`[billing/portal] polar status=${r.status} ${errLocs(r.data)}`)
        return fail(502, 'billing_failed', 'Не получилось открыть управление подпиской. Попробуй позже.')
      }
      return json({ url })
    } catch {
      return fail(504, 'billing_timeout', 'Платёжный сервис не ответил. Попробуй ещё раз.')
    }
  }
}

// ---------------------------------------------------------------- webhook signature (Standard Webhooks)
const TOLERANCE_SEC = 5 * 60

/**
 * Кандидаты ключа HMAC (Polar, docs «Handle & monitor webhook deliveries»):
 *  * секреты с 8.09.2026 — Standard Webhooks: whsec_<base64> → ключ = base64-декод;
 *  * старые секреты — «Polar HMAC»: ключ = UTF-8 байты всей строки whsec_…
 * Как и SDK Polar, пробуем оба.
 */
export function webhookKeys(secret: string): Buffer[] {
  const keys: Buffer[] = [Buffer.from(secret, 'utf8')]
  const b64 = secret.startsWith('whsec_') ? secret.slice(6) : secret
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(b64) && b64.length >= 16) keys.push(Buffer.from(b64, 'base64'))
  return keys
}

export function verifyWebhook(rawBody: string, headers: Headers, secret: string, nowSec: number): { ok: true; id: string } | { ok: false; reason: string } {
  const id = headers.get('webhook-id')
  const ts = headers.get('webhook-timestamp')
  const sigHeader = headers.get('webhook-signature')
  if (!id || !ts || !sigHeader) return { ok: false, reason: 'missing headers' }
  const tsNum = Number(ts)
  if (!Number.isInteger(tsNum) || Math.abs(nowSec - tsNum) > TOLERANCE_SEC) return { ok: false, reason: 'timestamp out of tolerance' }
  const signed = `${id}.${ts}.${rawBody}`
  const given = sigHeader
    .split(' ')
    .map((p) => p.split(','))
    .filter(([v, sig]) => v === 'v1' && !!sig)
    .map(([, sig]) => Buffer.from(sig, 'base64'))
  for (const key of webhookKeys(secret)) {
    const expected = createHmac('sha256', key).update(signed).digest()
    if (given.some((g) => g.length === expected.length && timingSafeEqual(g, expected))) return { ok: true, id }
  }
  return { ok: false, reason: 'bad signature' }
}

// ---------------------------------------------------------------- webhook handler
interface PolarSubscription {
  id?: string
  status?: string
  current_period_end?: string | null
  trial_end?: string | null
  cancel_at_period_end?: boolean
  modified_at?: string | null
  customer_id?: string
  product_id?: string
  recurring_interval?: string
  metadata?: Record<string, unknown>
  customer?: { id?: string; external_id?: string | null }
}

export function planOf(sub: PolarSubscription): string | null {
  if (sub.product_id && sub.product_id === serverEnv.polarProductMonthly()) return 'monthly'
  if (sub.product_id && sub.product_id === serverEnv.polarProductAnnual()) return 'annual'
  if (sub.recurring_interval === 'month') return 'monthly'
  if (sub.recurring_interval === 'year') return 'annual'
  return null
}

export function createWebhookHandler(deps: BillingDeps) {
  return async function handle(req: Request): Promise<Response> {
    if (req.method !== 'POST') return methodNotAllowed('POST')
    const secret = serverEnv.polarWebhookSecret()
    if (!secret || !isSupabaseServerConfigured()) return fail(503, 'billing_not_configured', 'Webhook is not configured.')
    const raw = await req.text()
    if (raw.length > 512_000) return fail(413, 'too_large', 'Payload too large.')
    const v = verifyWebhook(raw, req.headers, secret, deps.nowSec?.() ?? Math.floor(Date.now() / 1000))
    if (!v.ok) {
      console.warn(`[billing/webhook] rejected: ${v.reason}`)
      return fail(403, 'bad_signature', 'Invalid webhook signature.')
    }
    let event: { type?: string; timestamp?: string; data?: PolarSubscription }
    try {
      event = JSON.parse(raw)
    } catch {
      return fail(400, 'bad_json', 'Invalid JSON.')
    }
    const type = String(event.type ?? '')
    if (!type.startsWith('subscription.')) return json({ ok: true, ignored: type }, 202)

    try {
      if (await deps.db.webhookSeen(v.id)) return json({ ok: true, duplicate: true }, 202)
    } catch {
      return fail(500, 'db_error', 'Database unavailable.')
    }
    const sub = event.data ?? {}
    const userId = sub.customer?.external_id ?? (typeof sub.metadata?.user_id === 'string' ? sub.metadata.user_id : null)
    if (!sub.id || !sub.status || !userId || !UUID_RE.test(userId)) {
      console.warn(`[billing/webhook] ${type}: no linked user (external_id), skipped`)
      await deps.db.markWebhook(v.id, type).catch(() => {})
      return json({ ok: true, skipped: 'no_user' }, 202)
    }
    try {
      const applied = await deps.db.applySubscription({
        userId,
        customerId: sub.customer_id ?? sub.customer?.id ?? null,
        subscriptionId: sub.id,
        status: sub.status,
        plan: planOf(sub),
        periodEnd: sub.current_period_end ?? null,
        trialEnd: sub.trial_end ?? null,
        cancelAtPeriodEnd: sub.cancel_at_period_end === true,
        sourceAt: sub.modified_at ?? event.timestamp ?? null,
      })
      await deps.db.markWebhook(v.id, type)
      console.info(`[billing/webhook] ${type} status=${sub.status} applied=${applied}`)
      return json({ ok: true, applied }, 202)
    } catch {
      // 5xx → Polar повторит доставку
      return fail(500, 'db_error', 'Database unavailable.')
    }
  }
}
