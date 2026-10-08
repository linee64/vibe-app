import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface Session {
  email: string
  name: string
  since: string
}

export interface Progress {
  completed: string[]
  xp: number
  gems: number
  hearts: number
  streak: number
  todayXp: number
  perfectToday: number
  lessonsToday: number
  lastDay: string
}

const SESSION_KEY = 'vaibik.session'
const PROGRESS_KEY = 'vaibik.progress'
export const MAX_HEARTS = 5

const today = () => new Date().toISOString().slice(0, 10)

/** Стартовые демо-данные: несколько уроков уже «пройдено», чтобы путь выглядел живым */
const defaultProgress = (): Progress => ({
  completed: ['u1-1', 'u1-2', 'u1-3'],
  xp: 1240,
  gems: 505,
  hearts: MAX_HEARTS,
  streak: 12,
  todayXp: 20,
  perfectToday: 1,
  lessonsToday: 1,
  lastDay: today(),
})

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function loadProgress(): Progress {
  const saved = read<Progress>(PROGRESS_KEY)
  const p = { ...defaultProgress(), ...(saved ?? {}) }
  if (p.lastDay !== today()) {
    return { ...p, todayXp: 0, perfectToday: 0, lessonsToday: 0, lastDay: today() }
  }
  return p
}

interface Store {
  session: Session | null
  progress: Progress
  login: (email: string) => void
  logout: () => void
  completeLesson: (id: string, xp: number, perfect: boolean) => void
  loseHeart: () => void
  refillHearts: () => void
  resetProgress: () => void
}

const Ctx = createContext<Store | null>(null)

function nameFromEmail(email: string) {
  const local = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  const first = local.split(' ')[0] || 'Друг'
  return first.charAt(0).toUpperCase() + first.slice(1)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => read<Session>(SESSION_KEY))
  const [progress, setProgress] = useState<Progress>(loadProgress)

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  }, [progress])

  const login = useCallback((email: string) => {
    const s: Session = { email, name: nameFromEmail(email), since: new Date().toISOString() }
    localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    setSession(s)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

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
  const resetProgress = useCallback(() => setProgress(defaultProgress()), [])

  const value = useMemo(
    () => ({ session, progress, login, logout, completeLesson, loseHeart, refillHearts, resetProgress }),
    [session, progress, login, logout, completeLesson, loseHeart, refillHearts, resetProgress],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside provider')
  return s
}
