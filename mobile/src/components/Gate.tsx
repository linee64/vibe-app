/**
 * Вход в урок/домашку — как Gate и IntroScreen в src/App.tsx веба:
 * новичок перед первым уроком видит тур «Как это работает», закрытый тир/шаг — экран «пока закрыто»,
 * Pro-раздел без подписки — пейвол.
 */
import { useEffect, type ReactNode } from 'react'
import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { UNITS } from '@web/data/course'
import { TIERS, isTierUnlocked, isUnitLocked, needsPro, tierItems, tierOfUnit, type Tier } from '@web/data/tiers'
import { isNodeReachable } from '@web/data/path'
import { t } from '@web/i18n/core'
import { useStore } from '../store/Store'
import { useProStatus } from '../lib/billing'
import { Mascot, TierBadge } from './art'
import { Btn } from './ui'
import { PaywallView } from './Paywall'
import { C, font } from '../theme'

export const needsIntro = (p: { completed: string[]; homework: string[]; introSeen?: boolean }) => !p.introSeen && p.completed.length === 0 && p.homework.length === 0

export function LockedView({ tier }: { tier: Tier }) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { progress } = useStore()
  const tierOpen = isTierUnlocked(tier, progress)
  const prev = TIERS[TIERS.findIndex((x) => x.id === tier.id) - 1]
  const items = prev ? tierItems(prev, progress) : []
  const done = items.filter((i) => i.done).length
  return (
    <View testID="locked-screen" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, paddingTop: insets.top + 24, backgroundColor: C.white }}>
      <View>
        <Mascot mood="think" size={130} />
        <View style={{ position: 'absolute', right: -16, bottom: 8 }}>
          <TierBadge tier={tier} size={56} locked />
        </View>
      </View>
      <Text style={[font(900, 26), { lineHeight: 31, textAlign: 'center' }]}>{tierOpen ? t('path.lockedTitle') : t('x0sn18rr', { name: tier.name })}</Text>
      <Text style={[font(600, 16, C.muted), { maxWidth: 380, textAlign: 'center' }]}>{tierOpen || !prev ? t('path.locked') : t('path.tierLocked', { name: prev.name, done, length: items.length })}</Text>
      <Btn block label={t('path.toCurrent')} onPress={() => router.replace('/(tabs)/learn')} style={{ marginTop: 8, alignSelf: 'stretch' }} />
    </View>
  )
}

export function Gate({ unitId, nodeId, path, children }: { unitId: string; nodeId: string; path: string; children: ReactNode }) {
  const router = useRouter()
  const { progress } = useStore()
  const { pro, loading } = useProStatus()
  const intro = needsIntro(progress)
  useEffect(() => {
    if (intro) router.replace({ pathname: '/intro', params: { entry: 'first_lesson', next: path } })
  }, [intro, path, router])
  if (intro) return <View style={{ flex: 1, backgroundColor: C.white }} />
  if (isUnitLocked(unitId, progress) || !isNodeReachable(nodeId, progress)) return <LockedView tier={tierOfUnit(unitId)} />
  if (needsPro(unitId) && !pro) {
    if (loading) return <View style={{ flex: 1, backgroundColor: C.white }} />
    return <PaywallView title={UNITS.find((u) => u.id === unitId)?.title} unit={unitId} source="unit_gate" onClose={() => router.replace('/(tabs)/learn')} onPurchased={() => {}} />
  }
  return <>{children}</>
}
