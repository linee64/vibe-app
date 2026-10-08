import type { ExpoConfig } from 'expo/config'

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
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
  extra: { router: {}, eas: { projectId: '00000000-0000-0000-0000-000000000000' } },
}

export default config
