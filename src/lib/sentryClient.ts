/** Ленивый чанк с @sentry/react. Импортируется только из src/lib/sentry.ts при заданном VITE_SENTRY_DSN. */
import * as Sentry from '@sentry/react'
import { APP_VERSION, SENTRY_ENVIRONMENT } from './config'
import { scrubDeep, scrubString } from './scrub'

type SentryEvent = Sentry.ErrorEvent
type Breadcrumb = Sentry.Breadcrumb

/** Чистим событие: адреса без query, без почты/токенов; пользователь — только id */
export function scrubEvent(event: SentryEvent): SentryEvent {
  if (event.user) event.user = event.user.id ? { id: event.user.id } : undefined
  if (event.request) {
    const url = event.request.url ? scrubString(event.request.url.split('?')[0]) : undefined
    event.request = { url }
  }
  if (event.message) event.message = scrubString(event.message)
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = scrubString(ex.value)
    for (const f of ex.stacktrace?.frames ?? []) {
      delete f.vars
    }
  }
  if (event.extra) event.extra = scrubDeep(event.extra)
  if (event.contexts) event.contexts = scrubDeep(event.contexts)
  if (event.tags) event.tags = scrubDeep(event.tags)
  if (event.breadcrumbs) event.breadcrumbs = event.breadcrumbs.map(scrubBreadcrumb).filter((b): b is Breadcrumb => !!b)
  return event
}

function scrubBreadcrumb(b: Breadcrumb): Breadcrumb | null {
  // консоль может содержать что угодно — не отправляем
  if (b.category === 'console') return null
  const out: Breadcrumb = { ...b }
  if (out.message) out.message = scrubString(out.message)
  if (out.data) {
    const d = { ...out.data }
    if (typeof d.url === 'string') d.url = scrubString(d.url.split('?')[0])
    if (typeof d.to === 'string') d.to = scrubString(d.to.split('?')[0])
    if (typeof d.from === 'string') d.from = scrubString(d.from.split('?')[0])
    out.data = scrubDeep(d)
  }
  return out
}

export function init(dsn: string) {
  Sentry.init({
    dsn,
    environment: SENTRY_ENVIRONMENT,
    release: `vaibik-web@${APP_VERSION}`,
    // ничего лишнего: без пользователя по IP, cookies, заголовков, тел запросов, query и переменных стека
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      genAI: { inputs: false, outputs: false },
      stackFrameVariables: false,
    },
    // только ошибки: без трассировки производительности и без записи сессий
    tracesSampleRate: 0,
    integrations: (defaults) => defaults.filter((i) => i.name !== 'BrowserSession'),
    maxBreadcrumbs: 30,
    beforeSend: (event) => scrubEvent(event),
    beforeBreadcrumb: (b) => scrubBreadcrumb(b),
    ignoreErrors: ['ResizeObserver loop limit exceeded', 'ResizeObserver loop completed with undelivered notifications', /^AbortError/],
  })
}

export function capture(error: unknown, context?: Record<string, string | number | boolean | undefined>) {
  Sentry.withScope((scope) => {
    if (context) for (const [k, v] of Object.entries(context)) if (v !== undefined) scope.setTag(k, String(v).slice(0, 100))
    Sentry.captureException(error)
  })
}

export function setUser(id: string | null) {
  Sentry.setUser(id ? { id } : null)
}
