// POST /api/billing/webhook — вебхук Polar (подпись Standard Webhooks, секрет POLAR_WEBHOOK_SECRET)
import { supabaseDb } from '../../server/db.js'
import { createWebhookHandler } from '../../server/polar.js'

export const POST = createWebhookHandler({ db: supabaseDb })
