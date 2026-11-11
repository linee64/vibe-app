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
import { needsGuide, startRoute } from '../lib/guide'
import { useProSync } from '../lib/billing'

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

/** Статус Pro для всех экранов: RevenueCat (слушатель покупок) + подписка с сайта; обновляется при входе и возврате в приложение */
function ProSync() {
  const { session } = useStore()
  useProSync(session?.real ? (session.id ?? null) : null)
  return null
}

void SplashScreen.preventAutoHideAsync().catch(() => {})

function Gate({ children }: { children: React.ReactNode }) {
  const { session, authReady, progress, progressReady, progressSynced } = useStore()
  const segments = useSegments()
  const router = useRouter()
  useEffect(() => {
    if (!authReady) return
    const top = segments[0]
    const onAuth = top === '(auth)'
    if (!session) {
      if (!onAuth) router.replace('/(auth)/welcome')
      return
    }
    // облако молчит — не держим человека на входе; новичка в урок 1 не гадаем
    if (!progressReady) return
    // урок и экран награды не перебиваем: проводка откроется, когда ученик выйдет
    const inLesson = top === 'lesson' || top === 'lesson-complete' || top === 'homework' || top === 'guide'
    if (progressSynced && needsGuide(progress) && !inLesson) {
      router.replace('/guide')
      return
    }
    if (onAuth) {
      const dest = startRoute(progress, progressSynced)
      if (dest === '/lesson/u1-1') router.replace({ pathname: '/lesson/[id]', params: { id: 'u1-1' } })
      else router.replace(dest)
      return
    }
    // после смены языка дерево экранов пересоздаётся — возвращаемся туда, где был переключатель
    const back = takeReturnRoute()
    if (back) router.replace(back as never)
  }, [session, authReady, progress, progressReady, progressSynced, segments, router])
  useEffect(() => {
    if (!session || progressReady) return
    const top = segments[0]
    // вход и корень ждут облако; если оно молчит 4 с — на путь, не в урок 1
    if (top && top !== '(auth)' && top !== 'index') return
    const timer = setTimeout(() => router.replace('/(tabs)/learn'), 4000)
    return () => clearTimeout(timer)
  }, [session, progressReady, segments, router])
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
              <ProSync />
              <StatusBar style="dark" />
              <FeedbackProvider>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.white }, animation: 'slide_from_right' }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="lesson/[id]" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="homework/[id]" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="intro" options={{ animation: 'fade' }} />
                <Stack.Screen name="guide" options={{ animation: 'fade' }} />
                <Stack.Screen name="paywall" options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
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
