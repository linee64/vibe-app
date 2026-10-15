/** Профиль — как src/screens/Profile.tsx: карточка-аватар, гардероб, тир, статистика, «Как это работает», словарик, тариф, язык, звук, отзыв, достижения */
import type { ReactNode } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { BookOpen, Bot, Bug, Clapperboard, Coins, Database, Gift, Globe, House, PenLine, Rocket as RocketL, Smartphone, CloudUpload } from 'lucide-react-native'
import { SKINS } from '@web/data/skins'
import { ALL_LESSONS, UNITS } from '@web/data/course'
import { TRIAL_DAYS } from '@web/data/pricing'
import { HOMEWORKS } from '@web/data/homework'
import { TIERS, currentTier, isTierComplete } from '@web/data/tiers'
import { formatDate, t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'
import { DEMO_MODE, REVIEW_MODE } from '../../lib/env'
import { setDemoPro, useBillingState, useProInfo } from '../../lib/billing'
import { showPlanPurchase } from '@web/data/proStatus'
import { ProActiveCard } from '../../components/ProStatus'
import { track } from '../../lib/analytics'
import { useStore } from '../../store/Store'
import { useToast } from '../../components/Toast'
import { useFeedback } from '../../components/feedbackContext'
import { Check, FeedbackBubble, Mascot, MascotHead, Rocket, Shield, Spark, TierBadge, Token } from '../../components/art'
import { Blob, Btn, Card, ProgressBar } from '../../components/ui'
import { LanguageCard, LinkRow, SoundToggle } from '../../components/Settings'
import { C, alpha, caps, font } from '../../theme'

/** Карточка тарифа: Free → «Попробовать Pro»; Pro → только компактный статус «Вайбик Pro активен» (как веб) */
function PlanCard() {
  const router = useRouter()
  const pro = useProInfo()
  if (!showPlanPurchase(pro)) return <ProActiveCard pro={pro} action={{ label: t('pro.details'), onPress: () => router.push('/(tabs)/settings') }} />
  return <FreePlanCard />
}

function FreePlanCard() {
  const router = useRouter()
  const billing = useBillingState()
  const annual = billing?.offers.find((o) => o.plan === 'annual')
  return (
    <View testID="plan-free" style={{ marginTop: 32, borderRadius: 20, backgroundColor: C.brandDark, paddingBottom: 5 }}>
      <View style={{ borderRadius: 20, backgroundColor: C.brand, padding: 20, overflow: 'hidden', gap: 16 }}>
        <Blob />
        <View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <Text style={[font(900, 13, 'rgba(255,255,255,0.75)'), caps(13)]}>{t('x1sl243q')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, backgroundColor: C.gold, paddingHorizontal: 10, paddingVertical: 2 }}>
              <Gift size={14} strokeWidth={2.4} color={C.goldInk} />
              <Text style={font(900, 12, C.goldInk)}>{tx('x1i0nujw', { TRIAL_DAYS: annual?.trialDays ?? TRIAL_DAYS })}</Text>
            </View>
          </View>
          <Text style={[font(900, 20, C.white), { marginTop: 6, lineHeight: 24 }]}>{t('x1xtdtme')}</Text>
          {annual?.perMonth ? <Text style={[font(600, 14, 'rgba(255,255,255,0.8)'), { marginTop: 4, lineHeight: 19 }]}>{tx('x1fcvmfh', { annualPerMonth: annual.perMonth })}</Text> : null}
        </View>
        <Btn testID="open-paywall" tone="white" small label={t('x17v6d93')} onPress={() => router.push({ pathname: '/paywall', params: { source: 'profile' } })} />
      </View>
    </View>
  )
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string | number; label: string }) {
  return (
    <Card style={{ flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
      {icon}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={[font(900, 19), { lineHeight: 23 }]}>{value}</Text>
        <Text numberOfLines={1} style={font(600, 14, C.muted)}>{label}</Text>
      </View>
    </Card>
  )
}

function Achievement({ icon, color, title, desc, value, goal, level, last }: { icon: ReactNode; color: string; title: string; desc: string; value: number; goal: number; level: number; last?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: last ? 0 : 2, borderBottomColor: C.line }}>
      <View style={{ width: 64, height: 76, borderRadius: 16, backgroundColor: color, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4, borderBottomColor: 'rgba(47,42,71,0.18)' }}>
        {icon}
        <Text style={[font(900, 10, 'rgba(255,255,255,0.9)'), caps(10), { position: 'absolute', bottom: 4 }]}>{t('x1o81k78', { level })}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <Text style={[font(800, 17), { flexShrink: 1 }]}>{title}</Text>
          <Text style={font(700, 14, C.muted)}>
            {Math.min(value, goal)}/{goal}
          </Text>
        </View>
        <View style={{ marginVertical: 8 }}>
          <ProgressBar value={(Math.min(value, goal) / goal) * 100} color={C.gold} height={14} />
        </View>
        <Text style={font(600, 14, C.muted)}>{desc}</Text>
      </View>
    </View>
  )
}

const ICON = { size: 30, color: C.white, strokeWidth: 2.2 }
const ACHIEVEMENTS = [
  { unit: 'u1', icon: <PenLine {...ICON} />, color: '#7C4DFF', title: () => t('x0hdclx6') },
  { unit: 'u3', icon: <Bug {...ICON} />, color: '#13C2AE', title: () => t('x0vaktnm') },
  { unit: 'u4', icon: <Database {...ICON} />, color: '#5B2FD6', title: () => t('x18i6kuu') },
  { unit: 'u5', icon: <CloudUpload {...ICON} />, color: '#FFA41B', title: () => t('x1wvqlg2') },
  { unit: 'u7', icon: <Smartphone {...ICON} />, color: '#13C2AE', title: () => t('ach.mobile') },
  { unit: 'u9', icon: <Bot {...ICON} />, color: '#5B2FD6', title: () => t('ach.agents') },
]

export default function ProfileScreen() {
  const router = useRouter()
  const toast = useToast()
  const feedback = useFeedback()
  const { session, progress, logout, resetProgress, setUnlockAll } = useStore()
  const isPro = useProInfo().pro
  const tier = currentTier(progress)
  const tierDone = isTierComplete(tier, progress)
  const tierStatus = tierDone ? t('x0eei137') : tier.num === 1 ? t('x1y4r5mn') : t('x1psb0nk')
  const done = progress.completed.length
  const handle = (session?.email.split('@')[0] ?? 'user').toLowerCase()
  return (
    <ScrollView testID="profile-screen" style={{ flex: 1, backgroundColor: C.white }} contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 40 }}>
      <View style={{ borderRadius: 24, backgroundColor: C.brandLight, paddingHorizontal: 24, paddingBottom: 24, paddingTop: 32, overflow: 'hidden', alignItems: 'center', gap: 16 }}>
        <Blob size={160} color={alpha(C.brandMid, 0.4)} style={{ right: -40, top: -40 }} />
        <View pointerEvents="none" style={{ position: 'absolute', right: 32, top: 96, width: 28, height: 28, borderRadius: 8, backgroundColor: alpha(C.teal, 0.6), transform: [{ rotate: '12deg' }] }} />
        <View style={{ width: 112, height: 112, borderRadius: 56, borderWidth: 4, borderColor: C.white, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', boxShadow: `0 5px 0 ${C.brandMid}` }}>
          <MascotHead size={84} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={[font(900, 28), { lineHeight: 33, textAlign: 'center' }]}>{session?.name}</Text>
          <Text style={font(700, 16, C.muted)}>@{handle}</Text>
          <Text style={[font(600, 14, C.muted), { marginTop: 4, textAlign: 'center' }]}>
            {session?.real ? t('profile.since', { date: formatDate(session.since, { month: 'long', year: 'numeric' }).replace(/ г\.$/, '') }) : t('x1y1fgkx')}
          </Text>
        </View>
      </View>

      <Card testID="profile-wardrobe" onPress={() => router.push('/(tabs)/wardrobe')} style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, overflow: 'hidden' }}>
        <View style={{ width: 76, height: 76, borderRadius: 16, backgroundColor: C.brandLight, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }}>
          <Mascot mood="happy" laptop={false} size={66} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[font(900, 19), { lineHeight: 23 }]}>{t('wardrobe.title')}</Text>
          <Text style={[font(600, 14, C.muted), { marginTop: 2, lineHeight: 18 }]}>{t('wardrobe.profileDesc')}</Text>
          <Text style={[font(800, 13, C.brand), { marginTop: 4 }]}>{t('wardrobe.count', { n: progress.skins?.owned.length ?? 0, total: SKINS.length })}</Text>
        </View>
      </Card>

      <Card testID="profile-tier" style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 }}>
        <TierBadge tier={tier} size={64} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[font(900, 12, C.muted), caps(12)]}>{tx('x1c4daqg', { tierStatus })}</Text>
          <Text style={[font(900, 22), { lineHeight: 27 }]}>{tier.name}</Text>
          <View style={{ marginTop: 4, flexDirection: 'row', gap: 6 }}>
            {TIERS.map((x) => (
              <View key={x.id} style={{ height: 10, width: 40, borderRadius: 5, backgroundColor: x.num < tier.num || (x.num === tier.num && tierDone) ? C.teal : x.num === tier.num ? C.brandMid : C.line }} />
            ))}
          </View>
        </View>
        {progress.unlockAll ? (
          <View style={{ borderRadius: 99, backgroundColor: C.goldLight, paddingHorizontal: 10, paddingVertical: 4, maxWidth: 90 }}>
            <Text style={[font(900, 11, '#8a6a1e'), caps(11), { textAlign: 'center' }]}>{t('x158vhft')}</Text>
          </View>
        ) : null}
      </Card>

      <Text style={[font(900, 22), { marginTop: 32, marginBottom: 12 }]}>{t('x123wqr3')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <Stat icon={<Rocket size={30} />} value={progress.streak} label={t('x01f3koa')} />
        <Stat icon={<Spark size={30} />} value={progress.xp} label={t('x0b4ze50')} />
        <Stat icon={<Token size={30} />} value={progress.gems} label={t('x0zjmj8f')} />
        <Stat icon={<Shield size={30} />} value={t('x0yt6bkd')} label={t('x1ozxi5t')} />
        <Stat
          icon={
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center' }}>
              <Check size={20} color={C.white} />
            </View>
          }
          value={t('x14ncjwy', { done, length: ALL_LESSONS.length })}
          label={t('x1djcpis')}
        />
        <Stat icon={<House size={28} color={C.coral} strokeWidth={2.4} />} value={t('x1kb2n7y', { length: progress.homework.length, length2: HOMEWORKS.length })} label={t('x1sse3vq')} />
        <Stat icon={<Globe size={28} color={C.teal} strokeWidth={2.4} />} value={progress.portfolioUrl ? t('x19al7ql') : '—'} label={progress.portfolioUrl ? progress.portfolioUrl.replace(/^https?:\/\//, '') : t('x1i7mfk2')} />
      </View>

      <View style={{ marginTop: 24, gap: 12 }}>
        <LinkRow testID="profile-intro" icon={<Clapperboard size={24} color={C.brand} strokeWidth={2.4} />} bg={C.brandLight} title={t('intro.profileTitle')} desc={t('intro.profileDesc')} onPress={() => router.push('/intro')} />
        <LinkRow
          testID="profile-glossary"
          icon={<BookOpen size={24} color={C.brand} strokeWidth={2.4} />}
          bg={C.brandLight}
          title={t('gloss.title')}
          desc={t('gloss.profileDesc')}
          onPress={() => {
            track('glossary_opened', { where: 'profile' })
            router.push('/(tabs)/glossary')
          }}
        />
      </View>

      <PlanCard />

      <LanguageCard returnTo="/(tabs)/profile" />
      <SoundToggle />

      <View style={{ marginTop: 24 }}>
        <LinkRow big testID="open-feedback" icon={<FeedbackBubble size={36} />} bg={C.brandLight} title={t('x1kira6i')} desc={t('x1pyd1w5')} onPress={() => feedback.open('profile')} />
      </View>

      <Text style={[font(900, 22), { marginTop: 32, marginBottom: 12 }]}>{t('x1rhz5dh')}</Text>
      <Card style={{ overflow: 'hidden' }}>
        <Achievement icon={<RocketL {...ICON} />} color="#7C4DFF" title={t('x1hwakh2')} desc={t('x0k082nd')} value={progress.streak} goal={14} level={3} />
        {ACHIEVEMENTS.map((a) => {
          const unit = UNITS.find((u) => u.id === a.unit)!
          return <Achievement key={a.unit} icon={a.icon} color={a.color} title={a.title()} desc={t('x04fhpw2', { title: unit.title })} value={unit.lessons.filter((l) => progress.completed.includes(l.id)).length} goal={unit.lessons.length} level={1} />
        })}
        <Achievement last icon={<Coins {...ICON} />} color="#13C2AE" title={t('x1675awg')} desc={t('x0ifxvm8')} value={progress.gems} goal={1000} level={2} />
      </Card>

      <View style={{ marginTop: 32, gap: 12 }}>
        {DEMO_MODE || REVIEW_MODE ? (
          <>
            <Btn
              testID="reset"
              tone="ghost"
              block
              label={t('x0cghtrn')}
              onPress={() => {
                resetProgress()
                toast(DEMO_MODE ? t('x1elewd8') : t('x10sq1zi'))
              }}
            />
            <Btn
              testID="unlock-all"
              tone="ghost"
              block
              label={progress.unlockAll ? t('x1tl2xlk') : t('x0wtvn78')}
              onPress={() => {
                setUnlockAll(!progress.unlockAll)
                toast(progress.unlockAll ? t('x0p3aj4m') : t('x1y16fjs'))
              }}
            />
            {DEMO_MODE ? <Btn testID="demo-pro" tone="ghost" block label={isPro ? t('pro.demoOff') : t('pro.demoOn')} onPress={() => setDemoPro(!isPro)} /> : null}
          </>
        ) : null}
        <Btn testID="logout" tone="coral" block label={t('x0c80x6j')} onPress={logout} />
      </View>
    </ScrollView>
  )
}
