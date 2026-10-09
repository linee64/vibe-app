// POST /api/feedback — отзыв ученика (логика: server/feedback.ts)
import { supabaseDb } from '../server/db.js'
import { createFeedbackHandler } from '../server/feedback.js'
import { withSentry } from '../server/sentry.js'

export const POST = withSentry('feedback', createFeedbackHandler({ db: supabaseDb }))
