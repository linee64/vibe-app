/**
 * Перевод с разметкой для React (веб и React Native):
 *   ru: 'Ещё <0>{n} ВП</0> — и ты в зоне повышения<1/>'
 *   tx('key', { n: 5 }, [(chunk) => <b>{chunk}</b>, () => <Spark />])
 * {name} — подстановка (строка, число или ReactNode), <i>…</i> — обёртка из tags[i], <i/> — элемент tags[i]().
 */
import { Fragment, createElement, isValidElement, cloneElement, type ReactNode } from 'react'
import { rawMessage, type UIKey } from './core'

type Tag = (chunk: ReactNode) => ReactNode

function render(s: string, params: Record<string, ReactNode>, tags: Tag[], keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /<(\d+)>([\s\S]*?)<\/\1>|<(\d+)\/>|\{(\w+)\}/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  const push = (n: ReactNode) => {
    const k = `${keyBase}.${i++}`
    out.push(isValidElement(n) ? cloneElement(n, { key: k }) : n)
  }
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index))
    if (m[1] !== undefined) push(tags[+m[1]]?.(createElement(Fragment, null, ...render(m[2], params, tags, `${keyBase}.${m[1]}`))) ?? m[2])
    else if (m[3] !== undefined) push(tags[+m[3]]?.(null) ?? null)
    else push(m[4] in params ? params[m[4]] : m[0])
    last = re.lastIndex
  }
  if (last < s.length) out.push(s.slice(last))
  return out
}

export function tx(key: UIKey, params: Record<string, ReactNode> = {}, tags: Tag[] = []): ReactNode {
  const n = typeof params.n === 'number' ? params.n : typeof params.count === 'number' ? params.count : undefined
  const msg = rawMessage(key, n)
  return createElement(Fragment, null, ...render(msg, n === undefined ? params : { ...params }, tags, key))
}
