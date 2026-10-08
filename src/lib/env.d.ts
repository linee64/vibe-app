/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_API_BASE?: string
  readonly VITE_AI_ENABLED?: string
  readonly VITE_BILLING_ENABLED?: string
  readonly VITE_REVIEW_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
