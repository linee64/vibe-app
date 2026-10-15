/** «Тир пройден!» — как src/screens/TierUp.tsx (один раз на тир) */
import { useEffect } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { findTier, isTierPassed, nextTier } from '@web/data/tiers'
import { UNIT_COLORS } from '@web/data/types'
import { t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'
import { useStore } from '../../store/Store'
import { setLastNode } from '../../lib/flow'
import { track } from '../../lib/analytics'
import { playSound } from '../../lib/sound'
import { Check, Mascot, TierBadge } from '../../components/art'
import { Confetti, Pop } from '../../components/motion'
import { Btn } from '../../components/ui'
import { C, alpha, caps, font } from '../../theme'

export default function TierUpScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { progress, markTierCelebrated } = useStore()
  const tier = findTier(id)
  const passed = tier ? isTierPassed(tier, progress) : false

  useEffect(() => {
    if (!tier || !passed) return void router.replace('/(tabs)/learn')
    if (!progress.tiersCelebrated.includes(tier.id)) {
      playSound('levelup')
      track('tier_unlocked', { tier: nextTier(tier)?.id ?? 'soon', via: 'progress', completed_tier: tier.id })
    }
    markTierCelebrated(tier.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, passed, markTierCelebrated])

  if (!tier || !passed) return null
  const next = nextTier(tier)
  const c = UNIT_COLORS[tier.color]
  const go = () => {
    setLastNode(next ? `tier-${next.id}` : 'explore')
    router.replace('/(tabs)/learn')
  }
  return (
    <View testID={`tier-up-${tier.id}`} style={{ flex: 1, backgroundColor: C.white }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingTop: insets.top + 40, paddingBottom: 40, overflow: 'hidden' }}>
        <View pointerEvents="none" style={{ position: 'absolute', top: '18%', width: 420, height: 420, borderRadius: 210, backgroundColor: alpha(c.light, 0.6) }} />
        <Confetti />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
          <Pop style={{ zIndex: 1, marginRight: -16 }}>
            <Mascot mood="happy" size={150} />
          </Pop>
          <Pop delay={150}>
            <TierBadge tier={tier} size={140} />
          </Pop>
        </View>
        <Text style={[font(800, 13, c.dark), { marginTop: 12, textTransform: 'uppercase', letterSpacing: 1.8 }]}>{t('x0s3p0cq')}</Text>
        <Text style={[font(900, 32), { marginTop: 4, lineHeight: 38, textAlign: 'center' }]}>{t('x0lgquqh', { name: tier.name })}</Text>
        <Text style={[font(600, 17, C.muted), { marginTop: 4, maxWidth: 480, textAlign: 'center', lineHeight: 23 }]}>{tx('x1p2axug', { v: tier.outcome.charAt(0).toLowerCase() + tier.outcome.slice(1) })}</Text>
        <View style={{ marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {tier.skills.map((s) => (
            <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, borderWidth: 2, borderColor: c.mid, backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Check size={14} color={c.dark} />
              <Text style={font(800, 14, c.dark)}>{s}</Text>
            </View>
          ))}
        </View>
        {next ? (
          <View style={{ marginTop: 32, alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 22, borderWidth: 2, borderColor: UNIT_COLORS[next.color].mid, backgroundColor: UNIT_COLORS[next.color].light, padding: 16 }}>
            <TierBadge tier={next} size={60} />
            <View style={{ flex: 1 }}>
              <Text style={[font(900, 12, UNIT_COLORS[next.color].dark), caps(12)]}>{t('x0jxb9v2', { num: next.num })}</Text>
              <Text style={[font(900, 20), { lineHeight: 24 }]}>{next.name}</Text>
              <Text style={font(600, 14, C.muted)}>{next.outcome}</Text>
            </View>
          </View>
        ) : (
          <View testID="explore-next" style={{ marginTop: 32, alignSelf: 'stretch', borderRadius: 22, borderWidth: 2, borderStyle: 'dashed', borderColor: C.brandMid, backgroundColor: alpha(C.brandLight, 0.5), padding: 16 }}>
            <Text style={font(900, 18)}>{t('explore.tier.title')}</Text>
            <Text style={[font(600, 14, C.muted), { marginTop: 4 }]}>{t('explore.tier.body')}</Text>
          </View>
        )}
      </ScrollView>
      <View style={{ borderTopWidth: 2, borderTopColor: C.line, paddingHorizontal: 16, paddingTop: 20, paddingBottom: insets.bottom + 20 }}>
        <Btn testID="tier-continue" block label={next ? t('x0vf0bc5') : t('explore.kicker')} onPress={go} />
      </View>
    </View>
  )
}
