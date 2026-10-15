import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { findLesson } from '@web/data/course'
import { HINT_COST, RECHARGE_COST, RECHARGE_MINUTES, tokens, waitText } from '@web/data/economy'
import { canCheck, correctText, hintFor, isCorrect, type Answer, type Hint, type Status } from '@web/data/exerciseLogic'
import type { Exercise } from '@web/data/types'
import { hhmm } from '@web/data/charge'
import { useIsPro } from '../../lib/billing'
import { DEMO_MODE } from '../../lib/env'
import { useStore } from '../../store/Store'
import { ExerciseView } from '../../components/exercises'
import { Battery, Btn, ChargeMeter, ProgressBar, Token, Txt } from '../../components/ui'
import { Dialog } from '../../components/Sheet'
import { Cross, Mascot } from '../../components/art'
import { FadeUp, Pop, Shake } from '../../components/motion'
import { GlossaryButton } from '../../components/Glossary'
import { Gate } from '../../components/Gate'
import { Lightbulb } from 'lucide-react-native'
import { useToast } from '../../components/Toast'
import { buzz } from '../../lib/haptics'
import { playSound } from '../../lib/sound'
import { track } from '../../lib/analytics'
import { requestMicroPrompt } from '../../lib/feedback'
import { C, caps, font } from '../../theme'
import { rawMessage, t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'

const PRAISE = () => [t('lesson.praise.1'), t('lesson.praise.2'), t('lesson.praise.3'), t('lesson.praise.4'), t('lesson.praise.5')]

export default function LessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const unit = findLesson(id)?.unit
  if (!unit) return <LessonScreen key={id} id={id} />
  return (
    <Gate unitId={unit.id} nodeId={id} path={`/lesson/${id}`}>
      <LessonScreen key={id} id={id} />
    </Gate>
  )
}

function LessonScreen({ id }: { id: string }) {
  const found = findLesson(id)
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const { progress, loseHeart, refillHearts, addCharge, spendGems, chargeAt, fullAt, completeLesson, recordAnswer } = useStore()
  // Pro: заряд безлимитный — ошибки его не тратят
  const isPro = useIsPro()

  const exercises = found?.exercises ?? []
  const [queue, setQueue] = useState<number[]>(() => exercises.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [answer, setAnswer] = useState<Answer>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [solved, setSolved] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [praise, setPraise] = useState(PRAISE()[0])
  const [quitOpen, setQuitOpen] = useState(false)
  const [empty, setEmpty] = useState<null | 'menu' | 'review'>(null)
  const [hint, setHint] = useState<Hint | null>(null)
  const [recharged, setRecharged] = useState(false)
  const [lastWrong, setLastWrong] = useState<Exercise | null>(null)
  const startRef = useRef(0)
  const wasDone = useRef(false)
  const firstEver = useRef(false)
  const finished = useRef(false)
  const exitReason = useRef<'quit' | 'charge_empty' | 'left'>('left')
  const stepRef = useRef(0)

  // Ушли из урока, не закончив (крестик, «Выйти», жест «назад») — lesson_abandoned
  useEffect(() => {
    return () => {
      const l = findLesson(id)
      if (!finished.current && l) track('lesson_abandoned', { lesson_id: id, unit: l.unit.num, step: stepRef.current + 1, duration_s: Math.round((Date.now() - startRef.current) / 1000), reason: exitReason.current })
    }
  }, [id])

  useEffect(() => {
    startRef.current = Date.now()
    wasDone.current = progress.completed.includes(id)
    firstEver.current = progress.completed.length === 0
    finished.current = false
    if (found) track('lesson_started', { lesson_id: id, unit: found.unit.num, repeat: wasDone.current })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Pro/демо: заряд безлимитный. Отдельный эффект — статус Pro может прийти уже после открытия урока
  // (подписка/RevenueCat грузятся асинхронно), и тогда Pro-юзер с нулевым зарядом не должен упереться в «Бипи на нуле».
  useEffect(() => {
    if (progress.hearts === 0 && (DEMO_MODE || isPro)) {
      refillHearts()
      toast(t('x1imvgi9'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isPro])

  useEffect(() => {
    stepRef.current = pos
  }, [pos])

  const ex = exercises[queue[pos]]
  const isRetry = queue.indexOf(queue[pos]) < pos

  const finish = useCallback(
    (m: number, a: number) => {
      const seconds = Math.max(1, Math.round((Date.now() - startRef.current) / 1000))
      const perfect = m === 0
      const xp = wasDone.current ? 5 : perfect ? 15 : 10
      const accuracy = Math.round((exercises.length / Math.max(a, 1)) * 100)
      completeLesson(id, xp, perfect)
      playSound('complete')
      finished.current = true
      track('lesson_completed', { lesson_id: id, unit: found?.unit.num ?? 0, mistakes: m, duration_s: seconds, perfect, accuracy, repeat: wasDone.current })
      if (!wasDone.current && firstEver.current) void requestMicroPrompt('first_lesson')
      router.replace({ pathname: '/lesson-complete', params: { xp: String(xp), accuracy: String(accuracy), seconds: String(seconds), gems: String(perfect ? 10 : 5), title: found?.title ?? '', unit: found ? t('x11mxrex', { num: found.unit.num, title: found.unit.title }) : '', node: id } })
    },
    [completeLesson, exercises.length, found, id, router],
  )

  const check = useCallback(
    (skip = false) => {
      if (!ex || status !== 'idle') return
      if (!skip && !canCheck(ex, answer)) return
      const a = attempts + 1
      setAttempts(a)
      const ok = !skip && isCorrect(ex, answer)
      track('exercise_answered', { lesson_id: id, type: ex.kind, correct: ok, retry: isRetry, skipped: skip })
      recordAnswer(ok)
      if (ok) {
        void buzz('ok')
        playSound('correct')
        setSolved((s) => s + 1)
        setPraise(PRAISE()[Math.floor(Math.random() * PRAISE().length)])
        setStatus('correct')
        if (isRetry) {
          addCharge(1)
          setRecharged(true)
        }
      } else {
        void buzz('bad')
        playSound('wrong')
        const m = mistakes + 1
        setMistakes(m)
        setStatus('wrong')
        setLastWrong(ex)
        if (!skip && !isPro) loseHeart()
        setQueue((q) => [...q, q[pos]])
      }
    },
    [ex, status, answer, attempts, mistakes, pos, isRetry, isPro, loseHeart, addCharge, id, recordAnswer],
  )

  const advance = useCallback(() => {
    setPos((p) => p + 1)
    setAnswer(null)
    setStatus('idle')
    setHint(null)
    setRecharged(false)
  }, [])

  const next = useCallback(() => {
    if (status === 'wrong' && progress.hearts === 0 && !isPro) {
      track('charge_empty', { lesson_id: id, step: pos + 1 })
      setEmpty('menu')
      return
    }
    if (pos + 1 >= queue.length) {
      finish(mistakes, attempts)
      return
    }
    advance()
  }, [status, progress.hearts, isPro, pos, queue.length, mistakes, attempts, finish, advance, id])

  const buyHint = useCallback(() => {
    if (!ex || hint || status !== 'idle') return
    if (!spendGems(HINT_COST)) {
      toast(t('x18c73qa', { HINT_COST: tokens(HINT_COST) }))
      return
    }
    void buzz('tap')
    track('hint_used', { lesson_id: id, type: ex.kind })
    track('tokens_spent', { reason: 'hint', amount: HINT_COST })
    setHint(hintFor(ex))
  }, [ex, hint, status, spendGems, toast, id])

  if (!found) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: C.white }}>
        <Mascot mood="think" size={140} />
        <Txt w={900} size={22}>{t('x0thqany')}</Txt>
        <Btn label={t('x0povobi')} onPress={() => router.replace('/(tabs)/learn')} />
      </View>
    )
  }

  const sheet = status === 'correct' ? { bg: C.tealLight, fg: C.tealDark, tone: 'teal' as const } : status === 'wrong' ? { bg: C.coralLight, fg: C.coralDark, tone: 'coral' as const } : null
  const canHint = progress.gems >= HINT_COST && !hint

  return (
    <View testID="lesson-screen" style={{ flex: 1, backgroundColor: C.white }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: insets.top + 20, paddingHorizontal: 16 }}>
        <Pressable testID="close-lesson" accessibilityRole="button" accessibilityLabel={t('x1fqusza')} onPress={() => setQuitOpen(true)} hitSlop={8} style={{ padding: 4 }}>
          <Cross size={30} color={C.faint} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={(solved / exercises.length) * 100} min={3} height={18} />
        </View>
        <GlossaryButton where="lesson_list" />
        <Shake run={status === 'wrong'} key={progress.hearts}>
          <ChargeMeter value={progress.hearts} size={26} textSize={19} />
        </Shake>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}>
        <FadeUp key={pos}>{ex ? <ExerciseView ex={ex} answer={answer} setAnswer={setAnswer} status={status} hint={hint} /> : null}</FadeUp>
      </ScrollView>

      <View testID={sheet ? `sheet-${status}` : 'lesson-footer'} style={{ borderTopWidth: 2, borderTopColor: sheet ? 'transparent' : C.line, backgroundColor: sheet ? sheet.bg : C.white, paddingHorizontal: 16, paddingTop: 20, paddingBottom: insets.bottom + 20, gap: 16 }}>
        {sheet ? (
          <>
            <View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 12, rowGap: 4 }}>
                <Text style={[font(900, 22, sheet.fg), { lineHeight: 27 }]}>{status === 'correct' ? praise : t('x1i1nft2')}</Text>
                {recharged ? (
                  <Pop>
                    <View testID="recharged" style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, backgroundColor: C.white, paddingHorizontal: 10, paddingVertical: 2 }}>
                      <Battery level={Math.min(5, progress.hearts)} size={16} />
                      <Text style={font(900, 13, C.tealDark)}>{rawMessage('x1br5ro2').replace(/<0\/>\s*/, '')}</Text>
                    </View>
                  </Pop>
                ) : null}
              </View>
              {status === 'wrong' && ex ? <Text style={[font(800, 16, sheet.fg), { marginTop: 4 }]}>{tx('x03h2ydh', { ex: correctText(ex) }, [(chunk) => <Text style={font(700, 16, sheet.fg)}>{chunk}</Text>])}</Text> : null}
              {ex ? <Text style={[font(600, 15, sheet.fg), { marginTop: 4, lineHeight: 20, opacity: 0.9 }]}>{ex.explain}</Text> : null}
              {status === 'wrong' && progress.hearts > 0 ? <Text style={[font(800, 13, sheet.fg), { marginTop: 4, opacity: 0.8 }]}>{t('x017zrtc')}</Text> : null}
            </View>
            <Btn testID="next" label={status === 'correct' ? t('x1kpmy5f') : t('x0kpnyn9')} tone={sheet.tone} block onPress={next} />
          </>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Btn
              testID="hint-btn"
              tone="ghost"
              disabled={!canHint}
              onPress={buyHint}
              style={{ flexShrink: 0 }}
              icon={<Lightbulb size={20} color={canHint ? C.goldDark : C.disabledText} strokeWidth={2.4} />}
              after={
                <View accessibilityLabel={t('x08bdlxg', { HINT_COST: tokens(HINT_COST) })} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Token size={18} />
                  <Text style={font(800, 15, canHint ? C.tealDark : C.disabledText)}>{HINT_COST}</Text>
                </View>
              }
            />
            <View style={{ flex: 1 }}>
              <Btn testID="check" label={t('x11ht3eb')} block disabled={!canCheck(ex, answer)} onPress={() => check()} />
            </View>
          </View>
        )}
      </View>

      <Dialog open={quitOpen} label={t('x026dawp')} testID="quit-dialog">
        <View style={{ alignItems: 'center' }}>
          <Mascot mood="think" size={120} />
        </View>
        <Txt w={900} size={22} center style={{ marginTop: 12 }}>{t('x0anbgvi')}</Txt>
        <Txt w={600} size={16} color={C.muted} center style={{ marginTop: 4, marginBottom: 24 }}>{t('x1xlzamk')}</Txt>
        <Btn label={t('x1jeg8pe')} block onPress={() => setQuitOpen(false)} />
        <Pressable
          testID="quit-confirm"
          accessibilityRole="button"
          onPress={() => {
            exitReason.current = 'quit'
            setQuitOpen(false)
            router.replace('/(tabs)/learn')
          }}
          style={{ marginTop: 16, paddingVertical: 8 }}
        >
          <Text style={[font(800, 15, C.coralDark), caps(15), { textAlign: 'center' }]}>{t('x0c80x6j')}</Text>
        </Pressable>
      </Dialog>

      <Dialog open={empty === 'menu'} label={t('x1deozt6')} testID="empty-dialog">
        <View style={{ alignSelf: 'center' }}>
          <Mascot mood="think" size={112} />
          <View style={{ position: 'absolute', right: -24, bottom: 4, borderRadius: 12, backgroundColor: C.white, padding: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
            <Battery level={0} size={30} />
          </View>
        </View>
        <Txt w={900} size={22} center style={{ marginTop: 12 }}>{t('x11e7xbg')}</Txt>
        <Txt w={600} size={15} color={C.muted} center style={{ marginTop: 4, marginBottom: 20 }}>
          {t('lesson.chargePause', { min: RECHARGE_MINUTES })}
          {chargeAt ? t('x0p88rx4', { chargeAt: waitText(chargeAt) }) : ''}.
        </Txt>
        {fullAt ? <Txt w={800} size={14} color={C.tealDark} center style={{ marginTop: -12, marginBottom: 20 }}>{t('lesson.fullChargeIn', { time: hhmm(fullAt) })}</Txt> : null}
        <Btn testID="empty-review" label={t('x0s2jy7a')} tone="teal" block onPress={() => setEmpty('review')} />
        <Btn
          testID="empty-buy"
          label={rawMessage('x0xp4yz5').replace(/<0\/>\s*/, '').replace('{RECHARGE_COST}', String(RECHARGE_COST))}
          icon={<Token size={20} />}
          tone="ghost"
          block
          style={{ marginTop: 12 }}
          disabled={progress.gems < RECHARGE_COST}
          onPress={() => {
            if (!spendGems(RECHARGE_COST)) return
            track('tokens_spent', { reason: 'recharge', amount: RECHARGE_COST, where: 'charge_empty' })
            refillHearts()
            setEmpty(null)
            advance()
          }}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            exitReason.current = 'charge_empty'
            setEmpty(null)
            router.replace('/(tabs)/learn')
          }}
          style={{ marginTop: 12, paddingVertical: 8 }}
        >
          <Text style={[font(800, 15, C.muted), caps(15), { textAlign: 'center' }]}>{t('x0c80x6j')}</Text>
        </Pressable>
      </Dialog>

      <Dialog open={empty === 'review' && !!lastWrong} label={t('x18w0nxa')} testID="review-dialog">
        {lastWrong ? (
          <>
            <Text style={[font(900, 12, C.brand), caps(12), { marginBottom: 4 }]}>{t('x11ixt8m')}</Text>
            <Text style={[font(900, 20), { lineHeight: 25 }]}>{lastWrong.title}</Text>
            <View style={{ marginTop: 12, borderRadius: 16, borderWidth: 2, borderColor: C.teal, backgroundColor: C.tealLight, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text style={[font(900, 12, C.tealDark), caps(12)]}>{t('x0b5n5en')}</Text>
              <Text style={[font(800, 15), { marginTop: 2 }]}>{correctText(lastWrong)}</Text>
            </View>
            <View style={{ marginTop: 12, borderRadius: 16, backgroundColor: C.snow, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text style={[font(900, 12, C.muted), caps(12)]}>{t('x095ysxh')}</Text>
              <Text style={[font(600, 15), { marginTop: 2, lineHeight: 20 }]}>{lastWrong.explain}</Text>
            </View>
            <Btn
              testID="empty-done"
              label={t('x122fqbj')}
              tone="teal"
              block
              style={{ marginTop: 20 }}
              onPress={() => {
                addCharge(1)
                setEmpty(null)
                advance()
                toast(t('x1wb6njl'))
              }}
            />
          </>
        ) : null}
      </Dialog>
    </View>
  )
}
