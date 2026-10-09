import type { Tr, TrMap } from './types'

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)

/**
 * Накладывает перевод на исходный объект. Возвращает новый объект, исходник не мутирует.
 * Пер-полевой фолбэк: всё, чего нет в переводе (или пустая строка), остаётся из русского источника.
 * Числа/булевы значения исходника не заменяются никогда.
 */
export function applyTr<T>(src: T, tr: Tr | undefined | null): T {
  if (tr === undefined || tr === null) return src
  if (typeof src === 'string') return (typeof tr === 'string' && tr.trim() ? tr : src) as T
  if (Array.isArray(src)) {
    if (Array.isArray(tr)) return src.map((v, i) => applyTr(v, tr[i])) as T
    if (isObj(tr)) return src.map((v, i) => applyTr(v, (tr as TrMap)[String(i)])) as T
    return src
  }
  if (isObj(src) && isObj(tr)) {
    const out: Record<string, unknown> = { ...src }
    for (const k of Object.keys(tr)) if (k in src) out[k] = applyTr(src[k], (tr as TrMap)[k])
    return out as T
  }
  return src
}

/** Заменяет строки по точному совпадению (для общих строк из _kit) — глубоко, без мутаций */
export function replaceExact<T>(src: T, dict: Record<string, string>): T {
  if (typeof src === 'string') return (dict[src] ?? src) as T
  if (Array.isArray(src)) return src.map((v) => replaceExact(v, dict)) as T
  if (isObj(src)) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(src)) out[k] = replaceExact(v, dict)
    return out as T
  }
  return src
}

export const CYRILLIC = /[\u0400-\u04FF]/
export const hasCyrillic = (s: string) => CYRILLIC.test(s)

/** Все строки объекта (глубоко) — для проверок и отпечатков */
export function collectStrings(x: unknown, out: string[] = []): string[] {
  if (typeof x === 'string') out.push(x)
  else if (Array.isArray(x)) x.forEach((v) => collectStrings(v, out))
  else if (isObj(x)) Object.values(x).forEach((v) => collectStrings(v, out))
  return out
}

/** FNV-1a → 8 hex. Отпечаток русского текста упражнения: меняется, когда меняется источник. */
export function fingerprint(x: unknown): string {
  let h = 2166136261
  for (const s of collectStrings(x).filter(hasCyrillic)) {
    for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
    h = Math.imul(h ^ 0x1f, 16777619)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}
