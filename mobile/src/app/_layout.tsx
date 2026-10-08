import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black } from '@expo-google-fonts/nunito'
import { GestureHandlerRootView } from 'react-native-gesture-handler' // side-effect: gesture-handler init
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StoreProvider, useStore } from '../store/Store'
import { ToastProvider } from '../components/Toast'
import { C } from '../theme'

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
  }, [session, authReady, segments, router])
  return <>{children}</>
}

export default function RootLayout() {
  const [loaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black })
  useEffect(() => {
    if (loaded) void SplashScreen.hideAsync().catch(() => {})
  }, [loaded])
  if (!loaded) return null
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <ToastProvider>
            <Gate>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.snow }, animation: 'slide_from_right' }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="lesson/[id]" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="homework/[id]" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="placement" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="shop" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              </Stack>
            </Gate>
          </ToastProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
