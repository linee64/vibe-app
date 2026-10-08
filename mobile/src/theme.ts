/** Палитра и типографика Вайбика (та же, что в вебе; без зелёного) */
import type { TextStyle } from 'react-native'

export const C = {
  brand: '#7C4DFF',
  brandDark: '#5B2FD6',
  brandLight: '#EFE9FF',
  brandMid: '#C7B6FF',
  coral: '#FF7A59',
  coralDark: '#E0573A',
  coralLight: '#FFE9E2',
  coralMid: '#FFC2B2',
  teal: '#13C2AE',
  tealDark: '#0E9C8C',
  tealLight: '#DCF8F3',
  tealMid: '#9BE7DD',
  gold: '#FFC23D',
  goldDark: '#D99A00',
  goldLight: '#FFF1D9',
  amber: '#FFA41B',
  amberDark: '#B86A00',
  ink: '#2F2A47',
  muted: '#8C86A3',
  line: '#E7E3F1',
  snow: '#F6F4FB',
  white: '#FFFFFF',
  code: '#272239',
  codeBar: '#1F1B30',
  term: '#1B1726',
} as const

export type Weight = 400 | 600 | 700 | 800 | 900

export const FONT: Record<Weight, string> = {
  400: 'Nunito_400Regular',
  600: 'Nunito_600SemiBold',
  700: 'Nunito_700Bold',
  800: 'Nunito_800ExtraBold',
  900: 'Nunito_900Black',
}

export const font = (w: Weight = 700, size = 15, color: string = C.ink): TextStyle => ({ fontFamily: FONT[w], fontSize: size, color })

export const MONO = 'Menlo'

/** «Мультяшная» тень-подложка снизу, как у кнопок в вебе */
export const lip = (color: string, h = 4) => ({ borderBottomWidth: h, borderBottomColor: color })
