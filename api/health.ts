// GET /api/health — что подключено (без секретов): удобно проверить env после деплоя
import { isAiConfigured, isBillingConfigured, isSupabaseServerConfigured, serverEnv } from '../server/env.js'
import { json } from '../server/http.js'

export function GET(): Response {
  return json({
    ok: true,
    supabase: isSupabaseServerConfigured(),
    ai: isAiConfigured(),
    billing: isBillingConfigured(),
    webhook: !!serverEnv.polarWebhookSecret(),
    polarServer: serverEnv.polarServer(),
  })
}
