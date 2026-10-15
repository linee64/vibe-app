/** «Урок пройден!» — как src/screens/LessonComplete.tsx: конфетти, Бипи на золотом круге, три карточки, «Поделиться» и «Продолжить» */
import type { ReactNode } from 'react'
import { ScrollView, Share, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { INVITE_URL } from '@web/lib/prefs'
import { rawMessage, t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'
import { useStore } from '../store/Store'
import { continueAfter } from '../lib/flow'
import { Clock, Mascot, Spark, Target, Token } from '../components/art'
import { Confetti, Pop } from '../components/motion'
import { Btn } from '../components/ui'
import { C, caps, font } from '../theme'

function StatCard({ label, value, icon, color, edge }: { label: string; value: string; icon: ReactNode; color: string; edge: string }) {
  return (
    <Pop style={{ flex: 1 }}>
      <View style={{ borderRadius: 18, backgroundColor: edge, paddingBottom: 4 }}>
        <View style={{ borderRadius: 18, borderWidth: 2, borderColor: color, backgroundColor: color, padding: 2 }}>
          <Text numberOfLines={1} style={[font(900, 11, C.white), caps(11), { textAlign: 'center', paddingHorizontal: 8, paddingTop: 4, paddingBottom: 6 }]}>{label}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, backgroundColor: C.white, paddingVertical: 16 }}>
            {icon}
            <Text style={font(900, 22, color)}>{value}</Text>
          </View>
        </View>
      </View>
    </Pop>
  )
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function LessonCompleteScreen() {
  const p = useLocalSearchParams<{ xp: string; accuracy: string; seconds: string; gems: string; title: string; unit: string; node: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { progress } = useStore()
  const accuracy = Number(p.accuracy) || 0
  const perfect = accuracy === 100
  const share = () => void Share.share({ message: `${t('invite.text')} ${INVITE_URL}`, url: INVITE_URL }).catch(() => {})
  return (
    <View testID="lesson-complete" style={{ flex: 1, backgroundColor: C.white }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingTop: insets.top + 40, paddingBottom: 40 }}>
        <Confetti />
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', top: '54%', width: 230, height: 230, marginTop: -115, borderRadius: 115, backgroundColor: C.goldLight }} />
          <Pop>
            <Mascot mood="happy" size={210} />
          </Pop>
        </View>
        {p.unit ? <Text style={[font(800, 13, C.muted), caps(13), { marginTop: 16, textAlign: 'center' }]}>{p.unit}</Text> : null}
        <Text style={[font(900, 30, C.brand), { marginTop: p.unit ? 4 : 16, lineHeight: 36, textAlign: 'center' }]}>{perfect ? t('x04sz8f0') : t('x0w4ioxt')}</Text>
        <Text style={[font(600, 17, C.muted), { marginTop: 4, maxWidth: 460, textAlign: 'center', lineHeight: 23 }]}>{tx('x0koxje8', { lessonTitle: p.title ?? '' }, [(chunk) => <Text style={font(800, 17, C.ink)}>{chunk}</Text>])}</Text>
        <View testID="reward-tokens" style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, backgroundColor: C.tealLight, paddingHorizontal: 12, paddingVertical: 4 }}>
          <Token size={20} />
          <Text style={font(900, 15, C.tealDark)}>{rawMessage('x0anpi05').replace(/<0\/>\s*/, '').replace('{gems}', p.gems ?? '0')}</Text>
        </View>
        <View style={{ marginTop: 32, flexDirection: 'row', gap: 12, alignSelf: 'stretch', maxWidth: 540 }}>
          <StatCard label={t('x0r86dp9')} value={`+${p.xp ?? 0}`} icon={<Spark size={26} />} color="#FFB61D" edge="#E5A100" />
          <StatCard label={t('x0ngco8m')} value={`${accuracy}%`} icon={<Target size={24} />} color="#13C2AE" edge="#0E9C8C" />
          <StatCard label={t('x14ec53v')} value={fmt(Number(p.seconds) || 0)} icon={<Clock size={24} />} color="#7C4DFF" edge="#5B2FD6" />
        </View>
      </ScrollView>
      <View style={{ borderTopWidth: 2, borderTopColor: C.line, paddingHorizontal: 16, paddingTop: 20, paddingBottom: insets.bottom + 20, gap: 12 }}>
        <Btn testID="continue" block label={t('x1kpmy5f')} onPress={() => continueAfter(router, progress, p.node ?? '')} />
        <Btn tone="ghost" block label={t('x0nv9ya6')} onPress={share} />
      </View>
    </View>
  )
}
