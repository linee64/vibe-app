/**
 * Пейвол Pro — как PaywallScreen веба (нижний лист: Бипи, 4 плюса Pro, месяц/год, коралловая кнопка).
 * Цены — строки App Store / Google Play из RevenueCat (в местной валюте); «в месяц» для годового — из
 * pricePerMonthString или цены года / 12 в той же валюте. Демо без ключей — цены веба в $.
 * Если Pro уже активен — показываем «Pro уже активен» и «Управлять подпиской» вместо пробного периода.
 */
import { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PRO_FEATURES } from '@web/data/pricing'
import { t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'
import { createBilling, formatMoney, manageSubscriptions, type BillingState, type Plan, type PlanOffer } from '../lib/billing'
import { REVIEW_MODE } from '../lib/env'
import { openLegal } from '../lib/legal'
import { useStore } from '../store/Store'
import { Check, Mascot } from './art'
import { Btn } from './ui'
import { FadeUp, Float } from './motion'
import { useToast } from './Toast'
import { buzz } from '../lib/haptics'
import { track } from '../lib/analytics'
import { requestMicroPrompt } from '../lib/feedback'
import { C, alpha, caps, font } from '../theme'

const billing = createBilling()

/** Подпись тарифа в переключателе: «2 490 ₸ / мес»; годовой без «в месяц» — цена за год */
export function planLabel(o: PlanOffer) {
  if (o.plan === 'monthly') return t('x1iktayt', { monthly: o.price })
  return o.perMonth ? t('x09cu3l6', { annualPerMonth: o.perMonth }) : `${o.price} ${o.per}`
}

/** «Сегодня $0. Через 3 дня — …»: ноль — в валюте стора */
function afterTrial(o: PlanOffer, days: number) {
  const line = t(o.plan === 'annual' ? 'pricing.afterTrialYear' : 'pricing.afterTrialMonth', { days, price: o.price })
  return o.currency ? line.replace('$0', formatMoney(0, o.currency) ?? '0') : line
}

export function PaywallView({ title, unit, source, onClose, onPurchased }: { title?: string; unit?: string; source: string; onClose: () => void; onPurchased: () => void }) {
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const { session } = useStore()
  const params = { title, unit }
  const [state, setState] = useState<BillingState | null>(null)
  const [plan, setPlan] = useState<Plan>('annual')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    track('paywall_viewed', { source, unit: params.unit })
  }, [source, params.unit])

  useEffect(() => {
    let alive = true
    void billing.identify(session?.real ? (session.id ?? null) : null)
    void billing.state().then((s) => {
      if (!alive) return
      setState(s)
      if (!s.offers.some((o) => o.plan === 'annual') && s.offers[0]) setPlan(s.offers[0].plan)
    })
    return () => {
      alive = false
    }
  }, [session])

  const offers = useMemo(() => {
    const list = state?.offers ?? []
    return (['monthly', 'annual'] as const).map((p) => list.find((o) => o.plan === p)).filter((o): o is PlanOffer => !!o)
  }, [state])
  const offer = offers.find((o) => o.plan === plan) ?? offers[0] ?? null
  const demo = state?.mode === 'demo'
  const pro = !!state?.pro

  const back = onClose
  /** Ушли без покупки — короткий вопрос «Что остановило?» (уже на пути, не поверх пейвола) */
  const close = () => {
    track('paywall_closed', { source, unit: params.unit })
    if (!pro) void requestMicroPrompt('paywall_exit')
    back()
  }

  const buy = async () => {
    if (!offer || busy) return
    if (demo) return close()
    setBusy(true)
    track('checkout_started', { plan: offer.plan, source })
    const res = await billing.purchase(offer)
    setBusy(false)
    if (res.cancelled) return
    if (res.ok) {
      track('checkout_completed', { plan: offer.plan })
      if (offer.trialDays) track('trial_started', { plan: offer.plan, days: offer.trialDays })
      void buzz('ok')
      toast(t('x08exxgh'))
      onPurchased()
    } else toast(res.message ?? t('x1e46iff'))
  }
  const restore = async () => {
    setBusy(true)
    const res = await billing.restore()
    setBusy(false)
    toast(res.message ?? (res.pro ? t('x1e0jmys') : t('x0orhexg')))
    if (res.pro) setState((s) => (s ? { ...s, pro: true } : s))
  }

  const trialDays = offer?.trialDays ?? null
  const cta = busy ? t('x15d421k') : demo ? t('x0n3k6d9') : trialDays ? t('x1bsn2w4', { TRIAL_DAYS: trialDays }) : offer ? `${offer.title} · ${offer.price}` : t('x15d421k')

  return (
    <View testID="paywall" style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: alpha(C.ink, 0.4) }}>
      <Pressable accessibilityLabel={t('x09wpu9j')} onPress={close} style={{ flex: 1, minHeight: insets.top + 24 }} />
      <FadeUp>
        <ScrollView
          bounces={false}
          style={{ maxHeight: 760, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: C.white }}
          contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 32 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Float>
              <Mascot mood="happy" size={84} />
            </Float>
            <View style={{ flex: 1 }}>
              <Text style={[font(900, 13, C.coral), caps(13)]}>{t('x0x0c6hg')}</Text>
              <Text style={[font(900, 24), { lineHeight: 29 }]}>{pro ? t('x16nd0og') : params.title ? t('x044jpau', { title: params.title }) : t('x1hbxwho')}</Text>
            </View>
          </View>

          {pro ? (
            <View testID="paywall-pro-active">
              <Text style={[font(600, 16, C.muted), { marginTop: 12, lineHeight: 22 }]}>{t('x1abqfqj')}</Text>
              <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 2, borderColor: C.teal, backgroundColor: alpha(C.tealLight, 0.5), padding: 14 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={16} color={C.white} />
                </View>
                <Text style={[font(900, 16, C.tealDark), { flex: 1 }]}>{t('x0qd05yb')}</Text>
              </View>
              {!demo ? <Btn testID="paywall-manage" tone="teal" block big label={t('x0nbowwd')} onPress={() => manageSubscriptions(state?.managementURL)} style={{ marginTop: 16 }} /> : null}
              <Btn tone="ghost" block label={t('x09wpu9j')} onPress={back} style={{ marginTop: 12 }} />
            </View>
          ) : (
            <View>
              <Text style={[font(600, 16, C.muted), { marginTop: 12, lineHeight: 22 }]}>{tx('x0jpvemb', { TRIAL_DAYS: trialDays ?? 3 })}</Text>
              <View style={{ marginTop: 16, gap: 8 }}>
                {PRO_FEATURES().slice(0, 4).map((f) => (
                  <View key={f} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                    <View style={{ marginTop: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: C.tealLight, alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} color={C.tealDark} />
                    </View>
                    <Text style={[font(700, 15), { flex: 1, lineHeight: 21 }]}>{f}</Text>
                  </View>
                ))}
              </View>

              {offers.length > 1 ? (
                <View accessibilityRole="radiogroup" accessibilityLabel={t('x0uh9q75')} style={{ marginTop: 20, flexDirection: 'row', gap: 8, borderRadius: 16, backgroundColor: C.snow, padding: 6 }}>
                  {offers.map((o) => {
                    const on = offer?.plan === o.plan
                    return (
                      <Pressable
                        key={o.plan}
                        testID={`plan-${o.plan}`}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: on }}
                        onPress={() => setPlan(o.plan)}
                        style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 10, backgroundColor: on ? C.white : 'transparent', borderBottomWidth: on ? 3 : 0, borderBottomColor: C.line, marginBottom: on ? 0 : 3 }}
                      >
                        <Text style={font(800, 15, on ? C.brand : C.muted)}>{planLabel(o)}</Text>
                        {o.badge ? (
                          <View style={{ borderRadius: 99, backgroundColor: C.gold, paddingHorizontal: 6, paddingVertical: 1 }}>
                            <Text style={font(900, 11, C.goldInk)}>{o.badge}</Text>
                          </View>
                        ) : null}
                      </Pressable>
                    )
                  })}
                </View>
              ) : null}

              <Btn testID="buy" tone="coral" block big label={cta} disabled={busy || !offer} onPress={() => void buy()} style={{ marginTop: 16 }} />
              {offer && trialDays ? <Text testID="paywall-after-trial" style={[font(600, 13, C.muted), { marginTop: 8, textAlign: 'center' }]}>{afterTrial(offer, trialDays)}</Text> : offer ? <Text style={[font(600, 13, C.muted), { marginTop: 8, textAlign: 'center' }]}>{`${offer.price} ${offer.per}`}</Text> : null}
              <Btn testID="paywall-close" tone="ghost" block label={t('x0vau8r7')} onPress={close} style={{ marginTop: 12 }} />
            </View>
          )}

          {demo ? (
            <View testID="paywall-demo" style={{ marginTop: 16, borderRadius: 14, backgroundColor: C.goldLight, padding: 12 }}>
              <Text style={font(800, 13, C.goldDark)}>{t('x01e2w1o', { reason: state?.reason ?? '' })}</Text>
            </View>
          ) : null}
          {REVIEW_MODE ? <Text style={[font(700, 12, C.muted), { marginTop: 8, textAlign: 'center' }]}>{t('x1i79sll')}</Text> : null}

          {/* App Store 3.1.2: восстановление, автопродление, ссылки на условия и политику */}
          <View style={{ marginTop: 16, alignItems: 'center', gap: 8 }}>
            {!pro ? (
              <Pressable testID="restore" accessibilityRole="button" disabled={busy} onPress={() => void restore()} hitSlop={6}>
                <Text style={[font(800, 13, C.brand), caps(13)]}>{t('x08lcpuz')}</Text>
              </Pressable>
            ) : null}
            <Text style={[font(600, 11, C.muted), { textAlign: 'center', lineHeight: 15 }]}>{t('x0reciq9')}</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Pressable accessibilityRole="link" onPress={() => openLegal('terms')} hitSlop={6}>
                <Text style={[font(700, 12, C.muted), { textDecorationLine: 'underline' }]}>{t('legal.terms')}</Text>
              </Pressable>
              <Pressable accessibilityRole="link" onPress={() => openLegal('privacy')} hitSlop={6}>
                <Text style={[font(700, 12, C.muted), { textDecorationLine: 'underline' }]}>{t('x1y9umvl')}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </FadeUp>
    </View>
  )
}
