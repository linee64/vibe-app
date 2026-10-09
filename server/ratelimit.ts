/**
 * Простой лимит запросов в памяти функции (скользящее окно). На Vercel у каждого «тёплого» инстанса
 * свой счётчик — это защита от случайного флуда и простых ботов, а не строгая квота.
 */
export interface RateRule {
  windowMs: number
  max: number
}

export interface RateLimiter {
  /** Засчитать запрос; ok=false — лимит, retryAfter в секундах */
  hit(key: string, now?: number): { ok: true } | { ok: false; retryAfter: number }
  reset(): void
}

export function createRateLimiter(rules: RateRule[], maxKeys = 5000): RateLimiter {
  const hits = new Map<string, number[]>()
  const longest = Math.max(...rules.map((r) => r.windowMs))
  return {
    hit(key, now = Date.now()) {
      const list = (hits.get(key) ?? []).filter((t) => now - t < longest)
      for (const r of rules) {
        const inWindow = list.filter((t) => now - t < r.windowMs)
        if (inWindow.length >= r.max) {
          hits.set(key, list)
          return { ok: false, retryAfter: Math.max(1, Math.ceil((inWindow[0] + r.windowMs - now) / 1000)) }
        }
      }
      list.push(now)
      hits.delete(key)
      hits.set(key, list)
      // не даём карте расти бесконечно: выкидываем самые старые ключи
      while (hits.size > maxKeys) hits.delete(hits.keys().next().value as string)
      return { ok: true }
    },
    reset() {
      hits.clear()
    },
  }
}

/** IP клиента за прокси Vercel (только для лимита, никуда не сохраняется) */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim().slice(0, 64)
  return (req.headers.get('x-real-ip') ?? 'unknown').slice(0, 64)
}
