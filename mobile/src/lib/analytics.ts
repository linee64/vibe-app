/**
 * Аналитика PostHog для мобильного приложения (posthog-react-native). Та же обёртка и те же события, что в вебе
 * (@web/lib/analyticsCore): без EXPO_PUBLIC_POSTHOG_KEY — no-op (в dev — лог в консоль).
 * Никаких email/промптов в свойствах; автосбор касаний и запись сессий выключены.
 */
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { createAnalytics, type AnalyticsClient, type AnalyticsEvent } from '@web/lib/analyticsCore'
import type { AnalyticsProps } from '@web/lib/scrub'
import { ANALYTICS_ENABLED, ENV } from './env'
import { getLocale } from '@web/i18n/core'

export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0'
const platform = Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web'

async function loadPosthog(): Promise<AnalyticsClient | null> {
  const { PostHog } = await import('posthog-react-native')
  const ph = new PostHog(ENV.posthogKey, {
    host: ENV.posthogHost,
    captureAppLifecycleEvents: true,
    enableSessionReplay: false,
    personProfiles: 'identified_only',
  })
  return {
    capture: (e, p) => void ph.capture(e, p as Record<string, string | number | boolean | null>),
    identify: (id) => void ph.identify(id),
    reset: () => void ph.reset(),
    screen: (name, p) => void ph.screen(name, p as Record<string, string | number | boolean | null>),
  }
}

const analytics = createAnalytics({
  apiKey: ANALYTICS_ENABLED ? ENV.posthogKey : '',
  load: loadPosthog,
  // locale — геттер: читается при каждом событии
  base: {
    platform,
    app_version: APP_VERSION,
    get locale() {
      return getLocale()
    },
  },
  debug: typeof __DEV__ !== 'undefined' && __DEV__ && process.env.NODE_ENV !== 'test',
})

export type { AnalyticsEvent }
export const track = (event: AnalyticsEvent, props?: AnalyticsProps) => analytics.track(event, props)
export const identify = (userId: string) => analytics.identify(userId)
export const resetAnalytics = () => analytics.reset()
export const trackScreen = (route: string) => analytics.page(route)
