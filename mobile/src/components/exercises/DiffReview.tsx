import { Pressable, Text, View } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import type { DiffExercise } from '@web/data/types'
import { C, MONO, font } from '../../theme'
import { Head, HintNote, type ViewProps } from './shared'

function lineStyle(l: string) {
  if (l.startsWith('+')) return { bg: C.tealLight, sign: C.tealDark, text: '#0B5E55' }
  if (l.startsWith('-')) return { bg: C.coralLight, sign: C.coralDark, text: '#8A2E19' }
  return { bg: 'transparent', sign: C.muted, text: 'rgba(47,42,71,0.7)' }
}

/** «Ревью правок ИИ»: дифф по кускам → принять или отклонить каждый */
export function DiffView({ ex, answer, setAnswer, status, hint }: ViewProps<DiffExercise>) {
  const idle = status === 'idle'
  const dec = Array.isArray(answer) && answer.length === ex.hunks.length ? answer : ex.hunks.map(() => 0)
  const decide = (i: number, v: number) => {
    if (!idle) return
    const next = [...dec]
    next[i] = next[i] === v ? 0 : v
    setAnswer(next)
  }
  const plus = ex.hunks.reduce((n, h) => n + h.lines.filter((l) => l.startsWith('+')).length, 0)
  const minus = ex.hunks.reduce((n, h) => n + h.lines.filter((l) => l.startsWith('-')).length, 0)
  const left = dec.filter((d) => d === 0).length

  return (
    <View>
      <Head kind="diff" title={ex.title} prompt={ex.prompt} />
      <View style={{ marginBottom: 12, borderRadius: 16, borderWidth: 2, borderColor: C.line, backgroundColor: C.snow, paddingHorizontal: 14, paddingVertical: 10 }}>
        <Text style={[font(900, 11, C.muted), { textTransform: 'uppercase', letterSpacing: 0.8 }]}>Ты просил ИИ</Text>
        <Text style={[font(700, 15), { lineHeight: 20 }]}>«{ex.request}»</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
          <Text style={font(800, 12, C.muted)}>ИИ изменил {ex.hunks.length} {ex.hunks.length < 5 ? 'места' : 'мест'}:</Text>
          <Text style={font(800, 12, C.tealDark)}>+{plus}</Text>
          <Text style={font(800, 12, C.coralDark)}>−{minus}</Text>
        </View>
      </View>
      <HintNote hint={hint} />
      <View style={{ gap: 12 }}>
        {ex.hunks.map((h, i) => {
          const d = dec[i]
          const right = !idle && (h.harmful ? d === 2 : d === 1)
          const border = !idle ? (right ? '#8BE3D7' : '#FFB8A6') : d === 1 ? '#9BE7DD' : d === 2 ? '#FFC2B2' : C.line
          const safeMark = hint?.mark === i && idle
          return (
            <View key={i} testID={`hunk-${i}`} style={{ overflow: 'hidden', borderRadius: 18, borderWidth: 2, borderColor: border, borderBottomWidth: 5, borderBottomColor: border, backgroundColor: C.white }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderBottomWidth: 2, borderBottomColor: C.line, backgroundColor: C.snow, paddingHorizontal: 12, paddingVertical: 6 }}>
                <View style={{ borderRadius: 6, backgroundColor: C.white, paddingHorizontal: 6 }}>
                  <Text style={font(900, 11, C.muted)}>Правка {i + 1}</Text>
                </View>
                <Text numberOfLines={1} style={{ fontFamily: MONO, fontSize: 11.5, color: 'rgba(47,42,71,0.8)', flexShrink: 1 }}>{h.file}</Text>
                {safeMark ? (
                  <View style={{ borderRadius: 5, backgroundColor: C.teal, paddingHorizontal: 6 }}>
                    <Text style={font(900, 11, C.white)}>💡 безопасна</Text>
                  </View>
                ) : null}
              </View>
              <View style={{ paddingVertical: 4 }}>
                {h.lines.map((l, k) => {
                  const s = lineStyle(l)
                  return (
                    <View key={k} style={{ flexDirection: 'row', backgroundColor: s.bg, paddingHorizontal: 8 }}>
                      <Text style={{ width: 16, fontFamily: MONO, fontSize: 12, color: s.sign, fontWeight: '700' }}>{l[0] === ' ' ? '' : l[0] === '-' ? '−' : l[0]}</Text>
                      <Text style={{ flex: 1, fontFamily: MONO, fontSize: 12, lineHeight: 19, color: s.text }}>{l.slice(1) || ' '}</Text>
                    </View>
                  )
                })}
              </View>
              <View style={{ flexDirection: 'row', gap: 8, borderTopWidth: 2, borderTopColor: C.line, paddingHorizontal: 10, paddingVertical: 8 }}>
                {[{ v: 1, label: '✓ Принять', on: d === 1, color: C.teal, fg: C.tealDark }, { v: 2, label: '✕ Отклонить', on: d === 2, color: C.coral, fg: C.coralDark }].map((b) => (
                  <Pressable key={b.v} testID={`hunk-${i}-${b.v}`} accessibilityRole="button" accessibilityState={{ selected: b.on }} disabled={!idle} onPress={() => decide(i, b.v)} style={{ flex: 1, borderRadius: 12, borderWidth: 2, borderColor: b.on ? b.color : C.line, backgroundColor: b.on ? b.color : C.white, paddingVertical: 8 }}>
                    <Text style={[font(900, 13, b.on ? C.white : b.fg), { textAlign: 'center' }]}>{b.label}</Text>
                  </Pressable>
                ))}
              </View>
              {!idle && h.harmful ? (
                <Animated.View entering={FadeInUp} style={{ borderTopWidth: 2, borderTopColor: C.line, backgroundColor: C.coralLight, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text style={[font(700, 13, C.coralDark), { lineHeight: 18 }]}>🚩 {h.harmful}</Text>
                </Animated.View>
              ) : null}
            </View>
          )
        })}
      </View>
      {idle && left > 0 ? <Text style={[font(700, 14, C.muted), { marginTop: 14, textAlign: 'center' }]}>Реши судьбу каждой правки: осталось {left}</Text> : null}
    </View>
  )
}
