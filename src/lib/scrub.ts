/**
 * Вычистка секретов и личных данных перед отправкой в аналитику и отчёты об ошибках.
 * Чистый TypeScript — используется в вебе и в мобильном приложении (@web/lib/scrub).
 */

const PATTERNS: [RegExp, string][] = [
  [/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '[jwt]'],
  [/\bsb_(secret|publishable)_[A-Za-z0-9_-]{6,}/g, '[supabase-key]'],
  [/\bpolar_(oat|whs|pat)_[A-Za-z0-9_-]{6,}/g, '[polar-key]'],
  [/\bsk-[A-Za-z0-9_-]{12,}/g, '[api-key]'],
  [/\bphx_[A-Za-z0-9_-]{12,}/g, '[api-key]'],
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, 'Bearer [token]'],
  [/\b\d{6,}:[A-Za-z0-9_-]{30,}\b/g, '[bot-token]'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]'],
  [/([?&#](?:access_token|refresh_token|token|code|key|apikey|password|email|checkout_id)=)[^&#\s]*/gi, '$1[redacted]'],
]

export function scrubString(s: string): string {
  let out = s
  for (const [re, rep] of PATTERNS) out = out.replace(re, rep)
  return out
}

/** Ключи, значения которых не отправляем никогда: промпты учеников, тексты, почта, пароли, токены */
export const SENSITIVE_KEY_RE = /(prompt|message|text|body|email|e-mail|mail|password|passwd|secret|token|authorization|cookie|api[_-]?key|history|draft|answer)/i

/** Глубокая вычистка объекта (для событий Sentry): чувствительные ключи → «[filtered]», строки — через scrubString */
export function scrubDeep<T>(value: T, depth = 0): T {
  if (depth > 8) return value
  if (typeof value === 'string') return scrubString(value) as T
  if (Array.isArray(value)) return value.map((v) => scrubDeep(v, depth + 1)) as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEY_RE.test(k) && (typeof v === 'string' || (v && typeof v === 'object')) ? '[filtered]' : scrubDeep(v, depth + 1)
    }
    return out as T
  }
  return value
}

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>

/**
 * Свойства событий аналитики: только простые значения, без чувствительных ключей,
 * строки — короткие и без почты/токенов. Длинный текст (вдруг это промпт) не отправляем.
 */
export function sanitizeProps(props: AnalyticsProps | undefined): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {}
  if (!props) return out
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined) continue
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(k)) continue
    if (SENSITIVE_KEY_RE.test(k)) continue
    if (typeof v === 'string') {
      if (v.length > 80) continue
      const s = scrubString(v)
      if (s !== v) continue
      out[k] = s
    } else if (typeof v === 'number') {
      if (Number.isFinite(v)) out[k] = v
    } else out[k] = v
  }
  return out
}
