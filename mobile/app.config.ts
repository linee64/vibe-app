import type { ExpoConfig } from 'expo/config'

/**
 * Sentry: плагин нужен только для выгрузки source maps/dSYM при сборке в EAS. Подключаем, когда заданы
 * SENTRY_ORG и SENTRY_PROJECT (а SENTRY_AUTH_TOKEN — секрет EAS, не EXPO_PUBLIC_). Без них ошибки всё равно
 * отправляются по EXPO_PUBLIC_SENTRY_DSN, просто стек будет минифицированным.
 */
const sentryPlugin: NonNullable<ExpoConfig['plugins']> =
  process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
    ? [['@sentry/react-native', { organization: process.env.SENTRY_ORG, project: process.env.SENTRY_PROJECT, url: process.env.SENTRY_URL || 'https://sentry.io/' }]]
    : []

const config: ExpoConfig = {
  name: 'Вайбик',
  slug: 'vaibik',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'vaibik',
  userInterfaceStyle: 'light',
  backgroundColor: '#F6F4FB',
  ios: {
    bundleIdentifier: 'com.vaibik.app',
    supportsTablet: false,
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },
  android: {
    package: 'com.vaibik.app',
    adaptiveIcon: {
      backgroundColor: '#7C4DFF',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: { bundler: 'metro', output: 'single', favicon: './assets/favicon.png' },
  plugins: [
    'expo-router',
    'expo-font',
    ['expo-splash-screen', { backgroundColor: '#7C4DFF', image: './assets/splash-icon.png', imageWidth: 220 }],
    'expo-localization',
    ...sentryPlugin,
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
  extra: { router: {}, eas: { projectId: '00000000-0000-0000-0000-000000000000' } },
}

export default config
