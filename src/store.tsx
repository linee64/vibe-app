import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DEMO_MODE, REVIEW_MODE, SUPABASE_ENABLED } from './lib/config'
import { getSupabase } from './lib/supabase'
import { loadRemoteProgress, mergeProgress, saveRemoteProgress } from './lib/progressSync'
import { RECHARGE_MS } from './data/economy'

export interface Session {
  email: string
  name: string
  since: string
  /** id пользователя Supabase (только при настоящем входе) */
  id?: string
  /** true — настоящий аккаунт Supabase, false/нет — демо-вход */
  real?: boolean
}

export interface Progress {
  completed: string[]
  /** вайб-поинты (ВП) */
  xp: number
  /** токены */
  gems: number
  /** заряд Бипи: деления батарейки (0…MAX_HEARTS) */
  hearts: number
  /** деплой-серия: дней подряд */
  streak: number
  todayXp: number
  perfectToday: number
  lessonsToday: number
  lastDay: string
  /** Сданные домашки (id из src/data/homework.ts) */
  homework: string[]
  /** Тиры, засчитанные «Тестом на уровень» (id из src/data/tiers.ts) */
  tiersByTest: string[]
  /** Тиры, для которых уже показали экран «Новый тир!» */
  tiersCelebrated: string[]
  /** Демо: «Разблокировать всё» — снимает блокировку тиров */
  unlockAll: boolean
  /** Предложение пройти «Тест на уровень» после первого входа уже показано/закрыто */
  placementSeen: boolean
  /** Ссылка на свой настоящий проект (домашка «Запуск»), хранится только локально */
  portfolioUrl: string
}

const SESSION_KEY = 'vaibik.session'
const PROGRESS_KEY = 'vaibik.progress'
/** Чей прогресс лежит в localStorage (id пользователя Supabase) — чтобы не смешивать аккаунты */
const OWNER_KEY = 'vaibik.progress.owner'
export const MAX_HEARTS = 5
/** localStorage: когда начался отсчёт до следующего деления заряда (локально, в облако не уходит) */
const CHARGE_AT_KEY = 'vaibik.chargeAt'
/** sessionStorage: урок, из которого вернулись на путь (чтобы прокрутить к нему) */
export const LAST_LESSON_KEY = 'vaibik.lastLesson'
/** Через сколько мс после изменения прогресс уходит в облако */
const SAVE_DEBOUNCE_MS = 1200

const today = () => new Date().toISOString().slice(0, 10)

/** Стартовые демо-данные: несколько уроков уже «пройдено», чтобы путь выглядел живым */
const demoProgress = (): Progress => ({
  completed: ['u1-1', 'u1-2', 'u1-3'],
  xp: 1240,
  gems: 505,
  hearts: MAX_HEARTS,
  streak: 12,
  todayXp: 20,
  perfectToday: 1,
  lessonsToday: 1,
  lastDay: today(),
  homework: [],
  tiersByTest: [],
  tiersCelebrated: [],
  // режим ревью (VITE_REVIEW_MODE, по умолчанию включён): всё открыто
  unlockAll: REVIEW_MODE,
  placementSeen: false,
  portfolioUrl: '',
})

/** Чистый старт настоящего аккаунта */
const freshProgress = (): Progress => ({
  ...demoProgress(),
  completed: [],
  xp: 0,
  gems: 0,
  streak: 0,
  todayXp: 0,
  perfectToday: 0,
  lessonsToday: 0,
})

const defaultProgress = () => (DEMO_MODE ? demoProgress() : freshProgress())

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

const rollDay = (p: Progress): Progress =>
  p.lastDay !== today() ? { ...p, todayXp: 0, perfectToday: 0, lessonsToday: 0, lastDay: today() } : p

function loadProgress(): Progress {
  const saved = read<Progress>(PROGRESS_KEY)
  const p = { ...defaultProgress(), ...(saved ?? {}) }
  // Режим ревью: один раз открываем всё для уже сохранённого прогресса (потом кнопка в профиле работает как обычно)
  if (REVIEW_MODE && !localStorage.getItem('vaibik.reviewUnlock.v1')) {
    localStorage.setItem('vaibik.reviewUnlock.v1', '1')
    p.unlockAll = true
  }
  // Боевой режим с аккаунтами: демо-разблокировки нет
  if (!DEMO_MODE && !REVIEW_MODE) p.unlockAll = false
  return rollDay(p)
}

interface Store {
  session: Session | null
  /** Настоящие аккаунты: сессия уже восстановлена (в демо всегда true) */
  authReady: boolean
  progress: Progress
  /** Демо-вход по email (в режиме Supabase не используется — там вход через src/lib/auth.ts) */
  login: (email: string) => void
  logout: () => void
  completeLesson: (id: string, xp: number, perfect: boolean) => void
  /** Ошибка в уроке: −1 деление заряда */
  loseHeart: () => void
  /** Полный заряд */
  refillHearts: () => void
  /** +n делений заряда (разбор/исправление ошибки) */
  addCharge: (n: number) => void
  /** Потратить токены; false — не хватает */
  spendGems: (n: number) => boolean
  /** Когда добавится следующее деление заряда (null — батарейка полная) */
  chargeAt: number | null
  resetProgress: () => void
  /** Сдать домашку: +xp (повторно — меньше), отметить узел пройденным */
  completeHomework: (id: string, xp: number) => void
  /** Засчитать тиры по «Тесту на уровень» */
  passTiersByTest: (tierIds: string[]) => void
  markTierCelebrated: (tierId: string) => void
  setUnlockAll: (on: boolean) => void
  setPlacementSeen: () => void
  setPortfolioUrl: (url: string) => void
}

const Ctx = createContext<Store | null>(null)

function nameFromEmail(email: string) {
  const local = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  const first = local.split(' ')[0] || 'Друг'
  return first.charAt(0).toUpperCase() + first.slice(1)
}

interface AuthUserLike {
  id: string
  email?: string
  created_at?: string
  user_metadata?: { display_name?: unknown }
}

function sessionFromUser(u: AuthUserLike): Session {
  const email = u.email ?? ''
  const dn = typeof u.user_metadata?.display_name === 'string' ? u.user_metadata.display_name.trim() : ''
  return { email, name: dn || nameFromEmail(email || 'друг'), since: u.created_at ?? new Date().toISOString(), id: u.id, real: true }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => (SUPABASE_ENABLED ? null : read<Session>(SESSION_KEY)))
  const [authReady, setAuthReady] = useState(!SUPABASE_ENABLED)
  const [progress, setProgress] = useState<Progress>(loadProgress)
  /** Для какого пользователя прогресс уже загружен из облака (до этого в облако не пишем) */
  const [syncedFor, setSyncedFor] = useState<string | null>(null)
  const [chargeAt, setChargeAt] = useState<number | null>(null)
  const latest = useRef(progress)
  const saveTimer = useRef<number | undefined>(undefined)
  const dirty = useRef(false)

  useEffect(() => {
    latest.current = progress
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  }, [progress])

  // Заряд Бипи сам восстанавливается: +1 деление каждые RECHARGE_MS (отсчёт хранится локально)
  useEffect(() => {
    const tick = () => {
      const p = latest.current
      const now = Date.now()
      if (p.hearts >= MAX_HEARTS) {
        localStorage.removeItem(CHARGE_AT_KEY)
        setChargeAt(null)
        return
      }
      let at = Number(localStorage.getItem(CHARGE_AT_KEY)) || 0
      if (!at || at > now) at = now
      const n = Math.floor((now - at) / RECHARGE_MS)
      if (n > 0) {
        const add = Math.min(n, MAX_HEARTS - p.hearts)
        at += n * RECHARGE_MS
        setProgress((q) => ({ ...q, hearts: Math.min(MAX_HEARTS, q.hearts + add) }))
      }
      localStorage.setItem(CHARGE_AT_KEY, String(at))
      setChargeAt(p.hearts + n >= MAX_HEARTS ? null : at + RECHARGE_MS)
    }
    const first = window.setTimeout(tick, 0)
    const timer = window.setInterval(tick, 15_000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
  }, [progress.hearts])

  // ---------------------------------------------------------------- настоящие аккаунты (Supabase)
  useEffect(() => {
    if (!SUPABASE_ENABLED) return
    let unsub: (() => void) | undefined
    let alive = true
    getSupabase().then((sb) => {
      if (!alive) return
      if (!sb) {
        setAuthReady(true)
        return
      }
      const { data } = sb.auth.onAuthStateChange((event, s) => {
        // внутри колбэка нельзя ждать другие вызовы supabase — только обновляем состояние
        if (event === 'PASSWORD_RECOVERY') sessionStorage.setItem('vaibik.recovery', '1')
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

  // Загрузка и слияние прогресса при входе (и при возвращении на вкладку — вдруг учился с другого устройства)
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    let retry: number | undefined
    let attempt = 0
    const pull = async () => {
      try {
        const remote = await loadRemoteProgress(userId)
        if (cancelled) return
        setProgress((local) => {
          const owner = localStorage.getItem(OWNER_KEY)
          // локальные данные другого аккаунта (или старые демо-данные) не смешиваем с этим аккаунтом
          const base = owner === userId ? local : { ...freshProgress(), unlockAll: local.unlockAll && REVIEW_MODE }
          return rollDay(mergeProgress(base, remote))
        })
        localStorage.setItem(OWNER_KEY, userId)
        dirty.current = true // сразу дошлём слитую версию, если локально было больше
        setSyncedFor(userId)
      } catch {
        if (cancelled) return
        attempt += 1
        retry = window.setTimeout(pull, Math.min(60_000, 5_000 * attempt))
      }
    }
    pull()
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        window.clearTimeout(retry)
        attempt = 0
        pull()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      window.clearTimeout(retry)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [userId])

  const flush = useCallback(
    async function save(): Promise<void> {
      window.clearTimeout(saveTimer.current)
      if (!userId || syncedFor !== userId || !dirty.current) return
      dirty.current = false
      try {
        await saveRemoteProgress(userId, latest.current)
      } catch {
        dirty.current = true
        saveTimer.current = window.setTimeout(() => void save(), 10_000)
      }
    },
    [userId, syncedFor],
  )

  // Сохранение с задержкой: изменения пачкой уходят в облако
  useEffect(() => {
    if (!userId || syncedFor !== userId) return
    dirty.current = true
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => void flush(), SAVE_DEBOUNCE_MS)
  }, [progress, userId, syncedFor, flush])

  // Уходим со страницы/сворачиваем — досылаем немедленно
  useEffect(() => {
    if (!userId) return
    const onHide = () => {
      if (document.visibilityState === 'hidden') void flush()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
    }
  }, [userId, flush])

  const login = useCallback((email: string) => {
    const s: Session = { email, name: nameFromEmail(email), since: new Date().toISOString() }
    localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    setSession(s)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    if (!SUPABASE_ENABLED) {
      setSession(null)
      return
    }
    void (async () => {
      await flush().catch(() => {})
      const sb = await getSupabase()
      await sb?.auth.signOut({ scope: 'local' }).catch(() => {})
      // прогресс уже в облаке — на этом устройстве начисто
      localStorage.removeItem(OWNER_KEY)
      setSyncedFor(null)
      setProgress(freshProgress())
      setSession(null)
    })()
  }, [flush])

  const completeLesson = useCallback((id: string, xp: number, perfect: boolean) => {
    setProgress((p) => ({
      ...p,
      completed: p.completed.includes(id) ? p.completed : [...p.completed, id],
      xp: p.xp + xp,
      gems: p.gems + (perfect ? 10 : 5),
      todayXp: p.todayXp + xp,
      perfectToday: p.perfectToday + (perfect ? 1 : 0),
      lessonsToday: p.lessonsToday + 1,
    }))
  }, [])

  const loseHeart = useCallback(() => setProgress((p) => ({ ...p, hearts: Math.max(0, p.hearts - 1) })), [])
  const refillHearts = useCallback(() => setProgress((p) => ({ ...p, hearts: MAX_HEARTS })), [])
  const addCharge = useCallback((n: number) => setProgress((p) => ({ ...p, hearts: Math.min(MAX_HEARTS, p.hearts + n) })), [])
  const spendGems = useCallback((n: number) => {
    if (latest.current.gems < n) return false
    // сразу уменьшаем и в ref — чтобы два быстрых клика не потратили больше, чем есть
    latest.current = { ...latest.current, gems: latest.current.gems - n }
    setProgress((p) => ({ ...p, gems: Math.max(0, p.gems - n) }))
    return true
  }, [])
  // сохранение в облако перезаписывает строку целиком, так что сброс действует и там
  const resetProgress = useCallback(() => setProgress((p) => ({ ...defaultProgress(), unlockAll: p.unlockAll })), [])
  const completeHomework = useCallback((id: string, xp: number) => {
    setProgress((p) => {
      const again = p.homework.includes(id)
      const gain = again ? 10 : xp
      return {
        ...p,
        homework: again ? p.homework : [...p.homework, id],
        xp: p.xp + gain,
        gems: p.gems + (again ? 5 : 20),
        todayXp: p.todayXp + gain,
        lessonsToday: p.lessonsToday + 1,
      }
    })
  }, [])
  const passTiersByTest = useCallback(
    (ids: string[]) =>
      setProgress((p) => ({
        ...p,
        tiersByTest: [...new Set([...p.tiersByTest, ...ids])],
        // экран результата теста и есть праздник — отдельный «Новый тир!» не показываем
        tiersCelebrated: [...new Set([...p.tiersCelebrated, ...ids])],
        placementSeen: true,
      })),
    [],
  )
  const markTierCelebrated = useCallback(
    (id: string) => setProgress((p) => (p.tiersCelebrated.includes(id) ? p : { ...p, tiersCelebrated: [...p.tiersCelebrated, id] })),
    [],
  )
  const setUnlockAll = useCallback((on: boolean) => setProgress((p) => ({ ...p, unlockAll: on })), [])
  const setPlacementSeen = useCallback(() => setProgress((p) => ({ ...p, placementSeen: true })), [])
  const setPortfolioUrl = useCallback((url: string) => setProgress((p) => ({ ...p, portfolioUrl: url })), [])

  const value = useMemo(
    () => ({
      session,
      authReady,
      progress,
      login,
      logout,
      completeLesson,
      loseHeart,
      refillHearts,
      addCharge,
      spendGems,
      chargeAt,
      resetProgress,
      completeHomework,
      passTiersByTest,
      markTierCelebrated,
      setUnlockAll,
      setPlacementSeen,
      setPortfolioUrl,
    }),
    [session, authReady, progress, login, logout, completeLesson, loseHeart, refillHearts, addCharge, spendGems, chargeAt, resetProgress, completeHomework, passTiersByTest, markTierCelebrated, setUnlockAll, setPlacementSeen, setPortfolioUrl],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside provider')
  return s
}
