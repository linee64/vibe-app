/**
 * Отчёты об ошибках (Sentry) в мобильном приложении. Только при EXPO_PUBLIC_SENTRY_DSN.
 * Без пользователя по IP, без промптов, текстов отзывов и токенов (общая вычистка @web/lib/scrub).
 */
import * as Sentry from '@sentry/react-native'
import { scrubDeep, scrubString } from '@web/lib/scrub'
import { APP_VERSION } from './analytics'
import { ENV, SENTRY_ENABLED } from './env'

type Ev = Parameters<NonNullable<Sentry.ReactNativeOptions['beforeSend']>>[0]
type Crumb = Sentry.Breadcrumb

function scrubCrumb(b: Crumb): Crumb | null {
  if (b.category === 'console') return null
  const out: Crumb = { ...b }
  if (out.message) out.message = scrubString(out.message)
  if (out.data) {
    const d = { ...out.data }
    if (typeof d.url === 'string') d.url = scrubString(d.url.split('?')[0])
    out.data = scrubDeep(d)
  }
  return out
}

export function scrubMobileEvent(event: Ev): Ev {
  if (event.user) event.user = event.user.id ? { id: event.user.id } : undefined
  if (event.request) event.request = { url: event.request.url ? scrubString(event.request.url.split('?')[0]) : undefined }
  if (event.message) event.message = scrubString(event.message)
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = scrubString(ex.value)
    for (const f of ex.stacktrace?.frames ?? []) delete f.vars
  }
  if (event.extra) event.extra = scrubDeep(event.extra)
  if (event.contexts) event.contexts = scrubDeep(event.contexts)
  if (event.breadcrumbs) event.breadcrumbs = event.breadcrumbs.map(scrubCrumb).filter((b): b is Crumb => !!b)
  return event
}

let started = false
export function initSentry() {
  if (!SENTRY_ENABLED || started) return
  started = true
  Sentry.init({
    dsn: ENV.sentryDsn,
    environment: ENV.sentryEnv || (__DEV__ ? 'development' : 'production'),
    release: `vaibik-mobile@${APP_VERSION}`,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    enableAutoSessionTracking: true,
    attachScreenshot: false,
    attachViewHierarchy: false,
    maxBreadcrumbs: 30,
    beforeSend: (e) => scrubMobileEvent(e),
    beforeBreadcrumb: (b) => scrubCrumb(b),
  })
}

export function captureException(error: unknown, tags?: Record<string, string>) {
  if (!SENTRY_ENABLED) {
    if (__DEV__) console.info('[sentry:off]', error)
    return
  }
  Sentry.withScope((scope) => {
    for (const [k, v] of Object.entries(tags ?? {})) scope.setTag(k, v.slice(0, 100))
    Sentry.captureException(error)
  })
}

export function setSentryUser(id: string | null) {
  if (!SENTRY_ENABLED) return
  Sentry.setUser(id ? { id } : null)
}
