/** «Ещё» — как MoreScreen веба: дневная цель, настройки, магазин образов, помощь, документы, приглашение, отзыв, выход */
import type { ReactNode } from 'react'
import { Pressable, ScrollView, Share, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { CircleQuestionMark, FileText, Hand, Lock, Mail, Settings, ShoppingBag } from 'lucide-react-native'
import { t } from '@web/i18n/core'
import { INVITE_URL, useDailyGoal } from '../../lib/prefs'
import { openLegal } from '../../lib/legal'
import { track } from '../../lib/analytics'
import { useStore } from '../../store/Store'
import { useProInfo } from '../../lib/billing'
import { ProActiveCard } from '../../components/ProStatus'
import { useFeedback } from '../../components/feedbackContext'
import { FeedbackBubble, Mascot } from '../../components/art'
import { Blob, Card, Chevron, IconBox, ProgressBar } from '../../components/ui'
import { C, font } from '../../theme'

function Row({ icon, bg, title, desc, onPress, tone = 'ink', testID, first }: { icon: ReactNode; bg: string; title: string; desc?: string; onPress: () => void; tone?: 'ink' | 'coral'; testID: string; first?: boolean }) {
  return (
    <Pressable testID={testID} accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: first ? 0 : 2, borderTopColor: C.line, backgroundColor: pressed ? (tone === 'coral' ? C.coralLight : C.snow) : 'transparent' })}>
      <IconBox bg={bg}>{icon}</IconBox>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[font(900, 17, tone === 'coral' ? C.coralDark : C.ink), { lineHeight: 21 }]}>{title}</Text>
        {desc ? <Text style={[font(600, 13, C.muted), { lineHeight: 17 }]}>{desc}</Text> : null}
      </View>
      {tone === 'ink' ? <Chevron /> : null}
    </Pressable>
  )
}

function DailyGoalCard() {
  const { progress } = useStore()
  const goal = useDailyGoal()
  const xp = progress.todayXp
  const done = xp >= goal
  return (
    <View testID="daily-goal" style={{ borderRadius: 20, backgroundColor: C.brandDark, paddingBottom: 5 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 20, backgroundColor: C.brand, padding: 20, overflow: 'hidden' }}>
        <Blob />
        <Mascot mood="happy" size={72} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[font(900, 18, C.white), { lineHeight: 22 }]}>{t('more.today', { xp, goal })}</Text>
          <View style={{ marginTop: 8 }}>
            <ProgressBar value={Math.min(xp / goal, 1) * 100} min={4} color={C.gold} height={12} track="rgba(255,255,255,0.25)" />
          </View>
          <Text style={[font(700, 13, 'rgba(255,255,255,0.85)'), { marginTop: 6 }]}>{done ? t('more.goalDone') : t('more.goalLeft', { n: goal - xp })}</Text>
        </View>
      </View>
    </View>
  )
}

const I = { size: 24, strokeWidth: 2.4 }

export default function MoreScreen() {
  const router = useRouter()
  const { logout } = useStore()
  const feedback = useFeedback()
  const pro = useProInfo()
  const invite = async () => {
    try {
      const res = await Share.share({ title: t('invite.title'), message: `${t('invite.text')} ${INVITE_URL}`, url: INVITE_URL })
      track('invite_shared', { method: res.action === Share.sharedAction ? 'shared' : 'cancelled' })
    } catch {
      track('invite_shared', { method: 'failed' })
    }
  }
  return (
    <ScrollView testID="more-screen" style={{ flex: 1, backgroundColor: C.white }} contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 40 }}>
      <Text style={[font(900, 28), { lineHeight: 33 }]}>{t('x0vosrby')}</Text>
      <Text style={[font(600, 15, C.muted), { marginBottom: 20 }]}>{t('more.subtitle')}</Text>
      <DailyGoalCard />
      {pro.pro ? <ProActiveCard pro={pro} style={{ marginTop: 24 }} action={{ label: t('pro.details'), onPress: () => router.push('/(tabs)/settings') }} /> : null}
      <Card style={{ marginTop: 24, overflow: 'hidden' }}>
        <Row first testID="more-settings" icon={<Settings {...I} color={C.brand} />} bg="#EFE9FF" title={t('x01xs7fy')} desc={t('more.settingsDesc')} onPress={() => router.push('/(tabs)/settings')} />
        <Row testID="more-shop" icon={<ShoppingBag {...I} color={C.goldDark} />} bg="#FFF4D6" title={t('x1f2lm2g')} desc={t('more.shopDesc')} onPress={() => router.push('/(tabs)/wardrobe')} />
        <Row testID="more-help" icon={<CircleQuestionMark {...I} color={C.tealDark} />} bg="#DCF8F3" title={t('x0m2n6mj')} desc={t('more.helpDesc')} onPress={() => router.push('/(tabs)/help')} />
        <Row testID="more-privacy" icon={<Lock {...I} color={C.brand} />} bg="#EFE9FF" title={t('x1y9umvl')} desc={t('more.legalDesc')} onPress={() => openLegal('privacy')} />
        <Row testID="more-terms" icon={<FileText {...I} color={C.goldDark} />} bg="#FFF4D6" title={t('legal.terms')} desc={t('more.legalDesc')} onPress={() => openLegal('terms')} />
        <Row testID="more-invite" icon={<Mail {...I} color={C.coralDark} />} bg="#FFE9E2" title={t('x09a7sjx')} desc={t('more.inviteDesc')} onPress={() => void invite()} />
        <Row testID="more-feedback" icon={<FeedbackBubble size={30} />} bg="#EFE9FF" title={t('x1kira6i')} desc={t('x1pyd1w5')} onPress={() => feedback.open('more')} />
      </Card>
      <Card style={{ marginTop: 24, overflow: 'hidden' }}>
        <Row first testID="more-logout" icon={<Hand {...I} color={C.coralDark} />} bg="#FFE9E2" title={t('x0gojai6')} onPress={logout} tone="coral" />
      </Card>
    </ScrollView>
  )
}
