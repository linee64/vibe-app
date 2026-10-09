/**
 * Публичные настройки приложения из EXPO_PUBLIC_* (попадают в сборку — секретов тут быть не должно).
 * Обращаться только как process.env.EXPO_PUBLIC_X: Expo подставляет значения при сборке.
 */
const clean = (v: string | undefined) => (v ?? '').trim()

export const ENV = {
  supabaseUrl: clean(process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseKey: clean(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  apiBase: clean(process.env.EXPO_PUBLIC_API_BASE).replace(/\/+$/, ''),
  reviewMode: clean(process.env.EXPO_PUBLIC_REVIEW_MODE),
  rcIos: clean(process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY),
  rcAndroid: clean(process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY),
  /** PostHog: ключ проекта (phc_…) — публичный по замыслу */
  posthogKey: clean(process.env.EXPO_PUBLIC_POSTHOG_KEY),
  posthogHost: (clean(process.env.EXPO_PUBLIC_POSTHOG_HOST) || 'https://us.i.posthog.com').replace(/\/+$/, ''),
  /** Sentry DSN — публичный по замыслу */
  sentryDsn: clean(process.env.EXPO_PUBLIC_SENTRY_DSN),
  sentryEnv: clean(process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT),
}

function decodeBase64Url(part: string): string {
  const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
  if (typeof globalThis.atob === 'function') return globalThis.atob(b64)
  return ''
}

/** Защита от ошибки: секретный ключ Supabase в приложении — сразу выключаем Supabase */
export function looksSecret(k: string) {
  if (k.startsWith('sb_secret_')) return true
  if (k.startsWith('eyJ')) {
    try {
      const payload = JSON.parse(decodeBase64Url(k.split('.')[1] ?? ''))
      return payload?.role === 'service_role'
    } catch {
      return false
    }
  }
  return false
}

const keyIsSecret = looksSecret(ENV.supabaseKey)
if (keyIsSecret) {
  console.error('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY содержит СЕКРЕТНЫЙ ключ! Supabase отключён. Нужен publishable-ключ.')
}

export const SUPABASE_ENABLED = !!(ENV.supabaseUrl && ENV.supabaseKey) && !keyIsSecret
export const DEMO_MODE = !SUPABASE_ENABLED
/** Мобильному приложению нужен абсолютный адрес бэкенда (в вебе /api на том же домене) */
export const API_BASE = ENV.apiBase
export const AI_ENABLED = SUPABASE_ENABLED && !!API_BASE
/** Режим ревью (по умолчанию включён): тиры открыты, пейвол не мешает */
export const REVIEW_MODE = ENV.reviewMode !== 'false'

export const ANALYTICS_ENABLED = !!ENV.posthogKey
export const SENTRY_ENABLED = !!ENV.sentryDsn
/** Отзывы уходят на сервер, если известен адрес бэкенда; иначе хранятся на устройстве */
export const FEEDBACK_API_ENABLED = !!API_BASE
