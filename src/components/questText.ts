/** Подписи и хуки заданий (без компонентов — чтобы Fast Refresh работал для Quests.tsx) */
import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { claimableCount, questBoard, type QuestView } from '../data/quests'
import { t, type UIKey } from '../i18n/core'

export const questTitle = (q: QuestView) => t(`quests.${q.id}.title` as UIKey)
export const questDesc = (q: QuestView) => t(`quests.${q.id}.desc` as UIKey, { goal: q.goal })

/** Перерисовка раз в минуту и в полночь — задания сменятся без перезагрузки */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

export function useQuestBoard() {
  const { progress } = useStore()
  const now = useNow()
  return { ...questBoard(progress.quests, now), now }
}

export function useClaimable() {
  const { progress } = useStore()
  const now = useNow()
  return claimableCount(progress.quests, now)
}

/** «через 5 ч 12 мин» до полуночи / до понедельника */
export function resetText(now: Date, period: 'day' | 'week') {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  if (period === 'week') next.setDate(next.getDate() + ((8 - next.getDay()) % 7))
  const min = Math.max(1, Math.ceil((next.getTime() - now.getTime()) / 60000))
  if (min >= 24 * 60) return t('quests.resetDays', { n: Math.ceil(min / (24 * 60)) })
  return t('quests.resetHm', { h: Math.floor(min / 60), m: min % 60 })
}
