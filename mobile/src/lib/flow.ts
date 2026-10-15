/** После урока/домашки (src/flow.ts): тир пройден — праздничный экран, иначе на путь к этому узлу */
import type { useRouter } from 'expo-router'
import { pendingTierUp, type TierProgress } from '@web/data/tiers'

let lastNode: string | null = null
/** Узел, к которому прокрутить путь при возвращении (как LAST_LESSON_KEY в sessionStorage веба) */
export const takeLastNode = () => {
  const n = lastNode
  lastNode = null
  return n
}
export const setLastNode = (id: string) => {
  lastNode = id
}

type Router = ReturnType<typeof useRouter>

export function continueAfter(router: Router, p: TierProgress, nodeId: string) {
  lastNode = nodeId
  const t = pendingTierUp(p)
  if (t) router.replace({ pathname: '/tier-up/[id]', params: { id: t.id } })
  else router.replace('/(tabs)/learn')
}
