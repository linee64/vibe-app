/** Запросы к нашему /api (Vercel Functions) с токеном Supabase. Секретов в браузере нет. */
import { API_BASE } from './config'
import { accessToken } from './supabase'

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
  if (!token) throw new ApiError(401, 'unauthorized', 'Войди в аккаунт.')
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
    throw new ApiError(0, aborted ? 'timeout' : 'network', aborted ? 'Сервер не ответил вовремя.' : 'Нет связи с сервером. Проверь интернет.')
  } finally {
    clearTimeout(timer)
  }
  const data = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null
  if (!res.ok) {
    const ra = Number(res.headers.get('retry-after'))
    throw new ApiError(res.status, data?.error?.code ?? 'http_' + res.status, data?.error?.message ?? 'Что-то пошло не так. Попробуй ещё раз.', Number.isFinite(ra) ? ra : undefined)
  }
  return data as T
}
