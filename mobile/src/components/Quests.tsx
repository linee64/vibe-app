/** Задания Бипи — как src/components/Quests.tsx (QuestRow); эмодзи веба заменены линейными иконками lucide */
import { useState } from 'react'
import { Text, View } from 'react-native'
import { CircleCheckBig, Flame, House, Rocket, Sparkles, WandSparkles, Zap, type LucideIcon } from 'lucide-react-native'
import type { QuestView } from '@web/data/quests'
import { tokens } from '@web/data/economy'
import { t } from '@web/i18n/core'
import { useStore } from '../store/Store'
import { useToast } from './Toast'
import { Check } from './art'
import { Btn, ProgressBar, Token } from './ui'
import { Pop } from './motion'
import { questDesc, questTitle } from '../lib/quests'
import { playSound } from '../lib/sound'
import { buzz } from '../lib/haptics'
import { C, alpha, caps, font } from '../theme'

const QUEST_ICON: Record<string, LucideIcon> = {
  'd-ship2': Rocket,
  'd-combo10': Zap,
  'd-vibe50': Sparkles,
  'd-clean1': WandSparkles,
  'd-checks20': CircleCheckBig,
  'w-streak5': Flame,
  'w-review1': House,
}

export function QuestIcon({ id, size, color }: { id: string; size: number; color: string }) {
  const Icon = QUEST_ICON[id] ?? Sparkles
  return <Icon size={size} color={color} strokeWidth={2.4} />
}

export function QuestRow({ q, compact = false }: { q: QuestView; compact?: boolean }) {
  const { claimQuest } = useStore()
  const toast = useToast()
  const [pop, setPop] = useState(false)
  const pct = (q.value / q.goal) * 100
  const state = q.claimed ? 'claimed' : q.done ? 'ready' : 'progress'
  const claim = () => {
    const reward = claimQuest(q.id)
    if (!reward) return
    playSound('levelup')
    void buzz('ok')
    setPop(true)
    toast(t('quests.claimToast', { tokens: tokens(reward), title: questTitle(q) }))
  }
  const box = compact ? 44 : 56
  return (
    <View testID={`quest-${q.id}`} accessibilityLabel={`${questTitle(q)} ${q.value}/${q.goal}`} style={[{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 12, rowGap: 10 }, !compact && { borderRadius: 20, borderWidth: 2, padding: 14, borderColor: state === 'ready' ? C.teal : C.line, backgroundColor: state === 'ready' ? alpha(C.tealLight, 0.5) : C.white }]}>
      <View style={{ width: box, height: box, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: q.claimed ? C.snow : C.brandLight }}>
        <QuestIcon id={q.id} size={compact ? 22 : 28} color={q.claimed ? C.faint : C.brand} />
      </View>
      <View style={{ flex: 1, minWidth: 160 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <Text style={[font(900, compact ? 15 : 17), { flexShrink: 1, lineHeight: compact ? 18 : 21 }]}>{questTitle(q)}</Text>
          {!compact && state !== 'ready' ? (
            <View accessibilityLabel={t('quests.reward', { tokens: tokens(q.reward) })} style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 }}>
              <Token size={16} />
              <Text style={font(900, 13, C.tealDark)}>{q.reward}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[font(600, compact ? 13 : 14, C.muted), { lineHeight: compact ? 17 : 19 }]}>{questDesc(q)}</Text>
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <ProgressBar value={Math.max(pct, q.value ? 6 : 0)} color={q.done ? C.teal : C.brand} height={compact ? 14 : 16} />
          </View>
          <Text style={[font(800, 12, C.muted), { width: 46, textAlign: 'right' }]}>
            {q.value}/{q.goal}
          </Text>
        </View>
      </View>
      {state === 'ready' ? (
        <Btn testID={`claim-${q.id}`} tone="teal" small block={!compact} label={t('quests.claim')} onPress={claim} style={compact ? undefined : { flexBasis: '100%' }}>
          {!compact ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Token size={15} />
              <Text style={font(800, 13, C.white)}>{q.reward}</Text>
            </View>
          ) : null}
        </Btn>
      ) : state === 'claimed' ? (
        <ClaimedChip compact={compact} pop={pop} />
      ) : null}
    </View>
  )
}

function ClaimedChip({ compact, pop }: { compact: boolean; pop: boolean }) {
  const chip = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, backgroundColor: C.snow, paddingHorizontal: 10, paddingVertical: 6 }}>
      <Check size={14} color={C.muted} />
      {!compact ? <Text style={[font(900, 12, C.muted), caps(12)]}>{t('quests.claimed')}</Text> : null}
    </View>
  )
  return pop ? <Pop>{chip}</Pop> : chip
}
