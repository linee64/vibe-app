/**
 * Что подключено — решают только переменные окружения VITE_* (они попадают в браузер, секретов тут нет).
 *
 *  Демо-режим (ничего не задано): тестовый вход, прогресс в localStorage, ИИ-симуляция, без оплаты — как раньше.
 *  VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY → настоящие аккаунты и синхронизация прогресса.
 *  + серверный DEEPSEEK_API_KEY → ИИ-проверка домашек через /api/ai/review (VITE_AI_ENABLED=false — выключить).
 *  + VITE_BILLING_ENABLED=true и серверные POLAR_* → оплата Pro и пейвол разделов 2–5.
 *  VITE_REVIEW_MODE (по умолчанию 'true') — режим ревью: тиры и пейвол открыты. Перед запуском поставить 'false'.
 */
const env = import.meta.env

const url = (env.VITE_SUPABASE_URL ?? '').trim()
const key = (env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim()

/** Защита от ошибки: секретный ключ в браузере — сразу выключаем Supabase и громко ругаемся */
function looksSecret(k: string) {
  if (k.startsWith('sb_secret_')) return true
  if (k.startsWith('eyJ')) {
    try {
      const payload = JSON.parse(atob(k.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      return payload?.role === 'service_role'
    } catch {
      return false
    }
  }
  return false
}

const keyIsSecret = looksSecret(key)
if (keyIsSecret) {
  console.error('VITE_SUPABASE_PUBLISHABLE_KEY содержит СЕКРЕТНЫЙ ключ! Supabase отключён. Используй publishable-ключ (sb_publishable_…) и перевыпусти секретный.')
}

export const SUPABASE_URL = url
export const SUPABASE_PUBLISHABLE_KEY = key
export const SUPABASE_ENABLED = !!(url && key) && !keyIsSecret
/** Демо: без бэкенда, всё как в прототипе */
export const DEMO_MODE = !SUPABASE_ENABLED
/** Где живёт /api: пусто = тот же сайт (Vercel / vercel dev) */
export const API_BASE = (env.VITE_API_BASE ?? '').trim().replace(/\/+$/, '')
export const AI_ENABLED = SUPABASE_ENABLED && env.VITE_AI_ENABLED !== 'false'
export const BILLING_ENABLED = SUPABASE_ENABLED && env.VITE_BILLING_ENABLED === 'true'
/** Режим ревью: все тиры открыты по умолчанию и пейвол не показывается */
export const REVIEW_MODE = env.VITE_REVIEW_MODE !== 'false'
/** Пейвол реально действует (оплата подключена и ревью выключено) */
export const PAYWALL_ACTIVE = BILLING_ENABLED && !REVIEW_MODE
