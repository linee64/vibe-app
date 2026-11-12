import { Redirect } from 'expo-router'
import { useStore } from '../store/Store'
import { startRoute } from '../lib/guide'

/** Корень «/»: гость — на приглашение Бипи, новичок — в первый урок, остальные — на путь */
export default function Index() {
  const { session, authReady, progress, progressReady, progressSynced } = useStore()
  if (!authReady || (session && !progressReady)) return null
  if (!session) return <Redirect href="/(auth)/welcome" />
  const dest = startRoute(progress, progressSynced)
  if (dest === `/lesson/u1-1`) return <Redirect href={{ pathname: '/lesson/[id]', params: { id: 'u1-1' } }} />
  return <Redirect href={dest} />
}
