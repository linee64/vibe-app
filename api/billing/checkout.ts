// POST /api/billing/checkout — ссылка на оплату Pro в Polar (логика: server/polar.ts)
import { supabaseDb } from '../../server/db.js'
import { createCheckoutHandler } from '../../server/polar.js'
import { withSentry } from '../../server/sentry.js'

export const POST = withSentry('billing/checkout', createCheckoutHandler({ db: supabaseDb }))
