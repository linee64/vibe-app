import type { ReactNode } from 'react'

const TOKEN =
  /(\/\/.*$)|(`[^`]*`|'[^']*'|"[^"]*")|\b(function|const|let|var|return|for|if|else|async|await|throw|new|true|false|null|undefined)\b|\b(\d+)\b|(<\/?[A-Za-z][\w.]*|\/?>)/g

const COLORS = ['#8C86A3', '#FFD27A', '#C9A8FF', '#FF9C85', '#6FE3D3']

/** Простейшая подсветка синтаксиса для коротких JS/JSX-сниппетов */
export function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let k = 0
  for (const m of line.matchAll(TOKEN)) {
    const idx = m.index ?? 0
    if (idx > last) out.push(line.slice(last, idx))
    const group = m.slice(1).findIndex((g) => g !== undefined)
    out.push(
      <span key={k++} style={{ color: COLORS[group], fontStyle: group === 0 ? 'italic' : undefined }}>
        {m[0]}
      </span>,
    )
    last = idx + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}
