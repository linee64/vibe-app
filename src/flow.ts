import { LAST_LESSON_KEY } from './store'
import { navigate } from './router'
import { pendingTierUp, needsPro, type TierProgress } from './data/tiers'
import { currentNodeId, unitNodes, unitOfNode, type PathProgress } from './data/path'

/** Самый первый урок курса: новичок попадает прямо в него после входа */
export const FIRST_LESSON_ID = 'u1-1'
/** В первом уроке (пока он не пройден) оставляем 3 самых простых упражнения из 5: выбор, «чему нельзя верить», порядок шагов */
export const FIRST_RUN_PICK = [0, 3, 2]

/** Ничего ещё не пройдено: ни урока, ни домашки */
export const isNewLearner = (p: { completed: string[]; homework: string[] }) => p.completed.length === 0 && p.homework.length === 0

/** После урока/домашки: если только что пройден тир — праздничный экран, иначе обратно на путь к этому узлу */
export function continueAfter(p: TierProgress, nodeId: string) {
  sessionStorage.setItem(LAST_LESSON_KEY, nodeId)
  const t = pendingTierUp(p)
  navigate(t ? `/tier-up/${t.id}` : '/learn')
}

export interface NextStep {
  to: string
  title: string
}

/**
 * «Следующий урок» после только что пройденного: прямая кнопка в следующий узел пути —
 * только если дальше свободный (не Pro) узел и нет праздника «Новый тир!». Иначе null — ведём обычным «Продолжить».
 */
export function nextStep(p: TierProgress & PathProgress): NextStep | null {
  if (pendingTierUp(p)) return null
  const id = currentNodeId(p)
  if (!id) return null
  const unit = unitOfNode(id)
  if (!unit || needsPro(unit.id)) return null
  const node = unitNodes(unit).find((n) => n.id === id)
  if (!node) return null
  return node.type === 'lesson' ? { to: `/lesson/${id}`, title: node.lesson.title } : { to: `/homework/${id}`, title: node.hw.title }
}
