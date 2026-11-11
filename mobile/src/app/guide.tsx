/**
 * После первого урока Бипи показывает вайб-поинты, заряд и как устроена домашка.
 * Дальше introSeen, и следующие уроки без подсказок.
 */
import { useEffect, useState, type ReactNode } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Battery, Mascot, Spark, Token } from '../components/art'
import { Btn } from '../components/ui'
import { C, caps, font } from '../theme'
import { t } from '@web/i18n/core'
import { track } from '../lib/analytics'
import { playSound } from '../lib/sound'
import { useStore } from '../store/Store'

const STEPS = ['vp', 'charge', 'hw'] as const

export default function GuideScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { setIntroSeen } = useStore()
  const [step, setStep] = useState(0)
  const [pick, setPick] = useState<'good' | 'weak' | null>(null)
  const [checked, setChecked] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const id = STEPS[step]
  const last = step === STEPS.length - 1

  useEffect(() => {
    track('onboarding_started', { entry: 'guide' })
  }, [])

  const finish = () => {
    track('onboarding_completed', { entry: 'guide' })
    setIntroSeen()
    router.replace('/(tabs)/learn')
  }
  const check = () => {
    if (!pick) {
      setNote(t('guide.hwNeed'))
      return
    }
    if (pick === 'weak') {
      setChecked(false)
      setNote(t('guide.hwWeakNote'))
      playSound('wrong')
      return
    }
    setChecked(true)
    setNote(null)
    playSound('correct')
  }

  return (
    <View testID="guide" style={{ flex: 1, backgroundColor: C.white }}>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, gap: 10 }}>
        <Text style={[font(800, 13, C.muted), caps(13)]}>{t('guide.step', { n: step + 1, total: STEPS.length })}</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {STEPS.map((s, i) => (
            <View key={s} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i <= step ? C.brand : C.line }} />
          ))}
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center' }}>
          <Mascot mood={id === 'hw' && note && !checked ? 'think' : 'happy'} size={112} />
        </View>
        {id === 'vp' ? (
          <Card kicker={t('guide.vpKicker')} title={t('guide.vpTitle')} body={t('guide.vpBody')}>
            <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16, backgroundColor: C.gold, paddingHorizontal: 16, paddingVertical: 10 }}>
              <Spark size={22} />
              <Text style={font(900, 18, C.goldInk)}>+15</Text>
            </View>
          </Card>
        ) : null}
        {id === 'charge' ? (
          <Card kicker={t('guide.chargeKicker')} title={t('guide.chargeTitle')} body={t('guide.chargeBody')}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
              <Pill icon={<Battery level={4} size={20} />} label="4/5" />
              <Pill icon={<Token size={22} />} label="10" />
            </View>
          </Card>
        ) : null}
        {id === 'hw' ? (
          <Card kicker={t('guide.hwKicker')} title={t('guide.hwTitle')} body={t('guide.hwBody')}>
            <View style={{ gap: 10 }}>
              <Block testID="guide-block-good" on={pick === 'good'} tone="teal" text={t('guide.hwGood')} onPress={() => { setPick('good'); setChecked(false); setNote(null) }} />
              <Block testID="guide-block-weak" on={pick === 'weak'} tone="coral" text={t('guide.hwWeak')} onPress={() => { setPick('weak'); setChecked(false); setNote(null) }} />
            </View>
            {note ? <Text style={[font(700, 14, C.coralDark), { marginTop: 12, lineHeight: 19 }]}>{note}</Text> : null}
            {checked ? (
              <View testID="guide-preview" style={{ marginTop: 14, borderRadius: 18, borderWidth: 2, borderColor: C.line, overflow: 'hidden' }}>
                <View style={{ height: 72, backgroundColor: C.brand }} />
                <View style={{ padding: 14, gap: 4, backgroundColor: C.white }}>
                  <Text style={font(900, 18)}>{t('guide.hwPreviewTitle')}</Text>
                  <Text style={font(700, 14, C.muted)}>{t('guide.hwPreviewMeta')}</Text>
                  <View style={{ alignSelf: 'flex-start', marginTop: 8, borderRadius: 12, backgroundColor: C.coral, paddingHorizontal: 12, paddingVertical: 6 }}>
                    <Text style={font(800, 13, C.white)}>{t('guide.hwPreviewCta')}</Text>
                  </View>
                </View>
              </View>
            ) : null}
            {checked ? <Text style={[font(700, 15), { marginTop: 12, lineHeight: 21 }]}>{t('guide.hwOk')}</Text> : null}
          </Card>
        ) : null}
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: insets.bottom + 16 }}>
        {id === 'hw' && !checked ? (
          <Btn testID="guide-check" block label={t('guide.hwCheck')} onPress={check} />
        ) : (
          <Btn testID={last ? 'guide-finish' : 'guide-next'} block label={last ? t('guide.finish') : t('guide.next')} onPress={() => (last ? finish() : setStep((s) => s + 1))} />
        )}
      </View>
    </View>
  )
}

function Card({ kicker, title, body, children }: { kicker: string; title: string; body: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={[font(800, 13, C.brand), caps(13)]}>{kicker}</Text>
      <Text style={[font(900, 26), { marginTop: 4, lineHeight: 31 }]}>{title}</Text>
      <Text style={[font(600, 16, C.muted), { marginTop: 6, marginBottom: 16, lineHeight: 22 }]}>{body}</Text>
      {children}
    </View>
  )
}

function Pill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16, backgroundColor: C.snow, paddingHorizontal: 14, paddingVertical: 10 }}>
      {icon}
      <Text style={font(900, 16)}>{label}</Text>
    </View>
  )
}

function Block({ testID, text, on, tone, onPress }: { testID: string; text: string; on: boolean; tone: 'teal' | 'coral'; onPress: () => void }) {
  const color = tone === 'teal' ? C.teal : C.coral
  const bg = tone === 'teal' ? C.tealLight : C.coralLight
  return (
    <Pressable testID={testID} accessibilityRole="button" onPress={onPress} style={{ borderRadius: 16, borderWidth: 2, borderColor: on ? color : C.line, backgroundColor: on ? bg : C.white, paddingHorizontal: 14, paddingVertical: 12 }}>
      <Text style={[font(800, 15, on ? (tone === 'teal' ? C.tealDark : C.coralDark) : C.ink), { lineHeight: 20 }]}>{text}</Text>
    </Pressable>
  )
}
