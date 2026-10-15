import AsyncStorage from '@react-native-async-storage/async-storage'
import { track } from '../lib/analytics'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AppState } from 'react-native'
import { CHARGE_MAX } from '@web/data/economy'
import { addChargeState, fullChargeAt, nextChargeAt, settleCharge, spendCharge, withChargeFields } from '@web/data/charge'
import { DEMO_MODE, REVIEW_MODE, SUPABASE_ENABLED } from '../lib/env'
import { getSupabase } from '../lib/web-adapters/supabase'
import { CHARGE_AT_KEY, OWNER_KEY, PROGRESS_KEY, REVIEW_FLAG, SESSION_KEY, accruedCharge, defaultProgress, freshProgress, nameFromEmail, normalizeProgress, pullProgress, pushProgress, rollDay, type Progress, type Session } from './progress'
import { t } from '@web/i18n/core'
import { applyQuestEvent, claimQuest as claimQuestPure, markNotified, newlyCompleted, rollQuests, type QuestEvent, type QuestState } from '@web/data/quests'
import { lookOf, buySkin as buySkinPure, equipSkin as equipSkinPure, findSkin, unequipSlot, type BuyResult, type SkinSlot } from '@web/data/skins'
import { onUserLocaleChange } from '@web/i18n/runtime'
import { MascotLookContext } from '@web/components/mascotLook'

const SAVE_DEBOUNCE_MS = 1200

interface Store {
  session: Session | null
  authReady: boolean
  progress: Progress
  /** Демо-вход по email (когда Supabase не подключён) */
  login: (email: string) => void
  logout: () => void
  completeLesson: (id: string, xp: number, perfect: boolean) => void
  loseHeart: () => void
  refillHearts: () => void
  addCharge: (n: number) => void
  spendGems: (n: number) => boolean
  chargeAt: number | null
  /** Когда заряд станет полным (null — уже полный) */
  fullAt: number | null
  resetProgress: () => void
  completeHomework: (id: string, xp: number) => void
  passTiersByTest: (tierIds: string[]) => void
  markTierCelebrated: (tierId: string) => void
  setUnlockAll: (on: boolean) => void
  setPlacementSeen: () => void
  setPortfolioUrl: (url: string) => void
  /** Ответ в уроке проверен — для заданий «верных ответов подряд» */
  recordAnswer: (correct: boolean) => void
  /** Забрать награду за задание: сколько токенов начислено (0 — нельзя) */
  claimQuest: (id: string) => number
  setIntroSeen: () => void
  /** Гардероб Бипи: токены списываются ровно один раз, вещь сразу надевается */
  buySkin: (id: string, isPro: boolean) => BuyResult
  equipSkin: (id: string) => void
  unequipSkin: (slot: SkinSlot) => void
}

const Ctx = createContext<Store | null>(null)

interface AuthUserLike {
  id: string
  email?: string
  created_at?: string
  user_metadata?: { display_name?: unknown }
}

function sessionFromUser(u: AuthUserLike): Session {
  const email = u.email ?? ''
  const dn = typeof u.user_metadata?.display_name === 'string' ? u.user_metadata.display_name.trim() : ''
  return { email, name: dn || nameFromEmail(email || t('x16kyo87')), since: u.created_at ?? new Date().toISOString(), id: u.id, real: true }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(!SUPABASE_ENABLED)
  const [progress, setProgress] = useState<Progress>(defaultProgress)
  const [hydrated, setHydrated] = useState(false)
  const [syncedFor, setSyncedFor] = useState<string | null>(null)
  const [chargeAt, setChargeAt] = useState<number | null>(null)
  const [fullAt, setFullAt] = useState<number | null>(null)
  const latest = useRef(progress)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dirty = useRef(false)

  // --- восстановление из AsyncStorage
  useEffect(() => {
    let alive = true
    void (async () => {
      const [rawP, rawS, reviewFlag] = await Promise.all([AsyncStorage.getItem(PROGRESS_KEY), AsyncStorage.getItem(SESSION_KEY), AsyncStorage.getItem(REVIEW_FLAG)])
      if (!alive) return
      let p = normalizeProgress(rawP ? (JSON.parse(rawP) as Partial<Progress>) : null)
      // миграция: отсчёт заряда раньше жил отдельным ключом
      const legacyAt = Number(await AsyncStorage.getItem(CHARGE_AT_KEY)) || 0
      if (legacyAt && !p.chargeAt) p = { ...p, chargeAt: legacyAt }
      await AsyncStorage.removeItem(CHARGE_AT_KEY)
      p = accruedCharge(p)
      if (p.quests) p = { ...p, quests: rollQuests(p.quests) }
      if (REVIEW_MODE && !reviewFlag) {
        await AsyncStorage.setItem(REVIEW_FLAG, '1')
        p = { ...p, unlockAll: true }
      }
      if (!DEMO_MODE && !REVIEW_MODE) p = { ...p, unlockAll: false }
      setProgress(p)
      if (!SUPABASE_ENABLED && rawS) setSession(JSON.parse(rawS) as Session)
      setHydrated(true)
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    latest.current = progress
    if (hydrated) void AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  }, [progress, hydrated])

  // --- заряд Бипи: по таймстемпам (progress.chargeAt / depletedAt), пересчёт раз в 15 с и при возврате в приложение
  useEffect(() => {
    if (!hydrated) return
    const tick = () => {
      const p = latest.current
      const now = Date.now()
      const c = settleCharge(p, now)
      if (c.hearts !== p.hearts || c.chargeAt !== p.chargeAt || c.depletedAt !== p.depletedAt) setProgress((q) => withChargeFields(q, settleCharge(q, now)))
      setChargeAt(nextChargeAt(c, now))
      setFullAt(fullChargeAt(c, now))
    }
    tick()
    const timer = setInterval(tick, 15_000)
    const sub = AppState.addEventListener('change', (st) => st === 'active' && tick())
    return () => {
      clearInterval(timer)
      sub.remove()
    }
  }, [hydrated, progress.hearts, progress.chargeAt, progress.depletedAt])

  // --- настоящие аккаунты
  useEffect(() => {
    if (!SUPABASE_ENABLED) return
    let unsub: (() => void) | undefined
    let alive = true
    void getSupabase().then((sb) => {
      if (!alive) return
      if (!sb) {
        setAuthReady(true)
        return
      }
      const { data } = sb.auth.onAuthStateChange((_event, s) => {
        const user = s?.user
        setSession((prev) => {
          if (!user) return null
          if (prev?.id === user.id && prev.email === user.email) return prev
          return sessionFromUser(user)
        })
        setAuthReady(true)
      })
      unsub = () => data.subscription.unsubscribe()
    })
    return () => {
      alive = false
      unsub?.()
    }
  }, [])

  const userId = session?.real ? session.id : undefined

  useEffect(() => {
    if (!userId || !hydrated) return
    let cancelled = false
    let retry: ReturnType<typeof setTimeout> | undefined
    let attempt = 0
    const pull = async () => {
      try {
        const merged = await pullProgress(userId, latest.current)
        if (cancelled) return
        setProgress(merged)
        dirty.current = true
        setSyncedFor(userId)
      } catch {
        if (cancelled) return
        attempt += 1
        retry = setTimeout(() => void pull(), Math.min(60_000, 5_000 * attempt))
      }
    }
    void pull()
    return () => {
      cancelled = true
      clearTimeout(retry)
    }
  }, [userId, hydrated])

  const flushRef = useRef<() => Promise<void>>(async () => {})
  const flush = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (!userId || syncedFor !== userId || !dirty.current) return
    dirty.current = false
    try {
      await pushProgress(userId, latest.current)
    } catch {
      dirty.current = true
      saveTimer.current = setTimeout(() => void flushRef.current(), 10_000)
    }
  }, [userId, syncedFor])
  useEffect(() => { flushRef.current = flush })

  useEffect(() => {
    if (!userId || syncedFor !== userId) return
    dirty.current = true
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => void flush(), SAVE_DEBOUNCE_MS)
  }, [progress, userId, syncedFor, flush])

  const login = useCallback((email: string) => {
    const s: Session = { email, name: nameFromEmail(email), since: new Date().toISOString() }
    void AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s))
    setSession(s)
  }, [])

  const logout = useCallback(() => {
    track('logout')
    void AsyncStorage.removeItem(SESSION_KEY)
    if (!SUPABASE_ENABLED) {
      setSession(null)
      return
    }
    void (async () => {
      await flush().catch(() => {})
      const sb = await getSupabase()
      await sb?.auth.signOut({ scope: 'local' }).catch(() => {})
      await AsyncStorage.removeItem(OWNER_KEY)
      setSyncedFor(null)
      setProgress(freshProgress())
      setSession(null)
    })()
  }, [flush])

  /**
   * Событие для заданий (как в вебе, src/store.tsx): состояние заданий — в updater-е, quest_completed — по ref
   * (один раз на задание и период: выполненные сразу помечаются notified).
   */
  const questStep = useCallback((e: QuestEvent) => {
    const after = applyQuestEvent(latest.current.quests, e)
    const fresh = newlyCompleted(after).map((q) => {
      track('quest_completed', { quest_id: q.id, period: q.period, goal: q.goal })
      return q.id
    })
    latest.current = { ...latest.current, quests: fresh.length ? markNotified(after, fresh) : after }
    return (q: QuestState | undefined) => {
      const next = applyQuestEvent(q, e)
      return fresh.length ? markNotified(next, fresh) : next
    }
  }, [])

  const completeLesson = useCallback((id: string, xp: number, perfect: boolean) => {
    const step = questStep({ type: 'lesson', xp, perfect })
    setProgress((p) => rollDay({ ...p, completed: p.completed.includes(id) ? p.completed : [...p.completed, id], xp: p.xp + xp, gems: p.gems + (perfect ? 10 : 5), todayXp: p.todayXp + xp, perfectToday: p.perfectToday + (perfect ? 1 : 0), lessonsToday: p.lessonsToday + 1, quests: step(p.quests) }))
  }, [questStep])
  const loseHeart = useCallback(() => setProgress((p) => withChargeFields(p, spendCharge(p))), [])
  const refillHearts = useCallback(() => setProgress((p) => withChargeFields(p, { hearts: CHARGE_MAX })), [])
  const addCharge = useCallback((n: number) => setProgress((p) => withChargeFields(p, addChargeState(p, n))), [])
  const spendGems = useCallback((n: number) => {
    if (latest.current.gems < n) return false
    latest.current = { ...latest.current, gems: latest.current.gems - n }
    setProgress((p) => ({ ...p, gems: Math.max(0, p.gems - n) }))
    return true
  }, [])
  const resetProgress = useCallback(() => setProgress((p) => ({ ...defaultProgress(), unlockAll: p.unlockAll })), [])
  const completeHomework = useCallback((id: string, xp: number) => {
    const again0 = latest.current.homework.includes(id)
    const step = questStep({ type: 'homework', xp: again0 ? 10 : xp })
    setProgress((p) => {
      const again = p.homework.includes(id)
      const gain = again ? 10 : xp
      return rollDay({ ...p, homework: again ? p.homework : [...p.homework, id], xp: p.xp + gain, gems: p.gems + (again ? 5 : 20), todayXp: p.todayXp + gain, lessonsToday: p.lessonsToday + 1, quests: step(p.quests) })
    })
  }, [questStep])
  const passTiersByTest = useCallback((ids: string[]) => setProgress((p) => ({ ...p, tiersByTest: [...new Set([...p.tiersByTest, ...ids])], tiersCelebrated: [...new Set([...p.tiersCelebrated, ...ids])], placementSeen: true })), [])
  const markTierCelebrated = useCallback((id: string) => setProgress((p) => (p.tiersCelebrated.includes(id) ? p : { ...p, tiersCelebrated: [...p.tiersCelebrated, id] })), [])
  const setUnlockAll = useCallback((on: boolean) => setProgress((p) => ({ ...p, unlockAll: on })), [])
  const setPlacementSeen = useCallback(() => setProgress((p) => ({ ...p, placementSeen: true })), [])
  const setPortfolioUrl = useCallback((url: string) => setProgress((p) => ({ ...p, portfolioUrl: url })), [])
  const recordAnswer = useCallback(
    (correct: boolean) => {
      const step = questStep({ type: 'answer', correct })
      setProgress((p) => ({ ...p, quests: step(p.quests) }))
    },
    [questStep],
  )
  const claimQuest = useCallback((id: string) => {
    // считаем по ref, чтобы двойное нажатие не начислило награду дважды
    const res = claimQuestPure(latest.current.quests, id)
    if (!res) return 0
    latest.current = { ...latest.current, quests: res.state, gems: latest.current.gems + res.reward }
    setProgress((p) => {
      const again = claimQuestPure(p.quests, id)
      return again ? { ...p, quests: again.state, gems: p.gems + again.reward } : p
    })
    track('quest_claimed', { quest_id: id, period: res.quest.period, reward: res.reward })
    return res.reward
  }, [])
  const setIntroSeen = useCallback(() => setProgress((p) => (p.introSeen ? p : { ...p, introSeen: true })), [])
  const buySkin = useCallback((id: string, isPro: boolean): BuyResult => {
    const res = buySkinPure(latest.current.skins, latest.current.gems, id, isPro)
    if (!res.ok) return res
    latest.current = { ...latest.current, skins: res.state, gems: res.gems }
    setProgress((p) => {
      const again = buySkinPure(p.skins, p.gems, id, isPro)
      return again.ok ? { ...p, skins: again.state, gems: again.gems } : p
    })
    track('skin_purchased', { skin_id: id, price: res.skin.price, slot: res.skin.slot, rarity: res.skin.rarity, pro: !!res.skin.pro })
    track('tokens_spent', { reason: 'skin', amount: res.skin.price, where: 'wardrobe' })
    track('skin_equipped', { skin_id: id, slot: res.skin.slot, action: 'equip', via: 'purchase' })
    return res
  }, [])
  const equipSkin = useCallback((id: string) => {
    const next = equipSkinPure(latest.current.skins, id)
    if (!next || next === latest.current.skins) return
    latest.current = { ...latest.current, skins: next }
    setProgress((p) => ({ ...p, skins: equipSkinPure(p.skins, id) ?? p.skins }))
    track('skin_equipped', { skin_id: id, slot: findSkin(id)?.slot, action: 'equip', via: 'wardrobe' })
  }, [])
  const unequipSkin = useCallback((slot: SkinSlot) => {
    const id = latest.current.skins?.equipped[slot]
    if (!id) return
    latest.current = { ...latest.current, skins: unequipSlot(latest.current.skins, slot) }
    setProgress((p) => ({ ...p, skins: unequipSlot(p.skins, slot) }))
    track('skin_equipped', { skin_id: id, slot, action: 'unequip', via: 'wardrobe' })
  }, [])
  // явный выбор языка → в прогресс (уедет в облако вместе с ним), как в вебе
  useEffect(() => onUserLocaleChange((l) => setProgress((p) => (p.locale === l ? p : { ...p, locale: l }))), [])

  const value = useMemo<Store>(
    () => ({ session, authReady, progress, login, logout, completeLesson, loseHeart, refillHearts, addCharge, spendGems, chargeAt, fullAt, resetProgress, completeHomework, passTiersByTest, markTierCelebrated, setUnlockAll, setPlacementSeen, setPortfolioUrl, recordAnswer, claimQuest, setIntroSeen, buySkin, equipSkin, unequipSkin }),
    [session, authReady, progress, login, logout, completeLesson, loseHeart, refillHearts, addCharge, spendGems, chargeAt, fullAt, resetProgress, completeHomework, passTiersByTest, markTierCelebrated, setUnlockAll, setPlacementSeen, setPortfolioUrl, recordAnswer, claimQuest, setIntroSeen, buySkin, equipSkin, unequipSkin],
  )
  const look = useMemo(() => lookOf(progress.skins), [progress.skins])
  // надетые вещи — всем <Mascot /> и <MascotHead /> (общий контекст веба)
  return (
    <Ctx.Provider value={value}>
      <MascotLookContext.Provider value={look}>{children}</MascotLookContext.Provider>
    </Ctx.Provider>
  )
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside provider')
  return s
}
