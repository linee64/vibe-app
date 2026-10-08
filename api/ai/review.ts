// POST /api/ai/review — ИИ-разбор промпта (логика: server/review.ts)
import { supabaseDb } from '../../server/db.js'
import { createReviewHandler } from '../../server/review.js'

export const POST = createReviewHandler({ db: supabaseDb })
