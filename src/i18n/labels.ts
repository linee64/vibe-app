/**
 * Подписи для данных, которые сами остаются русскими (их читает сервер/вебхук):
 * категории и оценки отзывов. UI берёт подписи отсюда — на языке ученика.
 */
import { MANUAL_CATEGORIES, PAYWALL_REASONS, type FeedbackCategory } from '../data/feedback'
import { t, type UIKey } from './core'

export const feedbackCategoryLabel = (id: FeedbackCategory) => t(`feedback.cat.${id}` as UIKey)
/** r — 1…5 */
export const ratingLabel = (r: number) => (r >= 1 && r <= 5 ? t(`feedback.rating.${r}` as UIKey) : '')
export const manualCategories = () => MANUAL_CATEGORIES.map((c) => ({ ...c, label: feedbackCategoryLabel(c.id) }))
export const paywallReasons = () => PAYWALL_REASONS.map((c) => ({ ...c, label: feedbackCategoryLabel(c.id) }))
