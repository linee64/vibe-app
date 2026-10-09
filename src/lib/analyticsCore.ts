/**
 * Ядро аналитики без привязки к платформе: очередь до загрузки SDK, вычистка свойств, no-op без ключа.
 * Веб (src/lib/analytics.ts) подключает posthog-js, мобильное приложение — posthog-react-native.
 */
import { sanitizeProps, type AnalyticsProps } from './scrub'

/** Воронка и ключевые действия. Список с описаниями — docs/analytics.md */
export type AnalyticsEvent =
  | 'landing_viewed'
  | 'signup_started'
  | 'signup_completed'
  | 'login_completed'
  | 'logout'
  | 'placement_started'
  | 'placement_completed'
  | 'lesson_started'
  | 'exercise_answered'
  | 'hint_used'
  | 'charge_empty'
  | 'tokens_spent'
  | 'lesson_completed'
  | 'lesson_abandoned'
  | 'homework_started'
  | 'homework_submitted'
  | 'homework_passed'
  | 'tier_unlocked'
  | 'paywall_viewed'
  | 'paywall_closed'
  | 'checkout_started'
  | 'checkout_completed'
  | 'trial_started'
  | 'feedback_opened'
  | 'feedback_submitted'
  | 'micro_prompt_shown'
  | 'micro_prompt_dismissed'
  | 'error_screen_shown'
  | 'language_changed'

/** Минимум, который нужен от SDK (posthog-js и posthog-react-native оба подходят) */
export interface AnalyticsClient {
  capture(event: string, props?: Record<string, unknown>): void
  identify(id: string): void
  reset(): void
  screen?(name: string, props?: Record<string, unknown>): void
}

export interface AnalyticsOptions {
  /** Ключ проекта PostHog; пусто — выключено */
  apiKey: string
  /** Загрузить и настроить SDK (вызывается один раз, лениво) */
  load: () => Promise<AnalyticsClient | null>
  /** Свойства, которые добавляются к каждому событию (platform, app_version) */
  base?: AnalyticsProps
  /** Писать события в консоль, когда аналитика выключена (только dev) */
  debug?: boolean
  log?: (...args: unknown[]) => void
}

export interface Analytics {
  readonly enabled: boolean
  track(event: AnalyticsEvent, props?: AnalyticsProps): void
  identify(userId: string): void
  reset(): void
  /** Просмотр экрана (веб — $pageview по hash-маршруту, мобильное — screen) */
  page(route: string): void
  /** Для тестов: дождаться загрузки SDK и сброса очереди */
  flush(): Promise<void>
}

const UUID_RE = /^[0-9a-f-]{8,64}$/i

/** Маршрут без query/hash-параметров и без длинных сегментов — в аналитику уходит только «форма» адреса */
export function cleanRoute(route: string): string {
  const path = route.split(/[?#]/)[0] || '/'
  return path
    .split('/')
    .map((seg) => (seg.length > 40 ? ':long' : seg))
    .join('/')
    .slice(0, 120)
}

export function createAnalytics(opts: AnalyticsOptions): Analytics {
  const enabled = !!opts.apiKey.trim()
  const log = opts.log ?? ((...a: unknown[]) => console.info(...a))
  let client: AnalyticsClient | null = null
  let loading: Promise<void> | null = null
  const queue: ((c: AnalyticsClient) => void)[] = []
  let lastId: string | null = null

  const run = (fn: (c: AnalyticsClient) => void) => {
    if (!enabled) return
    if (client) {
      try {
        fn(client)
      } catch {
        /* аналитика никогда не ломает приложение */
      }
      return
    }
    if (queue.length < 200) queue.push(fn)
    if (!loading) {
      loading = opts
        .load()
        .then((c) => {
          client = c
          if (!c) return
          for (const f of queue.splice(0)) {
            try {
              f(c)
            } catch {
              /* ignore */
            }
          }
        })
        .catch(() => {
          queue.length = 0
        })
    }
  }

  return {
    enabled,
    track(event, props) {
      const clean = { ...sanitizeProps(opts.base), ...sanitizeProps(props) }
      if (!enabled) {
        if (opts.debug) log(`[analytics] ${event}`, clean)
        return
      }
      run((c) => c.capture(event, clean))
    },
    identify(userId) {
      // только id пользователя Supabase — никаких email и имён
      if (!UUID_RE.test(userId) || userId === lastId) return
      lastId = userId
      if (!enabled) {
        if (opts.debug) log('[analytics] identify', userId)
        return
      }
      run((c) => c.identify(userId))
    },
    reset() {
      lastId = null
      if (!enabled) {
        if (opts.debug) log('[analytics] reset')
        return
      }
      run((c) => c.reset())
    },
    page(route) {
      const path = cleanRoute(route)
      if (!enabled) return
      run((c) => (c.screen ? c.screen(path, sanitizeProps(opts.base)) : c.capture('$pageview', { ...sanitizeProps(opts.base), route: path })))
    },
    async flush() {
      if (loading) await loading
    },
  }
}
