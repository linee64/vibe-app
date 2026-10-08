import { LAST_LESSON_KEY } from './store'
import { navigate } from './router'
import { pendingTierUp, type TierProgress } from './data/tiers'

/** После урока/домашки: если только что пройден тир — праздничный экран, иначе обратно на путь к этому узлу */
export function continueAfter(p: TierProgress, nodeId: string) {
  sessionStorage.setItem(LAST_LESSON_KEY, nodeId)
  const t = pendingTierUp(p)
  navigate(t ? `/tier-up/${t.id}` : '/learn')
}
