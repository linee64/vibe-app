/**
 * Отчёты об ошибках (Sentry) для веба. Включается только при VITE_SENTRY_DSN.
 * SDK грузится лениво (отдельный чанк) после первого рендера; ошибки до загрузки ждут в очереди.
 * Перед отправкой всё вычищается: почта, токены, ключи; тексты промптов и отзывов не отправляются.
 */
import { SENTRY_DSN, SENTRY_ENABLED } from './config'

type SentryModule = typeof import('./sentryClient')
let mod: Promise<SentryModule | null> | null = null

export function initSentry() {
  if (!SENTRY_ENABLED || mod) return
  mod = import('./sentryClient')
    .then((m) => {
      m.init(SENTRY_DSN)
      return m
    })
    .catch(() => null)
}

export function captureException(error: unknown, context?: Record<string, string | number | boolean | undefined>) {
  if (!SENTRY_ENABLED) {
    if (import.meta.env.DEV) console.info('[sentry:off]', error)
    return
  }
  initSentry()
  void mod?.then((m) => m?.capture(error, context))
}

/** id пользователя Supabase (без email) или null при выходе */
export function setSentryUser(id: string | null) {
  if (!SENTRY_ENABLED) return
  initSentry()
  void mod?.then((m) => m?.setUser(id))
}
