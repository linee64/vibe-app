import AsyncStorage from '@react-native-async-storage/async-storage'
import { track } from '../lib/analytics'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CHARGE_MAX, RECHARGE_MS } from '@web/data/economy'
import { DEMO_MODE, REVIEW_MODE, SUPABASE_ENABLED } from '../lib/env'
import { getSupabase } from '../lib/web-adapters/supabase'
import { CHARGE_AT_KEY, OWNER_KEY, PROGRESS_KEY, REVIEW_FLAG, SESSION_KEY, accruedCharge, defaultProgress, freshProgress, nameFromEmail, normalizeProgress, pullProgress, pushProgress, rollDay, type Progress, type Session } from './progress'
import { t } from '@web/i18n/core'

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
  resetProgress: () => void
  completeHomework: (id: string, xp: number) => void
  passTiersByTest: (tierIds: string[]) => void
  markTierCelebrated: (tierId: string) => void
  setUnlockAll: (on: boolean) => void
  setPlacementSeen: () => void
  setPortfolioUrl: (url: string) => void
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

  // --- заряд Бипи: +1 деление каждые RECHARGE_MS
  useEffect(() => {
    if (!hydrated) return
    let alive = true
    const tick = async () => {
      const p = latest.current
      if (p.hearts >= CHARGE_MAX) {
        await AsyncStorage.removeItem(CHARGE_AT_KEY)
        if (alive) setChargeAt(null)
        return
      }
      const stored = Number(await AsyncStorage.getItem(CHARGE_AT_KEY)) || Date.now()
      const r = accruedCharge(p.hearts, stored)
      if (r.hearts !== p.hearts) setProgress((q) => ({ ...q, hearts: Math.max(q.hearts, r.hearts) }))
      if (r.chargeAt) await AsyncStorage.setItem(CHARGE_AT_KEY, String(r.chargeAt))
      else await AsyncStorage.removeItem(CHARGE_AT_KEY)
      if (alive) setChargeAt(r.chargeAt ? r.chargeAt + RECHARGE_MS : null)
    }
    void tick()
    const timer = setInterval(() => void tick(), 15_000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [hydrated, progress.hearts])

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

  const completeLesson = useCallback((id: string, xp: number, perfect: boolean) => {
    setProgress((p) => rollDay({ ...p, completed: p.completed.includes(id) ? p.completed : [...p.completed, id], xp: p.xp + xp, gems: p.gems + (perfect ? 10 : 5), todayXp: p.todayXp + xp, perfectToday: p.perfectToday + (perfect ? 1 : 0), lessonsToday: p.lessonsToday + 1 }))
  }, [])
  const loseHeart = useCallback(() => setProgress((p) => ({ ...p, hearts: Math.max(0, p.hearts - 1) })), [])
  const refillHearts = useCallback(() => setProgress((p) => ({ ...p, hearts: CHARGE_MAX })), [])
  const addCharge = useCallback((n: number) => setProgress((p) => ({ ...p, hearts: Math.min(CHARGE_MAX, p.hearts + n) })), [])
  const spendGems = useCallback((n: number) => {
    if (latest.current.gems < n) return false
    latest.current = { ...latest.current, gems: latest.current.gems - n }
    setProgress((p) => ({ ...p, gems: Math.max(0, p.gems - n) }))
    return true
  }, [])
  const resetProgress = useCallback(() => setProgress((p) => ({ ...defaultProgress(), unlockAll: p.unlockAll })), [])
  const completeHomework = useCallback((id: string, xp: number) => {
    setProgress((p) => {
      const again = p.homework.includes(id)
      const gain = again ? 10 : xp
      return rollDay({ ...p, homework: again ? p.homework : [...p.homework, id], xp: p.xp + gain, gems: p.gems + (again ? 5 : 20), todayXp: p.todayXp + gain, lessonsToday: p.lessonsToday + 1 })
    })
  }, [])
  const passTiersByTest = useCallback((ids: string[]) => setProgress((p) => ({ ...p, tiersByTest: [...new Set([...p.tiersByTest, ...ids])], tiersCelebrated: [...new Set([...p.tiersCelebrated, ...ids])], placementSeen: true })), [])
  const markTierCelebrated = useCallback((id: string) => setProgress((p) => (p.tiersCelebrated.includes(id) ? p : { ...p, tiersCelebrated: [...p.tiersCelebrated, id] })), [])
  const setUnlockAll = useCallback((on: boolean) => setProgress((p) => ({ ...p, unlockAll: on })), [])
  const setPlacementSeen = useCallback(() => setProgress((p) => ({ ...p, placementSeen: true })), [])
  const setPortfolioUrl = useCallback((url: string) => setProgress((p) => ({ ...p, portfolioUrl: url })), [])

  const value = useMemo<Store>(
    () => ({ session, authReady, progress, login, logout, completeLesson, loseHeart, refillHearts, addCharge, spendGems, chargeAt, resetProgress, completeHomework, passTiersByTest, markTierCelebrated, setUnlockAll, setPlacementSeen, setPortfolioUrl }),
    [session, authReady, progress, login, logout, completeLesson, loseHeart, refillHearts, addCharge, spendGems, chargeAt, resetProgress, completeHomework, passTiersByTest, markTierCelebrated, setUnlockAll, setPlacementSeen, setPortfolioUrl],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside provider')
  return s
}
