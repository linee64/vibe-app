import { useEffect, useRef } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { findTier, nextTier } from '@web/data/tiers'
import { UNIT_COLORS } from '@web/data/types'
import { useStore } from '../../store/Store'
import { Mascot } from '../../components/Mascot'
import { Btn, Txt } from '../../components/ui'
import { C } from '../../theme'
import { track } from '../../lib/analytics'
import { t } from '@web/i18n/core'

export default function TierUpScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { markTierCelebrated, progress } = useStore()
  const tier = findTier(id)
  const sent = useRef(false)
  useEffect(() => {
    // экран показывается один раз на тир — момент «тир пройден, следующий открыт»
    if (!tier || sent.current || progress.tiersCelebrated.includes(tier.id)) return
    sent.current = true
    track('tier_unlocked', { tier: nextTier(tier)?.id ?? 'soon', via: 'progress', completed_tier: tier.id })
  }, [tier, progress.tiersCelebrated])
  if (!tier) return null
  const color = UNIT_COLORS[tier.color]
  const nxt = nextTier(tier)
  return (
    <View style={{ flex: 1, backgroundColor: color.light, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16, paddingHorizontal: 22, gap: 10 }}>
      <View style={{ alignItems: 'center' }}>
        <Mascot mood="happy" size={160} />
      </View>
      <Txt w={900} size={14} color={color.dark} center>{t('x0dit57q')}</Txt>
      <Txt w={900} size={30} center>{tier.name}</Txt>
      <Txt w={700} size={15} color={C.muted} center>{tier.outcome}</Txt>
      <View style={{ gap: 6, marginTop: 6 }}>
        {tier.skills.map((s) => (
          <View key={s} style={{ borderRadius: 14, backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 10, borderLeftWidth: 5, borderLeftColor: color.main }}>
            <Txt w={800} size={15}>✓ {s}</Txt>
          </View>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      {nxt ? <Txt w={700} size={13} color={C.muted} center>{t('x0ajifv4', { name: nxt.name })}</Txt> : null}
      <Btn label={t('x0odeypg')} block onPress={() => { markTierCelebrated(tier.id); router.replace('/(tabs)/learn') }} />
    </View>
  )
}
