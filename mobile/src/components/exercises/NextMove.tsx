import { Text, View } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import type { NextMoveExercise } from '@web/data/types'
import { C, font } from '../../theme'
import { Tile } from '../ui'
import { AiAvatar, AiBubble, FrameCard, Head, HintNote, MeBubble, optTone, toneColor, type ViewProps } from './shared'
import { t } from '@web/i18n/core'

/** «Следующий ход»: чат с ИИ, где ответ неидеален → лучшее следующее сообщение */
export function NextMoveView({ ex, answer, setAnswer, status, hint }: ViewProps<NextMoveExercise>) {
  const idle = status === 'idle'
  const sent = typeof answer === 'number' && !idle ? ex.options[answer] : null
  return (
    <View>
      <Head kind="nextmove" title={ex.title} prompt={ex.prompt} />
      <FrameCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 2, borderBottomColor: C.line, backgroundColor: C.snow, paddingHorizontal: 13, paddingVertical: 8 }}>
          <AiAvatar size={22} />
          <Text style={font(900, 13)}>{t('x0lc5f4x')}</Text>
          <View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: C.teal }} />
          <Text style={font(700, 12, C.muted)}>{t('x1pjowqn')}</Text>
        </View>
        <View style={{ gap: 12, padding: 13, backgroundColor: '#FBFAFE' }}>
          {ex.chat.map((m, i) => (m.from === 'me' ? <MeBubble key={i} text={m.text} /> : <AiBubble key={i} text={m.text} code={m.code} preview={m.preview} />))}
          {sent ? (
            <Animated.View entering={FadeInUp}>
              <MeBubble text={sent} />
              <Text style={[font(900, 12, status === 'correct' ? C.tealDark : C.coralDark), { textAlign: 'right', marginTop: 4 }]}>{status === 'correct' ? t('x1vxs15u') : t('x1os7oiq')}</Text>
            </Animated.View>
          ) : null}
          {idle ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1, height: 2, backgroundColor: C.line }} />
              <Text style={font(800, 12, C.muted)}>{t('x07bybzh')}</Text>
              <View style={{ flex: 1, height: 2, backgroundColor: C.line }} />
            </View>
          ) : null}
        </View>
      </FrameCard>
      <Text style={[font(900, 16), { marginTop: 18, marginBottom: 10 }]}>{t('x1mxa2gg')}</Text>
      <HintNote hint={hint} />
      <View style={{ gap: 10 }}>
        {ex.options.map((o, i) => {
          const dim = !!hint?.dim?.includes(i) && idle && i !== ex.correct
          const t = optTone(i, answer, status, ex.correct)
          return (
            <Tile key={i} testID={`option-${i}`} state={dim ? 'dim' : t} disabled={!idle || dim} onPress={() => setAnswer(i)}>
              <View style={{ width: 28, height: 28, borderRadius: 28, borderWidth: 2, borderColor: toneColor(t), alignItems: 'center', justifyContent: 'center' }}>
                <Text style={font(900, 12, toneColor(t))}>➤</Text>
              </View>
              <Text style={[font(700, 15, toneColor(t)), { flex: 1, lineHeight: 20, textDecorationLine: dim ? 'line-through' : 'none', opacity: dim ? 0.45 : 1 }]}>{o}</Text>
            </Tile>
          )
        })}
      </View>
    </View>
  )
}
