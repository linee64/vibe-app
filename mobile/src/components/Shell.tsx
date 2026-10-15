/**
 * Оболочка вкладок — как AppShell в вебе на телефоне (src/components/Layout.tsx + Economy.tsx):
 * сверху панель экономики (Бипи, деплой-серия, токены, заряд, отзыв), снизу 5 цветных вкладок.
 */
import { useState, type ComponentProps, type ReactNode } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { Tabs, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CHARGE_MAX, RECHARGE_COST, RECHARGE_MINUTES, SHOP, days, tokens, waitText } from '@web/data/economy'
import { hhmm } from '@web/data/charge'
import { t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'
import { useStore } from '../store/Store'
import { useFeedback } from './feedbackContext'
import { useToast } from './Toast'
import { FeedbackBubble, MascotHead, NavLearn, NavLeague, NavMore, NavProfile, NavQuests, Rocket } from './art'
import { Battery, ChargeMeter, Token } from './ui'
import { useClaimable } from '../lib/quests'
import { track } from '../lib/analytics'
import { buzz } from '../lib/haptics'
import { C, caps, font } from '../theme'

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0]
type Panel = 'streak' | 'tokens' | 'charge' | null

export const HEADER_HEIGHT = 58

/** Шапка вкладок: экономика + «Оставить отзыв» */
export function TopBar() {
  const insets = useSafeAreaInsets()
  const { progress, chargeAt, fullAt, spendGems, refillHearts } = useStore()
  const toast = useToast()
  const feedback = useFeedback()
  const router = useRouter()
  const [open, setOpen] = useState<Panel>(null)
  const toggle = (p: Panel) => setOpen((o) => (o === p ? null : p))
  const full = progress.hearts >= CHARGE_MAX

  const item = (on: boolean) => ({ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6, backgroundColor: on ? C.snow : 'transparent' })

  return (
    <View style={{ backgroundColor: C.white, paddingTop: insets.top, borderBottomWidth: 2, borderBottomColor: C.line }} testID="economy-bar">
      <View style={{ height: HEADER_HEIGHT - 2, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 8, gap: 4 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable accessibilityLabel={t('x1etmf9m')} onPress={() => toast(t('x106qnot'))} style={item(false)}>
            <View style={{ width: 32, height: 32, borderRadius: 8, borderWidth: 2, borderColor: C.line, backgroundColor: C.brandLight, alignItems: 'center', justifyContent: 'center' }}>
              <MascotHead size={24} />
            </View>
          </Pressable>
          <Pressable testID="eco-streak" accessibilityLabel={t('x1hz6q6f')} onPress={() => toggle('streak')} style={item(open === 'streak')}>
            <Rocket size={26} />
            <Text style={font(800, 17, C.brandDark)}>{progress.streak}</Text>
          </Pressable>
          <Pressable testID="eco-tokens" accessibilityLabel={t('x1rvk2vc')} onPress={() => toggle('tokens')} style={item(open === 'tokens')}>
            <Token size={26} />
            <Text style={font(800, 17, C.tealDark)}>{progress.gems}</Text>
          </Pressable>
          <Pressable testID="eco-charge" accessibilityLabel={t('x1k9q8ch')} onPress={() => toggle('charge')} style={item(open === 'charge')}>
            <ChargeMeter value={progress.hearts} size={22} />
          </Pressable>
        </View>
        <Pressable testID="feedback-header" accessibilityLabel={t('x1kira6i')} onPress={() => feedback.open('header')} style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <FeedbackBubble size={26} />
        </Pressable>
      </View>

      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <Pressable style={{ flex: 1 }} onPress={() => setOpen(null)} accessibilityLabel={t('x09wpu9j')}>
          <View style={{ position: 'absolute', left: 12, right: 12, top: insets.top + HEADER_HEIGHT + 6 }}>
            <Pressable onPress={() => {}} style={{ borderRadius: 20, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, padding: 16, borderBottomWidth: 8, borderBottomColor: 'rgba(43,33,80,0.06)' }}>
              {open === 'streak' ? (
                <PanelCard title={t('x0obln5j', { streak: days(progress.streak) })} icon={<Rocket size={24} />}>
                  <Text style={[font(600, 14, C.muted), { lineHeight: 19 }]}>{t('x1smjre7')}</Text>
                  <View style={{ marginTop: 12, flexDirection: 'row', gap: 6 }}>
                    {Array.from({ length: 7 }, (_, i) => {
                      const on = i < Math.min(7, progress.streak)
                      return (
                        <View key={i} style={{ flex: 1, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? C.brand : C.line }}>
                          <Text style={font(900, 12, on ? C.white : C.muted)}>v{i + 1}</Text>
                        </View>
                      )
                    })}
                  </View>
                </PanelCard>
              ) : open === 'tokens' ? (
                <PanelCard title={t('x13ebedu', { gems: progress.gems })} icon={<Token size={24} />}>
                  <Text style={[font(600, 13, C.muted), { lineHeight: 18, marginBottom: 12 }]}>{t('x0qq83zl')}</Text>
                  <View style={{ gap: 8 }} testID="shop">
                    {SHOP.map((s) => {
                      const canBuy = s.id === 'recharge' && !full && progress.gems >= s.cost
                      return (
                        <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 2, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 8 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={font(900, 14)}>{s.id === 'skin' ? t('wardrobe.title') : s.title}</Text>
                            <Text style={[font(600, 12, C.muted), { lineHeight: 16 }]}>{s.id === 'skin' ? t('wardrobe.shopDesc') : s.desc}</Text>
                          </View>
                          {s.id === 'recharge' ? (
                            <Pressable
                              testID="shop-recharge"
                              disabled={!canBuy}
                              onPress={() => {
                                if (spendGems(RECHARGE_COST)) {
                                  void buzz('ok')
                                  track('tokens_spent', { reason: 'recharge', amount: RECHARGE_COST, where: 'shop' })
                                  refillHearts()
                                  toast(t('x159sjwb'))
                                }
                              }}
                              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, backgroundColor: canBuy ? C.teal : C.line, paddingHorizontal: 10, paddingVertical: 6 }}
                            >
                              <Token size={16} />
                              <Text style={font(900, 13, canBuy ? C.white : C.muted)}>{s.cost}</Text>
                            </Pressable>
                          ) : s.id === 'skin' ? (
                            <Pressable
                              testID="shop-wardrobe"
                              onPress={() => {
                                setOpen(null)
                                router.push('/(tabs)/wardrobe')
                              }}
                              style={{ borderRadius: 12, backgroundColor: C.brand, paddingHorizontal: 10, paddingVertical: 6 }}
                            >
                              <Text style={font(900, 13, C.white)}>{t('wardrobe.open')}</Text>
                            </Pressable>
                          ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, backgroundColor: C.snow, paddingHorizontal: 10, paddingVertical: 6 }}>
                              {s.soon ? <Text style={font(900, 13, C.muted)}>{t('x0z77pc6')}</Text> : <><Token size={16} /><Text style={font(900, 13, C.muted)}>{s.cost}</Text></>}
                            </View>
                          )}
                        </View>
                      )
                    })}
                  </View>
                </PanelCard>
              ) : open === 'charge' ? (
                <PanelCard title={t('x1iykqb0', { hearts: progress.hearts, CHARGE_MAX })} icon={<Battery size={22} level={progress.hearts} />}>
                  <View style={{ gap: 6 }}>
                    <Text style={[font(600, 14, C.muted), { lineHeight: 19 }]}>{t('x1bwsbbd')}</Text>
                    <Text style={[font(600, 14, C.muted), { lineHeight: 19 }]}>{t('economy.rechargeEvery', { min: RECHARGE_MINUTES })}{chargeAt ? t('x0p88rx4', { chargeAt: waitText(chargeAt) }) : ''}.</Text>
                    {fullAt ? <Text style={[font(800, 14, C.tealDark), { lineHeight: 19 }]}>{t('lesson.fullChargeIn', { time: hhmm(fullAt) })}</Text> : null}
                    <Text style={[font(600, 14, C.muted), { lineHeight: 19 }]}>{t('x0398cbq')}</Text>
                    <Text style={[font(600, 14, C.muted), { lineHeight: 19 }]}>{tx('x0s5mlrg', { RECHARGE_COST: tokens(RECHARGE_COST) }, [() => <Token size={14} />])}</Text>
                  </View>
                  {full ? <Text style={[font(800, 13, C.tealDark), { marginTop: 8 }]}>{t('x06ihfxg')}</Text> : null}
                </PanelCard>
              ) : null}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

function PanelCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <View accessibilityRole="summary" accessibilityLabel={title}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {icon}
        <Text style={[font(900, 17), { flexShrink: 1 }]}>{title}</Text>
      </View>
      {children}
    </View>
  )
}

/** 5 вкладок как в вебе; скрытые экраны (гардероб, словарик, настройки, помощь) подсвечивают «родительскую» */
const NAV = [
  { name: 'learn', label: () => t('x192hq8j'), Icon: NavLearn },
  { name: 'quests', label: () => t('x1rejxdo'), Icon: NavQuests },
  { name: 'league', label: () => t('x04w787b'), Icon: NavLeague },
  { name: 'profile', label: () => t('x0ez1von'), Icon: NavProfile },
  { name: 'more', label: () => t('x0vosrby'), Icon: NavMore },
] as const
const PARENT: Record<string, string> = { wardrobe: 'profile', glossary: 'profile', settings: 'more', help: 'more' }

export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const claimable = useClaimable()
  const routeName = state.routes[state.index]?.name ?? 'learn'
  const active = PARENT[routeName] ?? routeName
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 2, borderTopColor: C.line, backgroundColor: C.white, paddingHorizontal: 8, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 8) }}>
      {NAV.map(({ name, label, Icon }) => {
        const on = active === name
        return (
          <Pressable
            key={name}
            testID={`tab-${name}`}
            accessibilityRole="tab"
            accessibilityLabel={label()}
            accessibilityState={{ selected: on }}
            onPress={() => {
              void buzz('tap')
              navigation.navigate(name as never)
            }}
            style={{ width: 56, height: 48, borderRadius: 16, borderWidth: 2, borderColor: on ? C.brandMid : 'transparent', backgroundColor: on ? C.brandLight : 'transparent', alignItems: 'center', justifyContent: 'center' }}
          >
            <View>
              <Icon size={30} />
              {name === 'quests' && claimable > 0 ? (
                <View testID="quests-badge" accessibilityLabel={t('quests.badge', { n: claimable })} style={{ position: 'absolute', right: -4, top: -4, minWidth: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.white, backgroundColor: C.coral, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                  <Text style={font(900, 11, C.white)}>{claimable}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}

/** Заголовок раздела «uppercase tracking-wider» с линиями по бокам */
export function Kicker({ children, color = C.brand }: { children: string; color?: string }) {
  return <Text style={[font(800, 13, color), caps(13)]}>{children}</Text>
}
