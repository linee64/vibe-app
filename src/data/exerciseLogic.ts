import type { DuelExercise, Exercise, Outcome, PipelineExercise, UpgradeExercise } from './types'

/**
 * Ответ пользователя:
 *  choice / predict / nextmove / bug — индекс варианта (number)
 *  duel     — [сторона, причина]
 *  upgrade  — индексы выбранных чипов (в порядке данных)
 *  diff     — решение по каждому куску: 0 — не решено, 1 — принять, 2 — отклонить
 *  pipeline — индексы карточек на треке по порядку слотов (-1 — пустой слот)
 */
export type Answer = number | number[] | null
export type Status = 'idle' | 'correct' | 'wrong'

export function hashSeed(seed: string) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return h >>> 0
}

/** Детерминированное перемешивание (чтобы порядок не прыгал между рендерами) */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = hashSeed(seed)
  const rnd = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Ставит правильный вариант на позицию по хешу seed, остальные — в перемешанном порядке */
function placeCorrect<T>(items: T[], correct: number, seed: string): { items: T[]; correct: number } {
  const target = hashSeed(seed) % items.length
  const others = seededShuffle(
    items.map((_, i) => i).filter((i) => i !== correct),
    seed,
  )
  const order = [...others.slice(0, target), correct, ...others.slice(target)]
  return { items: order.map((i) => items[i]), correct: order.indexOf(correct) }
}

/**
 * В данных правильный вариант удобно писать первым. Перед показом детерминированно
 * перемешиваем варианты (и стороны дуэли), чтобы позиции правильных ответов были сбалансированы.
 */
export function prepareExercise(ex: Exercise, seed: string): Exercise {
  switch (ex.kind) {
    case 'choice':
    case 'nextmove': {
      const r = placeCorrect(ex.options, ex.correct, seed)
      return { ...ex, options: r.items, correct: r.correct }
    }
    case 'predict': {
      const r = placeCorrect(ex.outcomes, ex.correct, seed)
      return { ...ex, outcomes: r.items, correct: r.correct }
    }
    case 'duel': {
      const want = (hashSeed(seed + ':side') % 2) as 0 | 1
      const sides: DuelExercise['sides'] = want === ex.winner ? ex.sides : [ex.sides[1], ex.sides[0]]
      const r = placeCorrect(ex.reasons, ex.reason, seed + ':why')
      return { ...ex, sides, winner: want, reasons: r.items, reason: r.correct }
    }
    default:
      return ex
  }
}

/* ------------------------------------------------------------------ Прокачай промпт */

/** Сколько отнимает чип-ловушка от Вайб-метра */
export const TRAP_PENALTY = 18

export const isTrap = (ex: UpgradeExercise, i: number) => !!ex.chips[i]?.trap

export function upgradeScore(ex: UpgradeExercise, picked: number[]) {
  let s = ex.start
  for (const i of picked) s += isTrap(ex, i) ? -TRAP_PENALTY : ex.chips[i].power
  return Math.max(0, Math.min(100, s))
}

/** Порядок показа чипов (перемешан, но стабилен) */
export const chipOrder = (ex: UpgradeExercise) => seededShuffle(ex.chips.map((_, i) => i), ex.title + ex.base)

/* ------------------------------------------------------------------ Пайплайн */

/** Банк карточек пайплайна: шаги + лишние, перемешаны; не совпадает с правильным порядком */
export function pipelineBank(ex: PipelineExercise) {
  const all = [...ex.steps, ...(ex.extra ?? [])].map((_, i) => i)
  const bank = seededShuffle(all, ex.title + ex.steps.join('|'))
  if (ex.steps.every((_, i) => bank[i] === i)) bank.push(bank.shift()!)
  return bank
}
export const pipelineCards = (ex: PipelineExercise) => [...ex.steps, ...(ex.extra ?? [])]

/* ------------------------------------------------------------------ Проверка */

const arr = (a: Answer) => (Array.isArray(a) ? a : [])

export function isCorrect(ex: Exercise, answer: Answer): boolean {
  switch (ex.kind) {
    case 'choice':
    case 'predict':
    case 'nextmove':
    case 'bug':
      return answer === ex.correct
    case 'duel': {
      const [side, why] = arr(answer)
      return side === ex.winner && why === ex.reason
    }
    case 'upgrade': {
      const picked = new Set(arr(answer))
      return ex.chips.every((c, i) => (c.trap ? !picked.has(i) : picked.has(i))) && upgradeScore(ex, [...picked]) >= ex.target
    }
    case 'diff': {
      const a = arr(answer)
      return ex.hunks.every((h, i) => (h.harmful ? a[i] === 2 : a[i] === 1))
    }
    case 'pipeline': {
      const a = arr(answer)
      return a.length === ex.steps.length && ex.steps.every((_, i) => a[i] === i)
    }
  }
}

export function canCheck(ex: Exercise | undefined, answer: Answer) {
  if (!ex) return false
  switch (ex.kind) {
    case 'duel':
      return arr(answer).length === 2 && arr(answer).every((x) => x >= 0)
    case 'upgrade':
      return arr(answer).length > 0
    case 'diff':
      return arr(answer).length === ex.hunks.length && arr(answer).every((x) => x === 1 || x === 2)
    case 'pipeline':
      return arr(answer).length === ex.steps.length && arr(answer).every((x) => x >= 0)
    default:
      return typeof answer === 'number'
  }
}

const outcomeLabel = (o: Outcome) => o.label

/** Текст «Правильный ответ: …» в нижней панели */
export function correctText(ex: Exercise): string {
  switch (ex.kind) {
    case 'choice':
      return ex.quoted ? `«${ex.options[ex.correct]}»` : ex.options[ex.correct]
    case 'nextmove':
      return `«${ex.options[ex.correct]}»`
    case 'predict':
      return outcomeLabel(ex.outcomes[ex.correct])
    case 'bug':
      return ex.mode === 'text' ? `«${ex.code[ex.correct].trim()}»` : `строка ${ex.correct + 1}: ${ex.code[ex.correct].trim()}`
    case 'duel':
      return `промпт ${ex.winner === 0 ? 'A' : 'B'} — ${ex.reasons[ex.reason]}`
    case 'upgrade': {
      const good = ex.chips.filter((c) => !c.trap).map((c) => c.tag)
      const traps = ex.chips.filter((c) => c.trap).map((c) => `«${c.text}»`)
      return `добавить ${good.join(', ')}; ловушки — ${traps.join(', ')}`
    }
    case 'diff': {
      const bad = ex.hunks.map((h, i) => (h.harmful ? `правку ${i + 1}` : null)).filter(Boolean)
      return `отклонить ${bad.join(' и ')}, остальное принять`
    }
    case 'pipeline':
      return ex.steps.join(' → ')
  }
}

/** Сколько вариантов можно выбрать цифрами с клавиатуры (0 — клавиатура не используется) */
export function keyOptions(ex: Exercise | undefined) {
  if (!ex) return 0
  if (ex.kind === 'choice' || ex.kind === 'nextmove') return ex.options.length
  if (ex.kind === 'predict') return ex.outcomes.length
  if (ex.kind === 'bug') return ex.code.length
  return 0
}

/* ------------------------------------------------------------------ Подсказка Бипи (за токены) */

export interface Hint {
  /** варианты/строки, которые Бипи «вычеркнул» */
  dim?: number[]
  /** элемент, который Бипи пометил (ловушка / безопасный кусок / первый шаг) */
  mark?: number
  text: string
}

export function hintFor(ex: Exercise): Hint {
  // «предыдущий» вариант по кругу: детерминированно и не всегда соседний снизу
  const wrongAfter = (n: number, correct: number) => (correct + n - 1) % n
  switch (ex.kind) {
    case 'choice':
    case 'nextmove':
      return { dim: [wrongAfter(ex.options.length, ex.correct)], text: 'Бипи вычеркнул один неверный вариант' }
    case 'predict':
      return { dim: [wrongAfter(ex.outcomes.length, ex.correct)], text: 'Бипи вычеркнул один неверный результат' }
    case 'duel':
      return { dim: [wrongAfter(ex.reasons.length, ex.reason)], text: 'Бипи вычеркнул одну неверную причину' }
    case 'bug': {
      const others = ex.code.map((_, i) => i).filter((i) => i !== ex.correct && ex.code[i].trim())
      return { dim: seededShuffle(others, ex.title).slice(0, Math.ceil(others.length / 2)), text: 'Бипи погасил строки, где бага точно нет' }
    }
    case 'upgrade':
      return { mark: ex.chips.findIndex((c) => c.trap), text: 'Бипи пометил одну ловушку' }
    case 'diff':
      return { mark: ex.hunks.findIndex((h) => !h.harmful), text: 'Бипи проверил одну правку — она безопасна' }
    case 'pipeline':
      return { mark: 0, text: 'Бипи подсказал, с чего начать' }
  }
}
