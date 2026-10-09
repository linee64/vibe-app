/**
 * Прогон «правильного пути» домашки в локализованном симуляторе (для валидатора и тестов) —
 * как run() в scripts/validate-homework.ts.
 */
import type { HomeworkDef } from '../../data/homework'
import { BUG_CODE, BUG_ERROR, type Sim } from '../../homework/sims'
import type { Locale } from '../locales'
import { getLocalizedSims } from './sims'

const UI_ACTIONS: Record<string, Record<string, unknown>> = {
  viewMobile: { viewedMobile: true, device: 'phone' },
  addTask: { verified: true },
  submitForm: { saved: true },
  openSite: { opened: true },
}

export function runHomeworkSolution(hw: HomeworkDef, locale: Locale, steps: HomeworkDef['solution']) {
  const sim = getLocalizedSims(locale)[hw.id as 'hw1'] as unknown as Sim<unknown, Record<string, unknown>>
  let s = sim.init()
  let ui = sim.initUi()
  let draft = ''
  const log: string[] = []
  for (const st of steps) {
    if ('block' in st) draft += (draft ? ' ' : '') + (hw.blocks.find((b) => b.label === st.block)?.text ?? '')
    else if ('type' in st) draft += (draft ? ' ' : '') + st.type
    else if ('send' in st) {
      const turn = sim.apply(s, draft)
      s = turn.state
      log.push(`  > ${draft.replace(/\n/g, ' ⏎ ')}\n  → [${turn.tone}] ${turn.reply}${turn.changes.length ? ' | ' + turn.changes.join(', ') : ''}${turn.bipi ? '\n     Bipi: ' + turn.bipi : ''}`)
      draft = ''
    } else if ('action' in st) {
      if (st.action === 'copyError') draft += (draft ? '\n' : '') + BUG_ERROR
      else if (st.action === 'copyCode') draft += (draft ? '\n' : '') + BUG_CODE.join('\n')
      else ui = { ...ui, ...UI_ACTIONS[st.action] }
    }
  }
  return { checks: sim.check(s, ui) as Record<string, boolean>, log }
}
