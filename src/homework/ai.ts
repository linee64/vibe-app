/**
 * Мост между ИИ-разбором (DeepSeek через /api/ai/review) и детерминированными симуляторами домашек.
 *
 * ИИ понимает промпт по смыслу (синонимы, свои формулировки), а превью рисует симулятор (sims.ts).
 * Поэтому: всё, что ИИ признал выполненным, но симулятор по ключевым словам не заметил, мы «переводим»
 * на язык симулятора каноническими фразами и применяем промпт один раз. Итог — объединение:
 * ИИ может только добавить выполненное, но не отнять то, что засчитал симулятор.
 */
import type { HomeworkDef } from '../data/homework'
import type { ReviewRequest, PromptReview } from '../lib/review'
import { BUG_ERROR, type Sim } from './sims'

type Values = Record<string, string>

export interface AiProfile {
  /** Дополнительные возможности (не требования), которые ИИ может распознать */
  features: { id: string; label: string }[]
  /** Значения, которые стоит извлечь из промпта (название кафе, домен…) */
  values: { key: string; label: string }[]
  /** Требования, которые выполняются действием в превью */
  uiReqs: string[]
  /** UI-состояние «всё сделано в превью» — чтобы проверять только часть, зависящую от промпта */
  fullUi: unknown
  /** Каноническая фраза, которую поймёт симулятор (null — фразой не выполнить) */
  phrase: (id: string, v: Values) => string | null
  /** Есть ли уже возможность в состоянии симулятора */
  featureOn?: (state: unknown, id: string) => boolean
}

const clean = (x: string | undefined, max = 40) => (x ?? '').replace(/[«»"“„<>.]/g, '').trim().slice(0, max)
const DOMAIN_RE = /^[a-z0-9][a-z0-9-]{1,40}\.(ru|com|app|dev|io|рф|kz|uz|by|online|site|cafe|coffee|me)$/

const PALETTES = {
  coffee: 'Палитра: коричневые и бежевые тона.',
  violet: 'Палитра: фиолетовые тона.',
  coral: 'Палитра: коралловые тона.',
  teal: 'Палитра: бирюзовые тона.',
  amber: 'Палитра: янтарные тона.',
} as const

/** «бирюзовая» / «teal» → ключ палитры симулятора (по умолчанию — кофейные тона) */
export function paletteKey(x: string | undefined): keyof typeof PALETTES {
  const t = (x ?? '').toLowerCase().replace(/ё/g, 'е')
  if (/фиолет|сиренев|лилов|violet/.test(t)) return 'violet'
  if (/коралл|лосос|персик|coral/.test(t)) return 'coral'
  if (/бирюз|мятн|teal/.test(t)) return 'teal'
  if (/янтар|оранж|желт|золот|amber/.test(t)) return 'amber'
  return 'coffee'
}

export const AI_PROFILES: Record<string, AiProfile> = {
  hw1: {
    features: [{ id: 'friendly', label: 'Дружелюбный тон, на «ты»' }],
    values: [],
    uiReqs: [],
    fullUi: {},
    phrase: (id) =>
      ({
        role: 'Ты — копирайтер.',
        goal: 'Напиши карточку товара.',
        context: 'Термокружка держит тепло 6 часов, для студентов.',
        limits: 'Не больше 60 слов.',
        format: 'Формат: заголовок и список.',
        friendly: 'Тон дружелюбный.',
      })[id] ?? null,
    featureOn: (s, id) => id === 'friendly' && !!(s as { friendly?: boolean }).friendly,
  },
  hw2: {
    features: [
      { id: 'reviews', label: 'Секция отзывов' },
      { id: 'contacts', label: 'Контакты и адрес' },
      { id: 'about', label: 'Блок «О нас» / история' },
      { id: 'nav', label: 'Навигация в шапке' },
    ],
    values: [
      { key: 'cafe_name', label: 'Название кофейни' },
      { key: 'cta_text', label: 'Текст на кнопке-призыве' },
      { key: 'palette', label: 'Основная палитра сайта одним словом: коричневая | фиолетовая | коралловая | бирюзовая | янтарная' },
    ],
    uiReqs: ['mobile'],
    fullUi: { device: 'desktop', viewedMobile: true },
    phrase: (id, v) => {
      switch (id) {
        case 'hero':
          return `Лендинг для кофейни «${clean(v.cafe_name, 30) || 'Зерно'}».`
        case 'menu':
          return 'Секция меню с ценами.'
        case 'cta':
          return `Кнопка «${clean(v.cta_text, 30) || 'Забронировать столик'}».`
        case 'colors':
          return PALETTES[paletteKey(v.palette)]
        case 'mobile':
          return 'Адаптив под телефоны.'
        case 'reviews':
          return 'Добавь отзывы.'
        case 'contacts':
          return 'Контакты и адрес.'
        case 'about':
          return 'Блок о нас.'
        case 'nav':
          return 'Навигация в шапке.'
        default:
          return null
      }
    },
    featureOn: (s, id) => !!(s as Record<string, unknown>)[id],
  },
  hw3: {
    features: [],
    values: [],
    uiReqs: ['verified'],
    fullUi: { added: ['x'], failedClicks: 0, verified: true },
    phrase: (id) =>
      ({
        error: BUG_ERROR.split('\n')[0],
        where: 'Ошибка в App.jsx, функция addTask.',
        code: 'Код: this.tasks.push(text)',
        steps: 'Я нажимаю «Добавить» и ожидаю, что задача появится в списке.',
      })[id] ?? null,
  },
  hw4: {
    features: [{ id: 'thanks', label: 'Сообщение «Спасибо» после отправки' }],
    values: [],
    uiReqs: ['saved'],
    fullUi: { rows: [], saved: true },
    phrase: (id) =>
      ({
        fields: 'Поля: имя, email, сообщение.',
        table: 'Сохраняй отзывы в таблицу feedback в Supabase.',
        validation: 'Проверяй, что поля не пустые и email корректный.',
        secret: 'Ключ бери из .env, не пиши его в коде.',
        thanks: 'После отправки покажи «Спасибо!».',
      })[id] ?? null,
    featureOn: (s, id) => id === 'thanks' && !!(s as { thanks?: boolean }).thanks,
  },
  hw5: {
    features: [{ id: 'og', label: 'Картинка-превью для соцсетей (Open Graph)' }],
    values: [
      { key: 'commit_message', label: 'Сообщение коммита' },
      { key: 'domain', label: 'Домен целиком, например zerno-coffee.ru' },
    ],
    uiReqs: [],
    fullUi: { opened: true },
    phrase: (id, v) => {
      switch (id) {
        case 'commit':
          return `Сделай коммит с сообщением «${clean(v.commit_message, 60).length >= 3 ? clean(v.commit_message, 60) : 'Первая версия лендинга'}».`
        case 'push':
          return 'Запушь на GitHub.'
        case 'deploy':
          return 'Задеплой на Vercel.'
        case 'domain': {
          const d = (v.domain ?? '').trim().slice(0, 80).toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.$/, '')
          return `Подключи домен ${DOMAIN_RE.test(d) ? d : 'zerno-coffee.ru'}.`
        }
        case 'analytics':
          return 'Подключи аналитику.'
        case 'og':
          return 'Сделай превью для соцсетей.'
        default:
          return null
      }
    },
    featureOn: (s, id) => id === 'og' && !!(s as { ogImage?: boolean }).ogImage,
  },
}

/** Запрос к /api/ai/review для домашки */
export function buildReviewRequest(def: HomeworkDef, prompt: string, history: string[]): ReviewRequest {
  const p = AI_PROFILES[def.id]
  return {
    task: { id: def.id, title: def.title, brief: def.brief },
    requirements: def.requirements.map((r) => ({ id: r.id, label: r.label, ui: p?.uiReqs.includes(r.id) || undefined })),
    features: p?.features ?? [],
    values: p?.values ?? [],
    prompt,
    history,
  }
}

/**
 * Дополнить промпт фразами для того, что ИИ засчитал, а симулятор не заметил.
 * Возвращает текст для sim.apply и id добавленного.
 */
export function mergeAiIntoPrompt<S, U>(sim: Sim<S, U>, def: HomeworkDef, state: S, prompt: string, review: PromptReview): { text: string; added: string[] } {
  const p = AI_PROFILES[def.id]
  if (!p) return { text: prompt, added: [] }
  const dry = sim.apply(state, prompt)
  const ck = sim.check(dry.state, p.fullUi as U)
  const add: string[] = []
  const phrases: string[] = []
  // порядок требований = естественный порядок шагов (коммит → push → деплой…)
  for (const r of def.requirements) {
    if (!review.requirements[r.id] || ck[r.id]) continue
    const ph = p.phrase(r.id, review.values ?? {})
    if (ph) {
      add.push(r.id)
      phrases.push(ph)
    }
  }
  for (const f of review.detected_features ?? []) {
    if (!p.features.some((x) => x.id === f) || p.featureOn?.(dry.state, f)) continue
    const ph = p.phrase(f, review.values ?? {})
    if (ph) {
      add.push(f)
      phrases.push(ph)
    }
  }
  if (!phrases.length) return { text: prompt, added: [] }
  return { text: `${prompt.trimEnd()}\n${phrases.join('\n')}`, added: add }
}
