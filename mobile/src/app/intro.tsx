/**
 * «Как это работает» — как src/screens/Intro.tsx: 6 слайдов (ИИ, промпт, вайб-кодинг, что соберём, как устроены уроки, разминка).
 * Перед самым первым уроком (?entry=first_lesson&next=/lesson/…) и из профиля. Свайп, кнопки, «Пропустить».
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PanResponder, Pressable, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BatteryCharging, BookOpen, Bot, Bug, Coins, Database, Globe, Library, Rocket, Smartphone, Sparkles, Target, CloudUpload } from 'lucide-react-native'
import { t, type UIKey } from '@web/i18n/core'
import { playSound } from '../lib/sound'
import { track } from '../lib/analytics'
import { useStore } from '../store/Store'
import { Check, Cross, Mascot } from '../components/art'
import { AiAvatar } from '../components/exercises/shared'
import { FadeUp } from '../components/motion'
import { Btn } from '../components/ui'
import { C, alpha, caps, font } from '../theme'

const SLIDES = ['ai', 'prompt', 'vibe', 'build', 'how', 'warmup'] as const
const WARMUP = ['intro.warmup.a', 'intro.warmup.b', 'intro.warmup.c'] as const
const WARMUP_CORRECT = 1
const IC = { size: 22, strokeWidth: 2.4 }

export default function IntroScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { setIntroSeen } = useStore()
  const params = useLocalSearchParams<{ entry?: string; next?: string }>()
  const entry = params.entry === 'first_lesson' ? 'first_lesson' : 'profile'
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const slide = SLIDES[i]
  const last = i === SLIDES.length - 1

  useEffect(() => {
    track('onboarding_started', { entry })
  }, [entry])

  const done = () => {
    setIntroSeen()
    if (entry === 'first_lesson' && params.next) router.replace(params.next as never)
    else if (router.canGoBack()) router.back()
    else router.replace('/(tabs)/profile')
  }
  const go = useCallback((d: number) => setI((v) => Math.max(0, Math.min(SLIDES.length - 1, v + d))), [])
  const skip = () => {
    track('onboarding_skipped', { entry, step: i + 1 })
    done()
  }
  const finish = () => {
    track('onboarding_completed', { entry, warmup_correct: pick === WARMUP_CORRECT })
    done()
  }
  const answer = (k: number) => {
    if (pick !== null) return
    setPick(k)
    playSound(k === WARMUP_CORRECT ? 'correct' : 'wrong')
  }
  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) > 50) go(g.dx < 0 ? 1 : -1)
        },
      }),
    [go],
  )

  return (
    <View testID="intro" style={{ flex: 1, backgroundColor: C.white }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingTop: insets.top + 20 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('intro.skip')} onPress={skip} hitSlop={8} style={{ padding: 4 }}>
          <Cross size={28} color={C.faint} />
        </Pressable>
        <View accessibilityLabel={t('intro.progress', { n: i + 1, total: SLIDES.length })} style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
          {SLIDES.map((s, k) => (
            <Pressable key={s} accessibilityRole="tab" accessibilityLabel={t('intro.goTo', { n: k + 1 })} accessibilityState={{ selected: k === i }} onPress={() => setI(k)} hitSlop={{ top: 10, bottom: 10 }} style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: k <= i ? C.brand : C.line }} />
          ))}
        </View>
        <Pressable testID="intro-skip" accessibilityRole="button" onPress={skip} hitSlop={8}>
          <Text style={[font(800, 14, C.muted), caps(14)]}>{t('intro.skip')}</Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }} {...swipe.panHandlers}>
        <FadeUp key={slide}>
          {slide === 'ai' ? (
            <Card mascot="happy" kicker={t('intro.kicker', { n: 1, total: SLIDES.length })} title={t('intro.ai.title')} body={t('intro.ai.body')}>
              <View style={{ gap: 10, borderRadius: 20, backgroundColor: C.snow, padding: 16 }}>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ maxWidth: '85%', borderRadius: 16, borderBottomRightRadius: 6, backgroundColor: C.brand, paddingHorizontal: 12, paddingVertical: 10 }}>
                    <Text style={[font(700, 15, C.white), { lineHeight: 20 }]}>{t('intro.ai.me')}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  <AiAvatar />
                  <View style={{ flex: 1, borderRadius: 16, borderTopLeftRadius: 6, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 10 }}>
                    <Text style={[font(600, 15), { lineHeight: 20 }]}>{t('intro.ai.bot')}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ) : null}
          {slide === 'prompt' ? (
            <Card kicker={t('intro.kicker', { n: 2, total: SLIDES.length })} title={t('intro.prompt.title')} body={t('intro.prompt.body')}>
              <View style={{ gap: 12 }}>
                <Example tone="coral" label={t('intro.prompt.weakLabel')} text={t('intro.prompt.weak')} note={t('intro.prompt.weakNote')} />
                <Example tone="teal" label={t('intro.prompt.goodLabel')} text={t('intro.prompt.good')} note={t('intro.prompt.goodNote')} />
              </View>
            </Card>
          ) : null}
          {slide === 'vibe' ? (
            <Card kicker={t('intro.kicker', { n: 3, total: SLIDES.length })} title={t('intro.vibe.title')} body={t('intro.vibe.body')}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {(['intro.vibe.s1', 'intro.vibe.s2', 'intro.vibe.s3', 'intro.vibe.s4'] as UIKey[]).map((k, n) => (
                  <View key={k} style={{ flexBasis: '46%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, borderWidth: 2, borderColor: C.brandMid, backgroundColor: alpha(C.brandLight, 0.6), paddingHorizontal: 12, paddingVertical: 12 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={font(900, 15, C.white)}>{n + 1}</Text>
                    </View>
                    <Text style={[font(800, 14), { flex: 1, lineHeight: 17 }]}>{t(k)}</Text>
                  </View>
                ))}
              </View>
              <Text style={[font(800, 13, C.brand), { marginTop: 12, textAlign: 'center' }]}>{t('intro.vibe.loop')}</Text>
            </Card>
          ) : null}
          {slide === 'build' ? (
            <Card kicker={t('intro.kicker', { n: 4, total: SLIDES.length })} title={t('intro.build.title')} body={t('intro.build.body')}>
              <View style={{ gap: 8 }}>
                {(['intro.build.l1', 'intro.build.l2', 'intro.build.l3', 'intro.build.l4', 'intro.build.l5', 'intro.build.l6'] as UIKey[]).map((k, n) => {
                  const Icon = [Globe, Bug, Database, CloudUpload, Smartphone, Bot][n]
                  const color = [C.brand, C.coral, C.brandDark, C.goldDark, C.teal, C.brand][n]
                  return (
                    <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 10 }}>
                      <Icon {...IC} color={color} />
                      <Text style={[font(800, 14), { flex: 1, lineHeight: 17 }]}>{t(k)}</Text>
                    </View>
                  )
                })}
              </View>
            </Card>
          ) : null}
          {slide === 'how' ? (
            <Card kicker={t('intro.kicker', { n: 5, total: SLIDES.length })} title={t('intro.how.title')} body={t('intro.how.body')}>
              <View style={{ gap: 8 }}>
                {(
                  [
                    [<Library key="l" {...IC} color={C.brand} />, 'intro.how.lessons'],
                    [<Sparkles key="s" {...IC} color={C.amber} />, 'intro.how.vp'],
                    [<BatteryCharging key="b" {...IC} color={C.teal} />, 'intro.how.charge'],
                    [<Coins key="c" {...IC} color={C.tealDark} />, 'intro.how.tokens'],
                    [<Rocket key="r" {...IC} color={C.coral} />, 'intro.how.streak'],
                    [<Target key="t" {...IC} color={C.coralDark} />, 'intro.how.quests'],
                  ] as [ReactNode, UIKey][]
                ).map(([icon, k]) => (
                  <View key={k} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 16, backgroundColor: C.snow, paddingHorizontal: 12, paddingVertical: 10 }}>
                    {icon}
                    <Text style={[font(600, 14), { flex: 1, lineHeight: 19 }]}>{t(k)}</Text>
                  </View>
                ))}
              </View>
              <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: C.brandMid, paddingHorizontal: 12, paddingVertical: 10 }}>
                <BookOpen size={18} color={C.brandDark} strokeWidth={2.4} />
                <Text style={[font(700, 13, C.brandDark), { flex: 1, lineHeight: 18 }]}>{t('intro.how.gloss')}</Text>
              </View>
            </Card>
          ) : null}
          {slide === 'warmup' ? (
            <Card mascot={pick === WARMUP_CORRECT ? 'happy' : 'think'} kicker={t('intro.warmup.kicker')} title={t('intro.warmup.title')} body={t('intro.warmup.body')}>
              <View testID="intro-warmup" style={{ gap: 10 }}>
                {WARMUP.map((k, n) => {
                  const right = pick !== null && n === WARMUP_CORRECT
                  const wrong = pick !== null && n === pick && !right
                  const fg = right ? C.tealDark : wrong ? C.coralDark : C.ink
                  return (
                    <Pressable
                      key={k}
                      testID={`intro-option-${n}`}
                      disabled={pick !== null}
                      onPress={() => answer(n)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: right ? C.teal : wrong ? C.coral : C.line, backgroundColor: right ? C.tealLight : wrong ? C.coralLight : C.white, paddingHorizontal: 14, paddingVertical: 12, opacity: pick !== null && !right && !wrong ? 0.5 : 1 }}
                    >
                      <View style={{ width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: fg, alignItems: 'center', justifyContent: 'center' }}>
                        {right ? <Check size={16} color={fg} /> : <Text style={font(900, 13, fg)}>{String.fromCharCode(65 + n)}</Text>}
                      </View>
                      <Text style={[font(700, 15, fg), { flex: 1, lineHeight: 20 }]}>{t(k)}</Text>
                    </Pressable>
                  )
                })}
              </View>
              {pick !== null ? (
                <FadeUp>
                  <Text testID="intro-feedback" style={[font(700, 15, pick === WARMUP_CORRECT ? C.tealDark : C.coralDark), { marginTop: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: pick === WARMUP_CORRECT ? C.tealLight : C.coralLight, paddingHorizontal: 16, paddingVertical: 12, lineHeight: 20 }]}>
                    {pick === WARMUP_CORRECT ? t('intro.warmup.right') : t('intro.warmup.wrong')}
                  </Text>
                </FadeUp>
              ) : null}
            </Card>
          ) : null}
        </FadeUp>
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 2, borderTopColor: C.line, paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 16 }}>
        {i > 0 ? <Btn tone="ghost" label={t('intro.back')} onPress={() => go(-1)} /> : null}
        <View style={{ flex: 1 }}>
          {last ? (
            <Btn testID="intro-finish" block disabled={pick === null} label={entry === 'first_lesson' ? t('intro.start') : t('intro.done')} onPress={finish} />
          ) : (
            <Btn testID="intro-next" block label={t('intro.next')} onPress={() => go(1)} />
          )}
        </View>
      </View>
    </View>
  )
}

function Card({ mascot = 'default', kicker, title, body, children }: { mascot?: 'default' | 'happy' | 'think'; kicker: string; title: string; body: string; children: ReactNode }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
        <Mascot mood={mascot} size={84} />
        <View style={{ flex: 1, paddingBottom: 4 }}>
          <Text style={[font(900, 12, C.brand), caps(12)]}>{kicker}</Text>
          <Text style={[font(900, 24), { lineHeight: 29 }]}>{title}</Text>
        </View>
      </View>
      <Text style={[font(600, 16), { marginTop: 12, marginBottom: 16, lineHeight: 22 }]}>{body}</Text>
      {children}
    </View>
  )
}

function Example({ tone, label, text, note }: { tone: 'coral' | 'teal'; label: string; text: string; note: string }) {
  const c = tone === 'coral' ? { b: C.coral, bg: alpha(C.coralLight, 0.6), k: C.coralDark } : { b: C.teal, bg: alpha(C.tealLight, 0.6), k: C.tealDark }
  return (
    <View style={{ borderRadius: 18, borderWidth: 2, borderColor: c.b, backgroundColor: c.bg, paddingHorizontal: 16, paddingVertical: 12 }}>
      <Text style={[font(900, 12, c.k), caps(12)]}>{label}</Text>
      <Text style={[font(800, 16), { marginTop: 4, lineHeight: 21 }]}>{text}</Text>
      <Text style={[font(700, 13, c.k), { marginTop: 4, lineHeight: 17 }]}>{note}</Text>
    </View>
  )
}
