// Проверка симулятора домашек без браузера: npx jiti scripts/validate-homework.ts
// «Правильный путь» из src/data/homework.ts должен выполнять все требования, а расплывчатый промпт — нет.
import { HOMEWORKS, type HomeworkDef } from '../src/data/homework'
import { BUG_CODE, BUG_ERROR, cardSim, debugSim, deploySim, formSim, landingSim, type Sim } from '../src/homework/sims'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SIMS: Record<string, Sim<any, any>> = { hw1: cardSim, hw2: landingSim, hw3: debugSim, hw4: formSim, hw5: deploySim }
const UI_ACTIONS: Record<string, Record<string, unknown>> = {
  viewMobile: { viewedMobile: true, device: 'phone' },
  addTask: { verified: true },
  submitForm: { saved: true },
  openSite: { opened: true },
}

function run(hw: HomeworkDef, steps: HomeworkDef['solution']) {
  const sim = SIMS[hw.id]
  let s = sim.init()
  let ui = sim.initUi()
  let draft = ''
  const log: string[] = []
  for (const st of steps) {
    if ('block' in st) draft += (draft ? ' ' : '') + hw.blocks.find((b) => b.label === st.block)!.text
    else if ('type' in st) draft += (draft ? ' ' : '') + st.type
    else if ('send' in st) {
      const turn = sim.apply(s, draft)
      s = turn.state
      log.push(`  → [${turn.tone}] ${turn.reply}${turn.changes.length ? ' | ' + turn.changes.join(', ') : ''}${turn.bipi ? '\n     Бипи: ' + turn.bipi : ''}`)
      draft = ''
    } else if ('action' in st) {
      if (st.action === 'copyError') draft += (draft ? '\n' : '') + BUG_ERROR
      else if (st.action === 'copyCode') draft += (draft ? '\n' : '') + BUG_CODE.join('\n')
      // в превью «Добавить» засчитывается, только когда баг починен; форма — только когда есть таблица
      else ui = { ...ui, ...UI_ACTIONS[st.action] }
    }
  }
  return { checks: sim.check(s, ui) as Record<string, boolean>, log }
}

const problems: string[] = []
for (const hw of HOMEWORKS) {
  const ok = run(hw, hw.solution)
  const vague = run(hw, [{ type: hw.vague }, { send: true }])
  const okAll = hw.requirements.every((r) => ok.checks[r.id])
  const vagueCount = hw.requirements.filter((r) => vague.checks[r.id]).length
  console.log(`${hw.id} «${hw.title}»: solution ${okAll ? 'PASS' : 'FAIL'} ${JSON.stringify(ok.checks)}; vague → ${vagueCount}/${hw.requirements.length}`)
  console.log(ok.log.join('\n'))
  console.log('  vague:\n' + vague.log.join('\n'))
  if (!okAll) problems.push(`${hw.id}: solution does not meet all requirements`)
  if (vagueCount >= 2) problems.push(`${hw.id}: vague prompt meets ${vagueCount} requirements`)
  for (const b of hw.blocks) if (!hw.solution.every((s) => !('block' in s) || hw.blocks.some((x) => x.label === s.block))) problems.push(`${hw.id}: unknown block ${b.label}`)
  if (Object.keys(ok.checks).sort().join() !== hw.requirements.map((r) => r.id).sort().join()) problems.push(`${hw.id}: requirement ids mismatch`)
}
console.log(problems.length ? problems : 'OK')
if (problems.length) process.exit(1)
