// POST /api/billing/status — подписка из App Store / Google Play (RevenueCat) для сайта (логика: server/revenuecat.ts)
import { supabaseDb } from '../../server/db.js'
import { createStatusHandler } from '../../server/revenuecat.js'
import { withSentry } from '../../server/sentry.js'

export const POST = withSentry('billing/status', createStatusHandler({ db: supabaseDb }))
