import { useEffect, useRef, useState } from 'react'
import { Stack, usePathname, useRouter, useSegments, type ErrorBoundaryProps } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black } from '@expo-google-fonts/nunito'
import { GestureHandlerRootView } from 'react-native-gesture-handler' // side-effect: gesture-handler init
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StoreProvider, useStore } from '../store/Store'
import { ToastProvider } from '../components/Toast'
import { FeedbackProvider } from '../components/Feedback'
import { ErrorFallback } from '../components/ErrorFallback'
import { identify, resetAnalytics, track, trackScreen } from '../lib/analytics'
import { captureException, initSentry, setSentryUser } from '../lib/sentry'
import { C } from '../theme'
import { LocaleKeyed } from '@web/i18n/react'
import { onUserLocaleChange } from '@web/i18n/runtime'
import { initMobileLocale, takeReturnRoute } from '../lib/locale'

initSentry()

onUserLocaleChange((to, from) => track('language_changed', { from, to }))

/** Экран «Бипи споткнулся» вместо красного экрана: expo-router подставляет его при падении любого экрана */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    captureException(error, { boundary: 'expo-router' })
    track('error_screen_shown', { boundary: 'router' })
  }, [error])
  return <ErrorFallback onRetry={() => void retry()} />
}

/** identify/reset в аналитике и Sentry + экраны */
function AnalyticsBridge() {
  const { session } = useStore()
  const pathname = usePathname()
  const userId = session?.real ? session.id : undefined
  const prev = useRef<string | undefined>(undefined)
  const had = useRef(false)
  useEffect(() => {
    if (userId && userId !== prev.current) {
      identify(userId)
      setSentryUser(userId)
    }
    if (!session && had.current) {
      resetAnalytics()
      setSentryUser(null)
    }
    prev.current = userId
    had.current = !!session
  }, [userId, session])
  useEffect(() => {
    if (pathname) trackScreen(pathname)
  }, [pathname])
  return null
}

void SplashScreen.preventAutoHideAsync().catch(() => {})

function Gate({ children }: { children: React.ReactNode }) {
  const { session, authReady } = useStore()
  const segments = useSegments()
  const router = useRouter()
  useEffect(() => {
    if (!authReady) return
    const onAuth = segments[0] === '(auth)'
    if (!session && !onAuth) router.replace('/(auth)/login')
    else if (session && onAuth) router.replace('/(tabs)/learn')
    else if (session) {
      // после смены языка дерево экранов пересоздаётся — возвращаемся туда, где был переключатель
      const back = takeReturnRoute()
      if (back) router.replace(back as never)
    }
  }, [session, authReady, segments, router])
  return <>{children}</>
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black })
  // язык: AsyncStorage → язык телефона → en; каталог и контент грузим до первого кадра
  const [localeReady, setLocaleReady] = useState(false)
  useEffect(() => {
    void initMobileLocale().finally(() => setLocaleReady(true))
  }, [])
  const loaded = fontsLoaded && localeReady
  useEffect(() => {
    if (loaded) void SplashScreen.hideAsync().catch(() => {})
  }, [loaded])
  if (!loaded) return null
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <ToastProvider>
            <LocaleKeyed>
            <Gate>
              <AnalyticsBridge />
              <StatusBar style="dark" />
              <FeedbackProvider>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.snow }, animation: 'slide_from_right' }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="lesson/[id]" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="homework/[id]" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="placement" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="shop" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              </Stack>
              </FeedbackProvider>
            </Gate>
            </LocaleKeyed>
          </ToastProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
