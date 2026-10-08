import { Text, View } from 'react-native'
import type { ChoiceExercise } from '@web/data/types'
import { C, font } from '../../theme'
import { Tile } from '../ui'
import { Head, HintNote, Letter, optTone, toneColor, type ViewProps } from './shared'

/** «Ситуация»: карточка-сценарий → что сделаешь? */
export function ScenarioView({ ex, answer, setAnswer, status, hint }: ViewProps<ChoiceExercise>) {
  const idle = status === 'idle'
  return (
    <View>
      <Head kind="choice" title={ex.title} prompt={ex.situation ? ex.prompt : undefined} />
      <View style={{ marginBottom: 14, overflow: 'hidden', borderRadius: 20, borderWidth: 2, borderColor: '#FFD58C', borderBottomWidth: 5, backgroundColor: '#FFF8EA', paddingHorizontal: 16, paddingVertical: 13 }}>
        <Text style={{ position: 'absolute', right: -6, top: -10, fontSize: 56, opacity: 0.15 }}>🧭</Text>
        <Text style={[font(900, 11, C.amberDark), { textTransform: 'uppercase', letterSpacing: 0.8 }]}>Ситуация</Text>
        <Text style={[font(700, 16), { marginTop: 2, lineHeight: 22 }]}>{ex.situation ?? ex.prompt}</Text>
      </View>
      <Text style={[font(900, 15), { marginBottom: 10 }]}>Что сделаешь?</Text>
      <HintNote hint={hint} />
      <View style={{ gap: 10 }}>
        {ex.options.map((o, i) => {
          const dim = !!hint?.dim?.includes(i) && idle && i !== ex.correct
          const t = optTone(i, answer, status, ex.correct)
          return (
            <Tile key={i} testID={`option-${i}`} state={dim ? 'dim' : t} disabled={!idle || dim} onPress={() => setAnswer(i)}>
              <Letter i={i} on={answer === i || (!idle && i === ex.correct)} color={toneColor(t)} />
              <Text style={[font(700, 15, toneColor(t)), { flex: 1, lineHeight: 20, textDecorationLine: dim ? 'line-through' : 'none', opacity: dim ? 0.45 : 1 }]}>{ex.quoted ? `«${o}»` : o}</Text>
            </Tile>
          )
        })}
      </View>
    </View>
  )
}
