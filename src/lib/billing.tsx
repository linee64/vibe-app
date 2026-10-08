/**
 * Подписка Pro (Polar): статус читаем из таблицы subscriptions (её пишет только вебхук на сервере),
 * оплату и управление открываем через /api/billing/*.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BILLING_ENABLED, PAYWALL_ACTIVE } from './config'
import { ApiError, apiPost } from './api'
import { getSupabase } from './supabase'
import { useStore } from '../store'

export type Plan = 'monthly' | 'annual'

export interface Subscription {
  status: string
  plan: Plan | null
  current_period_end: string | null
  trial_end: string | null
  cancel_at_period_end: boolean
}

interface SubState {
  loading: boolean
  subscription: Subscription | null
  /** Pro активен (оплачен или идёт пробный период) */
  isPro: boolean
  isTrial: boolean
  refresh: () => Promise<Subscription | null>
}

const ACTIVE = new Set(['active', 'trialing'])
const Ctx = createContext<SubState | null>(null)

async function fetchSubscription(): Promise<Subscription | null> {
  const sb = await getSupabase()
  if (!sb) return null
  const { data, error } = await sb.from('subscriptions').select('status, plan, current_period_end, trial_end, cancel_at_period_end').maybeSingle()
  if (error) throw error
  return (data as Subscription | null) ?? null
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { session } = useStore()
  const userId = session?.real ? session.id : undefined
  const enabled = BILLING_ENABLED && !!userId
  const [state, setState] = useState<{ for?: string; sub: Subscription | null }>({ sub: null })

  const refresh = useCallback(async () => {
    if (!enabled) return null
    try {
      const sub = await fetchSubscription()
      setState({ for: userId, sub })
      return sub
    } catch {
      setState((s) => ({ for: userId, sub: s.for === userId ? s.sub : null }))
      return null
    }
  }, [enabled, userId])

  useEffect(() => {
    if (!enabled) return
    let alive = true
    fetchSubscription()
      .then((sub) => alive && setState({ for: userId, sub }))
      .catch(() => alive && setState({ for: userId, sub: null }))
    return () => {
      alive = false
    }
  }, [enabled, userId])

  const value = useMemo<SubState>(() => {
    const sub = state.for === userId ? state.sub : null
    const isPro = !!sub && ACTIVE.has(sub.status)
    return { loading: enabled && state.for !== userId, subscription: sub, isPro, isTrial: sub?.status === 'trialing', refresh }
  }, [state, userId, enabled, refresh])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

const NO_BILLING: SubState = { loading: false, subscription: null, isPro: false, isTrial: false, refresh: async () => null }

// eslint-disable-next-line react-refresh/only-export-components
export function useSubscription(): SubState {
  return useContext(Ctx) ?? NO_BILLING
}

/** Нужно ли показать пейвол для раздела (true — закрыто) */
// eslint-disable-next-line react-refresh/only-export-components
export function usePaywall(needsPro: boolean): { blocked: boolean; loading: boolean } {
  const { isPro, loading } = useSubscription()
  if (!PAYWALL_ACTIVE || !needsPro) return { blocked: false, loading: false }
  return { blocked: !loading && !isPro, loading }
}

/** Открыть оплату Polar (редирект). Возвращает текст ошибки, если не вышло. */
// eslint-disable-next-line react-refresh/only-export-components
export async function startCheckout(plan: Plan): Promise<string | null> {
  try {
    const { url } = await apiPost<{ url: string }>('/api/billing/checkout', { plan })
    window.location.assign(url)
    return null
  } catch (e) {
    return e instanceof ApiError ? e.message : 'Не получилось открыть оплату.'
  }
}

/** Открыть личный кабинет Polar (отмена, смена карты, чеки) */
// eslint-disable-next-line react-refresh/only-export-components
export async function openPortal(): Promise<string | null> {
  try {
    const { url } = await apiPost<{ url: string }>('/api/billing/portal', {})
    window.location.assign(url)
    return null
  } catch (e) {
    return e instanceof ApiError ? e.message : 'Не получилось открыть управление подпиской.'
  }
}
