import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { findLesson } from '@web/data/course'
import { CHARGE_MAX, HINT_COST, RECHARGE_COST, RECHARGE_MINUTES, tokens, waitText } from '@web/data/economy'
import { canCheck, correctText, hintFor, isCorrect, type Answer, type Hint, type Status } from '@web/data/exerciseLogic'
import type { Exercise } from '@web/data/types'
import { useStore } from '../../store/Store'
import { ExerciseView } from '../../components/exercises'
import { Battery, Btn, ProgressBar, Token, Txt } from '../../components/ui'
import { Sheet } from '../../components/Sheet'
import { Mascot } from '../../components/Mascot'
import { useToast } from '../../components/Toast'
import { buzz } from '../../lib/haptics'
import { track } from '../../lib/analytics'
import { requestMicroPrompt } from '../../lib/feedback'
import { C, font } from '../../theme'
import { t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'

const PRAISE = () => [t('lesson.praise.1'), t('lesson.praise.2'), t('lesson.praise.3'), t('lesson.praise.4'), t('lesson.praise.5')]

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const found = findLesson(id)
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const { progress, loseHeart, refillHearts, addCharge, spendGems, chargeAt, completeLesson } = useStore()

  const exercises = found?.exercises ?? []
  const [queue, setQueue] = useState<number[]>(() => exercises.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [answer, setAnswer] = useState<Answer>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [solved, setSolved] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [praise, setPraise] = useState(PRAISE()[0])
  const praiseRef = useRef(0)
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
    if (progress.hearts === 0) {
      refillHearts()
      toast(t('x1imvgi9'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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
      if (ok) {
        void buzz('ok')
        setSolved((s) => s + 1)
        praiseRef.current = (praiseRef.current + 1) % PRAISE().length
        setPraise(PRAISE()[praiseRef.current])
        setStatus('correct')
        if (isRetry) {
          addCharge(1)
          setRecharged(true)
        }
      } else {
        void buzz('bad')
        const m = mistakes + 1
        setMistakes(m)
        setStatus('wrong')
        setLastWrong(ex)
        if (!skip) loseHeart()
        setQueue((q) => [...q, q[pos]])
      }
    },
    [ex, status, answer, attempts, mistakes, pos, isRetry, loseHeart, addCharge, id],
  )

  const advance = useCallback(() => {
    setPos((p) => p + 1)
    setAnswer(null)
    setStatus('idle')
    setHint(null)
    setRecharged(false)
  }, [])

  const next = useCallback(() => {
    if (status === 'wrong' && progress.hearts === 0) {
      track('charge_empty', { lesson_id: id, step: pos + 1 })
      setEmpty('menu')
      return
    }
    if (pos + 1 >= queue.length) {
      finish(mistakes, attempts)
      return
    }
    advance()
  }, [status, progress.hearts, pos, queue.length, mistakes, attempts, finish, advance, id])

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

  return (
    <View style={{ flex: 1, backgroundColor: C.white }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8 }}>
        <Pressable testID="close-lesson" accessibilityLabel={t('x1fqusza')} onPress={() => setQuitOpen(true)} hitSlop={8}>
          <Text style={font(900, 26, C.muted)}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={(solved / exercises.length) * 100} />
        </View>
        <Battery level={progress.hearts} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View key={pos}>{ex ? <ExerciseView ex={ex} answer={answer} setAnswer={setAnswer} status={status} hint={hint} /> : null}</View>
      </ScrollView>

      <View style={{ borderTopWidth: 2, borderTopColor: sheet ? 'transparent' : C.line, backgroundColor: sheet ? sheet.bg : C.white, paddingHorizontal: 16, paddingTop: 14, paddingBottom: insets.bottom + 12, gap: 12 }}>
        {sheet ? (
          <>
            <View style={{ gap: 4 }}>
              <Text style={font(900, 20, sheet.fg)}>{status === 'correct' ? praise : t('x1i1nft2')}</Text>
              {recharged ? (
                <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, backgroundColor: C.white, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Battery level={Math.min(CHARGE_MAX, progress.hearts)} size={16} />
                  <Text style={font(900, 12, C.tealDark)}>{t('x1l4yb9d')}</Text>
                </View>
              ) : null}
              {status === 'wrong' && ex ? (
                <Text style={font(800, 15, sheet.fg)}>{tx('x03h2ydh', { ex: correctText(ex) }, [(chunk) => <Text style={font(700, 15, sheet.fg)}>{chunk}</Text>])}</Text>
              ) : null}
              {ex ? <Text style={[font(600, 14, sheet.fg), { opacity: 0.9 }]}>{ex.explain}</Text> : null}
              {status === 'wrong' && progress.hearts > 0 ? <Text style={[font(800, 12, sheet.fg), { opacity: 0.8 }]}>{t('x017zrtc')}</Text> : null}
            </View>
            <Btn testID="next" label={status === 'correct' ? t('x1kpmy5f') : t('x0kpnyn9')} tone={sheet.tone} block onPress={next} />
          </>
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable testID="hint-btn" accessibilityLabel={t('x08bdlxg', { HINT_COST: tokens(HINT_COST) })} disabled={!!hint || progress.gems < HINT_COST} onPress={buyHint} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: C.line, borderBottomColor: C.line, paddingHorizontal: 12, opacity: hint || progress.gems < HINT_COST ? 0.45 : 1 }}>
              <Text style={{ fontSize: 16 }}>💡</Text>
              <Token size={16} />
              <Text style={font(900, 14, C.tealDark)}>{HINT_COST}</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Btn testID="check" label={t('x11ht3eb')} block disabled={!canCheck(ex, answer)} onPress={() => check()} />
            </View>
          </View>
        )}
      </View>

      <Sheet open={quitOpen} onClose={() => setQuitOpen(false)} label={t('x026dawp')}>
        <View style={{ alignItems: 'center' }}>
          <Mascot mood="think" size={110} />
        </View>
        <Txt w={900} size={22} center>{t('x0anbgvi')}</Txt>
        <Txt w={600} size={15} color={C.muted} center>{t('x1xlzamk')}</Txt>
        <Btn label={t('x1jeg8pe')} block onPress={() => setQuitOpen(false)} />
        <Btn label={t('x0c80x6j')} tone="coral" block onPress={() => { exitReason.current = 'quit'; router.replace('/(tabs)/learn') }} />
      </Sheet>

      <Sheet open={empty === 'menu'} label={t('x1deozt6')}>
        <View style={{ alignItems: 'center' }}>
          <Mascot mood="think" size={100} />
          <Battery level={0} />
        </View>
        <Txt w={900} size={22} center>{t('x11e7xbg')}</Txt>
        <Txt w={600} size={14} color={C.muted} center>{t('lesson.chargePause', { min: RECHARGE_MINUTES })}{chargeAt ? t('x0p88rx4', { chargeAt: waitText(chargeAt) }) : ''}.
        </Txt>
        <Btn testID="empty-review" label={t('x0s2jy7a')} tone="teal" block onPress={() => setEmpty('review')} />
        <Btn
          testID="empty-buy"
          label={t('x0rqhnci', { RECHARGE_COST })}
          tone="ghost"
          block
          disabled={progress.gems < RECHARGE_COST}
          onPress={() => {
            if (!spendGems(RECHARGE_COST)) return
            track('tokens_spent', { reason: 'recharge', amount: RECHARGE_COST, where: 'charge_empty' })
            refillHearts()
            setEmpty(null)
            advance()
          }}
        />
        <Btn label={t('x0c80x6j')} tone="ghost" block onPress={() => { exitReason.current = 'charge_empty'; router.replace('/(tabs)/learn') }} />
      </Sheet>

      <Sheet open={empty === 'review' && !!lastWrong} label={t('x18w0nxa')}>
        {lastWrong ? (
          <>
            <Txt w={900} size={12} color={C.brand}>{t('x09zgdye')}</Txt>
            <Txt w={900} size={19}>{lastWrong.title}</Txt>
            <View style={{ borderRadius: 16, borderWidth: 2, borderColor: C.teal, backgroundColor: C.tealLight, padding: 12 }}>
              <Txt w={900} size={11} color={C.tealDark}>{t('x1ocwuu7')}</Txt>
              <Txt w={800} size={15}>{correctText(lastWrong)}</Txt>
            </View>
            <View style={{ borderRadius: 16, backgroundColor: C.snow, padding: 12 }}>
              <Txt w={900} size={11} color={C.muted}>{t('x0h7oyhh')}</Txt>
              <Txt w={600} size={14}>{lastWrong.explain}</Txt>
            </View>
            <Btn
              testID="empty-done"
              label={t('x122fqbj')}
              tone="teal"
              block
              onPress={() => {
                addCharge(1)
                setEmpty(null)
                advance()
                toast(t('x1wb6njl'))
              }}
            />
          </>
        ) : null}
      </Sheet>
    </View>
  )
}
