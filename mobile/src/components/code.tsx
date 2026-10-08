import { Text } from 'react-native'
import { MONO } from '../theme'

const TOKEN =
  /((?<![:\w])\/\/.*$|^\s*#.*$|^\s*--\s.*$)|(`[^`]*`|'[^']*'|"[^"]*")|\b(function|const|let|var|return|for|if|else|async|await|throw|new|true|false|null|undefined|import|export|from|select|where)\b|\b(\d+)\b|(<\/?[A-Za-z][\w.]*|\/?>)/g
const COLORS = ['#8C86A3', '#FFD27A', '#C9A8FF', '#FF9C85', '#6FE3D3']

/** Подсветка коротких сниппетов — тот же токенайзер, что в вебе (src/components/Code.tsx), но в <Text> */
export function highlight(line: string, keyPrefix = 'h') {
  const out: React.ReactNode[] = []
  let last = 0
  let k = 0
  for (const m of line.matchAll(TOKEN)) {
    const idx = m.index ?? 0
    if (idx > last) out.push(line.slice(last, idx))
    const group = m.slice(1).findIndex((g) => g !== undefined)
    out.push(
      <Text key={`${keyPrefix}${k++}`} style={{ color: COLORS[group], fontStyle: group === 0 ? 'italic' : 'normal' }}>
        {m[0]}
      </Text>,
    )
    last = idx + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

export const mono = (size = 12, color = '#EDEAF6') => ({ fontFamily: MONO, fontSize: size, color, lineHeight: size * 1.55 })
