// Проверка контента курса: npx jiti scripts/validate-content.ts
import { UNITS } from '../src/data/course'
let total = 0
const problems: string[] = []
for (const u of UNITS) {
  const counts = u.lessons.map((l) => l.exercises.length)
  total += counts.reduce((a, b) => a + b, 0)
  console.log(`${u.num}. ${u.title} [${u.color}${u.pro ? ', pro' : ''}] — ${u.lessons.length} nodes, ${counts.reduce((a, b) => a + b, 0)} exercises`)
  for (const l of u.lessons) {
    const kinds = l.exercises.map((e) => e.kind[0]).join('')
    console.log(`   ${l.id} (${l.kind}) ${l.title}: ${l.exercises.length} ex [${kinds}]`)
    if (l.exercises.length < 5 || l.exercises.length > 7) problems.push(`${l.id} count ${l.exercises.length}`)
    for (const e of l.exercises) {
      if (e.kind === 'choice' || e.kind === 'fill') {
        if (e.correct < 0 || e.correct >= e.options.length) problems.push(`${l.id} ${e.title} correct out of range`)
        if (new Set(e.options).size !== e.options.length) problems.push(`${l.id} ${e.title} dup options`)
      }
      if (e.kind === 'bug' && (e.correct < 0 || e.correct >= e.code.length)) problems.push(`${l.id} ${e.title} bug out of range`)
      if (e.kind === 'arrange') {
        const all = [...e.tiles, ...e.distractors]
        if (new Set(all).size !== all.length) problems.push(`${l.id} ${e.title} dup tiles`)
      }
      if (!e.explain) problems.push(`${l.id} ${e.title} no explain`)
    }
  }
}
const ids = UNITS.flatMap((u) => u.lessons.map((l) => l.id))
if (new Set(ids).size !== ids.length) problems.push('dup lesson ids')
console.log('TOTAL exercises', total, 'lessons', ids.length)
console.log(problems.length ? problems : 'OK')
const pos = [0, 0, 0, 0]
for (const u of UNITS) for (const l of u.lessons) for (const e of l.exercises) if (e.kind === 'choice' || e.kind === 'fill') pos[e.correct]++
console.log('correct-answer positions after shuffle (1st/2nd/3rd/4th):', pos.join(' / '))
