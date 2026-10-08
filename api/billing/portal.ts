// POST /api/billing/portal — ссылка в портал клиента Polar (управление подпиской)
import { supabaseDb } from '../../server/db.js'
import { createPortalHandler } from '../../server/polar.js'

export const POST = createPortalHandler({ db: supabaseDb })
