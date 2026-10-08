/**
 * Подмена веб-модуля src/lib/config.ts (там import.meta.env от Vite) для React Native.
 * Metro и Jest подставляют этот файл, когда общий веб-код (src/lib/review.ts, api.ts) делает import './config'.
 * Экспорт — те же имена, что в вебе.
 */
import { AI_ENABLED, API_BASE, DEMO_MODE, ENV, REVIEW_MODE, SUPABASE_ENABLED } from '../env'

export const SUPABASE_URL = ENV.supabaseUrl
export const SUPABASE_PUBLISHABLE_KEY = ENV.supabaseKey
export { AI_ENABLED, API_BASE, DEMO_MODE, REVIEW_MODE, SUPABASE_ENABLED }
/** Оплату в приложении ведёт RevenueCat (src/lib/billing.ts), веб-оплата Polar тут не используется */
export const BILLING_ENABLED = false
export const PAYWALL_ACTIVE = false
