import { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FREE_FEATURES, PRO_FEATURES, annualPerMonth, annualSavePct, usd } from '@web/data/pricing'
import { createBilling, type BillingState, type PlanOffer } from '../lib/billing'
import { REVIEW_MODE } from '../lib/env'
import { useStore } from '../store/Store'
import { Mascot } from '../components/Mascot'
import { Btn, Txt } from '../components/ui'
import { useToast } from '../components/Toast'
import { buzz } from '../lib/haptics'
import { C, font } from '../theme'

const billing = createBilling()

/** Пейвол Pro: цены из RevenueCat, иначе демо-цены из общего pricing.ts. Ничего не списывает без ключей. */
export default function PaywallScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const { session } = useStore()
  const [state, setState] = useState<BillingState | null>(null)
  const [plan, setPlan] = useState<PlanOffer | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    void billing.identify(session?.real ? (session.id ?? null) : null)
    void billing.state().then((s) => {
      if (!alive) return
      setState(s)
      setPlan(s.offers.find((o) => o.plan === 'annual') ?? s.offers[0] ?? null)
    })
    return () => {
      alive = false
    }
  }, [session])

  const buy = async () => {
    if (!plan) return
    setBusy(true)
    const res = await billing.purchase(plan)
    setBusy(false)
    if (res.cancelled) return
    if (res.ok) {
      void buzz('ok')
      toast('Pro подключён ✨')
      router.back()
    } else toast(res.message ?? 'Не вышло')
  }
  const restore = async () => {
    setBusy(true)
    const res = await billing.restore()
    setBusy(false)
    toast(res.message ?? (res.pro ? 'Готово' : 'Покупок нет'))
    if (res.pro) router.back()
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.snow }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 18, gap: 12 }}>
      <Pressable accessibilityLabel="Закрыть" onPress={() => router.back()} hitSlop={8} style={{ alignSelf: 'flex-end' }}>
        <Text style={font(900, 24, C.muted)}>✕</Text>
      </Pressable>
      <View style={{ alignItems: 'center' }}>
        <Mascot mood="happy" size={140} />
      </View>
      <Txt w={900} size={28} center>Вайбик Pro</Txt>
      <Txt w={700} size={14} color={C.muted} center>Все разделы, безлимитный заряд Бипи и мини-проекты с проверкой</Txt>

      <View style={{ borderRadius: 18, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, padding: 14, gap: 5 }}>
        {PRO_FEATURES.map((f) => (
          <Txt key={f} w={700} size={14}>✦ {f}</Txt>
        ))}
      </View>
      <Txt w={800} size={12} color={C.muted}>Бесплатно навсегда: {FREE_FEATURES[0].toLowerCase()}</Txt>

      <View style={{ gap: 8 }}>
        {(state?.offers ?? []).map((o) => {
          const on = plan?.plan === o.plan
          return (
            <Pressable key={o.plan} testID={`plan-${o.plan}`} accessibilityState={{ selected: on }} onPress={() => setPlan(o)} style={{ borderRadius: 18, borderWidth: 2, borderBottomWidth: 5, borderColor: on ? C.brand : C.line, borderBottomColor: on ? C.brandDark : C.line, backgroundColor: on ? C.brandLight : C.white, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={font(900, 16)}>{o.title}{o.badge ? `  ${o.badge}` : ''}</Text>
                <Text style={font(700, 13, C.muted)}>
                  {o.price} {o.per}
                  {o.plan === 'annual' ? ` · ${usd(annualPerMonth)}/мес · −${annualSavePct}%` : ''}
                </Text>
                {o.trialDays ? <Text style={font(800, 12, C.tealDark)}>{o.trialDays} дня бесплатно</Text> : null}
              </View>
              <View style={{ width: 22, height: 22, borderRadius: 22, borderWidth: 2, borderColor: on ? C.brand : C.line, backgroundColor: on ? C.brand : 'transparent' }} />
            </Pressable>
          )
        })}
      </View>

      {state?.mode === 'demo' ? (
        <View testID="paywall-demo" style={{ borderRadius: 14, backgroundColor: C.goldLight, padding: 12 }}>
          <Txt w={800} size={13} color={C.goldDark}>Демо: покупки не подключены — {state.reason} Ничего не спишется.</Txt>
        </View>
      ) : state?.pro ? (
        <Txt w={800} size={14} color={C.tealDark} center>Pro уже активен ✨</Txt>
      ) : null}
      {REVIEW_MODE ? <Txt w={700} size={12} color={C.muted} center>Режим ревью: разделы и так открыты, пейвол ничего не блокирует.</Txt> : null}

      <Btn testID="buy" label={busy ? 'Секунду…' : state?.mode === 'demo' ? 'Понятно, это демо' : `Попробовать ${plan?.trialDays ?? 3} дня бесплатно`} block disabled={busy || !plan} onPress={() => (state?.mode === 'demo' ? router.back() : void buy())} />
      <Btn testID="restore" label="Восстановить покупки" tone="ghost" small block disabled={busy} onPress={() => void restore()} />
      <Txt w={600} size={11} color={C.muted} center>Подписка продлевается автоматически, отменить можно в настройках App Store или Google Play. Оплата идёт через магазин приложений — веб-оплата внутри приложения недоступна.</Txt>
    </ScrollView>
  )
}
