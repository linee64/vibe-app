/**
 * Словарик Вайбика: ключевые термины курса простыми словами.
 * Подписи и определения — в UI-каталогах (gloss.<id>.term / gloss.<id>.def), тут — порядок терминов
 * и как найти термин в тексте урока на каждом языке. Чистая логика без DOM — общая для веба и мобилки.
 *
 * В уроке термин подсвечивается один раз — там, где он впервые встречается (glossPlan):
 * в первом упражнении, где он есть, и в первом его поле (реплика Бипи → ситуация → объяснение).
 */
import type { Exercise } from './types'
import type { Locale } from '../i18n/locales'

export const GLOSS_IDS = ['ai', 'llm', 'prompt', 'vibe', 'code', 'bug', 'frontend', 'backend', 'api', 'database', 'deploy', 'agent'] as const
export type GlossId = (typeof GLOSS_IDS)[number]

/** [шаблон, чувствителен к регистру] — шаблоны без границ слова, их добавляет glossRegex */
type Pat = [string, boolean?]

const PATTERNS: Record<Locale, Record<GlossId, Pat>> = {
  ru: {
    ai: ['ИИ', true],
    llm: ['LLM|нейросет\\p{L}*|языков\\p{L}* модел\\p{L}*'],
    prompt: ['промпт\\p{L}*'],
    vibe: ['вайб-кодинг\\p{L}*|vibe coding'],
    code: ['код(?:а|е|у|ом|ы|ов|ами)?'],
    bug: ['баг(?:а|и|у|ом|ов|ами|ах)?'],
    frontend: ['фронтенд\\p{L}*'],
    backend: ['бэкенд\\p{L}*|бекенд\\p{L}*'],
    api: ['API', true],
    database: ['баз\\p{L}* данных'],
    deploy: ['деплой\\p{L}*|деплои\\p{L}*|задеплой\\p{L}*|задеплои\\p{L}*'],
    agent: ['агент\\p{L}*'],
  },
  kk: {
    ai: ['ЖИ', true],
    llm: ['LLM|нейрожелі\\p{L}*|тілдік модел\\p{L}*'],
    prompt: ['промпт\\p{L}*'],
    vibe: ['вайб-кодинг\\p{L}*|vibe coding'],
    code: ['код(?:тар|тары|тарды|ты|тың|қа|та|ын|ы|ымен|пен)?'],
    bug: ['баг\\p{L}*'],
    frontend: ['фронтенд\\p{L}*'],
    backend: ['бэкенд\\p{L}*'],
    api: ['API', true],
    database: ['дерекқор\\p{L}*|деректер база\\p{L}*'],
    deploy: ['деплой\\p{L}*'],
    agent: ['агент\\p{L}*'],
  },
  en: {
    ai: ['AI', true],
    llm: ['LLMs?|language models?|neural networks?'],
    prompt: ['prompts?'],
    vibe: ['vibe[- ]coding'],
    code: ['code'],
    bug: ['bugs?'],
    frontend: ['front[- ]?end'],
    backend: ['back[- ]?end'],
    api: ['APIs?', true],
    database: ['databases?'],
    deploy: ['deploy(?:s|ed|ing|ment)?'],
    agent: ['agents?'],
  },
  es: {
    ai: ['IA', true],
    llm: ['LLMs?|modelos? de lenguaje|redes? neuronal(?:es)?'],
    prompt: ['prompts?'],
    vibe: ['vibe coding'],
    code: ['código'],
    bug: ['bugs?'],
    frontend: ['frontend'],
    backend: ['backend'],
    api: ['APIs?', true],
    database: ['bases? de datos'],
    deploy: ['despliegues?|desplegar|despliega\\p{L}*|deploy\\p{L}*'],
    agent: ['agentes?'],
  },
  zh: {
    ai: ['AI', true],
    llm: ['LLM|大语言模型|大模型|语言模型'],
    prompt: ['提示词'],
    vibe: ['氛围编程|vibe coding'],
    code: ['代码'],
    bug: ['bug'],
    frontend: ['前端'],
    backend: ['后端'],
    api: ['API', true],
    database: ['数据库'],
    deploy: ['部署|上线'],
    agent: ['智能体|AI 代理'],
  },
}

/** Граница «слова»: латиница, кириллица и цифры (иероглифы границей не мешают — в китайском нет пробелов) */
const W = '[\\p{Script=Latin}\\p{Script=Cyrillic}\\p{N}]'
const cache = new Map<string, RegExp>()

export function glossRegex(locale: Locale, id: GlossId): RegExp {
  const key = locale + ':' + id
  let re = cache.get(key)
  if (!re) {
    const [src, cs] = PATTERNS[locale][id]
    re = new RegExp(`(?<!${W})(?:${src})(?!${W})`, cs ? 'gu' : 'giu')
    cache.set(key, re)
  }
  re.lastIndex = 0
  return re
}

/** Первое вхождение термина в текст (или -1) */
export function findTerm(text: string, locale: Locale, id: GlossId): { index: number; length: number } | null {
  const m = glossRegex(locale, id).exec(text)
  return m ? { index: m.index, length: m[0].length } : null
}

export interface GlossSegment {
  text: string
  term?: GlossId
}

/** Разбить текст на куски: выбранные термины — отдельными сегментами (первое вхождение, без пересечений) */
export function splitGloss(text: string, terms: Iterable<GlossId>, locale: Locale): GlossSegment[] {
  const hits: { index: number; length: number; id: GlossId }[] = []
  for (const id of terms) {
    const h = findTerm(text, locale, id)
    if (h) hits.push({ ...h, id })
  }
  hits.sort((a, b) => a.index - b.index || b.length - a.length)
  const out: GlossSegment[] = []
  let pos = 0
  for (const h of hits) {
    if (h.index < pos) continue
    if (h.index > pos) out.push({ text: text.slice(pos, h.index) })
    out.push({ text: text.slice(h.index, h.index + h.length), term: h.id })
    pos = h.index + h.length
  }
  if (pos < text.length || !out.length) out.push({ text: text.slice(pos) })
  return out
}

export type GlossField = 'prompt' | 'situation' | 'explain'

/** Тексты упражнения в порядке показа: реплика Бипи над заданием, карточка-ситуация, объяснение после ответа */
export function glossFields(ex: Exercise): Partial<Record<GlossField, string>> {
  if (ex.kind === 'choice') return { prompt: ex.situation ? ex.prompt : undefined, situation: ex.situation ?? ex.prompt, explain: ex.explain }
  return { prompt: ex.prompt, explain: ex.explain }
}

const FIELD_ORDER: GlossField[] = ['prompt', 'situation', 'explain']

/**
 * План подсветки урока: для каждого упражнения (по индексу) и поля — какие термины подсветить.
 * Термин подсвечивается только при первом появлении в уроке.
 */
export function glossPlan(exercises: Exercise[], locale: Locale): Map<number, Map<GlossField, Set<GlossId>>> {
  const plan = new Map<number, Map<GlossField, Set<GlossId>>>()
  const seen = new Set<GlossId>()
  exercises.forEach((ex, i) => {
    const fields = glossFields(ex)
    for (const f of FIELD_ORDER) {
      const text = fields[f]
      if (!text) continue
      for (const id of GLOSS_IDS) {
        if (seen.has(id) || !findTerm(text, locale, id)) continue
        seen.add(id)
        let byField = plan.get(i)
        if (!byField) plan.set(i, (byField = new Map()))
        let set = byField.get(f)
        if (!set) byField.set(f, (set = new Set()))
        set.add(id)
      }
    }
  })
  return plan
}
