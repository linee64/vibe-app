/**
 * Статус Вайбик Pro — общий для веба (Polar) и приложения (RevenueCat / App Store / Google Play).
 * Чистые функции без React и платформенных SDK: их используют src/lib/billing.tsx, mobile/src/lib/billing.ts и тесты.
 *
 *  * Pro = оплачен или идёт пробный период. «Отменена» (автопродление выключено) — Pro до конца периода.
 *  * Купившему Pro карточку тарифа / пробного периода не показываем нигде — только компактный статус.
 *  * Управление подпиской — там, где её оформили: Polar (веб), App Store (iPhone), Google Play (Android).
 *    На другой платформе — короткая подсказка, где ею управлять.
 */
export type ProPlan = 'monthly' | 'annual'
/** Где оформлена подписка */
export type ProSource = 'web' | 'app_store' | 'play_store' | 'demo'
/** active — продлится; trialing — пробный период; cancelled — автопродление выключено, Pro до конца периода; past_due — проблема с оплатой (стор даёт льготный период) */
export type ProState = 'active' | 'trialing' | 'cancelled' | 'past_due'
export type AppPlatform = 'web' | 'ios' | 'android'

export interface ProStatus {
  pro: boolean
  source: ProSource | null
  plan: ProPlan | null
  state: ProState | null
  /** Дата продления (или окончания, если отменена). ISO */
  periodEnd: string | null
  /** Конец пробного периода. ISO */
  trialEnd: string | null
  /** Пробный период и после него будет списание */
  willRenew: boolean
}

export const FREE: ProStatus = { pro: false, source: null, plan: null, state: null, periodEnd: null, trialEnd: null, willRenew: false }

/** Строка таблицы subscriptions (её пишет вебхук Polar) */
export interface PolarSubscriptionLike {
  status: string
  plan: string | null
  current_period_end: string | null
  trial_end: string | null
  cancel_at_period_end?: boolean | null
}

const asPlan = (p: string | null | undefined): ProPlan | null => {
  if (!p) return null
  const s = p.toLowerCase()
  if (s === 'annual' || s === 'yearly' || s === 'year' || s.includes('year') || s.includes('annual')) return 'annual'
  if (s === 'monthly' || s === 'month' || s.includes('month')) return 'monthly'
  return null
}

/**
 * Polar: пока подписка оплачена/в пробном периоде, статус active/trialing (после отмены — с cancel_at_period_end),
 * а «canceled» Polar ставит, когда период закончился или доступ отозван (возврат) — это уже Free.
 */
export function fromPolar(sub: PolarSubscriptionLike | null | undefined): ProStatus {
  if (!sub) return FREE
  const pro = sub.status === 'active' || sub.status === 'trialing'
  if (!pro) return FREE
  const cancelled = sub.cancel_at_period_end === true
  const state: ProState = cancelled ? 'cancelled' : sub.status === 'trialing' ? 'trialing' : 'active'
  return {
    pro: true,
    source: 'web',
    plan: asPlan(sub.plan),
    state,
    periodEnd: sub.current_period_end ?? sub.trial_end ?? null,
    trialEnd: sub.status === 'trialing' ? (sub.trial_end ?? sub.current_period_end ?? null) : null,
    willRenew: !cancelled,
  }
}

/** Entitlement RevenueCat (CustomerInfo.entitlements.active[…] из SDK или subscriber.entitlements из REST API, приведённые к этому виду) */
export interface StoreEntitlementLike {
  isActive: boolean
  willRenew: boolean
  /** TRIAL / INTRO / NORMAL (SDK) или trial / intro / normal (REST) */
  periodType?: string | null
  expirationDate?: string | null
  /** APP_STORE / PLAY_STORE / … (SDK) или app_store / play_store (REST) */
  store?: string | null
  productIdentifier?: string | null
  billingIssueDetectedAt?: string | null
}

export function storeOf(store: string | null | undefined): ProSource {
  const s = (store ?? '').toLowerCase()
  if (s.includes('play')) return 'play_store'
  if (s.includes('stripe') || s.includes('paddle') || s.includes('rc_billing') || s.includes('web')) return 'web'
  return 'app_store'
}

export function fromStore(e: StoreEntitlementLike | null | undefined, now = Date.now()): ProStatus {
  if (!e) return FREE
  const exp = e.expirationDate ?? null
  const expired = exp ? Date.parse(exp) <= now : false
  if (!e.isActive || expired) return FREE
  const trial = (e.periodType ?? '').toLowerCase() === 'trial'
  const state: ProState = !e.willRenew ? 'cancelled' : e.billingIssueDetectedAt ? 'past_due' : trial ? 'trialing' : 'active'
  return {
    pro: true,
    source: storeOf(e.store),
    plan: asPlan(e.productIdentifier),
    state,
    periodEnd: exp,
    trialEnd: trial ? exp : null,
    willRenew: e.willRenew,
  }
}

/** Демо без бэкенда: «как будто купили годовой» — для проверки экранов */
export function demoPro(now = Date.now()): ProStatus {
  const end = new Date(now + 365 * 24 * 3600 * 1000).toISOString()
  return { pro: true, source: 'demo', plan: 'annual', state: 'active', periodEnd: end, trialEnd: null, willRenew: true }
}

const rank = (s: ProStatus, platform: AppPlatform) => {
  if (!s.pro) return 0
  const native = (platform === 'web' && s.source === 'web') || (platform === 'ios' && s.source === 'app_store') || (platform === 'android' && s.source === 'play_store')
  // подписка, которая продлится, важнее отменённой; родная для платформы — важнее чужой (ею можно управлять здесь)
  return 1 + (s.willRenew ? 2 : 0) + (native ? 1 : 0)
}

/** Несколько источников (Polar + стор): Pro, если хоть один активен; для экрана берём «главный» */
export function mergePro(platform: AppPlatform, ...list: (ProStatus | null | undefined)[]): ProStatus {
  let best: ProStatus = FREE
  for (const s of list) if (s && rank(s, platform) > rank(best, platform)) best = s
  return best
}

// ---------------------------------------------------------------- что показывать

/** Карточку тарифа / «Попробовать Pro» / пробный период / пейвол показываем только без Pro */
export const showPlanPurchase = (s: ProStatus | null | undefined): boolean => !s?.pro

export type ManageKind = 'polar_portal' | 'app_store' | 'play_store' | 'demo'
export interface ManagePlan {
  /** Кнопка «Управлять подпиской» на этой платформе; null — только подсказка */
  action: ManageKind | null
  /** Подписка оформлена на другой платформе — показать, где ею управлять */
  elsewhere: Exclude<ProSource, 'demo'> | null
}

/** Как управлять/отменить подписку с этой платформы */
export function managePlan(s: ProStatus | null | undefined, platform: AppPlatform): ManagePlan {
  if (!s?.pro || !s.source) return { action: null, elsewhere: null }
  if (s.source === 'demo') return { action: 'demo', elsewhere: null }
  if (s.source === 'web') return platform === 'web' ? { action: 'polar_portal', elsewhere: null } : { action: null, elsewhere: 'web' }
  if (s.source === 'app_store') return platform === 'ios' ? { action: 'app_store', elsewhere: null } : { action: null, elsewhere: 'app_store' }
  return platform === 'android' ? { action: 'play_store', elsewhere: null } : { action: null, elsewhere: 'play_store' }
}

/** Какую строку статуса показать под «Вайбик Pro активен» (текст — в UI через i18n) */
export type ProLine = { kind: 'trial'; date: string } | { kind: 'renews'; date: string } | { kind: 'until'; date: string } | { kind: 'pastDue' } | { kind: 'none' }

export function proLine(s: ProStatus | null | undefined): ProLine {
  if (!s?.pro) return { kind: 'none' }
  if (s.state === 'past_due') return { kind: 'pastDue' }
  if (s.state === 'cancelled') return s.periodEnd ? { kind: 'until', date: s.periodEnd } : { kind: 'none' }
  if (s.state === 'trialing') {
    const d = s.trialEnd ?? s.periodEnd
    return d ? { kind: 'trial', date: d } : { kind: 'none' }
  }
  return s.periodEnd ? { kind: 'renews', date: s.periodEnd } : { kind: 'none' }
}
