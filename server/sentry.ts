/**
 * Минимальный клиент Sentry для /api (без @sentry/node: быстрее холодный старт, полный контроль над данными).
 * Включается только при SENTRY_DSN. Отправляет только тип ошибки, вычищенное сообщение и стек —
 * без тела запроса, заголовков, токенов, почты и текстов промптов.
 */
import { randomUUID } from 'node:crypto'
import { fail } from './http.js'

const str = (name: string) => (process.env[name] ?? '').trim()

const SCRUB: [RegExp, string][] = [
  [/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '[jwt]'],
  [/\bsb_(secret|publishable)_[A-Za-z0-9_-]{6,}/g, '[supabase-key]'],
  [/\bpolar_(oat|whs|pat)_[A-Za-z0-9_-]{6,}/g, '[polar-key]'],
  [/\bsk-[A-Za-z0-9_-]{12,}/g, '[api-key]'],
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, 'Bearer [token]'],
  [/\b\d{6,}:[A-Za-z0-9_-]{30,}\b/g, '[bot-token]'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]'],
  [/([?&](?:access_token|token|key|apikey|chat_id|email)=)[^&\s]*/gi, '$1[redacted]'],
]
export const scrubServer = (s: string) => SCRUB.reduce((acc, [re, rep]) => acc.replace(re, rep), s)

interface Dsn {
  endpoint: string
  publicKey: string
  raw: string
}

export function parseDsn(dsn: string): Dsn | null {
  try {
    const u = new URL(dsn)
    const projectId = u.pathname.replace(/^\/+|\/+$/g, '').split('/').pop()
    if (!u.username || !projectId || !/^\d+$/.test(projectId)) return null
    const prefix = u.pathname.replace(/\/?\d+\/?$/, '')
    return { endpoint: `${u.protocol}//${u.host}${prefix}/api/${projectId}/envelope/`, publicKey: u.username, raw: dsn }
  } catch {
    return null
  }
}

export const isSentryConfigured = () => !!parseDsn(str('SENTRY_DSN'))

function frames(stack: string | undefined) {
  if (!stack) return undefined
  const out: { function?: string; filename?: string; lineno?: number; colno?: number; in_app?: boolean }[] = []
  for (const line of stack.split('\n').slice(1, 40)) {
    const m = /^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/.exec(line)
    if (!m) continue
    const filename = m[2].replace(/^file:\/\//, '').replace(/^.*?\/(api|server)\//, '$1/')
    out.push({ function: m[1], filename, lineno: Number(m[3]), colno: Number(m[4]), in_app: !filename.includes('node_modules') && !filename.startsWith('node:') })
  }
  return out.length ? { frames: out.reverse() } : undefined
}

export interface CaptureContext {
  route: string
  tags?: Record<string, string | number | boolean | undefined>
}

export function buildEvent(error: unknown, ctx: CaptureContext) {
  const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Non-Error thrown')
  const tags: Record<string, string> = { route: ctx.route }
  for (const [k, v] of Object.entries(ctx.tags ?? {})) if (v !== undefined) tags[k] = scrubServer(String(v)).slice(0, 200)
  return {
    event_id: randomUUID().replace(/-/g, ''),
    timestamp: Date.now() / 1000,
    platform: 'node',
    level: 'error',
    logger: 'vaibik-api',
    environment: str('SENTRY_ENVIRONMENT') || str('VERCEL_ENV') || 'development',
    release: str('VERCEL_GIT_COMMIT_SHA') ? `vaibik-api@${str('VERCEL_GIT_COMMIT_SHA').slice(0, 12)}` : undefined,
    tags,
    exception: { values: [{ type: err.name || 'Error', value: scrubServer(err.message).slice(0, 1000), stacktrace: frames(err.stack) }] },
  }
}

/** Отправить ошибку в Sentry (не бросает; ждёт не дольше timeoutMs) */
export async function captureServerError(error: unknown, ctx: CaptureContext, opts: { fetchImpl?: typeof fetch; timeoutMs?: number } = {}): Promise<boolean> {
  const dsn = parseDsn(str('SENTRY_DSN'))
  console.error(`[${ctx.route}] ${error instanceof Error ? `${error.name}: ${scrubServer(error.message)}` : 'error'}`)
  if (!dsn) return false
  const event = buildEvent(error, ctx)
  const body = [JSON.stringify({ event_id: event.event_id, sent_at: new Date().toISOString(), dsn: dsn.raw }), JSON.stringify({ type: 'event' }), JSON.stringify(event)].join('\n')
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 2000)
  try {
    const res = await (opts.fetchImpl ?? fetch)(dsn.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-sentry-envelope',
        'x-sentry-auth': `Sentry sentry_version=7, sentry_key=${dsn.publicKey}, sentry_client=vaibik-api/1.0`,
      },
      body,
      signal: ctrl.signal,
    })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

type Handler = (req: Request) => Promise<Response> | Response

/** Обёртка обработчика /api: неожиданная ошибка → отчёт в Sentry и дружелюбный 500 */
export function withSentry(route: string, handler: Handler, opts: { fetchImpl?: typeof fetch } = {}): (req: Request) => Promise<Response> {
  return async (req) => {
    try {
      return await handler(req)
    } catch (e) {
      await captureServerError(e, { route, tags: { method: req.method } }, opts)
      return fail(500, 'internal', 'Что-то пошло не так. Попробуй ещё раз через минуту.')
    }
  }
}
