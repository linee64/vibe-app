import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { useStore } from './store'
import { navigate, useRoute } from './router'
import { AppShell } from './components/Layout'
import { Login, ResetPassword } from './screens/Login'
import { Home } from './screens/Home'
import { LessonScreen } from './screens/Lesson'
import { Leaderboard } from './screens/Leaderboard'
import { Profile } from './screens/Profile'
import { MoreSoon, QuestsSoon } from './screens/Placeholder'
import { Landing } from './screens/Landing'
import { PlacementScreen } from './screens/Placement'
import { TierUpScreen } from './screens/TierUp'
import { LockedScreen } from './components/Locked'
import { findLesson } from './data/course'
import { findHomework } from './data/homework'
import { isUnitLocked, needsPro, tierOfUnit } from './data/tiers'
import { UNITS } from './data/course'
import { BILLING_ENABLED, SUPABASE_ENABLED } from './lib/config'
import { consumeAuthRedirect } from './lib/auth'
import { SubscriptionProvider, usePaywall, useSubscription } from './lib/billing'
import { PaywallScreen } from './components/Paywall'
import { useToast } from './components/Toast'
import { CrashTest } from './components/ErrorBoundary'
import { identify, resetAnalytics, track, trackPage } from './lib/analytics'
import { setSentryUser } from './lib/sentry'
import { t } from './i18n/core'

// Домашки (симулятор ИИ + превью) — отдельный чанк, грузится при первом открытии
const HomeworkScreen = lazy(() => import('./screens/Homework').then((m) => ({ default: m.HomeworkScreen })))

const RECOVERY_KEY = 'vaibik.recovery'
const Blank = () => <div className="min-h-dvh bg-white" />

export default function App() {
  const { session, authReady } = useStore()
  const route = useRoute()
  // ссылки из писем Supabase (?reset=1, ошибки) — разбираем один раз при старте
  const [redirect] = useState(() => (SUPABASE_ENABLED ? consumeAuthRedirect() : { reset: false, error: null }))
  const [, rerender] = useState(0)
  useAnalyticsBridge(session?.real ? session.id : undefined, route)

  // «/» — публичный лендинг для гостей; «/landing» — лендинг всегда (и для вошедших);
  // «/pricing» — лендинг, прокрученный к тарифам
  const isPublic = route === '/' || route === '/landing' || route === '/pricing'

  useEffect(() => {
    if (!authReady) return
    if (!session && route !== '/login' && !isPublic) navigate('/login')
    if (session && (route === '/login' || route === '/')) navigate('/learn')
  }, [session, authReady, route, isPublic])

  // настоящие аккаунты: ждём, пока Supabase восстановит сессию (доли секунды), чтобы не мигал экран входа
  if (!authReady && !isPublic) return <Blank />
  if (route === '/pricing') return <Landing section="pricing" />
  if (route === '/landing' || (!session && route === '/')) return <Landing />
  if (!session) return <Login initialError={redirect.error} />
  if (session.real && sessionStorage.getItem(RECOVERY_KEY) === '1')
    return (
      <ResetPassword
        onDone={() => {
          sessionStorage.removeItem(RECOVERY_KEY)
          rerender((n) => n + 1)
          navigate('/learn')
        }}
      />
    )

  return (
    <SubscriptionProvider>
      <AppRoutes route={route} />
    </SubscriptionProvider>
  )
}

/** Аналитика и Sentry: id пользователя Supabase при входе, сброс при выходе, просмотры экранов */
function useAnalyticsBridge(userId: string | undefined, route: string) {
  const prev = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (userId) {
      identify(userId)
      setSentryUser(userId)
    } else if (prev.current) {
      resetAnalytics()
      setSentryUser(null)
    }
    prev.current = userId
  }, [userId])
  useEffect(() => {
    trackPage(route)
  }, [route])
}

/** #/debug/crash — проверить экран ошибки и отчёт в Sentry (только dev или localStorage vaibik.debug=1) */
const debugRoutes = () => import.meta.env.DEV || localStorage.getItem('vaibik.debug') === '1'

/** Урок/домашка: сначала блокировка тира, потом пейвол Pro */
function Gate({ unitId, children }: { unitId: string; children: ReactNode }) {
  const { progress } = useStore()
  const pay = usePaywall(needsPro(unitId))
  if (isUnitLocked(unitId, progress)) return <LockedScreen tier={tierOfUnit(unitId)} />
  if (pay.loading) return <Blank />
  if (pay.blocked) return <PaywallScreen title={UNITS.find((u) => u.id === unitId)?.title} unitId={unitId} />
  return <>{children}</>
}

/** Возврат из оплаты Polar (?checkout_id=…): ждём вебхук и обновляем статус */
function useCheckoutReturn() {
  const toast = useToast()
  const { refresh } = useSubscription()
  useEffect(() => {
    if (!BILLING_ENABLED) return
    const url = new URL(window.location.href)
    if (!url.searchParams.has('checkout_id')) return
    url.searchParams.delete('checkout_id')
    window.history.replaceState(null, '', url.toString())
    toast(t('x0vyw476'))
    track('checkout_completed', {})
    let tries = 0
    let timer: number | undefined
    const poll = async () => {
      const sub = await refresh()
      if (sub && (sub.status === 'active' || sub.status === 'trialing')) {
        if (sub.status === 'trialing') track('trial_started', { plan: sub.plan ?? undefined })
        toast(t('x0rcuyls'))
        return
      }
      if (++tries < 10) timer = window.setTimeout(poll, 2000)
    }
    poll()
    return () => window.clearTimeout(timer)
  }, [refresh, toast])
}

function AppRoutes({ route }: { route: string }) {
  useCheckoutReturn()

  if (route === '/debug/crash' && debugRoutes()) return <CrashTest />
  if (route.startsWith('/lesson/')) {
    const id = route.slice('/lesson/'.length)
    // уроки закрытого тира по прямой ссылке не открываются
    const unit = findLesson(id)?.unit
    if (!unit) return <LessonScreen key={id} id={id} />
    return (
      <Gate unitId={unit.id}>
        <LessonScreen key={id} id={id} />
      </Gate>
    )
  }
  if (route.startsWith('/homework/')) {
    const id = route.slice('/homework/'.length)
    // закрытый тир — сразу экран «закрыто», без загрузки чанка домашек
    const hw = findHomework(id)
    const screen = (
      <Suspense fallback={<Blank />}>
        <HomeworkScreen key={id} id={id} />
      </Suspense>
    )
    return hw ? <Gate unitId={hw.unitId}>{screen}</Gate> : screen
  }
  if (route.startsWith('/placement/')) {
    const id = route.slice('/placement/'.length)
    return <PlacementScreen key={id} target={id} />
  }
  if (route.startsWith('/tier-up/')) {
    const id = route.slice('/tier-up/'.length)
    return <TierUpScreen key={id} id={id} />
  }

  switch (route) {
    case '/leaderboard':
      return (
        <AppShell active="/leaderboard">
          <Leaderboard />
        </AppShell>
      )
    case '/profile':
      return (
        <AppShell active="/profile">
          <Profile />
        </AppShell>
      )
    case '/quests':
      return (
        <AppShell active="/quests">
          <QuestsSoon />
        </AppShell>
      )
    case '/more':
      return (
        <AppShell active="/more">
          <MoreSoon />
        </AppShell>
      )
    default:
      return (
        <AppShell active="/learn">
          <Home />
        </AppShell>
      )
  }
}
