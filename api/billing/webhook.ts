// POST /api/billing/webhook — вебхук Polar (подпись Standard Webhooks, секрет POLAR_WEBHOOK_SECRET)
import { supabaseDb } from '../../server/db.js'
import { createWebhookHandler } from '../../server/polar.js'
import { withSentry } from '../../server/sentry.js'

export const POST = withSentry('billing/webhook', createWebhookHandler({ db: supabaseDb }))
