/** Экран «Задания» — как QuestsScreen в src/components/Quests.tsx */
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { PartyPopper } from 'lucide-react-native'
import type { QuestView } from '@web/data/quests'
import { tokens } from '@web/data/economy'
import { t } from '@web/i18n/core'
import { Mascot } from '../../components/art'
import { QuestRow } from '../../components/Quests'
import { Blob, Btn, Token } from '../../components/ui'
import { FadeUp } from '../../components/motion'
import { resetText, useQuestBoard } from '../../lib/quests'
import { C, alpha, caps, font } from '../../theme'

export default function QuestsScreen() {
  const router = useRouter()
  const { daily, weekly, now } = useQuestBoard()
  const allClaimed = daily.every((q) => q.claimed)
  const earned = daily.filter((q) => q.claimed).reduce((n, q) => n + q.reward, 0)
  return (
    <ScrollView testID="quests-screen" style={{ flex: 1, backgroundColor: C.white }} contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 40 }}>
      <View style={{ marginBottom: 24, borderRadius: 24, backgroundColor: C.brandDark, paddingBottom: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 24, backgroundColor: C.brand, padding: 20, overflow: 'hidden' }}>
          <Blob size={128} style={{ right: -32, top: -40 }} />
          <Mascot mood={allClaimed ? 'happy' : 'default'} size={92} />
          <View style={{ flex: 1 }}>
            <Text style={[font(900, 26, C.white), { lineHeight: 31 }]}>{t('x1rejxdo')}</Text>
            <Text style={[font(600, 15, 'rgba(255,255,255,0.85)'), { lineHeight: 20, marginTop: 4 }]}>{t('quests.subtitle')}</Text>
            {earned > 0 ? (
              <View testID="quests-earned" style={{ marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4 }}>
                <Token size={15} />
                <Text style={font(900, 13, C.white)}>{t('quests.earned', { tokens: tokens(earned) })}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <QuestGroup title={t('x00e91ep')} reset={resetText(now, 'day')} quests={daily} />
      {allClaimed ? (
        <FadeUp style={{ marginTop: -8, marginBottom: 24 }}>
          <View testID="quests-all-done" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: C.teal, backgroundColor: alpha(C.tealLight, 0.4), paddingHorizontal: 16, paddingVertical: 12 }}>
            <PartyPopper size={20} color={C.tealDark} strokeWidth={2.4} />
            <Text style={[font(800, 14, C.tealDark), { flex: 1 }]}>{t('quests.allDone')}</Text>
          </View>
        </FadeUp>
      ) : null}
      <QuestGroup title={t('quests.weekly')} reset={resetText(now, 'week')} quests={weekly} />

      <View style={{ marginBottom: 24, alignItems: 'center', gap: 12, borderRadius: 20, backgroundColor: C.snow, padding: 20 }}>
        <Text style={[font(600, 14, C.muted), { textAlign: 'center', lineHeight: 19 }]}>{t('quests.how')}</Text>
        <Btn small label={t('quests.toPath')} onPress={() => router.navigate('/(tabs)/learn')} style={{ alignSelf: 'center' }} />
      </View>

      <Pressable testID="quests-wardrobe" accessibilityRole="button" onPress={() => router.push('/(tabs)/wardrobe')} style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 20, borderWidth: 2, borderColor: C.brandMid, backgroundColor: alpha(C.brandLight, 0.6), paddingHorizontal: 16, paddingVertical: 12 }}>
        <Mascot mood="happy" laptop={false} size={56} />
        <View style={{ flex: 1 }}>
          <Text style={[font(900, 16), { lineHeight: 19 }]}>{t('wardrobe.title')}</Text>
          <Text style={[font(600, 14, C.muted), { lineHeight: 18 }]}>{t('wardrobe.questsTeaser')}</Text>
        </View>
        <Text style={[font(800, 13, C.brand), caps(13)]}>{t('wardrobe.open')}</Text>
      </Pressable>
    </ScrollView>
  )
}

function QuestGroup({ title, reset, quests }: { title: string; reset: string; quests: QuestView[] }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ marginBottom: 12, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', columnGap: 12, rowGap: 4, paddingHorizontal: 4 }}>
        <Text style={font(900, 20)}>{title}</Text>
        <Text style={font(800, 13, C.muted)}>{t('quests.resetIn', { time: reset })}</Text>
      </View>
      <View style={{ gap: 12 }}>
        {quests.map((q) => (
          <QuestRow key={q.id} q={q} />
        ))}
      </View>
    </View>
  )
}
