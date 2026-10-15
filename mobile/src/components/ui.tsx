/**
 * Базовые элементы в стиле веба (src/index.css): «объёмные» кнопки .btn с полкой снизу, карточки .card,
 * плитки .tile, полоса прогресса .progress-track, переключатель — те же размеры, радиусы и цвета.
 */
import { useState, type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native'
import { CHARGE_MAX } from '@web/data/economy'
import { C, caps, font, type Weight } from '../theme'
import { Battery as BatteryIcon, Token as TokenIcon } from './art'
import { t } from '@web/i18n/core'

export function Txt({ children, w = 700, size = 15, color = C.ink, style, center, lines }: { children?: ReactNode; w?: Weight; size?: number; color?: string; style?: StyleProp<TextStyle>; center?: boolean; lines?: number }) {
  return (
    <Text numberOfLines={lines} style={[font(w, size, color), { lineHeight: Math.round(size * 1.3) }, center && { textAlign: 'center' }, style]}>
      {children}
    </Text>
  )
}

/**
 * «Объёмная» поверхность: под ней полка цвета edge высотой depth, при нажатии поверхность опускается на полку
 * (как .btn / .tile / узлы пути в вебе: box-shadow 0 Npx 0 + translateY при :active).
 */
export function Press3D({ children, onPress, edge, depth = 4, radius = 16, disabled, style, innerStyle, testID, label, selected, hitSlop }: { children: ReactNode; onPress?: () => void; edge: string; depth?: number; radius?: number; disabled?: boolean; style?: StyleProp<ViewStyle>; innerStyle?: StyleProp<ViewStyle>; testID?: string; label?: string; selected?: boolean; hitSlop?: number }) {
  const [down, setDown] = useState(false)
  const pressed = down && !disabled
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={hitSlop}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      style={[{ borderRadius: radius, backgroundColor: edge, paddingBottom: pressed ? 0 : depth, marginTop: pressed ? depth : 0 }, style]}
    >
      <View style={[{ borderRadius: radius, flexGrow: 1 }, innerStyle]}>{children}</View>
    </Pressable>
  )
}

export type Tone = 'brand' | 'teal' | 'coral' | 'gold' | 'ghost' | 'white'
const TONES: Record<Tone, { c: string; e: string; t: string; border?: string }> = {
  brand: { c: C.brand, e: C.brandDark, t: C.white },
  teal: { c: C.teal, e: C.tealDark, t: C.white },
  coral: { c: C.coral, e: C.coralDark, t: C.white },
  gold: { c: C.gold, e: C.goldDark, t: C.goldInk },
  ghost: { c: C.white, e: C.line, t: C.brand, border: C.line },
  white: { c: C.white, e: 'rgba(0,0,0,0.18)', t: C.brand },
}

/** Кнопка .btn: заглавные буквы, полка 4px, sm — 40px */
export function Btn({ label, children, onPress, tone = 'brand', colors, textColor, disabled, block, small, big, style, testID, icon, after }: { label?: string; children?: ReactNode; onPress?: () => void; tone?: Tone; colors?: { c: string; e: string }; textColor?: string; disabled?: boolean; block?: boolean; small?: boolean; big?: boolean; style?: StyleProp<ViewStyle>; testID?: string; icon?: ReactNode; after?: ReactNode }) {
  const base = TONES[tone]
  const tn = disabled ? { c: C.disabled, e: C.disabledEdge, t: C.disabledText, border: undefined } : { ...base, ...(colors ?? {}), t: textColor ?? base.t }
  const size = small ? 13 : big ? 16 : 15
  return (
    <Press3D testID={testID} label={label} onPress={onPress} disabled={disabled} edge={tn.e} radius={small ? 14 : 16} style={[block ? { alignSelf: 'stretch' } : { alignSelf: 'flex-start' }, style]} innerStyle={{ backgroundColor: tn.c, minHeight: small ? 40 : big ? 54 : 50, paddingHorizontal: small ? 16 : 24, paddingVertical: 6, borderWidth: tn.border ? 2 : 0, borderColor: tn.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      {icon}
      {label != null ? <Text style={[font(800, size, tn.t), caps(size), { textAlign: 'center', flexShrink: 1 }]}>{label}</Text> : null}
      {children}
      {after}
    </Press3D>
  )
}

/** Плитка-вариант ответа (.tile, .is-selected / .is-correct / .is-wrong) */
export function Tile({ children, state, onPress, disabled, testID, style }: { children: ReactNode; state?: 'selected' | 'correct' | 'wrong' | 'dim'; onPress?: () => void; disabled?: boolean; testID?: string; style?: StyleProp<ViewStyle> }) {
  const map = {
    selected: { border: C.brandMid, bg: C.brandLight, lip: C.brandMid },
    correct: { border: C.tealMid, bg: C.tealLight, lip: C.tealMid },
    wrong: { border: C.coralMid, bg: C.coralLight, lip: C.coralMid },
    dim: { border: C.line, bg: C.white, lip: C.line },
  }[state ?? 'dim']
  return (
    <Press3D testID={testID} onPress={onPress} disabled={disabled} edge={map.lip} depth={4} radius={16} selected={state === 'selected'} style={[{ opacity: state === 'dim' && disabled ? 0.5 : 1 }, style]} innerStyle={{ borderWidth: 2, borderColor: map.border, backgroundColor: map.bg, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {children}
    </Press3D>
  )
}

/** .card: белая, рамка 2px, радиус 20 */
export function Card({ children, style, onPress, testID }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; testID?: string }) {
  if (onPress)
    return (
      <Pressable testID={testID} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && { backgroundColor: C.snow }, style]}>
        {children}
      </Pressable>
    )
  return (
    <View testID={testID} style={[styles.card, style]}>
      {children}
    </View>
  )
}

/** .progress-track + .progress-fill (с бликом сверху) */
export function ProgressBar({ value, color = C.brand, height = 16, track = C.line, min = 0 }: { value: number; color?: string; height?: number; track?: string; min?: number }) {
  const w = Math.max(min, Math.min(100, value))
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      {w > 0 ? (
        <View style={{ width: `${w}%`, height: '100%', borderRadius: height, backgroundColor: color }}>
          {height >= 12 ? <View style={{ position: 'absolute', left: 8, right: 8, top: 3, height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' }} /> : null}
        </View>
      ) : null}
    </View>
  )
}

/** Батарейка заряда Бипи — рисунок из веба */
export function Battery({ level, size = 24 }: { level: number; size?: number }) {
  return <BatteryIcon size={size} level={level} max={CHARGE_MAX} />
}

/** Счётчик заряда: батарейка + число (цвет по уровню, как ChargeMeter в вебе) */
export function ChargeMeter({ value, size = 22, textSize = 17 }: { value: number; size?: number; textSize?: number }) {
  const color = value >= 3 ? C.tealDark : value === 2 ? C.amberDark : C.coralDark
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} accessibilityLabel={t('x0pcbh74', { value, CHARGE_MAX })}>
      <Battery level={value} size={size} />
      <Text style={font(900, textSize, color)}>{value}</Text>
    </View>
  )
}

/** Токен — шестигранная фишка из веба */
export function Token({ size = 16 }: { size?: number }) {
  return <TokenIcon size={size} />
}

export function Chip({ label, color, on, onPress }: { label: string; color: { main: string; light: string; dark: string }; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} style={{ borderRadius: 12, borderWidth: 2, borderColor: on ? color.main : color.light, backgroundColor: on ? color.main : C.white, paddingHorizontal: 10, paddingVertical: 6, borderBottomWidth: 4, borderBottomColor: on ? color.dark : color.light }}>
      <Text style={font(800, 13, on ? C.white : color.dark)}>{on ? '✓ ' : '+ '}{label}</Text>
    </Pressable>
  )
}

export function Screen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flex: 1, backgroundColor: C.white }, style]}>{children}</View>
}

/** Переключатель в стиле Вайбика (SettingsControls.tsx): 64×34, «ВКЛ/ВЫКЛ» внутри */
export function Switch({ on, onToggle, label, testID }: { on: boolean; onToggle: () => void; label: string; testID?: string }) {
  return (
    <Pressable testID={testID} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: on }} onPress={onToggle} style={{ width: 64, height: 34, borderRadius: 34, borderWidth: 2, borderColor: on ? C.tealDark : C.line, backgroundColor: on ? C.teal : C.line, justifyContent: 'center' }}>
      <Text style={[font(900, 10, on ? C.white : C.muted), caps(10), { position: 'absolute' }, on ? { left: 8 } : { right: 8 }]}>{on ? t('sound.on') : t('sound.off')}</Text>
      <View style={{ position: 'absolute', top: 2, left: on ? 32 : 2, width: 26, height: 26, borderRadius: 13, backgroundColor: C.white, borderBottomWidth: 2, borderBottomColor: 'rgba(47,42,71,0.18)' }} />
    </Pressable>
  )
}

/** Квадрат-подложка под иконку (rounded-2xl) */
export function IconBox({ children, bg, size = 48, radius = 16 }: { children: ReactNode; bg: string; size?: number; radius?: number }) {
  return <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
}

/** «›» в конце строки-ссылки */
export const Chevron = ({ color = C.brand }: { color?: string }) => <Text style={font(900, 22, color)}>›</Text>

/** Декоративный круг в углу карточки (absolute -right-10 -top-12 rounded-full bg-white/10) */
export function Blob({ size = 144, color = 'rgba(255,255,255,0.1)', style }: { size?: number; color?: string; style?: StyleProp<ViewStyle> }) {
  return <View pointerEvents="none" style={[{ position: 'absolute', right: -40, top: -48, width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]} />
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.white, borderRadius: 20, borderWidth: 2, borderColor: C.line },
})

export type { PressableProps }
