/**
 * reviewPrompt() — ИИ-разбор промпта через /api/ai/review (DeepSeek на сервере).
 * Никогда не бросает: при демо-режиме, лимите или ошибке возвращает { ok:false, reason, message },
 * и вызывающий код откатывается на офлайн-симуляцию.
 */
import { AI_ENABLED } from './config'
import { ApiError, apiPost } from './api'
import { getLocale, t } from '../i18n/core'

export interface ReviewRequest {
  task: { id: string; title: string; brief: string }
  requirements: { id: string; label: string; ui?: boolean }[]
  features?: { id: string; label: string }[]
  values?: { key: string; label: string }[]
  prompt: string
  history?: string[]
  /** Язык ученика — Бипи ответит на нём */
  locale?: string
}

export interface PromptReview {
  /** 0–100 */
  score: number
  /** id требования → выполнено ли */
  requirements: Record<string, boolean>
  /** 2–4 коротких совета от Бипи */
  feedback: string[]
  improved_prompt: string
  detected_features: string[]
  /** извлечённые значения (название кафе, текст кнопки, домен…) */
  values: Record<string, string>
}

export type ReviewOutcome =
  | { ok: true; review: PromptReview; usage: { used: number; limit: number } }
  | { ok: false; reason: 'disabled' | 'limit' | 'auth' | 'error'; message: string }

export async function reviewPrompt(req: ReviewRequest): Promise<ReviewOutcome> {
  if (!AI_ENABLED) return { ok: false, reason: 'disabled', message: t('x154trt3') }
  try {
    const data = await apiPost<{ review: PromptReview; usage: { used: number; limit: number } }>('/api/ai/review', {
      ...req,
      locale: req.locale ?? getLocale(),
      prompt: req.prompt.slice(0, 4000),
      history: (req.history ?? []).slice(-8).map((h) => h.slice(0, 1000)),
    })
    if (!data?.review || typeof data.review.score !== 'number') throw new ApiError(502, 'bad_output', t('x1xxtts4'))
    return { ok: true, review: data.review, usage: data.usage }
  } catch (e) {
    const err = e instanceof ApiError ? e : new ApiError(0, 'network', t('x043dxuk'))
    if (err.status === 429) return { ok: false, reason: 'limit', message: err.message }
    if (err.status === 401) return { ok: false, reason: 'auth', message: err.message }
    if (err.status === 503 && err.code === 'ai_not_configured') return { ok: false, reason: 'disabled', message: err.message }
    return { ok: false, reason: 'error', message: err.message }
  }
}
