import { Text, View } from 'react-native'
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated'
import type { PredictExercise } from '@web/data/types'
import { C, font } from '../../theme'
import { Tile } from '../ui'
import { AiAvatar, CodeBlock, FrameCard, Head, HintNote, MeBubble, OutcomeView, optTone, toneColor, type ViewProps } from './shared'

/** «Предскажи результат»: промпт → какой результат выдаст ИИ */
export function PredictView({ ex, answer, setAnswer, status, hint }: ViewProps<PredictExercise>) {
  const idle = status === 'idle'
  return (
    <View>
      <Head kind="predict" title={ex.title} prompt={ex.prompt} />
      <FrameCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 2, borderBottomColor: C.line, backgroundColor: C.snow, paddingHorizontal: 13, paddingVertical: 8 }}>
          <AiAvatar size={22} />
          <Text style={font(900, 13)}>{ex.tool ?? 'Чат с ИИ'}</Text>
          <Text style={[font(800, 12, C.muted), { marginLeft: 'auto' }]}>{idle ? 'отправлено' : 'ответ получен'}</Text>
        </View>
        <View style={{ gap: 10, padding: 13 }}>
          <MeBubble text={ex.input} />
          {ex.code ? <CodeBlock lines={ex.code} small /> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AiAvatar size={24} />
            {idle ? (
              <View style={{ flexDirection: 'row', gap: 4, borderRadius: 16, borderWidth: 2, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 9 }} accessibilityLabel="ИИ думает">
                {[0, 1, 2].map((d) => (
                  <View key={d} style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: C.brandMid }} />
                ))}
              </View>
            ) : (
              <Animated.View entering={FadeIn} style={{ flex: 1, borderRadius: 16, borderWidth: 2, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={font(800, 13)}>Вот что вышло: {ex.outcomes[ex.correct].label.toLowerCase()}</Text>
              </Animated.View>
            )}
          </View>
        </View>
      </FrameCard>
      <Text style={[font(900, 16), { marginTop: 18, marginBottom: 10 }]}>Что скорее всего выдаст ИИ?</Text>
      <HintNote hint={hint} />
      <View style={{ gap: 12 }}>
        {ex.outcomes.map((o, i) => {
          const dim = !!hint?.dim?.includes(i) && idle && i !== ex.correct
          const t = optTone(i, answer, status, ex.correct)
          return (
            <Tile key={i} testID={`outcome-${i}`} state={dim ? 'dim' : t} disabled={!idle || dim} onPress={() => setAnswer(i)}>
              <View style={{ flex: 1, gap: 8, opacity: dim ? 0.35 : 1 }} pointerEvents="none">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[font(900, 12, toneColor(t)), { textTransform: 'uppercase', letterSpacing: 0.8 }]}>Вариант {i + 1}</Text>
                  {!idle && i === ex.correct ? <Text style={font(900, 13, C.tealDark)}>✓</Text> : null}
                </View>
                <OutcomeView o={o} />
                {!idle ? (
                  <Animated.Text entering={FadeInUp} style={font(800, 12.5, toneColor(t))}>
                    {o.label}
                  </Animated.Text>
                ) : null}
              </View>
            </Tile>
          )
        })}
      </View>
    </View>
  )
}
