/** Мелкие помощники для Web-обработчиков Vercel (Request → Response). */
import { serverEnv } from './env.js'

export interface ApiErrorBody {
  error: { code: string; message: string }
}

const SECURITY_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS, ...headers },
  })
}

/** Ошибка с дружелюбным русским текстом — его можно показать ученику как есть */
export function fail(status: number, code: string, message: string, headers: Record<string, string> = {}): Response {
  const body: ApiErrorBody = { error: { code, message } }
  return json(body, status, headers)
}

export const methodNotAllowed = (allow: string) => fail(405, 'method_not_allowed', 'Метод не поддерживается.', { Allow: allow })

/**
 * CORS: API только для своего сайта. Браузер всегда шлёт Origin в POST из fetch —
 * если он есть и не совпадает с адресом самого API (или APP_URL), отклоняем.
 * CORS-заголовки не выдаём совсем, поэтому чужие сайты не смогут прочитать ответ.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true // запросы не из браузера (curl, тесты); авторизация всё равно обязательна
  const allowed = new Set<string>()
  try {
    allowed.add(new URL(req.url).origin)
  } catch {
    /* ignore */
  }
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  if (host) allowed.add(`${proto}://${host}`)
  const app = serverEnv.appUrl()
  if (app) {
    try {
      allowed.add(new URL(app).origin)
    } catch {
      /* ignore */
    }
  }
  return allowed.has(origin)
}

export const forbiddenOrigin = () => fail(403, 'forbidden_origin', 'Запрос с чужого сайта отклонён.')

/** Читает JSON-тело с ограничением размера */
export async function readJson(req: Request, maxBytes = 32_000): Promise<{ ok: true; data: unknown } | { ok: false; res: Response }> {
  const type = req.headers.get('content-type') ?? ''
  if (!type.includes('application/json')) return { ok: false, res: fail(415, 'bad_content_type', 'Нужен JSON.') }
  const len = Number(req.headers.get('content-length') ?? '0')
  if (len > maxBytes) return { ok: false, res: fail(413, 'too_large', 'Слишком длинный запрос.') }
  const text = await req.text()
  if (text.length > maxBytes) return { ok: false, res: fail(413, 'too_large', 'Слишком длинный запрос.') }
  try {
    return { ok: true, data: JSON.parse(text) }
  } catch {
    return { ok: false, res: fail(400, 'bad_json', 'Не получилось прочитать запрос.') }
  }
}

export function bearerToken(req: Request): string | null {
  const h = req.headers.get('authorization') ?? ''
  const m = /^Bearer\s+([A-Za-z0-9._~+/=-]{20,4096})$/.exec(h.trim())
  return m ? m[1] : null
}

/** Адрес приложения для ссылок возврата: APP_URL или origin самого запроса */
export function appBaseUrl(req: Request): string {
  const app = serverEnv.appUrl()
  if (app) return app
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  if (host) return `${proto}://${host}`
  return new URL(req.url).origin
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
