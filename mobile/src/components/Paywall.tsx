/**
 * Пейвол Pro — как PaywallScreen веба (нижний лист: Бипи, 4 плюса Pro, месяц/год, коралловая кнопка).
 * Цены — строки App Store / Google Play из RevenueCat (в местной валюте); «в месяц» для годового — из
 * pricePerMonthString или цены года / 12 в той же валюте. Демо без ключей — цены веба в $.
 * Если Pro уже активен — показываем «Pro уже активен» и «Управлять подпиской» вместо пробного периода.
 */
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PRO_FEATURES } from '@web/data/pricing'
import { t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'
import { createBilling, formatMoney, useProInfo, type BillingState, type Plan, type PlanOffer } from '../lib/billing'
import { ProActiveCard } from './ProStatus'
import { useRouter } from 'expo-router'
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

/** Название тарифа как в App Store Connect: «Vaibik Pro — yearly» (из стора, иначе из каталога) */
export function planName(o: PlanOffer) {
  return o.storeTitle || t(o.plan === 'annual' ? 'paywall.planYearly' : 'paywall.planMonthly')
}

/** Полная цена за период, крупно: «$59.99 / year», «$9.99 / month» (Guideline 3.1.2: сумма за период — главная) */
export function planPrice(o: PlanOffer) {
  return t(o.plan === 'annual' ? 'paywall.priceYear' : 'paywall.priceMonth', { price: o.price })
}

/** Подпись тарифа (для тестов и доступности): название + цена за период */
export function planLabel(o: PlanOffer) {
  return `${planName(o)} · ${planPrice(o)}`
}

/** Условия пробного периода: «3-day free trial, then $59.99 per year» */
function trialTerms(o: PlanOffer, days: number) {
  return t(o.plan === 'annual' ? 'paywall.trialThenYear' : 'paywall.trialThenMonth', { days, price: o.price })
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

  /** Номер попытки: растёт при «Повторить» и автоповторах — перезапускает загрузку цен */
  const [attempt, setAttempt] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout> | undefined
    setLoading(true)
    void (async () => {
      await billing.identify(session?.real ? (session.id ?? null) : null)
      const s = await billing.state()
      if (!alive) return
      setState(s)
      setLoading(false)
      if (!s.offers.some((o) => o.plan === 'annual') && s.offers[0]) setPlan(s.offers[0].plan)
      // цены не загрузились (сеть, StoreKit ещё не отдал продукты) — молча пробуем ещё до 3 раз, дальше — кнопка «Повторить»
      if (s.mode === 'error' && attempt < 3) timer = setTimeout(() => alive && setAttempt((n) => n + 1), [2000, 4000, 8000][attempt])
    })()
    return () => {
      alive = false
      if (timer) clearTimeout(timer)
    }
  }, [session, attempt])
  const failed = state?.mode === 'error'
  const retry = () => {
    setState(null)
    setAttempt((n) => n + 1)
  }

  const offers = useMemo(() => {
    const list = state?.offers ?? []
    return (['monthly', 'annual'] as const).map((p) => list.find((o) => o.plan === p)).filter((o): o is PlanOffer => !!o)
  }, [state])
  const offer = offers.find((o) => o.plan === plan) ?? offers[0] ?? null
  const demo = state?.mode === 'demo'
  // общий статус Pro: обновляется сразу после покупки/восстановления (слушатель RevenueCat) — пейвол превращается в статус
  const proInfo = useProInfo()
  const pro = proInfo.pro
  const router = useRouter()

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
    if (res.pro) setState((s) => (s ? { ...s, pro: true } : s)) // статус Pro уже обновлён в billing.ts
  }

  const trialDays = offer?.trialDays ?? null
  const cta = busy ? t('x15d421k') : demo ? t('x0n3k6d9') : trialDays ? t('x1bsn2w4', { TRIAL_DAYS: trialDays }) : offer ? `${planName(offer)} · ${planPrice(offer)}` : t('x15d421k')

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
              <Text style={[font(900, 24), { lineHeight: 29 }]}>{pro ? t('x16nd0og') : params.title ? t('x044jpau', { title: params.title }) : t('x1xtdtme')}</Text>
            </View>
          </View>

          {pro ? (
            <View testID="paywall-pro-active">
              <ProActiveCard pro={proInfo} style={{ marginTop: 16 }} />
              <Btn testID="paywall-manage" block big label={t('pro.toSettings')} onPress={() => {
                back()
                router.push('/(tabs)/settings')
              }} style={{ marginTop: 16 }} />
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

              {loading && !state ? (
                <View testID="paywall-loading" style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 20 }}>
                  <ActivityIndicator color={C.brand} />
                  <Text style={font(700, 15, C.muted)}>{t('paywall.loading')}</Text>
                </View>
              ) : failed ? (
                <View testID="paywall-error" accessibilityRole="alert" style={{ marginTop: 20, borderRadius: 16, backgroundColor: C.coralLight, padding: 16 }}>
                  <Text style={font(900, 16, C.coralDark)}>{t('paywall.loadError')}</Text>
                  <Text style={[font(600, 14, C.ink), { marginTop: 4, lineHeight: 19 }]}>{t('paywall.loadErrorHint')}</Text>
                  <Btn testID="paywall-retry" tone="coral" block label={t('paywall.retry')} onPress={retry} style={{ marginTop: 12 }} />
                </View>
              ) : (
                <View accessibilityRole="radiogroup" accessibilityLabel={t('x0uh9q75')} style={{ marginTop: 20, gap: 10 }}>
                  {offers.map((o) => {
                    const on = offer?.plan === o.plan
                    return (
                      <Pressable
                        key={o.plan}
                        testID={`plan-${o.plan}`}
                        accessibilityRole="radio"
                        accessibilityLabel={`${planName(o)}, ${planPrice(o)}`}
                        accessibilityState={{ checked: on }}
                        onPress={() => setPlan(o.plan)}
                        style={{ borderRadius: 16, borderWidth: 2, borderColor: on ? C.brand : C.line, backgroundColor: on ? C.brandLight : C.white, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                      >
                        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? C.brand : C.line, backgroundColor: on ? C.brand : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                          {on ? <Check size={12} color={C.white} /> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                            <Text style={font(900, 16, on ? C.brand : C.ink)}>{planName(o)}</Text>
                            {o.badge ? (
                              <View style={{ borderRadius: 99, backgroundColor: C.gold, paddingHorizontal: 6, paddingVertical: 1 }}>
                                <Text style={font(900, 11, C.goldInk)}>{t('paywall.save', { pct: o.badge.replace(/\D/g, '') })}</Text>
                              </View>
                            ) : null}
                          </View>
                          <Text style={[font(900, 20, C.ink), { marginTop: 2 }]}>{planPrice(o)}</Text>
                          {o.trialDays ? <Text style={[font(700, 13, C.tealDark), { marginTop: 2 }]}>{trialTerms(o, o.trialDays)}</Text> : null}
                          {o.plan === 'annual' && o.perMonth ? <Text style={[font(600, 12, C.muted), { marginTop: 2 }]}>{t('x09cu3l6', { annualPerMonth: o.perMonth })}</Text> : null}
                        </View>
                      </Pressable>
                    )
                  })}
                </View>
              )}

              {failed ? null : (
                <>
                  <Btn testID="buy" tone="coral" block big label={cta} disabled={busy || !offer} onPress={() => void buy()} style={{ marginTop: 16 }} />
                  {offer ? (
                    <Text testID="paywall-terms-line" style={[font(700, 13, C.ink), { marginTop: 8, textAlign: 'center' }]}>
                      {trialDays ? trialTerms(offer, trialDays) : `${planName(offer)} · ${planPrice(offer)}`}
                    </Text>
                  ) : null}
                </>
              )}
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
            <Text testID="paywall-disclosure" style={[font(600, 11, C.muted), { textAlign: 'center', lineHeight: 15 }]}>{t('paywall.disclosure')}</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Pressable accessibilityRole="link" testID="paywall-terms" onPress={() => openLegal('terms')} hitSlop={6}>
                <Text style={[font(700, 12, C.muted), { textDecorationLine: 'underline' }]}>{t('legal.terms')}</Text>
              </Pressable>
              <Pressable accessibilityRole="link" testID="paywall-privacy" onPress={() => openLegal('privacy')} hitSlop={6}>
                <Text style={[font(700, 12, C.muted), { textDecorationLine: 'underline' }]}>{t('x1y9umvl')}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </FadeUp>
    </View>
  )
}
