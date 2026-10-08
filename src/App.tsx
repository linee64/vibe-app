import { lazy, Suspense, useEffect } from 'react'
import { useStore } from './store'
import { navigate, useRoute } from './router'
import { AppShell } from './components/Layout'
import { Login } from './screens/Login'
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
import { isUnitLocked, tierOfUnit } from './data/tiers'

// Домашки (симулятор ИИ + превью) — отдельный чанк, грузится при первом открытии
const HomeworkScreen = lazy(() => import('./screens/Homework').then((m) => ({ default: m.HomeworkScreen })))

export default function App() {
  const { session, progress } = useStore()
  const route = useRoute()

  // «/» — публичный лендинг для гостей; «/landing» — лендинг всегда (и для вошедших);
  // «/pricing» — лендинг, прокрученный к тарифам
  const isPublic = route === '/' || route === '/landing' || route === '/pricing'

  useEffect(() => {
    if (!session && route !== '/login' && !isPublic) navigate('/login')
    if (session && (route === '/login' || route === '/')) navigate('/learn')
  }, [session, route, isPublic])

  if (route === '/pricing') return <Landing section="pricing" />
  if (route === '/landing' || (!session && route === '/')) return <Landing />
  if (!session) return <Login />

  if (route.startsWith('/lesson/')) {
    const id = route.slice('/lesson/'.length)
    // уроки закрытого тира по прямой ссылке не открываются
    const unit = findLesson(id)?.unit
    if (unit && isUnitLocked(unit.id, progress)) return <LockedScreen tier={tierOfUnit(unit.id)} />
    return <LessonScreen key={id} id={id} />
  }
  if (route.startsWith('/homework/')) {
    const id = route.slice('/homework/'.length)
    // закрытый тир — сразу экран «закрыто», без загрузки чанка домашек
    const hw = findHomework(id)
    if (hw && isUnitLocked(hw.unitId, progress)) return <LockedScreen tier={tierOfUnit(hw.unitId)} />
    return (
      <Suspense fallback={<div className="min-h-dvh bg-white" />}>
        <HomeworkScreen key={id} id={id} />
      </Suspense>
    )
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
