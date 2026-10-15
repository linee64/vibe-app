import { useLocalSearchParams, useRouter } from 'expo-router'
import { PaywallView } from '../components/Paywall'

/** Маршрут /paywall (модалка поверх экрана): ?title=…&unit=…&source=… */
export default function PaywallRoute() {
  const router = useRouter()
  const params = useLocalSearchParams<{ title?: string; unit?: string; source?: string }>()
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/learn'))
  return <PaywallView title={params.title} unit={params.unit} source={params.source ?? 'paywall'} onClose={back} onPurchased={back} />
}

