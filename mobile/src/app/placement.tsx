import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TIERS, PLACEMENT_PASS, placementQuestions, tiersBefore, type TierId } from '@web/data/tiers'
import { isCorrect, type Answer, type Status } from '@web/data/exerciseLogic'
import { useStore } from '../store/Store'
import { ExerciseView } from '../components/exercises'
import { Btn, ProgressBar, Txt } from '../components/ui'
import { Mascot } from '../components/Mascot'
import { buzz } from '../lib/haptics'
import { C, font } from '../theme'

/** Тест на уровень: 8 вопросов, заряд не тратится. Зачёт — открывает предыдущие тиры. */
export default function PlacementScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { progress, passTiersByTest, setPlacementSeen } = useStore()
  const target: TierId = TIERS.find((t) => !progress.tiersByTest.includes(t.id) && t.id !== 'novice')?.id ?? 'mid'
  const questions = useMemo(() => placementQuestions(target), [target])
  const [step, setStep] = useState<'intro' | 'quiz' | 'done'>('intro')
  const [i, setI] = useState(0)
  const [answer, setAnswer] = useState<Answer>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [score, setScore] = useState(0)

  const ex = questions[i]
  const check = () => {
    if (!ex || status !== 'idle' || answer === null) return
    const ok = isCorrect(ex, answer)
    void buzz(ok ? 'ok' : 'bad')
    if (ok) setScore((s) => s + 1)
    setStatus(ok ? 'correct' : 'wrong')
  }
  const next = () => {
    if (i + 1 >= questions.length) setStep('done')
    else {
      setI((n) => n + 1)
      setAnswer(null)
      setStatus('idle')
    }
  }
  const finish = () => {
    const passed = score >= PLACEMENT_PASS
    if (passed) passTiersByTest(tiersBefore(target))
    else setPlacementSeen()
    router.replace('/(tabs)/learn')
  }

  if (step === 'intro')
    return (
      <View style={{ flex: 1, backgroundColor: C.snow, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 16, paddingHorizontal: 22, gap: 12 }}>
        <View style={{ alignItems: 'center' }}>
          <Mascot mood="think" size={150} />
        </View>
        <Txt w={900} size={26} center>Тест на уровень</Txt>
        <Txt w={700} size={15} color={C.muted} center>
          {questions.length} вопросов из пройденных разделов. Заряд Бипи не тратится. {PLACEMENT_PASS} из {questions.length} — и тир откроется.
        </Txt>
        <View style={{ flex: 1 }} />
        <Btn testID="placement-start" label="Начать" block disabled={!questions.length} onPress={() => setStep('quiz')} />
        <Btn label="Не сейчас" tone="ghost" block onPress={() => { setPlacementSeen(); router.back() }} />
      </View>
    )

  if (step === 'done') {
    const passed = score >= PLACEMENT_PASS
    return (
      <View style={{ flex: 1, backgroundColor: passed ? C.tealLight : C.snow, paddingTop: insets.top + 30, paddingBottom: insets.bottom + 16, paddingHorizontal: 22, gap: 10, alignItems: 'center' }}>
        <Mascot mood={passed ? 'happy' : 'think'} size={160} />
        <Txt w={900} size={26} center>{passed ? 'Тир открыт!' : 'Пока рано'}</Txt>
        <Txt w={800} size={18} center>{score} из {questions.length}</Txt>
        <Txt w={700} size={14} color={C.muted} center>{passed ? 'Предыдущие тиры засчитаны — можно идти дальше по пути.' : `Нужно ${PLACEMENT_PASS} верных. Пройди уроки и попробуй снова.`}</Txt>
        <View style={{ flex: 1 }} />
        <Btn testID="placement-finish" label="На путь" block onPress={finish} style={{ alignSelf: 'stretch' }} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.white }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <Pressable accessibilityLabel="Закрыть тест" onPress={() => router.back()} hitSlop={8}>
          <Text style={font(900, 24, C.muted)}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={(i / questions.length) * 100} />
        </View>
        <Txt w={900} size={14} color={C.muted}>{i + 1}/{questions.length}</Txt>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {ex ? <ExerciseView ex={ex} answer={answer} setAnswer={setAnswer} status={status} /> : null}
      </ScrollView>
      <View style={{ padding: 16, paddingBottom: insets.bottom + 12, borderTopWidth: 2, borderTopColor: C.line }}>
        {status === 'idle' ? <Btn testID="placement-check" label="Проверить" block disabled={answer === null} onPress={check} /> : <Btn testID="placement-next" label={i + 1 >= questions.length ? 'К результату' : 'Дальше'} tone={status === 'correct' ? 'teal' : 'coral'} block onPress={next} />}
      </View>
    </View>
  )
}
