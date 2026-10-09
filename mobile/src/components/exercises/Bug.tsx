import { Pressable, Text, View } from 'react-native'
import Animated, { ZoomIn } from 'react-native-reanimated'
import type { BugExercise } from '@web/data/types'
import { C, font } from '../../theme'
import { highlight, mono } from '../code'
import { AiAvatar, Head, HintNote, type ViewProps } from './shared'
import { t } from '@web/i18n/core'

/** «Найди баг» (код) и «Красный флаг» (фраза в ответе ИИ): тап по строке */
export function BugView({ ex, answer, setAnswer, status, hint }: ViewProps<BugExercise>) {
  const idle = status === 'idle'
  const text = ex.mode === 'text'
  return (
    <View>
      <Head kind={text ? 'flag' : 'bug'} title={ex.title} prompt={ex.prompt} />
      <HintNote hint={hint} />
      {text ? (
        <View style={{ overflow: 'hidden', borderRadius: 20, borderWidth: 2, borderColor: C.line, borderBottomWidth: 5, backgroundColor: C.white }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 2, borderBottomColor: C.line, backgroundColor: C.snow, paddingHorizontal: 13, paddingVertical: 8 }}>
            <AiAvatar size={22} />
            <Text numberOfLines={1} style={[font(900, 13), { flexShrink: 1 }]}>{ex.file}</Text>
            <View style={{ marginLeft: 'auto', borderRadius: 99, backgroundColor: C.coralLight, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={font(900, 11, C.coralDark)}>{t('x1ng1cus')}</Text>
            </View>
          </View>
          <View style={{ gap: 6, padding: 10 }}>
            {ex.code.map((line, i) => {
              const sel = answer === i
              const dim = !!hint?.dim?.includes(i) && idle && i !== ex.correct
              const border = !idle ? (i === ex.correct ? C.teal : sel ? C.coral : 'transparent') : sel ? C.coral : 'transparent'
              const bg = !idle ? (i === ex.correct ? C.tealLight : sel ? C.coralLight : 'transparent') : sel ? C.coralLight : 'transparent'
              return (
                <Pressable key={i} testID={`line-${i}`} accessibilityRole="button" disabled={!idle || dim} onPress={() => setAnswer(i)} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 12, borderWidth: 2, borderColor: border, backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 8, opacity: dim ? 0.35 : !idle && i !== ex.correct && !sel ? 0.55 : 1 }}>
                  <Text style={{ fontSize: 14, opacity: sel || (!idle && i === ex.correct) ? 1 : 0 }}>🚩</Text>
                  <Text style={[font(600, 14.5), { flex: 1, lineHeight: 20 }]}>{line}</Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      ) : (
        <View style={{ overflow: 'hidden', borderRadius: 20, backgroundColor: C.code, borderBottomWidth: 6, borderBottomColor: '#1a1628' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.codeBar, paddingHorizontal: 12, paddingVertical: 10 }}>
            {[C.coral, C.gold, C.teal].map((c) => (
              <View key={c} style={{ width: 11, height: 11, borderRadius: 11, backgroundColor: c }} />
            ))}
            <Text numberOfLines={1} style={[mono(12, 'rgba(255,255,255,0.8)'), { marginLeft: 8, flexShrink: 1, borderBottomWidth: 2, borderBottomColor: C.brand, paddingHorizontal: 8 }]}>{ex.file}</Text>
            <View style={{ marginLeft: 'auto', borderRadius: 99, backgroundColor: 'rgba(124,77,255,0.3)', paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={font(800, 10, '#C9A8FF')}>{t('x1mj9nf1')}</Text>
            </View>
          </View>
          <View style={{ paddingVertical: 8 }}>
            {ex.code.map((line, i) => {
              const sel = answer === i
              const dim = !!hint?.dim?.includes(i) && idle && i !== ex.correct
              const border = !idle ? (i === ex.correct ? C.teal : sel ? C.coral : 'transparent') : sel ? C.brand : 'transparent'
              const bg = !idle ? (i === ex.correct ? 'rgba(19,194,174,0.3)' : sel ? 'rgba(255,122,89,0.3)' : 'transparent') : sel ? 'rgba(124,77,255,0.35)' : 'transparent'
              return (
                <Pressable key={i} testID={`line-${i}`} accessibilityRole="button" disabled={!idle || dim} onPress={() => setAnswer(i)} style={{ flexDirection: 'row', alignItems: 'flex-start', borderLeftWidth: 4, borderLeftColor: border, backgroundColor: bg, paddingVertical: 6, paddingRight: 12, opacity: dim ? 0.3 : !idle && i !== ex.correct && !sel ? 0.55 : 1 }}>
                  <Text style={[mono(13, 'rgba(255,255,255,0.3)'), { width: 32, textAlign: 'right', marginRight: 10 }]}>{i + 1}</Text>
                  <Text style={[mono(13), { flex: 1 }]}>{line ? highlight(line, `b${i}-`) : ' '}</Text>
                  {!idle && i === ex.correct ? (
                    <Animated.Text entering={ZoomIn} style={{ paddingLeft: 6 }}>
                      🐞
                    </Animated.Text>
                  ) : null}
                </Pressable>
              )
            })}
          </View>
        </View>
      )}
      <Text style={[font(700, 14, C.muted), { marginTop: 12, textAlign: 'center' }]}>{text ? t('x0k81lf8') : t('x1o415sx')}</Text>
    </View>
  )
}
