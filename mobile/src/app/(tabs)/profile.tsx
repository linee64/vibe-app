import { useState } from 'react'
import { ScrollView, Switch, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { UNITS } from '@web/data/course'
import { HOMEWORKS } from '@web/data/homework'
import { VP, days } from '@web/data/economy'
import { PRO_FEATURES, TRIAL_DAYS, usd, PRICES } from '@web/data/pricing'
import { DEMO_MODE, SUPABASE_ENABLED } from '../../lib/env'
import { useStore } from '../../store/Store'
import { Btn, Txt } from '../../components/ui'
import { Sheet } from '../../components/Sheet'
import { Mascot, MascotHead } from '../../components/Mascot'
import { useFeedback } from '../../components/feedbackContext'
import { C, font } from '../../theme'
import { t } from '@web/i18n/core'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { tx } from '@web/i18n/rich'

export default function ProfileScreen() {
  const { session, progress, logout, setUnlockAll, resetProgress } = useStore()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [confirm, setConfirm] = useState(false)
  const feedback = useFeedback()
  const total = UNITS.reduce((n, u) => n + u.lessons.length, 0)
  const badges = HOMEWORKS.filter((h) => progress.homework.includes(h.id))

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.snow }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 30, paddingHorizontal: 16, gap: 12 }}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Mascot size={130} />
        <Txt w={900} size={24}>{session?.name ?? t('x0rgj735')}</Txt>
        <Txt w={700} size={13} color={C.muted}>{session?.email}</Txt>
        <Txt w={700} size={12} color={C.muted}>{DEMO_MODE ? t('x0dv2mx3') : t('x1cn18rx')}</Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Stat value={`${progress.xp}`} label={VP} />
        <Stat value={`${progress.completed.length}/${total}`} label={t('x0wfkmpa')} />
        <Stat value={days(progress.streak)} label={t('x0ckyibg')} />
      </View>

      <View style={{ borderRadius: 18, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, padding: 14, gap: 6 }}>
        <Txt w={900} size={15}>{t('x1vsm5d3')}</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {HOMEWORKS.map((h) => {
            const on = badges.some((b) => b.id === h.id)
            return (
              <View key={h.id} style={{ borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: on ? C.goldLight : C.snow, opacity: on ? 1 : 0.6 }}>
                <Text style={font(800, 13)}>{h.badge.emoji} {on ? h.badge.name : '???'}</Text>
              </View>
            )
          })}
        </View>
      </View>

      <View style={{ borderRadius: 18, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, padding: 14, gap: 6 }}>
        <Txt w={900} size={15}>{t('lang.label')}</Txt>
        <Txt w={600} size={13} color={C.muted}>{t('lang.hint')}</Txt>
        <LanguageSwitcher />
      </View>

      {progress.portfolioUrl ? (
        <View style={{ borderRadius: 18, backgroundColor: C.tealLight, padding: 14 }}>
          <Txt w={900} size={14} color={C.tealDark}>{t('x16w9p3r')}</Txt>
          <Txt w={700} size={13}>{progress.portfolioUrl}</Txt>
        </View>
      ) : null}

      <View style={{ borderRadius: 18, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, padding: 14, gap: 8 }}>
        <Txt w={900} size={15}>Pro</Txt>
        <Txt w={700} size={13} color={C.muted}>{tx('x1rewohk', { monthly: usd(PRICES.monthly), annual: usd(PRICES.annual), TRIAL_DAYS })}</Txt>
        {PRO_FEATURES().slice(0, 3).map((f) => (
          <Txt key={f} w={700} size={13}>• {f}</Txt>
        ))}
        <Btn testID="open-paywall" label={t('x17u98ip')} tone="gold" block onPress={() => router.push('/paywall')} />
      </View>

      <View style={{ borderRadius: 18, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, padding: 14, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.brandLight, alignItems: 'center', justifyContent: 'center' }}>
            <MascotHead size={32} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt w={900} size={15}>{t('x078t777')}</Txt>
            <Txt w={600} size={12} color={C.muted}>{t('x153haoq')}</Txt>
          </View>
        </View>
        <Btn testID="open-feedback" label={t('x1kira6i')} tone="ghost" block onPress={() => feedback.open('profile')} />
      </View>

      <View style={{ borderRadius: 18, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, padding: 14, gap: 10 }}>
        <Txt w={900} size={15}>{t('x01xs7fy')}</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Txt w={800} size={14}>{t('x0cwqba4')}</Txt>
            <Txt w={600} size={12} color={C.muted}>{t('x0qo5etk')}</Txt>
          </View>
          <Switch testID="unlock-all" value={progress.unlockAll} onValueChange={setUnlockAll} trackColor={{ true: C.brand, false: C.line }} />
        </View>
        <Btn label={t('x0tw0ozv')} tone="ghost" block onPress={() => router.push('/placement')} />
        <Btn label={t('x1ayt150')} tone="ghost" block onPress={() => router.push('/shop')} />
        <Btn testID="reset" label={t('x0066vqf')} tone="ghost" block onPress={() => setConfirm(true)} />
        <Btn testID="logout" label={t('x0c80x6j')} tone="coral" block onPress={logout} />
        <Txt w={600} size={11} color={C.muted}>
          {SUPABASE_ENABLED ? t('x0alonok') : t('x1c6se9m')}{' '}{t('x06sdw8t')}</Txt>
      </View>

      <Sheet open={confirm} onClose={() => setConfirm(false)} label={t('x0066vqf')}>
        <Txt w={900} size={20} center>{t('x04xnb9k')}</Txt>
        <Txt w={600} size={14} color={C.muted} center>{t('x13bbdsu')}</Txt>
        <Btn label={t('x082rl2m')} tone="coral" block onPress={() => { resetProgress(); setConfirm(false) }} />
        <Btn label={t('x1d0cpfv')} tone="ghost" block onPress={() => setConfirm(false)} />
      </Sheet>
    </ScrollView>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, borderRadius: 16, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, paddingVertical: 10, alignItems: 'center' }}>
      <Text style={font(900, 16)}>{value}</Text>
      <Text style={font(700, 11, C.muted)}>{label}</Text>
    </View>
  )
}
