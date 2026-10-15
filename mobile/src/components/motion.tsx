/** Анимации из src/index.css: anim-float, anim-bob, ring-pulse, anim-pop, anim-fade-up, anim-shake, конфетти */
import { useEffect, useState, type ReactNode } from 'react'
import { AccessibilityInfo, Animated, Easing, Platform, View, type StyleProp, type ViewStyle } from 'react-native'

const native = Platform.OS !== 'web'
let reduceMotion = false
void AccessibilityInfo.isReduceMotionEnabled?.()
  .then((v) => (reduceMotion = v))
  .catch(() => {})

function useLoop(duration: number, run = true) {
  const [v] = useState(() => new Animated.Value(0))
  useEffect(() => {
    if (!run || reduceMotion) return
    const a = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: native }),
      Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: native }),
    ]))
    a.start()
    return () => a.stop()
  }, [v, duration, run])
  return v
}

/** anim-float: покачивание вверх-вниз на 8px за 3.2 с */
export function Float({ children, style, amp = 8, duration = 3200 }: { children: ReactNode; style?: StyleProp<ViewStyle>; amp?: number; duration?: number }) {
  const v = useLoop(duration)
  return <Animated.View style={[style, { transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -amp] }) }] }]}>{children}</Animated.View>
}

/** anim-bob: пузырь «НАЧАТЬ» над текущим узлом */
export const Bob = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => (
  <Float style={style} amp={7} duration={1400}>
    {children}
  </Float>
)

/** ring-pulse: кольцо вокруг текущего узла */
export function Pulse({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const v = useLoop(2000)
  return <Animated.View pointerEvents="none" style={[style, { transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }] }]}>{children}</Animated.View>
}

/** anim-pop: появление с лёгким «перелётом» */
export function Pop({ children, style, delay = 0 }: { children: ReactNode; style?: StyleProp<ViewStyle>; delay?: number }) {
  const [v] = useState(() => new Animated.Value(reduceMotion ? 1 : 0))
  useEffect(() => {
    if (reduceMotion) return
    Animated.sequence([Animated.delay(delay), Animated.spring(v, { toValue: 1, friction: 5, tension: 120, useNativeDriver: native })]).start()
  }, [v, delay])
  return <Animated.View style={[style, { opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 1], extrapolate: 'clamp' }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]}>{children}</Animated.View>
}

/** anim-fade-up: снизу на 12px с проявлением */
export function FadeUp({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const [v] = useState(() => new Animated.Value(reduceMotion ? 1 : 0))
  useEffect(() => {
    if (reduceMotion) return
    Animated.timing(v, { toValue: 1, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: native }).start()
  }, [v])
  return <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>{children}</Animated.View>
}

/** anim-shake: при ошибке (меняй key, чтобы проиграть снова) */
export function Shake({ children, run, style }: { children: ReactNode; run: boolean; style?: StyleProp<ViewStyle> }) {
  const [v] = useState(() => new Animated.Value(0))
  useEffect(() => {
    if (!run || reduceMotion) return
    v.setValue(0)
    Animated.timing(v, { toValue: 1, duration: 350, easing: Easing.linear, useNativeDriver: native }).start()
  }, [run, v])
  return <Animated.View style={[style, { transform: [{ translateX: v.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, -6, 6, -6, 6, 0] }) }] }]}>{children}</Animated.View>
}

const CONFETTI_COLORS = ['#7C4DFF', '#FF7A59', '#13C2AE', '#FFC23D', '#5B2FD6', '#FFB61D']

function Piece({ i }: { i: number }) {
  const [v] = useState(() => new Animated.Value(0))
  useEffect(() => {
    if (reduceMotion) return
    const a = Animated.loop(Animated.sequence([Animated.delay((i % 9) * 220), Animated.timing(v, { toValue: 1, duration: 2400 + (i % 5) * 350, easing: Easing.in(Easing.ease), useNativeDriver: native })]))
    a.start()
    return () => a.stop()
  }, [v, i])
  const w = i % 3 === 0 ? 8 : 10
  const h = i % 3 === 0 ? 16 : 10
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: `${(i * 37 + 11) % 100}%`,
        width: w,
        height: h,
        borderRadius: i % 4 === 0 ? 999 : 3,
        backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        opacity: v.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 1, 0] }),
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-20, 260] }) }, { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] }) }],
      }}
    />
  )
}

/** Конфетти, как на экране «Урок пройден» в вебе */
export function Confetti() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 340, overflow: 'hidden' }}>
      {Array.from({ length: 36 }, (_, i) => (
        <Piece key={i} i={i} />
      ))}
    </View>
  )
}
