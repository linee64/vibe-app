/**
 * Отзывы: отправка в /api/feedback (когда есть бэкенд), иначе — локально в localStorage.
 * Если сервер недоступен, отзыв ложится в «исходящие» и уходит при следующем запуске. Ученику всегда «спасибо».
 */
import { API_BASE, APP_VERSION, FEEDBACK_API_ENABLED } from './config'
import { accessToken } from './supabase'
import { track } from './analytics'
import { cleanRoute } from './analyticsCore'
import {
  FEEDBACK_LOCAL_KEY,
  FEEDBACK_OUTBOX_KEY,
  MICRO_STORAGE_KEY,
  idsFromRoute,
  markMicroShown,
  microToShow,
  parseMicroState,
  queueMicro,
  type FeedbackContext,
  type FeedbackPayload,
  type MicroPromptKind,
} from '../data/feedback'
import { getLocale, t } from '../i18n/core'

export type SubmitResult = { ok: true; stored: 'server' | 'local' | 'outbox' } | { ok: false; message: string }

const readList = (key: string): FeedbackPayload[] => {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
const writeList = (key: string, list: FeedbackPayload[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(list.slice(-20)))
  } catch {
    /* хранилище переполнено — не страшно */
  }
}

function coarseBrowser(ua: string): { browser?: string; os?: string } {
  const b = /(Edg|OPR|YaBrowser|Firefox|Chrome|CriOS|Version)\/(\d+)/.exec(ua)
  const name = b ? ({ Edg: 'Edge', OPR: 'Opera', YaBrowser: 'Yandex', CriOS: 'Chrome', Version: 'Safari' } as Record<string, string>)[b[1]] ?? b[1] : undefined
  const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : undefined
  return { browser: name && b ? `${name} ${b[2]}` : undefined, os }
}

/** Технические детали для отзыва (без личных данных) */
export function collectContext(extra: Partial<FeedbackContext> = {}): FeedbackContext {
  const route = cleanRoute(window.location.hash.replace(/^#/, '') || '/')
  return {
    route,
    ...idsFromRoute(route),
    app_version: APP_VERSION,
    platform: 'web',
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    locale: (navigator.language || '').slice(0, 20) || undefined,
    ...coarseBrowser(navigator.userAgent),
    ...extra,
  }
}

async function post(p: FeedbackPayload): Promise<'ok' | 'retry' | { error: string }> {
  const token = await accessToken().catch(() => null)
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 12_000)
  try {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(p),
      signal: ctrl.signal,
    })
    if (res.ok) return 'ok'
    if (res.status === 400 || res.status === 413 || res.status === 415) {
      const data = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
      return { error: (getLocale() === 'ru' && data?.error?.message) || t('x1d3doxm') }
    }
    return 'retry'
  } catch {
    return 'retry'
  } finally {
    clearTimeout(timer)
  }
}

export async function submitFeedback(p: FeedbackPayload): Promise<SubmitResult> {
  const payload: FeedbackPayload = { ...p, message: p.message.trim(), email: p.email?.trim() || undefined }
  track('feedback_submitted', { rating: payload.rating, category: payload.category, source: payload.source })
  if (!FEEDBACK_API_ENABLED) {
    // демо-режим: бэкенда нет — храним у себя
    writeList(FEEDBACK_LOCAL_KEY, [...readList(FEEDBACK_LOCAL_KEY), { ...payload, email: undefined }])
    return { ok: true, stored: 'local' }
  }
  const r = await post(payload)
  if (r === 'ok') return { ok: true, stored: 'server' }
  if (r === 'retry') {
    writeList(FEEDBACK_OUTBOX_KEY, [...readList(FEEDBACK_OUTBOX_KEY), payload])
    return { ok: true, stored: 'outbox' }
  }
  return { ok: false, message: r.error }
}

/** Досылаем отзывы, которые не ушли из-за сети (вызывается при старте) */
export async function flushFeedbackOutbox() {
  if (!FEEDBACK_API_ENABLED) return
  const list = readList(FEEDBACK_OUTBOX_KEY)
  if (!list.length) return
  const left: FeedbackPayload[] = []
  for (const p of list.slice(0, 5)) {
    const r = await post(p)
    if (r === 'retry') left.push(p)
  }
  writeList(FEEDBACK_OUTBOX_KEY, [...left, ...list.slice(5)])
}

// ---------------------------------------------------------------- микро-опросы (localStorage)

const loadMicro = () => parseMicroState(localStorage.getItem(MICRO_STORAGE_KEY))
const saveMicro = (s: ReturnType<typeof loadMicro>) => {
  try {
    localStorage.setItem(MICRO_STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('vaibik:micro'))
}

/** Попросить микро-опрос (покажется вне урока, если позволяют лимиты) */
export function requestMicroPrompt(kind: MicroPromptKind) {
  saveMicro(queueMicro(loadMicro(), kind, Date.now()))
}

export function pendingMicroPrompt(): MicroPromptKind | null {
  return microToShow(loadMicro(), Date.now())
}

export function markMicroPromptShown(kind: MicroPromptKind) {
  saveMicro(markMicroShown(loadMicro(), kind, Date.now()))
}
