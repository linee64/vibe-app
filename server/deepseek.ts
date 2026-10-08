/**
 * DeepSeek Chat Completions (OpenAI-совместимый API, https://api.deepseek.com).
 * Режим без «размышлений» (thinking: disabled) — быстрее и дешевле; ответ строго JSON (response_format json_object).
 * Ключ берётся только из process.env.DEEPSEEK_API_KEY и никогда не логируется.
 */
import { serverEnv } from './env.js'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DeepSeekOk {
  ok: true
  json: unknown
  usage: { prompt_tokens: number; completion_tokens: number; cache_hit_tokens: number }
  model: string
  attempts: number
  latencyMs: number
}

export interface DeepSeekErr {
  ok: false
  /** timeout | unavailable | auth | bad_output */
  kind: 'timeout' | 'unavailable' | 'auth' | 'bad_output'
  status?: number
  attempts: number
}

export interface DeepSeekOptions {
  fetchImpl?: typeof fetch
  timeoutMs?: number
  maxTokens?: number
  retries?: number
}

const RETRYABLE = (status: number) => status === 429 || status >= 500

export async function deepseekJson(messages: ChatMessage[], opts: DeepSeekOptions = {}): Promise<DeepSeekOk | DeepSeekErr> {
  const f = opts.fetchImpl ?? fetch
  const timeoutMs = opts.timeoutMs ?? 15_000
  const retries = opts.retries ?? 1
  const started = Date.now()
  let last: DeepSeekErr = { ok: false, kind: 'unavailable', attempts: 0 }

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await f(`${serverEnv.deepseekBaseUrl()}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serverEnv.deepseekKey()}` },
        body: JSON.stringify({
          model: serverEnv.deepseekModel(),
          messages,
          thinking: { type: 'disabled' },
          response_format: { type: 'json_object' },
          max_tokens: opts.maxTokens ?? 700,
          temperature: 0.2,
          stream: false,
        }),
        signal: ctrl.signal,
      })
      if (!res.ok) {
        // тело ошибки не логируем целиком — там может быть эхо запроса
        last = { ok: false, kind: res.status === 401 || res.status === 403 ? 'auth' : 'unavailable', status: res.status, attempts: attempt }
        if (RETRYABLE(res.status) && attempt <= retries) continue
        return last
      }
      const body = (await res.json()) as {
        model?: string
        choices?: { message?: { content?: string | null } }[]
        usage?: { prompt_tokens?: number; completion_tokens?: number; prompt_cache_hit_tokens?: number }
      }
      const content = body.choices?.[0]?.message?.content ?? ''
      let parsed: unknown
      try {
        parsed = content ? JSON.parse(content) : null
      } catch {
        parsed = null
      }
      if (!parsed || typeof parsed !== 'object') {
        last = { ok: false, kind: 'bad_output', attempts: attempt }
        if (attempt <= retries) continue
        return last
      }
      return {
        ok: true,
        json: parsed,
        usage: {
          prompt_tokens: body.usage?.prompt_tokens ?? 0,
          completion_tokens: body.usage?.completion_tokens ?? 0,
          cache_hit_tokens: body.usage?.prompt_cache_hit_tokens ?? 0,
        },
        model: body.model ?? serverEnv.deepseekModel(),
        attempts: attempt,
        latencyMs: Date.now() - started,
      }
    } catch (e) {
      const aborted = ctrl.signal.aborted || (e instanceof Error && e.name === 'AbortError')
      last = { ok: false, kind: aborted ? 'timeout' : 'unavailable', attempts: attempt }
      if (attempt <= retries) continue
      return last
    } finally {
      clearTimeout(timer)
    }
  }
  return last
}
