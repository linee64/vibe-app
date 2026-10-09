/** Запросы к нашему /api (Vercel Functions) с токеном Supabase. Секретов в браузере нет. */
import { API_BASE } from './config'
import { accessToken } from './supabase'
import { getLocale, t, type UIKey } from '../i18n/core'

/** Коды ошибок сервера, у которых есть перевод (сервер отвечает по-русски) */
const SERVER_CODES = new Set(["unauthorized", "limit_reached", "ai_timeout", "ai_failed", "ai_not_configured", "usage_unavailable", "billing_not_configured", "billing_failed", "billing_timeout", "already_subscribed", "no_customer", "bad_plan", "rate_limited", "feedback_failed", "feedback_not_configured"])

/** Сообщение сервера на языке ученика: русский — как есть, остальные — по коду ошибки */
export function localizeServerMessage(code: string, message: string | undefined): string {
  if (getLocale() === 'ru' && message) return message
  return SERVER_CODES.has(code) ? t(`api.err.${code}` as UIKey) : (getLocale() === 'ru' ? message : undefined) ?? t('x1yhbsd0')
}

export class ApiError extends Error {
  status: number
  code: string
  retryAfter?: number
  constructor(status: number, code: string, message: string, retryAfter?: number) {
    super(message)
    this.status = status
    this.code = code
    this.retryAfter = retryAfter
  }
}

export async function apiPost<T>(path: string, body: unknown, { timeoutMs = 45_000 } = {}): Promise<T> {
  const token = await accessToken()
  if (!token) throw new ApiError(401, 'unauthorized', t('x0y30xii'))
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
  } catch (e) {
    const aborted = (e as Error)?.name === 'AbortError'
    throw new ApiError(0, aborted ? 'timeout' : 'network', aborted ? t('x0upz6wc') : t('x1ocrfdi'))
  } finally {
    clearTimeout(timer)
  }
  const data = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null
  if (!res.ok) {
    const ra = Number(res.headers.get('retry-after'))
    const code = data?.error?.code ?? 'http_' + res.status
    throw new ApiError(res.status, code, localizeServerMessage(code, data?.error?.message), Number.isFinite(ra) ? ra : undefined)
  }
  return data as T
}
