import { Redirect } from 'expo-router'
import { useStore } from '../store/Store'

/** Корень «/»: раньше тут был «Unmatched Route» — теперь сразу на путь или на вход */
export default function Index() {
  const { session, authReady } = useStore()
  if (!authReady) return null
  return <Redirect href={session ? '/(tabs)/learn' : '/(auth)/login'} />
}
