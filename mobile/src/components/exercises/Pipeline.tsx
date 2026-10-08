import { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated'
import type { PipelineExercise } from '@web/data/types'
import { pipelineBank, pipelineCards } from '@web/data/exerciseLogic'
import { C, font } from '../../theme'
import { Head, HintNote, type ViewProps } from './shared'

/**
 * «Собери пайплайн»: тап по карточке — в первый свободный слот, тап по слоту — вернуть.
 * Стрелки ↑↓ меняют карточки местами (вместо перетаскивания: жест конфликтует с react-compiler,
 * а на телефоне стрелки ещё и точнее).
 */
export function PipelineView({ ex, answer, setAnswer, status, hint }: ViewProps<PipelineExercise>) {
  const idle = status === 'idle'
  const cards = useMemo(() => pipelineCards(ex), [ex])
  const bank = useMemo(() => pipelineBank(ex), [ex])
  const n = ex.steps.length
  const slots = Array.isArray(answer) && answer.length === n ? answer : Array<number>(n).fill(-1)
  const placed = new Set(slots.filter((x) => x >= 0))
  const [just, setJust] = useState<number | null>(null)

  const put = (card: number) => {
    const next = [...slots]
    const free = next.indexOf(-1)
    if (free < 0) return
    next[free] = card
    setAnswer(next)
    setJust(card)
  }
  const remove = (slot: number) => {
    const next = [...slots]
    next[slot] = -1
    setAnswer(next)
  }
  const move = (slot: number, dir: -1 | 1) => {
    const to = slot + dir
    if (to < 0 || to >= n || slots[to] < 0) return
    const next = [...slots]
    ;[next[slot], next[to]] = [next[to], next[slot]]
    setAnswer(next)
  }

  return (
    <View>
      <Head kind="pipeline" title={ex.title} prompt={ex.prompt} />
      <HintNote hint={hint} />
      <View testID="pipeline-track" style={{ borderRadius: 20, borderWidth: 2, borderColor: C.line, backgroundColor: C.snow, padding: 12 }}>
        <View style={{ position: 'absolute', left: 29, top: 30, bottom: 30, width: 3, backgroundColor: C.brandMid, borderRadius: 3 }} />
        <View style={{ gap: 10 }}>
          {slots.map((card, i) => {
            const ok = !idle && card === i
            const bad = !idle && card !== i
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 38, height: 38, borderRadius: 38, borderWidth: 3, borderColor: ok ? C.teal : bad ? C.coral : card >= 0 ? C.brand : C.brandMid, backgroundColor: ok ? C.teal : bad ? C.coral : card >= 0 ? C.brand : C.white, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                  <Text style={font(900, 14, ok || bad || card >= 0 ? C.white : C.brand)}>{ok ? '✓' : i + 1}</Text>
                </View>
                <View testID={`slot-${i}`} style={{ flex: 1, minHeight: 48, borderRadius: 16, borderWidth: 2, borderStyle: card >= 0 ? 'solid' : 'dashed', borderColor: card >= 0 ? 'transparent' : C.brandMid, backgroundColor: card >= 0 ? 'transparent' : 'rgba(255,255,255,0.6)' }}>
                  {card >= 0 ? (
                    <Animated.View entering={just === card ? ZoomIn.springify() : undefined} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, borderColor: ok ? C.teal : bad ? C.coral : C.brand, borderBottomColor: ok ? C.tealMid : bad ? C.coralMid : C.brandMid, backgroundColor: ok ? C.tealLight : bad ? C.coralLight : C.brandLight, paddingLeft: 12, paddingRight: 6, paddingVertical: 8 }}>
                      <Text style={[font(700, 14.5, ok ? C.tealDark : bad ? C.coralDark : C.brandDark), { flex: 1, lineHeight: 19 }]}>{cards[card]}</Text>
                      {idle ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          <Arrow testID={`up-${i}`} label="Выше" disabled={i === 0 || slots[i - 1] < 0} onPress={() => move(i, -1)}>
                            ↑
                          </Arrow>
                          <Arrow testID={`down-${i}`} label="Ниже" disabled={i === n - 1 || slots[i + 1] < 0} onPress={() => move(i, 1)}>
                            ↓
                          </Arrow>
                          <Pressable testID={`remove-${i}`} accessibilityLabel="Убрать карточку" onPress={() => remove(i)} hitSlop={4} style={{ paddingHorizontal: 6 }}>
                            <Text style={font(900, 14, 'rgba(47,42,71,0.5)')}>✕</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </Animated.View>
                  ) : (
                    <Text style={[font(700, 13, 'rgba(124,77,255,0.5)'), { paddingHorizontal: 12, paddingVertical: 13 }]}>{i === 0 ? 'Первый шаг' : `Шаг ${i + 1}`}</Text>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      </View>

      {idle ? (
        <>
          <Text style={[font(700, 14, C.muted), { marginTop: 14, marginBottom: 8 }]}>Нажми на карточку — она встанет на первый свободный шаг. Стрелки ↑↓ меняют шаги местами. Одна-две карточки — лишние.</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
            {bank.map((card) =>
              placed.has(card) ? (
                <View key={card} style={{ borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: C.line, paddingHorizontal: 12, paddingVertical: 10 }}>
                  <Text style={font(700, 14, 'transparent')}>{cards[card]}</Text>
                </View>
              ) : (
                <Pressable key={card} testID={`card-${card}`} accessibilityRole="button" onPress={() => put(card)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, borderColor: hint?.mark === card ? C.brand : C.line, borderBottomColor: hint?.mark === card ? C.brandMid : C.line, backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 9, transform: [{ translateY: pressed ? 2 : 0 }] })}>
                  <Text style={[font(700, 14.5), { lineHeight: 19 }]}>{cards[card]}</Text>
                  {hint?.mark === card ? (
                    <View style={{ borderRadius: 5, backgroundColor: C.brand, paddingHorizontal: 6 }}>
                      <Text style={font(900, 11, C.white)}>начни с этого</Text>
                    </View>
                  ) : null}
                </Pressable>
              ),
            )}
          </View>
        </>
      ) : (ex.extra?.length ?? 0) > 0 ? (
        <Animated.Text entering={FadeIn} style={[font(700, 13.5, C.muted), { marginTop: 12 }]}>
          Лишние карточки: {ex.extra!.map((x) => `«${x}»`).join(', ')}
        </Animated.Text>
      ) : null}
    </View>
  )
}

function Arrow({ children, onPress, disabled, label, testID }: { children: string; onPress: () => void; disabled: boolean; label: string; testID: string }) {
  return (
    <Pressable testID={testID} accessibilityLabel={label} disabled={disabled} onPress={onPress} style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: disabled ? 'transparent' : C.white, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.25 : 1 }}>
      <Text style={font(900, 15, C.brandDark)}>{children}</Text>
    </Pressable>
  )
}
