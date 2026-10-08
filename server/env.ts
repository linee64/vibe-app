/**
 * Серверные переменные окружения (только для /api на Vercel — в браузер не попадают).
 * Значения читаются при каждом вызове, чтобы тесты могли подменять process.env.
 */
const str = (name: string) => (process.env[name] ?? '').trim()
const int = (name: string, def: number) => {
  const n = Number.parseInt(str(name), 10)
  return Number.isFinite(n) && n >= 0 ? n : def
}

export const serverEnv = {
  supabaseUrl: () => str('SUPABASE_URL'),
  supabaseSecretKey: () => str('SUPABASE_SECRET_KEY'),
  deepseekKey: () => str('DEEPSEEK_API_KEY'),
  deepseekBaseUrl: () => (str('DEEPSEEK_BASE_URL') || 'https://api.deepseek.com').replace(/\/+$/, ''),
  deepseekModel: () => str('DEEPSEEK_MODEL') || 'deepseek-flash',
  aiLimitFree: () => int('AI_DAILY_LIMIT_FREE', 10),
  aiLimitPro: () => int('AI_DAILY_LIMIT_PRO', 100),
  polarToken: () => str('POLAR_ACCESS_TOKEN'),
  polarServer: (): 'sandbox' | 'production' => (str('POLAR_SERVER') === 'production' ? 'production' : 'sandbox'),
  polarApiVersion: () => str('POLAR_API_VERSION') || '2026-10',
  polarProductMonthly: () => str('POLAR_PRODUCT_MONTHLY_ID'),
  polarProductAnnual: () => str('POLAR_PRODUCT_ANNUAL_ID'),
  polarWebhookSecret: () => str('POLAR_WEBHOOK_SECRET'),
  /** Публичный адрес сайта (https://vaibik.vercel.app) — для ссылок возврата из оплаты */
  appUrl: () => str('APP_URL').replace(/\/+$/, ''),
}

export const isSupabaseServerConfigured = () => !!(serverEnv.supabaseUrl() && serverEnv.supabaseSecretKey())
export const isAiConfigured = () => !!serverEnv.deepseekKey()
export const isBillingConfigured = () =>
  !!(serverEnv.polarToken() && serverEnv.polarProductMonthly() && serverEnv.polarProductAnnual())

export const polarBaseUrl = () => (serverEnv.polarServer() === 'production' ? 'https://api.polar.sh' : 'https://sandbox-api.polar.sh')
