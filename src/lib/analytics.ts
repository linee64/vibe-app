/**
 * Продуктовая аналитика (PostHog) для веба. Включается только при VITE_POSTHOG_KEY.
 * Без ключа — no-op (в dev события печатаются в консоль). SDK грузится лениво, отдельным чанком.
 *
 * Приватность: никаких email, имён и текста промптов в свойствах (см. sanitizeProps);
 * автосбор кликов и полей выключен; запись сессий — только при VITE_POSTHOG_SESSION_RECORDING=true
 * и с маскировкой всех полей ввода и текстов.
 */
import { ANALYTICS_ENABLED, APP_VERSION, POSTHOG_HOST, POSTHOG_KEY, POSTHOG_SESSION_RECORDING } from './config'
import { createAnalytics, type AnalyticsClient, type AnalyticsEvent } from './analyticsCore'
import type { AnalyticsProps } from './scrub'
import { getLocale } from '../i18n/core'

export type { AnalyticsEvent }

async function loadPosthog(): Promise<AnalyticsClient | null> {
  const { default: posthog } = await import('posthog-js')
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // только явные события из track(): никакого автосбора кликов/полей ввода
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_dead_clicks: false,
    rageclick: false,
    disable_session_recording: !POSTHOG_SESSION_RECORDING,
    session_recording: { maskAllInputs: true, maskTextSelector: '*' },
    disable_surveys: true,
    enable_heatmaps: false,
    // профили только для вошедших (identify), анонимы — без профилей
    person_profiles: 'identified_only',
    persistence: 'localStorage+cookie',
    mask_all_text: true,
    mask_all_element_attributes: true,
    respect_dnt: true,
    // в URL могут оказаться ?code=…/?checkout_id=… — режем query у адресов
    sanitize_properties: (props) => {
      for (const k of ['$current_url', '$referrer', '$initial_referrer', '$initial_current_url']) {
        const v = props[k]
        if (typeof v === 'string') props[k] = v.split('?')[0]
      }
      return props
    },
  })
  return posthog as unknown as AnalyticsClient
}

const analytics = createAnalytics({
  apiKey: ANALYTICS_ENABLED ? POSTHOG_KEY : '',
  load: loadPosthog,
  // locale — геттер: читается при каждом событии, поэтому смена языка сразу видна в PostHog
  base: {
    platform: 'web',
    app_version: APP_VERSION,
    get locale() {
      return getLocale()
    },
  },
  debug: !!import.meta.env.DEV,
})

export const track = (event: AnalyticsEvent, props?: AnalyticsProps) => analytics.track(event, props)
export const identify = (userId: string) => analytics.identify(userId)
export const resetAnalytics = () => analytics.reset()
export const trackPage = (route: string) => analytics.page(route)
