/** Палитра и типографика Вайбика — один в один с вебом (src/index.css, @theme); без зелёного */
import type { TextStyle } from 'react-native'

export const C = {
  brand: '#7C4DFF',
  brandDark: '#5B2FD6',
  brandLight: '#EFE9FF',
  brandMid: '#C7B6FF',
  coral: '#FF7A59',
  coralDark: '#E0573A',
  coralLight: '#FFE9E2',
  coralMid: '#FFB8A6',
  teal: '#13C2AE',
  tealDark: '#0E9C8C',
  tealLight: '#DCF8F3',
  tealMid: '#8BE3D7',
  gold: '#FFC23D',
  goldDark: '#E5A100',
  goldLight: '#FFF4D6',
  goldInk: '#5A3D00',
  amber: '#FFB61D',
  amberDark: '#B86A00',
  fire: '#FF9A1F',
  gem: '#2EB6F5',
  heart: '#FF4F6D',
  ink: '#2F2A47',
  muted: '#8C86A3',
  faint: '#B3ADC8',
  line: '#E7E3F1',
  snow: '#F7F5FC',
  white: '#FFFFFF',
  disabled: '#E9E6F2',
  disabledEdge: '#D6D1E4',
  disabledText: '#AAA4C0',
  code: '#272239',
  codeBar: '#1F1B30',
  term: '#1B1726',
} as const

/** Полупрозрачные варианты (Tailwind bg-white/25, bg-brand-light/60 …) */
export const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

export type Weight = 400 | 600 | 700 | 800 | 900

export const FONT: Record<Weight, string> = {
  400: 'Nunito_400Regular',
  600: 'Nunito_600SemiBold',
  700: 'Nunito_700Bold',
  800: 'Nunito_800ExtraBold',
  900: 'Nunito_900Black',
}

export const font = (w: Weight = 700, size = 15, color: string = C.ink): TextStyle => ({ fontFamily: FONT[w], fontSize: size, color })

/** «uppercase tracking-wider» из веба */
export const caps = (size: number): TextStyle => ({ textTransform: 'uppercase', letterSpacing: size * 0.05 })

export const MONO = 'Menlo'

/** «Мультяшная» тень-подложка снизу, как у кнопок в вебе */
export const lip = (color: string, h = 4) => ({ borderBottomWidth: h, borderBottomColor: color })
