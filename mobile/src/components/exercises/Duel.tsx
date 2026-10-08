import { Pressable, Text, View } from 'react-native'
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated'
import type { DuelExercise } from '@web/data/types'
import { C, font } from '../../theme'
import { Tile } from '../ui'
import { Head, HintNote, Letter, OutcomeView, toneColor, type ViewProps } from './shared'

const SIDE = [
  { name: 'Промпт A', color: C.brand, light: C.brandLight, mid: C.brandMid },
  { name: 'Промпт B', color: C.coral, light: C.coralLight, mid: C.coralMid },
]

/** «Дуэль промптов»: два промпта и что они дали → кто победил → почему */
export function DuelView({ ex, answer, setAnswer, status, hint }: ViewProps<DuelExercise>) {
  const [side, why] = Array.isArray(answer) ? answer : [-1, -1]
  const idle = status === 'idle'
  const pickSide = (s: number) => idle && setAnswer([s, s === side ? why : -1])
  const pickWhy = (r: number) => idle && setAnswer([side, r])

  return (
    <View>
      <Head kind="duel" title={ex.title} prompt={ex.prompt} />
      <View style={{ gap: 14 }}>
        {ex.sides.map((s, i) => {
          const c = SIDE[i]
          const on = side === i
          const win = !idle && i === ex.winner
          const lost = !idle && on && i !== ex.winner
          const border = win ? '#8BE3D7' : lost ? '#FFB8A6' : on ? c.color : C.line
          return (
            <View key={i}>
              <Pressable
                testID={`side-${i}`}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                disabled={!idle}
                onPress={() => pickSide(i)}
                style={({ pressed }) => ({ borderRadius: 20, borderWidth: 2, borderColor: border, borderBottomWidth: 5, borderBottomColor: win ? '#8BE3D7' : lost ? '#FFB8A6' : on ? c.mid : C.line, backgroundColor: on && idle ? c.light : C.white, padding: 12, transform: [{ translateY: pressed ? 2 : 0 }] })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ borderRadius: 99, paddingHorizontal: 10, paddingVertical: 2, backgroundColor: c.color }}>
                    <Text style={[font(900, 12, C.white), { textTransform: 'uppercase', letterSpacing: 0.8 }]}>{c.name}</Text>
                  </View>
                  {win ? (
                    <Animated.Text entering={ZoomIn} style={font(900, 13, C.tealDark)}>
                      🏆 Победитель
                    </Animated.Text>
                  ) : on && idle ? (
                    <Text style={font(900, 12, c.color)}>Мой выбор</Text>
                  ) : null}
                </View>
                <View style={{ borderRadius: 16, borderBottomRightRadius: 6, backgroundColor: c.color, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text style={[font(700, 14, C.white), { lineHeight: 19 }]}>{s.prompt}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 8 }}>
                  <View style={{ flex: 1, height: 2, backgroundColor: C.line }} />
                  <Text style={[font(900, 11, C.muted), { textTransform: 'uppercase', letterSpacing: 0.8 }]}>ИИ выдал</Text>
                  <View style={{ flex: 1, height: 2, backgroundColor: C.line }} />
                </View>
                <View pointerEvents="none">
                  <OutcomeView o={s.result} />
                </View>
              </Pressable>
              {i === 0 ? (
                <View style={{ alignItems: 'center', marginTop: -2, marginBottom: -16, zIndex: 2 }}>
                  <View style={{ width: 42, height: 42, borderRadius: 42, borderWidth: 3, borderColor: C.white, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                    <Text style={font(900, 13, C.white)}>VS</Text>
                  </View>
                </View>
              ) : null}
            </View>
          )
        })}
      </View>

      {side >= 0 ? (
        <Animated.View entering={FadeInUp} style={{ marginTop: 22 }}>
          <Text style={[font(900, 16), { marginBottom: 10 }]}>Почему {SIDE[side].name} сильнее?</Text>
          <HintNote hint={hint} />
          <View style={{ gap: 10 }}>
            {ex.reasons.map((r, i) => {
              const dim = !!hint?.dim?.includes(i) && idle && i !== ex.reason
              let t: 'selected' | 'correct' | 'wrong' | 'dim' | undefined
              if (idle) t = why === i ? 'selected' : undefined
              else if (side === ex.winner && i === ex.reason) t = 'correct'
              else if (why === i) t = 'wrong'
              else if (i === ex.reason) t = 'correct'
              else t = 'dim'
              return (
                <Tile key={i} testID={`reason-${i}`} state={dim ? 'dim' : t} disabled={!idle || dim} onPress={() => pickWhy(i)}>
                  <Letter i={i} on={why === i} color={toneColor(t)} />
                  <Text style={[font(700, 15, toneColor(t)), { flex: 1, lineHeight: 20, textDecorationLine: dim ? 'line-through' : 'none', opacity: dim ? 0.45 : 1 }]}>{r}</Text>
                </Tile>
              )
            })}
          </View>
        </Animated.View>
      ) : (
        <Text style={[font(700, 14, C.muted), { marginTop: 18, textAlign: 'center' }]}>Нажми на карточку промпта, который победил</Text>
      )}
    </View>
  )
}
