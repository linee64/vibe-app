/**
 * POST /api/feedback — отзыв ученика из формы «Отзыв» или микро-опроса.
 *
 * Запрос:  { rating?: 1–5|null, category?: string|null, message?: string (≤1000), email?: string (только гости),
 *            source: 'manual'|'first_lesson'|'paywall_exit'|'homework', context?: {route, lesson_id, …} }
 *          Authorization: Bearer <access token Supabase> — необязательно (тогда отзыв привязан к user_id).
 * Ответ:   201 { ok: true, stored, forwarded }
 * Ошибки:  400 bad_request · 413 too_large · 415 · 403 forbidden_origin · 429 rate_limited
 *          503 feedback_not_configured (нет ни Supabase, ни FEEDBACK_WEBHOOK_URL) · 502 feedback_failed
 *
 * Сохраняется в таблицу public.feedback (secret-ключ, RLS не мешает). Если задан FEEDBACK_WEBHOOK_URL —
 * короткая сводка уходит туда (Telegram-бот, Discord или Slack), чтобы владелец видел отзыв сразу.
 */
import { isSupabaseServerConfigured } from './env.js'
import { bearerToken, fail, forbiddenOrigin, isSameOrigin, json, methodNotAllowed, readJson } from './http.js'
import { userFromToken, type Db, type FeedbackRow } from './db.js'
import { clientIp, createRateLimiter, type RateLimiter } from './ratelimit.js'
import { captureServerError } from './sentry.js'

export const FEEDBACK_SOURCES = ['manual', 'first_lesson', 'paywall_exit', 'homework'] as const
export const FEEDBACK_CATEGORIES = ['bug', 'idea', 'hard', 'other', 'price', 'try_first', 'no_value'] as const
export const FEEDBACK_MAX_MESSAGE = 1000

const CATEGORY_RU: Record<string, string> = {
  bug: 'Баг',
  idea: 'Идея',
  hard: 'Сложно/непонятно',
  other: 'Другое',
  price: 'Дорого',
  try_first: 'Хочу сначала попробовать',
  no_value: 'Не вижу ценности',
}
const SOURCE_RU: Record<string, string> = { manual: 'форма «Отзыв»', first_lesson: 'после первого урока', paywall_exit: 'закрыл пейвол', homework: 'после домашки' }
const RATING_RU = ['', 'Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Супер!']

export interface FeedbackInput {
  rating: number | null
  category: string | null
  message: string | null
  email: string | null
  source: (typeof FEEDBACK_SOURCES)[number]
  context: Record<string, string>
}

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

/** Какие технические детали принимаем и как их проверяем (всё остальное отбрасывается) */
const CONTEXT_FIELDS: Record<string, RegExp> = {
  route: /^\/[A-Za-z0-9/_:.-]{0,119}$/,
  lesson_id: /^[a-z0-9-]{1,40}$/i,
  homework_id: /^hw[0-9]{1,2}$/,
  app_version: /^[A-Za-z0-9.+_-]{1,40}$/,
  platform: /^(web|ios|android)$/,
  viewport: /^\d{2,5}x\d{2,5}$/,
  locale: /^[A-Za-z]{2,3}([-_][A-Za-z0-9]{2,8}){0,2}$/,
  browser: /^[A-Za-z ]{1,20} \d{1,4}$/,
  os: /^[A-Za-z ]{1,20}$/,
  os_version: /^[0-9.]{1,15}$/,
  device: /^[A-Za-z0-9 ,._()-]{1,40}$/,
}

export function validateFeedback(raw: unknown): { ok: true; input: FeedbackInput; honeypot: boolean } | { ok: false; message: string } {
  const bad = (message: string) => ({ ok: false as const, message })
  if (!isObj(raw)) return bad('Пустой отзыв.')

  let rating: number | null = null
  if (raw.rating !== undefined && raw.rating !== null) {
    if (typeof raw.rating !== 'number' || !Number.isInteger(raw.rating) || raw.rating < 1 || raw.rating > 5) return bad('Оценка — от 1 до 5.')
    rating = raw.rating
  }

  let category: string | null = null
  if (raw.category !== undefined && raw.category !== null) {
    if (typeof raw.category !== 'string' || !(FEEDBACK_CATEGORIES as readonly string[]).includes(raw.category)) return bad('Неизвестная категория.')
    category = raw.category
  }

  const sourceRaw = raw.source ?? 'manual'
  if (typeof sourceRaw !== 'string' || !(FEEDBACK_SOURCES as readonly string[]).includes(sourceRaw)) return bad('Неизвестный источник отзыва.')
  const source = sourceRaw as FeedbackInput['source']

  let message: string | null = null
  if (raw.message !== undefined && raw.message !== null) {
    if (typeof raw.message !== 'string') return bad('Текст отзыва должен быть строкой.')
    const m = raw.message.replace(CONTROL_RE, '').replace(/\r\n?/g, '\n').replace(/\n{4,}/g, '\n\n\n').trim()
    if (m.length > FEEDBACK_MAX_MESSAGE) return bad(`Слишком длинный отзыв — до ${FEEDBACK_MAX_MESSAGE} символов.`)
    message = m || null
  }

  let email: string | null = null
  if (raw.email !== undefined && raw.email !== null && raw.email !== '') {
    if (typeof raw.email !== 'string') return bad('Неверная почта.')
    const e = raw.email.trim().toLowerCase()
    if (e.length > 254 || !EMAIL_RE.test(e)) return bad('Похоже, в почте опечатка.')
    email = e
  }

  const context: Record<string, string> = {}
  if (raw.context !== undefined && raw.context !== null) {
    if (!isObj(raw.context)) return bad('Неверные технические детали.')
    for (const [k, re] of Object.entries(CONTEXT_FIELDS)) {
      const v = raw.context[k]
      if (typeof v === 'string' && re.test(v)) context[k] = v
    }
  }

  if (rating === null && category === null && !message) return bad('Поставь оценку, выбери тему или напиши пару слов.')
  // скрытое поле-ловушка для ботов: людям его не видно
  const honeypot = typeof raw.website === 'string' && raw.website.trim() !== ''
  return { ok: true, input: { rating, category, message, email, source, context }, honeypot }
}

/** Короткая текстовая сводка для Telegram/Discord/Slack (без почты и без технических секретов) */
export function feedbackSummary(f: FeedbackInput, who: 'user' | 'guest'): string {
  const head: string[] = []
  if (f.rating) head.push(`Оценка: ${f.rating}/5 (${RATING_RU[f.rating]})`)
  if (f.category) head.push(`Тема: ${CATEGORY_RU[f.category] ?? f.category}`)
  head.push(`Откуда: ${SOURCE_RU[f.source]}`)
  const lines = ['💬 Новый отзыв · Вайбик', head.join(' · ')]
  if (f.message) lines.push('', `«${f.message.length > 700 ? `${f.message.slice(0, 700)}…` : f.message}»`)
  const c = f.context
  const tech = [c.route, c.lesson_id && `урок ${c.lesson_id}`, c.homework_id && `домашка ${c.homework_id}`, c.platform, c.app_version && `v${c.app_version}`, c.viewport, c.browser, c.os]
    .filter(Boolean)
    .join(' · ')
  if (tech) lines.push('', `Тех: ${tech}`)
  lines.push(who === 'user' ? 'Кто: ученик с аккаунтом' : f.email ? 'Кто: гость, оставил почту (см. таблицу feedback)' : 'Кто: гость')
  return lines.join('\n')
}

/** Отправка сводки на FEEDBACK_WEBHOOK_URL: Telegram Bot API, Discord, Slack или любой JSON-вебхук */
export async function forwardFeedback(url: string, text: string, f: FeedbackInput, fetchImpl: typeof fetch = fetch, timeoutMs = 4000): Promise<boolean> {
  let target: URL
  try {
    target = new URL(url)
  } catch {
    return false
  }
  if (target.protocol !== 'https:') return false
  let body: unknown
  const host = target.hostname
  if (host === 'api.telegram.org') {
    const chatId = target.searchParams.get('chat_id')
    if (!chatId) return false
    target.search = ''
    body = { chat_id: chatId, text: text.slice(0, 4000), disable_web_page_preview: true }
  } else if (host === 'discord.com' || host === 'discordapp.com' || host.endsWith('.discord.com')) {
    body = { content: text.slice(0, 1900), allowed_mentions: { parse: [] } }
  } else if (host === 'hooks.slack.com') {
    body = { text: text.slice(0, 3000) }
  } else {
    body = { text: text.slice(0, 4000), rating: f.rating, category: f.category, source: f.source }
  }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetchImpl(target.toString(), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal })
    if (!res.ok) console.warn(`[feedback] webhook status=${res.status}`)
    return res.ok
  } catch {
    console.warn('[feedback] webhook failed')
    return false
  } finally {
    clearTimeout(timer)
  }
}

/** По умолчанию: с одного IP — не больше 5 отзывов за 10 минут и 30 в сутки; с одного аккаунта — так же */
export const defaultFeedbackLimiter = () =>
  createRateLimiter([
    { windowMs: 10 * 60_000, max: 5 },
    { windowMs: 24 * 3_600_000, max: 30 },
  ])

export interface FeedbackDeps {
  db: Db
  fetchImpl?: typeof fetch
  limiter?: RateLimiter
  now?: () => number
}

export function createFeedbackHandler(deps: FeedbackDeps) {
  const limiter = deps.limiter ?? defaultFeedbackLimiter()
  return async function handle(req: Request): Promise<Response> {
    if (req.method !== 'POST') return methodNotAllowed('POST')
    if (!isSameOrigin(req)) return forbiddenOrigin()

    const body = await readJson(req, 8_000)
    if (!body.ok) return body.res
    const v = validateFeedback(body.data)
    if (!v.ok) return fail(400, 'bad_request', v.message)

    const now = deps.now?.() ?? Date.now()
    const limited = (key: string) => {
      const r = limiter.hit(key, now)
      return r.ok ? null : fail(429, 'rate_limited', 'Спасибо, отзывов уже много! Попробуй чуть позже.', { 'Retry-After': String(r.retryAfter) })
    }
    const ipLimit = limited(`ip:${clientIp(req)}`)
    if (ipLimit) return ipLimit

    const dbOn = isSupabaseServerConfigured()
    const hook = (process.env.FEEDBACK_WEBHOOK_URL ?? '').trim()
    if (!dbOn && !hook) return fail(503, 'feedback_not_configured', 'Отзывы пока принимаются только в приложении.')
    if (v.honeypot) return json({ ok: true, stored: false, forwarded: false }, 201)

    const user = dbOn ? await userFromToken(deps.db, bearerToken(req)) : null
    if (user) {
      const userLimit = limited(`user:${user.id}`)
      if (userLimit) return userLimit
    }
    const input: FeedbackInput = { ...v.input, email: user ? null : v.input.email }

    let stored = false
    if (dbOn) {
      const row: FeedbackRow = {
        user_id: user?.id ?? null,
        email: input.email,
        rating: input.rating,
        category: input.category,
        message: input.message,
        context: input.context,
        source: input.source,
      }
      try {
        await deps.db.insertFeedback(row)
        stored = true
      } catch (e) {
        await captureServerError(e, { route: 'feedback', tags: { stage: 'insert' } }, { fetchImpl: deps.fetchImpl })
      }
    }
    const forwarded = hook ? await forwardFeedback(hook, feedbackSummary(input, user ? 'user' : 'guest'), input, deps.fetchImpl) : false
    console.info(`[feedback] source=${input.source} rating=${input.rating ?? '-'} category=${input.category ?? '-'} user=${user ? 'yes' : 'no'} stored=${stored} forwarded=${forwarded}`)
    if (!stored && !forwarded) return fail(502, 'feedback_failed', 'Не получилось сохранить отзыв — попробуй ещё раз позже.')
    return json({ ok: true, stored, forwarded }, 201)
  }
}
