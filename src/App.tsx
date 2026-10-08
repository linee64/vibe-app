import { useEffect } from 'react'
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

export default function App() {
  const { session } = useStore()
  const route = useRoute()

  // «/» — публичный лендинг для гостей; «/landing» — лендинг всегда (и для вошедших)
  const isPublic = route === '/' || route === '/landing'

  useEffect(() => {
    if (!session && route !== '/login' && !isPublic) navigate('/login')
    if (session && (route === '/login' || route === '/')) navigate('/learn')
  }, [session, route, isPublic])

  if (route === '/landing' || (!session && route === '/')) return <Landing />
  if (!session) return <Login />

  if (route.startsWith('/lesson/')) {
    const id = route.slice('/lesson/'.length)
    return <LessonScreen key={id} id={id} />
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
