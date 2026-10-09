// POST /api/ai/review — ИИ-разбор промпта (логика: server/review.ts)
import { supabaseDb } from '../../server/db.js'
import { createReviewHandler } from '../../server/review.js'
import { withSentry } from '../../server/sentry.js'

export const POST = withSentry('ai/review', createReviewHandler({ db: supabaseDb }))
