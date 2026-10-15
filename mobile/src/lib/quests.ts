/**
 * Подписи и хуки заданий — как src/components/questText.ts в вебе (тот модуль тянет веб-стор, поэтому
 * здесь своя тонкая копия поверх общей логики src/data/quests.ts).
 */
import { useEffect, useState } from 'react'
import { claimableCount, questBoard, type QuestView } from '@web/data/quests'
import { t, type UIKey } from '@web/i18n/core'
import { useStore } from '../store/Store'

export const questTitle = (q: QuestView) => t(`quests.${q.id}.title` as UIKey)
export const questDesc = (q: QuestView) => t(`quests.${q.id}.desc` as UIKey, { goal: q.goal })

/** Перерисовка раз в минуту — задания сменятся в полночь без перезапуска */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
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
