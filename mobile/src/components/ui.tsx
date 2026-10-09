import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native'
import { C, font, type Weight } from '../theme'
import { t } from '@web/i18n/core'

export function Txt({ children, w = 700, size = 15, color = C.ink, style, center }: { children?: React.ReactNode; w?: Weight; size?: number; color?: string; style?: StyleProp<TextStyle>; center?: boolean }) {
  return <Text style={[font(w, size, color), center && { textAlign: 'center' }, style]}>{children}</Text>
}

/** Кнопка с «полкой» снизу, как в вебе */
export function Btn({ label, onPress, tone = 'brand', disabled, block, small, style, testID }: { label: string; onPress?: () => void; tone?: 'brand' | 'teal' | 'coral' | 'gold' | 'ghost'; disabled?: boolean; block?: boolean; small?: boolean; style?: StyleProp<ViewStyle>; testID?: string }) {
  const tones = {
    brand: { bg: C.brand, fg: C.white, lip: C.brandDark },
    teal: { bg: C.teal, fg: C.white, lip: C.tealDark },
    coral: { bg: C.coral, fg: C.white, lip: C.coralDark },
    gold: { bg: C.gold, fg: C.ink, lip: C.goldDark },
    ghost: { bg: C.white, fg: C.ink, lip: C.line },
  }[tone]
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.btn, { backgroundColor: tones.bg, borderBottomColor: tones.lip, opacity: disabled ? 0.45 : 1, transform: [{ translateY: pressed && !disabled ? 2 : 0 }] }, block && { alignSelf: 'stretch' }, small && { paddingVertical: 9 }, style]}
    >
      <Text style={[font(900, small ? 14 : 16, tones.fg), { textAlign: 'center', letterSpacing: 0.3 }]}>{label}</Text>
    </Pressable>
  )
}

/** Плитка-вариант ответа */
export function Tile({ children, state, onPress, disabled, testID }: { children: React.ReactNode; state?: 'selected' | 'correct' | 'wrong' | 'dim'; onPress?: () => void; disabled?: boolean; testID?: string }) {
  const map = {
    selected: { border: C.brand, bg: C.brandLight, lip: C.brandMid },
    correct: { border: C.teal, bg: C.tealLight, lip: C.tealMid },
    wrong: { border: C.coral, bg: C.coralLight, lip: C.coralMid },
    dim: { border: C.line, bg: C.white, lip: C.line },
  }[state ?? 'dim']
  return (
    <Pressable testID={testID} accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.tile, { borderColor: map.border, backgroundColor: map.bg, borderBottomColor: map.lip, opacity: state === 'dim' && disabled ? 0.45 : 1, transform: [{ translateY: pressed && !disabled ? 2 : 0 }] }]}>
      {children}
    </Pressable>
  )
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>
}

export function ProgressBar({ value, color = C.brand, height = 14 }: { value: number; color?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height, backgroundColor: C.line, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(3, Math.min(100, value))}%`, height: '100%', borderRadius: height, backgroundColor: color }} />
    </View>
  )
}

/** Батарейка заряда Бипи */
export function Battery({ level, size = 26 }: { level: number; size?: number }) {
  const cells = 5
  const w = size * 1.7
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }} accessibilityLabel={t('x1o1gwzr', { level, cells })}>
      <View style={{ width: w, height: size * 0.62, borderRadius: 6, borderWidth: 2, borderColor: C.ink, flexDirection: 'row', padding: 2, gap: 2 }}>
        {Array.from({ length: cells }, (_, i) => (
          <View key={i} style={{ flex: 1, borderRadius: 2, backgroundColor: i < level ? (level <= 1 ? C.coral : level <= 3 ? C.gold : C.teal) : C.line }} />
        ))}
      </View>
      <View style={{ width: size * 0.14, height: size * 0.26, borderTopRightRadius: 3, borderBottomRightRadius: 3, backgroundColor: C.ink }} />
    </View>
  )
}

export function Token({ size = 16 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size, backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: C.tealDark }}>
      <Text style={{ color: C.white, fontSize: size * 0.6, fontWeight: '900' }}>₮</Text>
    </View>
  )
}

export function Chip({ label, color, on, onPress }: { label: string; color: { main: string; light: string; dark: string }; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} style={{ borderRadius: 12, borderWidth: 2, borderColor: on ? color.main : color.light, backgroundColor: on ? color.main : C.white, paddingHorizontal: 10, paddingVertical: 6, borderBottomWidth: 4, borderBottomColor: on ? color.dark : color.light }}>
      <Text style={font(800, 13, on ? C.white : color.dark)}>{on ? '✓ ' : '+ '}{label}</Text>
    </Pressable>
  )
}

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flex: 1, backgroundColor: C.snow }, style]}>{children}</View>
}

const styles = StyleSheet.create({
  btn: { borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, borderWidth: 0, borderBottomWidth: 4, alignItems: 'center' },
  tile: { borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  card: { backgroundColor: C.white, borderRadius: 20, borderWidth: 2, borderColor: C.line, borderBottomWidth: 5, padding: 14 },
})

export type { PressableProps }
