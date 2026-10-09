// POST /api/billing/portal — ссылка в портал клиента Polar (управление подпиской)
import { supabaseDb } from '../../server/db.js'
import { createPortalHandler } from '../../server/polar.js'
import { withSentry } from '../../server/sentry.js'

export const POST = withSentry('billing/portal', createPortalHandler({ db: supabaseDb }))
