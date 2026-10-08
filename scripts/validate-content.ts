// Проверка контента курса: npx jiti scripts/validate-content.ts
// Каждое упражнение должно иметь ровно одно решение, ловушки никогда не засчитываются,
// позиции правильных ответов сбалансированы, в каждом уроке ≥3 разных типов, «Ситуаций» ≤25%.
import { UNITS } from '../src/data/course'
import { isCorrect, pipelineBank, upgradeScore, type Answer } from '../src/data/exerciseLogic'
import type { Exercise, ExerciseKind } from '../src/data/types'

const KINDS: ExerciseKind[] = ['duel', 'predict', 'upgrade', 'nextmove', 'diff', 'bug', 'pipeline', 'choice']
const problems: string[] = []
const warn: string[] = []
const byKind: Record<string, number> = {}
const byUnit: Record<string, Record<string, number>> = {}
const positions: Record<string, number[]> = {}
const duelSides = [0, 0]
let total = 0
let flags = 0

const dup = (a: string[]) => a.filter((x, i) => a.indexOf(x) !== i)
const pos = (group: string, idx: number, n: number) => {
  const key = `${group}/${n}`
  positions[key] ??= Array(n).fill(0)
  positions[key][idx]++
}

/** Правильный ответ, построенный из данных */
function solution(e: Exercise): Answer {
  switch (e.kind) {
    case 'choice':
    case 'predict':
    case 'nextmove':
    case 'bug':
      return e.correct
    case 'duel':
      return [e.winner, e.reason]
    case 'upgrade':
      return e.chips.map((c, i) => (c.trap ? -1 : i)).filter((i) => i >= 0)
    case 'diff':
      return e.hunks.map((h) => (h.harmful ? 2 : 1))
    case 'pipeline':
      return e.steps.map((_, i) => i)
  }
}

/** Все альтернативные ответы должны быть неверными (единственность решения) */
function alternatives(e: Exercise): Answer[] {
  const out: Answer[] = []
  switch (e.kind) {
    case 'choice':
    case 'nextmove':
      e.options.forEach((_, i) => i !== e.correct && out.push(i))
      break
    case 'predict':
      e.outcomes.forEach((_, i) => i !== e.correct && out.push(i))
      break
    case 'bug':
      e.code.forEach((_, i) => i !== e.correct && out.push(i))
      break
    case 'duel':
      for (const s of [0, 1]) e.reasons.forEach((_, r) => (s !== e.winner || r !== e.reason) && out.push([s, r]))
      break
    case 'upgrade': {
      // все подмножества чипов (их ≤ 8 → ≤ 256 вариантов)
      const n = e.chips.length
      const good = solution(e) as number[]
      for (let m = 0; m < 1 << n; m++) {
        const set = Array.from({ length: n }, (_, i) => i).filter((i) => m & (1 << i))
        if (set.length === good.length && set.every((i) => good.includes(i))) continue
        out.push(set)
      }
      break
    }
    case 'diff': {
      const n = e.hunks.length
      for (let m = 0; m < 1 << n; m++) {
        const a = Array.from({ length: n }, (_, i) => (m & (1 << i) ? 2 : 1))
        if (a.every((x, i) => x === (e.hunks[i].harmful ? 2 : 1))) continue
        out.push(a)
      }
      break
    }
    case 'pipeline': {
      const all = [...e.steps, ...(e.extra ?? [])].map((_, i) => i)
      // перестановки: соседние обмены + подмена шага лишней карточкой
      for (let i = 0; i + 1 < e.steps.length; i++) {
        const a = e.steps.map((_, k) => k)
        ;[a[i], a[i + 1]] = [a[i + 1], a[i]]
        out.push(a)
      }
      for (const x of all.slice(e.steps.length)) {
        const a = e.steps.map((_, k) => k)
        a[a.length - 1] = x
        out.push(a)
      }
      break
    }
  }
  return out
}

for (const u of UNITS) {
  byUnit[u.id] = {}
  const n = u.lessons.reduce((a, l) => a + l.exercises.length, 0)
  console.log(`${u.num}. ${u.title} [${u.color}${u.pro ? ', pro' : ''}] — ${u.lessons.length} уроков, ${n} упражнений`)
  for (const l of u.lessons) {
    const where = (e: Exercise) => `${l.id} «${e.title}»`
    const kinds = new Set(l.exercises.map((e) => e.kind))
    console.log(`   ${l.id} (${l.kind}) ${l.title}: ${l.exercises.length} — ${l.exercises.map((e) => e.kind).join(', ')}`)
    if (l.exercises.length < 5 || l.exercises.length > 6) problems.push(`${l.id}: ${l.exercises.length} упражнений (нужно 5–6)`)
    if (kinds.size < 3) problems.push(`${l.id}: только ${kinds.size} типа`)
    if (l.exercises.filter((e) => e.kind === 'choice').length > 2) problems.push(`${l.id}: больше 2 «Ситуаций»`)
    for (const d of dup(l.exercises.map((e) => e.title))) problems.push(`${l.id}: повтор заголовка «${d}»`)

    for (const e of l.exercises) {
      total++
      byKind[e.kind] = (byKind[e.kind] ?? 0) + 1
      byUnit[u.id][e.kind] = (byUnit[u.id][e.kind] ?? 0) + 1
      if (!e.explain || e.explain.length < 40) problems.push(`${where(e)}: нет объяснения`)
      if (!e.title) problems.push(`${l.id}: упражнение без заголовка`)

      switch (e.kind) {
        case 'choice':
        case 'nextmove': {
          if (e.options.length < 3) problems.push(`${where(e)}: меньше 3 вариантов`)
          if (dup(e.options).length) problems.push(`${where(e)}: повтор вариантов`)
          if (e.kind === 'choice' && !e.situation && !e.prompt) problems.push(`${where(e)}: нет ситуации`)
          if (e.kind === 'nextmove' && (!e.chat.length || e.chat[e.chat.length - 1].from !== 'ai')) problems.push(`${where(e)}: чат должен заканчиваться репликой ИИ`)
          pos(e.kind === 'choice' ? 'choice' : 'nextmove', e.correct, e.options.length)
          break
        }
        case 'predict':
          if (e.outcomes.length < 2) problems.push(`${where(e)}: меньше 2 исходов`)
          if (dup(e.outcomes.map((o) => o.label)).length) problems.push(`${where(e)}: повтор подписей исходов`)
          pos('predict', e.correct, e.outcomes.length)
          break
        case 'duel':
          if (e.sides[0].prompt === e.sides[1].prompt) problems.push(`${where(e)}: одинаковые промпты`)
          if (e.reasons.length < 3 || dup(e.reasons).length) problems.push(`${where(e)}: нужно ≥3 разных причин`)
          duelSides[e.winner]++
          pos('duel-reason', e.reason, e.reasons.length)
          break
        case 'upgrade': {
          const good = e.chips.filter((c) => !c.trap)
          const traps = e.chips.filter((c) => c.trap)
          const sum = e.start + good.reduce((a, c) => a + c.power, 0)
          if (good.length < 2 || traps.length < 1) problems.push(`${where(e)}: нужно ≥2 улучшений и ≥1 ловушка`)
          if (traps.some((c) => c.power !== 0)) problems.push(`${where(e)}: у ловушки должна быть сила 0`)
          if (good.some((c) => c.power <= 0)) problems.push(`${where(e)}: улучшение без силы`)
          if (sum < e.target) problems.push(`${where(e)}: все улучшения дают ${sum} < цели ${e.target}`)
          if (sum > 100) warn.push(`${where(e)}: сумма ${sum} > 100 (обрежется)`)
          for (const c of good) if (sum - c.power >= e.target) problems.push(`${where(e)}: без «${c.tag}» цель всё равно достигается`)
          if (e.start >= e.target) problems.push(`${where(e)}: старт уже на цели`)
          if (dup(e.chips.map((c) => c.text)).length) problems.push(`${where(e)}: повтор чипов`)
          const allGood = solution(e) as number[]
          traps.forEach((_, k) => {
            const ti = e.chips.indexOf(traps[k])
            if (isCorrect(e, [...allGood, ti])) problems.push(`${where(e)}: ловушка засчитывается`)
            if (upgradeScore(e, [...allGood, ti]) >= upgradeScore(e, allGood)) problems.push(`${where(e)}: ловушка не снижает Вайб-метр`)
          })
          for (const c of e.chips) if (c.text.length > 120) warn.push(`${where(e)}: длинный чип (${c.text.length})`)
          break
        }
        case 'diff': {
          const harm = e.hunks.filter((h) => h.harmful).length
          if (!harm || harm === e.hunks.length) problems.push(`${where(e)}: нужны и опасные, и безопасные правки`)
          for (const h of e.hunks) for (const line of h.lines) if (!/^[+\- ]/.test(line)) problems.push(`${where(e)}: строка без +/−/пробела: ${line}`)
          if (!e.request) problems.push(`${where(e)}: нет запроса`)
          break
        }
        case 'bug': {
          if (e.correct < 0 || e.correct >= e.code.length) problems.push(`${where(e)}: строка вне диапазона`)
          else {
            const line = e.code[e.correct].trim()
            if (!line) problems.push(`${where(e)}: баг на пустой строке`)
            if (e.code.filter((c) => c.trim() === line).length > 1) problems.push(`${where(e)}: строка с багом встречается дважды`)
          }
          if (e.mode === 'text') flags++
          break
        }
        case 'pipeline': {
          const all = [...e.steps, ...(e.extra ?? [])]
          if (e.steps.length < 3) problems.push(`${where(e)}: меньше 3 шагов`)
          if (dup(all).length) problems.push(`${where(e)}: повтор карточек`)
          const bank = pipelineBank(e)
          if (e.steps.every((_, i) => bank[i] === i)) problems.push(`${where(e)}: банк уже в правильном порядке`)
          break
        }
      }

      // единственность решения
      if (!isCorrect(e, solution(e))) problems.push(`${where(e)}: эталонный ответ не засчитывается`)
      const alt = alternatives(e).filter((a) => isCorrect(e, a))
      if (alt.length) problems.push(`${where(e)}: ещё ${alt.length} верных ответов, напр. ${JSON.stringify(alt[0])}`)
    }
  }
}

const ids = UNITS.flatMap((u) => u.lessons.map((l) => l.id))
if (new Set(ids).size !== ids.length) problems.push('повтор id уроков')
const choiceShare = (byKind.choice ?? 0) / total
if (choiceShare > 0.25) problems.push(`«Ситуаций» ${(choiceShare * 100).toFixed(0)}% > 25%`)

// баланс позиций правильных ответов (после детерминированного перемешивания)
for (const [k, arr] of Object.entries(positions)) {
  const sum = arr.reduce((a, b) => a + b, 0)
  if (sum >= 9 && Math.max(...arr) / sum > 0.5) problems.push(`позиции ${k} несбалансированы: ${arr.join('/')}`)
}
if (Math.abs(duelSides[0] - duelSides[1]) > Math.max(2, (duelSides[0] + duelSides[1]) * 0.3)) problems.push(`победители дуэлей несбалансированы: A ${duelSides[0]} / B ${duelSides[1]}`)

console.log('\nУпражнений:', total, '· уроков:', ids.length)
console.log('По типам:', KINDS.map((k) => `${k} ${byKind[k] ?? 0}`).join(' · '), `(из них «красный флаг» ${flags})`)
for (const u of UNITS) console.log(`  ${u.id}:`, KINDS.map((k) => `${k} ${byUnit[u.id][k] ?? 0}`).join(' · '))
console.log(`«Ситуации»: ${((choiceShare) * 100).toFixed(1)}%`)
console.log('Позиции правильных ответов:', Object.entries(positions).map(([k, a]) => `${k}: ${a.join('/')}`).join(' · '))
console.log(`Победитель дуэли: A ${duelSides[0]} / B ${duelSides[1]}`)
if (warn.length) console.log('\nПредупреждения:\n  ' + warn.join('\n  '))
console.log(problems.length ? `\nПРОБЛЕМЫ (${problems.length}):\n  ` + problems.join('\n  ') : '\nOK')
if (problems.length) process.exit(1)
