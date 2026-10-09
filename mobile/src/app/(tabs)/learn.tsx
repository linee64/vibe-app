import { Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { UNITS } from '@web/data/course'
import { UNIT_COLORS } from '@web/data/types'
import { unitNodes, isNodeDone, currentNodeId, type PathItem } from '@web/data/path'
import { TIERS, isTierPassed, isTierUnlocked, isUnitLocked, needsPro, pendingTierUp, tierNodeProgress, type Tier } from '@web/data/tiers'
import { VP, days, waitText } from '@web/data/economy'
import { useStore } from '../../store/Store'
import { Battery, ProgressBar, Token, Txt } from '../../components/ui'
import { MascotHead } from '../../components/Mascot'
import { FeedbackButton } from '../../components/Feedback'
import { C, font } from '../../theme'
import { t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'

const NODE_ICON: Record<string, string> = { star: '⭐', book: '📘', dumbbell: '💪', chest: '🎁', trophy: '🏆' }

export default function LearnScreen() {
  const { progress, chargeAt } = useStore()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const current = currentNodeId(progress)
  const celebration = pendingTierUp(progress)

  const open = (item: PathItem, unitId: string) => {
    if (isUnitLocked(unitId, progress)) return
    if (needsPro(unitId)) {
      router.push('/paywall')
      return
    }
    router.push(item.type === 'lesson' ? `/lesson/${item.id}` : `/homework/${item.id}`)
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.snow }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 30 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 10 }}>
        <MascotHead size={38} />
        <Txt w={900} size={22} style={{ flex: 1 }}>{t('x0c6ksvf')}</Txt>
        <FeedbackButton entry="header" />
        <Pressable onPress={() => router.push('/shop')} testID="open-shop" style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, paddingHorizontal: 10, paddingVertical: 5 }}>
          <Token size={16} />
          <Text style={font(900, 14)}>{progress.gems}</Text>
        </Pressable>
        <View style={{ alignItems: 'flex-end' }}>
          <Battery level={progress.hearts} size={22} />
          {chargeAt ? <Text style={font(700, 10, C.muted)}>+1 {waitText(chargeAt)}</Text> : null}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 }}>
        <Stat emoji="🔥" label={t('x1epijl3')} value={days(progress.streak)} />
        <Stat emoji="✨" label={t('x0f019kt')} value={`${progress.xp} ${VP}`} />
      </View>

      {!progress.placementSeen ? (
        <Pressable testID="placement-banner" onPress={() => router.push('/placement')} style={{ marginHorizontal: 16, marginBottom: 12, borderRadius: 18, backgroundColor: C.brand, padding: 14, borderBottomWidth: 4, borderBottomColor: C.brandDark }}>
          <Txt w={900} size={16} color={C.white}>{t('x0wyu2fe')}</Txt>
          <Txt w={700} size={13} color="#E8E0FF">{t('x1re5hkw')}</Txt>
        </Pressable>
      ) : null}

      {celebration ? (
        <Pressable testID="tier-up-banner" onPress={() => router.push(`/tier-up/${celebration.id}`)} style={{ marginHorizontal: 16, marginBottom: 12, borderRadius: 18, backgroundColor: C.gold, padding: 14, borderBottomWidth: 4, borderBottomColor: C.goldDark }}>
          <Txt w={900} size={16}>{t('x1wc7ege', { name: celebration.name })}</Txt>
          <Txt w={700} size={13}>{t('x0nrcu0i')}</Txt>
        </Pressable>
      ) : null}

      {TIERS.map((tier) => (
        <TierBlock key={tier.id} tier={tier} current={current} onOpen={open} />
      ))}
    </ScrollView>
  )
}

function Stat({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={{ flex: 1, borderRadius: 16, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={font(700, 11, C.muted)}>{emoji} {label}</Text>
      <Text style={font(900, 16)}>{value}</Text>
    </View>
  )
}

function TierBlock({ tier, current, onOpen }: { tier: Tier; current: string | null; onOpen: (item: PathItem, unitId: string) => void }) {
  const { progress } = useStore()
  const router = useRouter()
  const open = isTierUnlocked(tier, progress)
  const passed = isTierPassed(tier, progress)
  const { done, total } = tierNodeProgress(tier, progress)
  const byTest = passed && done < total
  const color = UNIT_COLORS[tier.color]
  const units = UNITS.filter((u) => tier.units.includes(u.id))

  return (
    <View style={{ marginBottom: 8 }}>
      <View testID={`tier-${tier.id}`} style={{ marginHorizontal: 16, marginBottom: 8, borderRadius: 20, backgroundColor: color.main, padding: 14, borderBottomWidth: 5, borderBottomColor: color.dark, opacity: open ? 1 : 0.75 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Txt w={900} size={18} color={C.white} style={{ flex: 1 }}>{tx('x00sbg42', { v: open ? '' : '🔒 ', num: tier.num, name: tier.name })}</Txt>
          {passed ? <Text style={font(900, 12, C.white)}>{t('x0zlgs72')}</Text> : byTest ? <Text style={font(900, 12, C.white)}>{t('x11cu9j6')}</Text> : null}
        </View>
        <Txt w={700} size={13} color={color.light} style={{ marginTop: 2 }}>
          {tier.outcome}
        </Txt>
        <View style={{ marginTop: 8 }}>
          <ProgressBar value={(done / Math.max(total, 1)) * 100} color={C.white} height={8} />
          <Text style={[font(800, 11, color.light), { marginTop: 3 }]}>{done}/{total}</Text>
        </View>
        {!open ? (
          <Pressable testID={`tier-locked-${tier.id}`} onPress={() => router.push('/placement')} style={{ marginTop: 8, alignSelf: 'flex-start', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={font(900, 13, C.white)}>{t('x0pnkiit')}</Text>
          </Pressable>
        ) : null}
      </View>

      {open &&
        units.map((unit) => {
          const c = UNIT_COLORS[unit.color]
          const locked = isUnitLocked(unit.id, progress)
          const nodes = unitNodes(unit)
          return (
            <View key={unit.id} style={{ paddingHorizontal: 16, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: c.main, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: c.dark }}>
                  <Text style={font(900, 14, C.white)}>{unit.num}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt w={900} size={16}>{unit.title}</Txt>
                  <Txt w={700} size={12} color={C.muted}>{unit.subtitle}</Txt>
                </View>
                {needsPro(unit.id) ? (
                  <Pressable testID={`pro-${unit.id}`} onPress={() => router.push('/paywall')} style={{ borderRadius: 99, backgroundColor: C.goldLight, paddingHorizontal: 9, paddingVertical: 3 }}>
                    <Text style={font(900, 11, C.goldDark)}>PRO</Text>
                  </Pressable>
                ) : null}
              </View>
              <View style={{ alignItems: 'center', gap: 0 }}>
                {nodes.map((item, i) => {
                  const doneNode = isNodeDone(item, progress)
                  const isCurrent = item.id === current
                  const shift = i % 2 === 0 ? -46 : 46
                  const label = item.type === 'lesson' ? item.lesson.title : item.hw.short
                  const icon = item.type === 'homework' ? '🏠' : NODE_ICON[item.lesson.kind]
                  return (
                    <Pressable key={item.id} testID={`node-${item.id}`} accessibilityLabel={label} onPress={() => !locked && onOpen(item, unit.id)} style={{ alignSelf: 'center', marginLeft: shift, alignItems: 'center', marginBottom: 4}}>
                      <View style={{ width: 66, height: 66, borderRadius: 66, backgroundColor: doneNode ? c.main : isCurrent ? C.white : C.white, borderWidth: isCurrent ? 4 : 2, borderColor: doneNode ? c.dark : isCurrent ? c.main : C.line, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 6, borderBottomColor: doneNode ? c.dark : isCurrent ? c.dark : C.line, opacity: locked ? 0.5 : 1 }}>
                        <Text style={{ fontSize: 26 }}>{doneNode ? '✓' : locked ? '🔒' : icon}</Text>
                      </View>
                      <Text numberOfLines={2} style={[font(800, 11, doneNode ? c.dark : C.ink), { width: 110, textAlign: 'center', marginTop: 2, lineHeight: 14 }]}>{label}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          )
        })}
    </View>
  )
}
