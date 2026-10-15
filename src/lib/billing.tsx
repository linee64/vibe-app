/**
 * Подписка Pro (Polar): статус читаем из таблицы subscriptions (её пишет только вебхук на сервере),
 * оплату и управление открываем через /api/billing/*.
 * Подписку из App Store / Google Play (RevenueCat) сайт узнаёт через POST /api/billing/status
 * (нужен серверный REVENUECAT_SECRET_API_KEY; без него — только Polar).
 * Итоговый статус (ProStatus) считает общий модуль src/data/proStatus.ts.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { BILLING_ENABLED, DEMO_MODE, PAYWALL_ACTIVE } from './config'
import { ApiError, apiPost } from './api'
import { getSupabase } from './supabase'
import { useStore } from '../store'
import { track } from './analytics'
import { t } from '../i18n/core'
import { FREE, demoPro, fromPolar, mergePro, type ProStatus, type StoreEntitlementLike, fromStore } from '../data/proStatus'

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
  /** Итоговый статус Pro: Polar + App Store/Google Play (+ демо-переключатель) */
  pro: ProStatus
  /** Pro активен (оплачен, пробный период или отменён, но период ещё идёт) */
  isPro: boolean
  isTrial: boolean
  refresh: () => Promise<Subscription | null>
}

// ---------------------------------------------------------------- демо: «как будто купили Pro»
const DEMO_PRO_KEY = 'vaibik.demoPro'
const demoListeners = new Set<() => void>()
const readDemoPro = () => {
  if (!DEMO_MODE) return false
  try {
    return localStorage.getItem(DEMO_PRO_KEY) === '1'
  } catch {
    return false
  }
}
/** Только демо без бэкенда: включить/выключить «Pro» для проверки экранов */
// eslint-disable-next-line react-refresh/only-export-components
export function setDemoPro(on: boolean) {
  if (!DEMO_MODE) return
  try {
    if (on) localStorage.setItem(DEMO_PRO_KEY, '1')
    else localStorage.removeItem(DEMO_PRO_KEY)
  } catch {
    /* приватный режим — просто не запомним */
  }
  demoListeners.forEach((l) => l())
}
function subscribeDemo(cb: () => void) {
  demoListeners.add(cb)
  const onStorage = (e: StorageEvent) => e.key === DEMO_PRO_KEY && cb()
  window.addEventListener('storage', onStorage)
  return () => {
    demoListeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}
// eslint-disable-next-line react-refresh/only-export-components
export const useDemoPro = () => useSyncExternalStore(subscribeDemo, readDemoPro, readDemoPro)

/** Ответ /api/billing/status: подписка из App Store / Google Play (RevenueCat), если сервер её знает */
interface StatusResponse {
  store: StoreEntitlementLike | null
}
async function fetchStoreEntitlement(): Promise<StoreEntitlementLike | null> {
  try {
    const r = await apiPost<StatusResponse>('/api/billing/status', {}, { timeoutMs: 10_000 })
    return r?.store ?? null
  } catch {
    return null // не настроено (503) или сеть — просто считаем, что подписки из стора нет
  }
}

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
  const demo = useDemoPro()
  const [state, setState] = useState<{ for?: string; sub: Subscription | null }>({ sub: null })
  const [store, setStore] = useState<{ for?: string; ent: StoreEntitlementLike | null }>({ ent: null })

  const refresh = useCallback(async () => {
    if (!enabled) return null
    void fetchStoreEntitlement().then((ent) => setStore({ for: userId, ent }))
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
    void fetchStoreEntitlement().then((ent) => alive && setStore({ for: userId, ent }))
    return () => {
      alive = false
    }
  }, [enabled, userId])

  // вернулись на вкладку (из портала Polar, после отмены/продления) — перечитываем статус
  useEffect(() => {
    if (!enabled) return
    const onVisible = () => document.visibilityState === 'visible' && void refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [enabled, refresh])

  const value = useMemo<SubState>(() => {
    const sub = state.for === userId ? state.sub : null
    const ent = store.for === userId ? store.ent : null
    const pro = demo ? demoPro() : mergePro('web', fromPolar(sub), fromStore(ent))
    return { loading: enabled && state.for !== userId, subscription: sub, pro, isPro: pro.pro, isTrial: pro.state === 'trialing', refresh }
  }, [state, store, userId, enabled, refresh, demo])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

const NO_BILLING: SubState = { loading: false, subscription: null, pro: FREE, isPro: false, isTrial: false, refresh: async () => null }

// eslint-disable-next-line react-refresh/only-export-components
export function useSubscription(): SubState {
  return useContext(Ctx) ?? NO_BILLING
}

/** Итоговый статус Pro (для карточек тарифа, лендинга, настроек) */
// eslint-disable-next-line react-refresh/only-export-components
export const usePro = (): ProStatus => useSubscription().pro

/** Нужно ли показать пейвол для раздела (true — закрыто) */
// eslint-disable-next-line react-refresh/only-export-components
export function usePaywall(needsPro: boolean): { blocked: boolean; loading: boolean } {
  const { isPro, loading } = useSubscription()
  if (!PAYWALL_ACTIVE || !needsPro) return { blocked: false, loading: false }
  return { blocked: !loading && !isPro, loading }
}

/** Открыть оплату Polar (редирект). Возвращает текст ошибки, если не вышло. */
// eslint-disable-next-line react-refresh/only-export-components
export async function startCheckout(plan: Plan, source = 'unknown'): Promise<string | null> {
  track('checkout_started', { plan, source })
  try {
    const { url } = await apiPost<{ url: string }>('/api/billing/checkout', { plan })
    window.location.assign(url)
    return null
  } catch (e) {
    return e instanceof ApiError ? e.message : t('x1vxi7bb')
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
    return e instanceof ApiError ? e.message : t('x0ogcmbc')
  }
}
