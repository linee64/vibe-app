/**
 * Отзывы в мобильном приложении: POST {EXPO_PUBLIC_API_BASE}/api/feedback (как в вебе) или — без бэкенда —
 * хранение на устройстве. Сеть пропала — отзыв ждёт в «исходящих» и уходит при следующем запуске.
 * Микро-опросы: общие правила из @web/data/feedback, состояние — в AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Dimensions, Platform } from 'react-native'
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
} from '@web/data/feedback'
import { cleanRoute } from '@web/lib/analyticsCore'
import { accessToken } from './web-adapters/supabase'
import { API_BASE, FEEDBACK_API_ENABLED } from './env'
import { APP_VERSION, track } from './analytics'
import { t } from '@web/i18n/core'

export type SubmitResult = { ok: true; stored: 'server' | 'local' | 'outbox' } | { ok: false; message: string }

async function readList(key: string): Promise<FeedbackPayload[]> {
  try {
    const v = JSON.parse((await AsyncStorage.getItem(key)) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
const writeList = (key: string, list: FeedbackPayload[]) => AsyncStorage.setItem(key, JSON.stringify(list.slice(-20))).catch(() => {})

export function collectContext(route: string, extra: Partial<FeedbackContext> = {}): FeedbackContext {
  const r = cleanRoute(route || '/')
  const { width, height } = Dimensions.get('window')
  const platform = Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web'
  return {
    route: r,
    ...idsFromRoute(r),
    app_version: APP_VERSION,
    platform,
    viewport: `${Math.round(width)}x${Math.round(height)}`,
    os: Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web',
    ...extra,
  }
}

async function post(p: FeedbackPayload, fetchImpl: typeof fetch = fetch): Promise<'ok' | 'retry' | { error: string }> {
  const token = await accessToken().catch(() => null)
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 12_000)
  try {
    const res = await fetchImpl(`${API_BASE}/api/feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(p),
      signal: ctrl.signal,
    })
    if (res.ok) return 'ok'
    if (res.status === 400 || res.status === 413 || res.status === 415) {
      const data = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
      return { error: data?.error?.message ?? t('x1d3doxm') }
    }
    return 'retry'
  } catch {
    return 'retry'
  } finally {
    clearTimeout(timer)
  }
}

export async function submitFeedback(p: FeedbackPayload, opts: { fetchImpl?: typeof fetch; apiEnabled?: boolean } = {}): Promise<SubmitResult> {
  const payload: FeedbackPayload = { ...p, message: p.message.trim(), email: p.email?.trim() || undefined }
  track('feedback_submitted', { rating: payload.rating, category: payload.category, source: payload.source })
  if (!(opts.apiEnabled ?? FEEDBACK_API_ENABLED)) {
    await writeList(FEEDBACK_LOCAL_KEY, [...(await readList(FEEDBACK_LOCAL_KEY)), { ...payload, email: undefined }])
    return { ok: true, stored: 'local' }
  }
  const r = await post(payload, opts.fetchImpl)
  if (r === 'ok') return { ok: true, stored: 'server' }
  if (r === 'retry') {
    await writeList(FEEDBACK_OUTBOX_KEY, [...(await readList(FEEDBACK_OUTBOX_KEY)), payload])
    return { ok: true, stored: 'outbox' }
  }
  return { ok: false, message: r.error }
}

export async function flushFeedbackOutbox() {
  if (!FEEDBACK_API_ENABLED) return
  const list = await readList(FEEDBACK_OUTBOX_KEY)
  if (!list.length) return
  const left: FeedbackPayload[] = []
  for (const p of list.slice(0, 5)) if ((await post(p)) === 'retry') left.push(p)
  await writeList(FEEDBACK_OUTBOX_KEY, [...left, ...list.slice(5)])
}

// ---------------------------------------------------------------- микро-опросы

type Listener = () => void
const listeners = new Set<Listener>()
export const onMicroChange = (l: Listener) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

const load = async () => parseMicroState(await AsyncStorage.getItem(MICRO_STORAGE_KEY).catch(() => null))
async function save(s: Awaited<ReturnType<typeof load>>) {
  await AsyncStorage.setItem(MICRO_STORAGE_KEY, JSON.stringify(s)).catch(() => {})
  listeners.forEach((l) => l())
}

export async function requestMicroPrompt(kind: MicroPromptKind, now = Date.now()) {
  await save(queueMicro(await load(), kind, now))
}

/** Забрать опрос для показа (сразу засчитывается как показанный) */
export async function takeMicroPrompt(now = Date.now()): Promise<MicroPromptKind | null> {
  const s = await load()
  const kind = microToShow(s, now)
  if (!kind) return null
  await AsyncStorage.setItem(MICRO_STORAGE_KEY, JSON.stringify(markMicroShown(s, kind, now))).catch(() => {})
  track('micro_prompt_shown', { source: kind })
  return kind
}
