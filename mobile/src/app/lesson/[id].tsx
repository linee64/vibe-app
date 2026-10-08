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
import { C, font } from '../../theme'

const PRAISE = ['Отлично!', 'Супер!', 'В точку!', 'Так держать!', 'Прекрасно!']

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
  const [praise, setPraise] = useState(PRAISE[0])
  const praiseRef = useRef(0)
  const [quitOpen, setQuitOpen] = useState(false)
  const [empty, setEmpty] = useState<null | 'menu' | 'review'>(null)
  const [hint, setHint] = useState<Hint | null>(null)
  const [recharged, setRecharged] = useState(false)
  const [lastWrong, setLastWrong] = useState<Exercise | null>(null)
  const startRef = useRef(0)
  const wasDone = useRef(false)

  useEffect(() => {
    startRef.current = Date.now()
    wasDone.current = progress.completed.includes(id)
    if (progress.hearts === 0) {
      refillHearts()
      toast('Демо: Бипи подзарядился ⚡')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const ex = exercises[queue[pos]]
  const isRetry = queue.indexOf(queue[pos]) < pos

  const finish = useCallback(
    (m: number, a: number) => {
      const seconds = Math.max(1, Math.round((Date.now() - startRef.current) / 1000))
      const perfect = m === 0
      const xp = wasDone.current ? 5 : perfect ? 15 : 10
      const accuracy = Math.round((exercises.length / Math.max(a, 1)) * 100)
      completeLesson(id, xp, perfect)
      router.replace({ pathname: '/lesson-complete', params: { xp: String(xp), accuracy: String(accuracy), seconds: String(seconds), gems: String(perfect ? 10 : 5), title: found?.title ?? '', unit: found ? `Раздел ${found.unit.num} · ${found.unit.title}` : '', node: id } })
    },
    [completeLesson, exercises.length, found, id, router],
  )

  const check = useCallback(
    (skip = false) => {
      if (!ex || status !== 'idle') return
      if (!skip && !canCheck(ex, answer)) return
      const a = attempts + 1
      setAttempts(a)
      if (!skip && isCorrect(ex, answer)) {
        void buzz('ok')
        setSolved((s) => s + 1)
        praiseRef.current = (praiseRef.current + 1) % PRAISE.length
        setPraise(PRAISE[praiseRef.current])
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
    [ex, status, answer, attempts, mistakes, pos, isRetry, loseHeart, addCharge],
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
      setEmpty('menu')
      return
    }
    if (pos + 1 >= queue.length) {
      finish(mistakes, attempts)
      return
    }
    advance()
  }, [status, progress.hearts, pos, queue.length, mistakes, attempts, finish, advance])

  const buyHint = useCallback(() => {
    if (!ex || hint || status !== 'idle') return
    if (!spendGems(HINT_COST)) {
      toast(`Нужно ${tokens(HINT_COST)} — их дают за уроки`)
      return
    }
    void buzz('tap')
    setHint(hintFor(ex))
  }, [ex, hint, status, spendGems, toast])

  if (!found) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: C.white }}>
        <Mascot mood="think" size={140} />
        <Txt w={900} size={22}>Урок не найден</Txt>
        <Btn label="На главную" onPress={() => router.replace('/(tabs)/learn')} />
      </View>
    )
  }

  const sheet = status === 'correct' ? { bg: C.tealLight, fg: C.tealDark, tone: 'teal' as const } : status === 'wrong' ? { bg: C.coralLight, fg: C.coralDark, tone: 'coral' as const } : null

  return (
    <View style={{ flex: 1, backgroundColor: C.white }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8 }}>
        <Pressable testID="close-lesson" accessibilityLabel="Закрыть урок" onPress={() => setQuitOpen(true)} hitSlop={8}>
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
              <Text style={font(900, 20, sheet.fg)}>{status === 'correct' ? praise : 'Не совсем так'}</Text>
              {recharged ? (
                <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, backgroundColor: C.white, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Battery level={Math.min(CHARGE_MAX, progress.hearts)} size={16} />
                  <Text style={font(900, 12, C.tealDark)}>+1 заряд: ошибка исправлена</Text>
                </View>
              ) : null}
              {status === 'wrong' && ex ? (
                <Text style={font(800, 15, sheet.fg)}>Правильный ответ: <Text style={font(700, 15, sheet.fg)}>{correctText(ex)}</Text></Text>
              ) : null}
              {ex ? <Text style={[font(600, 14, sheet.fg), { opacity: 0.9 }]}>{ex.explain}</Text> : null}
              {status === 'wrong' && progress.hearts > 0 ? <Text style={[font(800, 12, sheet.fg), { opacity: 0.8 }]}>Задание вернётся в конце урока — исправишь и вернёшь деление заряда.</Text> : null}
            </View>
            <Btn testID="next" label={status === 'correct' ? 'Продолжить' : 'Понятно'} tone={sheet.tone} block onPress={next} />
          </>
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable testID="hint-btn" accessibilityLabel={`Подсказка за ${tokens(HINT_COST)}`} disabled={!!hint || progress.gems < HINT_COST} onPress={buyHint} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: C.line, borderBottomColor: C.line, paddingHorizontal: 12, opacity: hint || progress.gems < HINT_COST ? 0.45 : 1 }}>
              <Text style={{ fontSize: 16 }}>💡</Text>
              <Token size={16} />
              <Text style={font(900, 14, C.tealDark)}>{HINT_COST}</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Btn testID="check" label="Проверить" block disabled={!canCheck(ex, answer)} onPress={() => check()} />
            </View>
          </View>
        )}
      </View>

      <Sheet open={quitOpen} onClose={() => setQuitOpen(false)} label="Выйти из урока">
        <View style={{ alignItems: 'center' }}>
          <Mascot mood="think" size={110} />
        </View>
        <Txt w={900} size={22} center>Уже уходишь?</Txt>
        <Txt w={600} size={15} color={C.muted} center>Прогресс этого урока не сохранится.</Txt>
        <Btn label="Продолжить урок" block onPress={() => setQuitOpen(false)} />
        <Btn label="Выйти" tone="coral" block onPress={() => router.replace('/(tabs)/learn')} />
      </Sheet>

      <Sheet open={empty === 'menu'} label="Заряд Бипи на нуле">
        <View style={{ alignItems: 'center' }}>
          <Mascot mood="think" size={100} />
          <Battery level={0} />
        </View>
        <Txt w={900} size={22} center>Бипи на нуле</Txt>
        <Txt w={600} size={14} color={C.muted} center>
          Это не штраф — просто пауза. Разбери ошибку, и Бипи получит деление заряда. Или подожди: +1 деление каждые {RECHARGE_MINUTES} мин{chargeAt ? ` (следующее ${waitText(chargeAt)})` : ''}.
        </Txt>
        <Btn testID="empty-review" label="🔁 Разобрать ошибку · +1 деление" tone="teal" block onPress={() => setEmpty('review')} />
        <Btn
          testID="empty-buy"
          label={`₮ Подзарядить за ${RECHARGE_COST}`}
          tone="ghost"
          block
          disabled={progress.gems < RECHARGE_COST}
          onPress={() => {
            if (!spendGems(RECHARGE_COST)) return
            refillHearts()
            setEmpty(null)
            advance()
          }}
        />
        <Btn label="Выйти" tone="ghost" block onPress={() => router.replace('/(tabs)/learn')} />
      </Sheet>

      <Sheet open={empty === 'review' && !!lastWrong} label="Разбор ошибки">
        {lastWrong ? (
          <>
            <Txt w={900} size={12} color={C.brand}>РАЗБОР С БИПИ</Txt>
            <Txt w={900} size={19}>{lastWrong.title}</Txt>
            <View style={{ borderRadius: 16, borderWidth: 2, borderColor: C.teal, backgroundColor: C.tealLight, padding: 12 }}>
              <Txt w={900} size={11} color={C.tealDark}>ПРАВИЛЬНЫЙ ОТВЕТ</Txt>
              <Txt w={800} size={15}>{correctText(lastWrong)}</Txt>
            </View>
            <View style={{ borderRadius: 16, backgroundColor: C.snow, padding: 12 }}>
              <Txt w={900} size={11} color={C.muted}>ПОЧЕМУ</Txt>
              <Txt w={600} size={14}>{lastWrong.explain}</Txt>
            </View>
            <Btn
              testID="empty-done"
              label="Понял, заряжаем ⚡"
              tone="teal"
              block
              onPress={() => {
                addCharge(1)
                setEmpty(null)
                advance()
                toast('+1 деление заряда ⚡')
              }}
            />
          </>
        ) : null}
      </Sheet>
    </View>
  )
}
