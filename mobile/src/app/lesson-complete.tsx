import { Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { pendingTierUp } from '@web/data/tiers'
import { VP } from '@web/data/economy'
import { useStore } from '../store/Store'
import { Mascot } from '../components/Mascot'
import { Btn, Token, Txt } from '../components/ui'
import { C, font } from '../theme'
import { t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'

export default function LessonCompleteScreen() {
  const { xp, accuracy, seconds, gems, title, unit } = useLocalSearchParams<{ xp: string; accuracy: string; seconds: string; gems: string; title: string; unit: string; node: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { progress, markTierCelebrated } = useStore()
  const sec = Number(seconds) || 0
  const mm = Math.floor(sec / 60)
  const ss = String(sec % 60).padStart(2, '0')

  const go = () => {
    const t = pendingTierUp(progress)
    if (t) {
      markTierCelebrated(t.id)
      router.replace({ pathname: '/tier-up/[id]', params: { id: t.id } })
    } else router.replace('/(tabs)/learn')
  }

  return (
    <View testID="lesson-complete" style={{ flex: 1, backgroundColor: C.brandLight, paddingTop: insets.top + 30, paddingBottom: insets.bottom + 20, paddingHorizontal: 22, alignItems: 'center', gap: 10 }}>
      <Mascot mood="happy" size={170} />
      <Txt w={900} size={28} center>{t('x0w4ioxt')}</Txt>
      <Txt w={700} size={15} color={C.muted} center>{unit}</Txt>
      <Txt w={800} size={17} center>{title}</Txt>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <Stat label={VP} value={`+${xp ?? 0}`} color={C.brand} />
        <Stat label={t('x1ev8ys6')} value={`${accuracy ?? 0}%`} color={C.teal} />
        <Stat label={t('x1nhmxiz')} value={`${mm}:${ss}`} color={C.coral} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <Token size={18} />
        <Text style={font(900, 15, C.tealDark)}>{tx('x0udd8ri', { v: gems ?? 0 })}</Text>
      </View>
      <View style={{ flex: 1 }} />
      <Btn testID="continue" label={t('x1s86pj9')} block onPress={go} style={{ alignSelf: 'stretch' }} />
    </View>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ minWidth: 90, borderRadius: 18, backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: color }}>
      <Text style={font(900, 20, color)}>{value}</Text>
      <Text style={font(800, 12, C.muted)}>{label}</Text>
    </View>
  )
}
