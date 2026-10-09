/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_API_BASE?: string
  readonly VITE_AI_ENABLED?: string
  readonly VITE_BILLING_ENABLED?: string
  readonly VITE_REVIEW_MODE?: string
  readonly VITE_POSTHOG_KEY?: string
  readonly VITE_POSTHOG_HOST?: string
  readonly VITE_POSTHOG_SESSION_RECORDING?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_SENTRY_ENVIRONMENT?: string
  readonly VITE_FEEDBACK_API?: string
}

/** Подставляет vite.config.ts: версия из package.json (+ короткий коммит на Vercel) */
declare const __APP_VERSION__: string

interface ImportMeta {
  readonly env: ImportMetaEnv
}
