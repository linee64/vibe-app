/** Конец пути без «финиша» — как src/components/ExploreMore.tsx: повторить урок, задания, домашка, предложить тему */
import { useState, type ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ALL_LESSONS, UNITS } from '@web/data/course'
import { homeworkForUnit } from '@web/data/homework'
import { questBoard } from '@web/data/quests'
import { isUnitLocked } from '@web/data/tiers'
import { isNodeReachable } from '@web/data/path'
import { t } from '@web/i18n/core'
import { useStore } from '../../store/Store'
import { useFeedback } from '../feedbackContext'
import { track } from '../../lib/analytics'
import { Dumbbell, FeedbackBubble, Mascot, Rocket, Target } from '../art'
import { C, alpha, caps, font } from '../../theme'

function Action({ icon, light, title, desc, onPress, name }: { icon: ReactNode; light: string; title: string; desc: string; onPress: () => void; name: string }) {
  return (
    <Pressable testID={`explore-${name}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, padding: 14, borderBottomWidth: pressed ? 2 : 6, borderBottomColor: pressed ? C.line : '#E7E3F2', marginTop: pressed ? 4 : 0 })}>
      <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: light, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[font(900, 16), { lineHeight: 19 }]}>{title}</Text>
        <Text numberOfLines={2} style={[font(600, 14, C.muted), { lineHeight: 18, marginTop: 2 }]}>{desc}</Text>
      </View>
    </Pressable>
  )
}

export function ExploreMore() {
  const { progress } = useStore()
  const router = useRouter()
  const feedback = useFeedback()
  const [seed] = useState(() => new Date().getDate())
  const done = ALL_LESSONS.filter((l) => progress.completed.includes(l.id))
  const review = done.length ? done[seed % done.length] : ALL_LESSONS[0]
  const homeworks = UNITS.map((u) => homeworkForUnit(u.id)).filter((h) => !!h)
  const nextHw = homeworks.find((h) => !progress.homework.includes(h.id) && !isUnitLocked(h.unitId, progress) && isNodeReachable(h.id, progress))
  const againHw = homeworks.find((h) => progress.homework.includes(h.id))
  const hw = nextHw ?? againHw
  const daily = questBoard(progress.quests).daily
  const dailyDone = daily.filter((q) => q.done).length
  const act = (name: string, fn: () => void) => () => {
    track('explore_action', { action: name })
    fn()
  }
  return (
    <View testID="explore" style={{ paddingBottom: 32 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
        <View style={{ height: 2, width: 40, backgroundColor: C.brandMid }} />
        <Text style={[font(800, 13, C.brand), caps(13)]}>{t('explore.kicker')}</Text>
        <View style={{ height: 2, width: 40, backgroundColor: C.brandMid }} />
      </View>
      <View style={{ borderRadius: 26, backgroundColor: alpha(C.brandLight, 0.6), padding: 20, overflow: 'hidden' }}>
        <View pointerEvents="none" style={{ position: 'absolute', right: -40, top: -48, width: 144, height: 144, borderRadius: 72, backgroundColor: alpha(C.coral, 0.15) }} />
        <View pointerEvents="none" style={{ position: 'absolute', left: -40, bottom: -56, width: 128, height: 128, borderRadius: 64, backgroundColor: alpha(C.teal, 0.15) }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Mascot mood="happy" size={88} />
          <View style={{ flex: 1 }}>
            <Text style={[font(900, 21), { lineHeight: 25 }]}>{t('explore.title')}</Text>
            <Text style={[font(600, 15, C.muted), { lineHeight: 20, marginTop: 4 }]}>{t('explore.body')}</Text>
          </View>
        </View>
        <View style={{ marginTop: 20, gap: 12 }}>
          <Action name="practice" icon={<Dumbbell size={26} color="#7C4DFF" />} light="#EFE9FF" title={t(done.length ? 'explore.practice.title' : 'explore.practice.start')} desc={t('explore.practice.desc', { title: review.title })} onPress={act('practice', () => router.push(`/lesson/${review.id}`))} />
          <Action name="quests" icon={<Target size={26} />} light="#FFE9E2" title={t('explore.quests.title')} desc={t('explore.quests.desc', { done: dailyDone, total: daily.length })} onPress={act('quests', () => router.push('/(tabs)/quests'))} />
          {hw ? <Action name="homework" icon={<Rocket size={26} />} light="#DCF8F3" title={t('explore.hw.title')} desc={nextHw ? t('explore.hw.next', { title: hw.title }) : t('explore.hw.again')} onPress={act('homework', () => router.push(`/homework/${hw.id}`))} /> : null}
          <Action name="suggest" icon={<FeedbackBubble size={26} />} light="#F3EFFF" title={t('explore.suggest.title')} desc={t('explore.suggest.desc')} onPress={act('suggest', () => feedback.open('explore'))} />
        </View>
      </View>
    </View>
  )
}
