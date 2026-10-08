import type { ArrangeExercise, Exercise } from './course'

export type Answer = number | number[] | null
export type Status = 'idle' | 'correct' | 'wrong'

/** Детерминированное перемешивание (чтобы порядок не прыгал между рендерами) */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
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

export function arrangeBank(ex: ArrangeExercise) {
  const bank = seededShuffle([...ex.tiles, ...ex.distractors], ex.title)
  // не даём банку случайно совпасть с правильным порядком
  if (ex.tiles.every((t, i) => bank[i] === t)) bank.push(bank.shift()!)
  return bank
}

export function isCorrect(ex: Exercise, answer: Answer): boolean {
  if (ex.kind === 'arrange') {
    const bank = arrangeBank(ex)
    const picked = (Array.isArray(answer) ? answer : []).map((i) => bank[i])
    return picked.join(' ') === ex.tiles.join(' ')
  }
  return answer === ex.correct
}

export function correctText(ex: Exercise): string {
  switch (ex.kind) {
    case 'choice':
      return ex.options[ex.correct]
    case 'arrange':
      return ex.tiles.join(' ')
    case 'bug':
      return `строка ${ex.correct + 1}: ${ex.code[ex.correct].trim()}`
    case 'fill':
      return `${ex.before} ${ex.options[ex.correct]} ${ex.after}`.trim()
  }
}

export function canCheck(answer: Answer) {
  return Array.isArray(answer) ? answer.length > 0 : answer !== null
}

