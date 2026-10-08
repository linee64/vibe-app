// POST /api/billing/checkout — ссылка на оплату Pro в Polar (логика: server/polar.ts)
import { supabaseDb } from '../../server/db.js'
import { createCheckoutHandler } from '../../server/polar.js'

export const POST = createCheckoutHandler({ db: supabaseDb })
