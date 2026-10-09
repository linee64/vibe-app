import { useEffect, useMemo, useRef } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg'
import type { UpgradeExercise } from '@web/data/types'
import { chipOrder, upgradeScore } from '@web/data/exerciseLogic'
import { vibeMood } from '@web/components/exercises/meta'
import { C, font } from '../../theme'
import { Head, HintNote, type ViewProps } from './shared'
import { t } from '@web/i18n/core'

const polar = (v: number, r: number) => {
  const a = Math.PI * (1 - v / 100)
  return [100 + r * Math.cos(a), 100 - r * Math.sin(a)]
}
const arc = (from: number, to: number, r: number) => {
  const [x1, y1] = polar(from, r)
  const [x2, y2] = polar(to, r)
  return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
}

/** Вайб-метр: полукруглая шкала качества промпта со стрелкой (Reanimated) и отметкой цели */
export function VibeMeter({ value, target, size = 200 }: { value: number; target: number; size?: number }) {
  const mood = vibeMood(value, target)
  const [tx, ty] = polar(target, 92)
  const [tx2, ty2] = polar(target, 64)
  const k = size / 200
  const angle = useSharedValue(value * 1.8 - 90)
  const wobble = useSharedValue(0)
  const prev = useRef(value)
  useEffect(() => {
    angle.value = withSpring(value * 1.8 - 90, { damping: 9, stiffness: 120 })
    if (value < prev.current) wobble.value = withSequence(withTiming(-5, { duration: 90 }), withTiming(5, { duration: 90 }), withTiming(-3, { duration: 90 }), withTiming(0, { duration: 90 }))
    prev.current = value
  }, [value, angle, wobble])
  const needle = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }))
  const shake = useAnimatedStyle(() => ({ transform: [{ translateX: wobble.value }] }))
  const needleBox = 136 * k
  return (
    <Animated.View style={[{ alignItems: 'center' }, shake]} testID="vibe-meter" accessibilityLabel={t('x00hkeuq', { value })}>
      <View style={{ width: size, height: 116 * k }}>
        <Svg viewBox="0 0 200 116" width={size} height={116 * k}>
          <Path d={arc(0, 100, 78)} stroke="#EEEAF6" strokeWidth={20} fill="none" strokeLinecap="round" />
          <Path d={arc(0.5, 44, 78)} stroke="#FFC2B2" strokeWidth={20} fill="none" strokeLinecap="round" />
          <Path d={arc(46, 72, 78)} stroke="#FFD58C" strokeWidth={20} fill="none" />
          <Path d={arc(74, 99.5, 78)} stroke="#9BE7DD" strokeWidth={20} fill="none" strokeLinecap="round" />
          {value > 0 ? <Path d={arc(0.5, Math.max(1, value - 0.5), 78)} stroke={mood.color} strokeWidth={9} fill="none" strokeLinecap="round" /> : null}
          <Line x1={tx2} y1={ty2} x2={tx} y2={ty} stroke="#2F2A47" strokeWidth={3.5} strokeLinecap="round" />
          <SvgText x={tx} y={ty - 6} textAnchor="middle" fontSize={10} fontWeight="900" fill="#2F2A47">{t('x1xpzq6r')}</SvgText>
        </Svg>
        {/* стрелка: квадрат с центром в оси шкалы, вращается вокруг центра */}
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: needleBox, height: needleBox, left: 100 * k - needleBox / 2, top: 100 * k - needleBox / 2 }, needle]}>
          <Svg viewBox="0 0 136 136" width={needleBox} height={needleBox}>
            <Path d="M68 2 L74 68 L62 68 Z" fill="#2F2A47" />
          </Svg>
        </Animated.View>
        <Svg viewBox="0 0 200 116" width={size} height={116 * k} style={{ position: 'absolute' }} pointerEvents="none">
          <Circle cx="100" cy="100" r="11" fill="#2F2A47" />
          <Circle cx="100" cy="100" r="4.5" fill="#FF7A59" />
        </Svg>
      </View>
      <Text style={[font(900, 26, mood.color), { marginTop: 2 }]}>{value}%</Text>
      <Text style={font(800, 13, mood.color)}>
        {mood.emoji} {mood.text}
      </Text>
    </Animated.View>
  )
}

const plural = (n: number) => (n === 1 ? t('x0jqys9a') : n < 5 ? t('x0hj1ypi') : t('x0j6kr9o'))

/** «Прокачай промпт»: слабый промпт + чипы-улучшения; Вайб-метр реагирует вживую */
export function UpgradeView({ ex, answer, setAnswer, status, hint }: ViewProps<UpgradeExercise>) {
  const picked = useMemo(() => (Array.isArray(answer) ? answer : []), [answer])
  const idle = status === 'idle'
  const order = useMemo(() => chipOrder(ex), [ex])
  const score = upgradeScore(ex, picked)
  const toggle = (i: number) => {
    if (!idle) return
    setAnswer(picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i])
  }
  const inserted = ex.chips.map((c, i) => ({ c, i })).filter(({ i }) => picked.includes(i))

  return (
    <View>
      <Head kind="upgrade" title={ex.title} prompt={ex.prompt} />
      <View style={{ overflow: 'hidden', borderRadius: 18, borderWidth: 2, borderColor: C.line, borderBottomWidth: 5, backgroundColor: C.white }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderBottomWidth: 2, borderBottomColor: C.line, backgroundColor: C.snow, paddingHorizontal: 12, paddingVertical: 6 }}>
          {[C.coral, C.gold, C.teal].map((c) => (
            <View key={c} style={{ width: 9, height: 9, borderRadius: 9, backgroundColor: c }} />
          ))}
          <Text style={[font(600, 11, C.muted), { marginLeft: 6 }]}>prompt.md</Text>
          <Text style={[font(800, 11, C.muted), { marginLeft: 'auto' }]}>{picked.length ? `+${picked.length} ${plural(picked.length)}` : t('x0r512do')}</Text>
        </View>
        <Text style={[font(600, 15), { minHeight: 90, paddingHorizontal: 14, paddingVertical: 12, lineHeight: 23 }]} testID="prompt-text">
          {ex.base}
          {inserted.map(({ c, i }) => {
            const bad = !idle && !!c.trap
            return (
              <Text key={i}>
                {' '}
                <Text style={{ backgroundColor: bad ? C.coralLight : !idle ? C.tealLight : C.brandLight, color: bad ? C.coralDark : !idle ? C.tealDark : C.brandDark, textDecorationLine: bad ? 'line-through' : 'none' }}>{c.text}</Text>
              </Text>
            )
          })}
        </Text>
      </View>
      <View style={{ alignItems: 'center', marginVertical: 14 }}>
        <VibeMeter value={score} target={ex.target} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={font(900, 15)}>{t('x1th9ida')}</Text>
        <Text style={font(700, 12, C.muted)}>{t('x0jn9as3')}</Text>
      </View>
      <HintNote hint={hint} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        {order.map((i) => {
          const c = ex.chips[i]
          const on = picked.includes(i)
          const marked = hint?.mark === i && idle
          const tone: { b: string; bg: string; l: string; fg: string } = !idle
            ? c.trap
              ? on ? { b: C.coral, bg: C.coralLight, l: C.coralMid, fg: C.coralDark } : { b: C.line, bg: C.white, l: C.line, fg: C.muted }
              : on ? { b: C.teal, bg: C.tealLight, l: C.tealMid, fg: C.tealDark } : { b: C.coral, bg: C.coralLight, l: C.coralMid, fg: C.coralDark }
            : on ? { b: C.brand, bg: C.brandLight, l: C.brandMid, fg: C.brandDark } : { b: C.line, bg: C.white, l: C.line, fg: C.ink }
          return (
            <Pressable key={i} testID={`chip-${i}`} accessibilityRole="button" accessibilityState={{ selected: on }} disabled={!idle} onPress={() => toggle(i)} style={({ pressed }) => ({ maxWidth: '100%', borderRadius: 14, borderWidth: 2, borderColor: tone.b, borderBottomWidth: 4, borderBottomColor: tone.l, backgroundColor: tone.bg, paddingHorizontal: 11, paddingVertical: 7, transform: [{ translateY: pressed ? 2 : 0 }] })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[font(900, 10.5, tone.fg), { textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.75 }]}>
                  {on ? '✓' : '+'} {c.tag}
                </Text>
                {marked ? (
                  <View style={{ borderRadius: 4, backgroundColor: C.coral, paddingHorizontal: 4 }}>
                    <Text style={font(900, 10, C.white)}>{t('x1nv5xco')}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[font(700, 14, tone.fg), { lineHeight: 18 }]}>{c.text}</Text>
            </Pressable>
          )
        })}
      </View>
      {!idle ? (
        <Animated.View entering={FadeInUp} style={{ marginTop: 14, gap: 6, borderRadius: 16, backgroundColor: C.snow, paddingHorizontal: 14, paddingVertical: 12 }}>
          {ex.chips
            .filter((c) => c.trap)
            .map((c, k) => (
              <Text key={k} style={[font(600, 13.5), { lineHeight: 18 }]}>
                <Text style={font(900, 13.5, C.coralDark)}>🚩 «{c.text}»</Text> — {c.trap}
              </Text>
            ))}
        </Animated.View>
      ) : null}
    </View>
  )
}
