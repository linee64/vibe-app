/**
 * Оплата в приложении: Apple и Google требуют In-App Purchase для цифровых подписок,
 * поэтому веб-оплата Polar внутри приложения не используется. Здесь — RevenueCat
 * (react-native-purchases) за ключами EXPO_PUBLIC_REVENUECAT_*_KEY.
 * Без ключей — демо: пейвол показывает цены, но ничего не списывает.
 * Нативный SDK работает только в dev build / стор-сборке, не в Expo Go.
 */
import { AppState, Linking, Platform } from 'react-native'
import { useEffect, useState, useSyncExternalStore } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PRICES, TRIAL_DAYS, annualPerMonth, annualSavePct, usd } from '@web/data/pricing'
import { FREE, demoPro, fromPolar, fromStore, mergePro, type AppPlatform, type PolarSubscriptionLike, type ProStatus, type StoreEntitlementLike } from '@web/data/proStatus'
import { LOCALE_META } from '@web/i18n/locales'
import { DEMO_MODE, ENV } from './env'
import { getSupabase } from './web-adapters/supabase'
import { getLocale, t } from '@web/i18n/core'

/** Идентификатор entitlement в RevenueCat. Сверяем без учёта регистра/пробелов; любой из вариантов даёт Pro */
export const ENTITLEMENT = 'Vaibik Pro'
const ENTITLEMENT_ALIASES = ['vaibikpro', 'pro', 'vaibik_pro', 'vaibik-pro']
const normEnt = (k: string) => k.toLowerCase().replace(/[\s_-]+/g, '')
/** Идентификаторы продуктов в App Store Connect / Play Console — совпадают с тарифами веба */
export const PRODUCT_IDS = { monthly: 'com.vaibik.app.pro.monthly', annual: 'com.vaibik.app.pro.yearly' } as const
export type Plan = 'monthly' | 'annual'

export interface PlanOffer {
  plan: Plan
  title: string
  /** Строка цены из стора («$9.99») или расчётная в демо */
  price: string
  per: string
  trialDays: number | null
  badge?: string
  /** Годовой тариф: цена в месяц в валюте стора («≈ 2 490 ₸»); нет — не показываем */
  perMonth?: string
  /** Числовая цена и валюта из стора (для расчёта «в месяц» и скидки) */
  amount?: number
  currency?: string
  /** Пакет RevenueCat (есть только в живом режиме) */
  pkg?: unknown
}

export interface BillingState {
  mode: 'live' | 'demo'
  /** Почему не live (для экрана настроек/пейвола) */
  reason?: string
  pro: boolean
  offers: PlanOffer[]
  /** Ссылка управления подпиской из RevenueCat (App Store / Google Play) */
  managementURL?: string | null
}

export interface Billing {
  state: () => Promise<BillingState>
  purchase: (offer: PlanOffer) => Promise<{ ok: boolean; cancelled?: boolean; message?: string }>
  restore: () => Promise<{ ok: boolean; pro: boolean; message?: string }>
  identify: (userId: string | null) => Promise<void>
}

function platformKey() {
  return Platform.OS === 'ios' ? ENV.rcIos : Platform.OS === 'android' ? ENV.rcAndroid : ''
}

interface RCModule {
  default: {
    configure: (c: { apiKey: string }) => void
    isConfigured: () => Promise<boolean>
    getOfferings: () => Promise<{ current?: { availablePackages: RCPackage[] } | null }>
    purchasePackage: (p: RCPackage) => Promise<{ customerInfo: RCInfo }>
    restorePurchases: () => Promise<RCInfo>
    getCustomerInfo: () => Promise<RCInfo>
    logIn: (id: string) => Promise<unknown>
    logOut: () => Promise<unknown>
    showManageSubscriptions?: () => Promise<void>
    addCustomerInfoUpdateListener?: (l: (info: RCInfo) => void) => void
  }
  PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: string }
}

interface RCPackage {
  identifier: string
  packageType: string
  product: {
    identifier: string
    priceString: string
    price?: number
    currencyCode?: string
    pricePerMonthString?: string | null
    introPrice?: { price: number; periodNumberOfUnits: number; periodUnit: string } | null
  }
}
interface RCEntitlement {
  productIdentifier: string
  isActive?: boolean
  willRenew?: boolean
  periodType?: string
  expirationDate?: string | null
  store?: string
  billingIssueDetectedAt?: string | null
}
interface RCInfo {
  entitlements: { active: Record<string, RCEntitlement> }
  managementURL?: string | null
}

let rc: RCModule | null | undefined

async function loadSdk(): Promise<RCModule | null> {
  if (rc !== undefined) return rc
  const key = platformKey()
  if (!key || Platform.OS === 'web') {
    rc = null
    return null
  }
  try {
    const mod = (await import('react-native-purchases')) as unknown as RCModule
    const ready = await mod.default.isConfigured().catch(() => false)
    if (!ready) mod.default.configure({ apiKey: key })
    // любое изменение подписки (покупка, продление, отмена, восстановление) — сразу в статус Pro, без перезапуска
    mod.default.addCustomerInfoUpdateListener?.((info) => void isPro(info))
    rc = mod
  } catch {
    rc = null
  }
  return rc
}

const PLAN_META: Record<Plan, { title: string; per: string }> = {
  monthly: { get title() { return t('x1i7og0k') }, get per() { return t('x1g6bvjm') } },
  annual: { get title() { return t('x0468b34') }, get per() { return t('x0pcpi1q') } },
}

function planOf(p: RCPackage): Plan | null {
  const id = p.product.identifier
  const pk = p.identifier.toLowerCase()
  if (id === PRODUCT_IDS.monthly || p.packageType === 'MONTHLY' || pk === 'monthly' || pk === '$rc_monthly') return 'monthly'
  if (id === PRODUCT_IDS.annual || p.packageType === 'ANNUAL' || pk === 'yearly' || pk === 'annual' || pk === '$rc_annual') return 'annual'
  return null
}

function trialOf(p: RCPackage): number | null {
  const i = p.product.introPrice
  if (!i || i.price !== 0) return null
  if (i.periodUnit === 'DAY') return i.periodNumberOfUnits
  if (i.periodUnit === 'WEEK') return i.periodNumberOfUnits * 7
  return null
}

/** Активный entitlement Pro из CustomerInfo (сверка без учёта регистра/пробелов) */
function proEntitlement(info: RCInfo): RCEntitlement | null {
  const active = info.entitlements?.active ?? {}
  const key = Object.keys(active).find((k) => ENTITLEMENT_ALIASES.includes(normEnt(k)) || normEnt(k) === normEnt(ENTITLEMENT))
  return key ? active[key] : null
}

/** CustomerInfo → ProStatus (тариф, продлится ли, до какого числа, какой магазин) */
export function statusFromInfo(info: RCInfo): ProStatus {
  const e = proEntitlement(info)
  if (!e) return FREE
  const ent: StoreEntitlementLike = {
    isActive: e.isActive ?? true,
    willRenew: e.willRenew ?? true,
    periodType: e.periodType ?? null,
    expirationDate: e.expirationDate ?? null,
    store: e.store ?? (Platform.OS === 'android' ? 'PLAY_STORE' : 'APP_STORE'),
    productIdentifier: e.productIdentifier,
    billingIssueDetectedAt: e.billingIssueDetectedAt ?? null,
  }
  return fromStore(ent)
}

function isPro(info: RCInfo) {
  proKnown = true
  managementURL = info.managementURL ?? managementURL
  setSource('rc', statusFromInfo(info))
  return current.pro
}

// ---------------------------------------------------------------- общий статус Pro (все экраны)
const PLATFORM: AppPlatform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web'
const DEMO_PRO_KEY = 'vaibik.demoPro'
/** Источники: RevenueCat (App Store / Google Play), Polar (подписка с сайта, таблица subscriptions), демо-переключатель */
const sources: { rc: ProStatus; polar: ProStatus; demo: boolean } = { rc: FREE, polar: FREE, demo: false }
let current: ProStatus = FREE
let managementURL: string | null = null
/** Статус уже узнали у RevenueCat (или SDK нет) — до этого пейвол не показываем, чтобы Pro не мигал */
let proKnown = false
const proListeners = new Set<() => void>()
function recompute() {
  const next = sources.demo ? demoPro() : mergePro(PLATFORM, sources.polar, sources.rc)
  if (JSON.stringify(next) === JSON.stringify(current)) return
  current = next
  proListeners.forEach((l) => l())
}
function setSource(k: 'rc' | 'polar', v: ProStatus) {
  sources[k] = v
  recompute()
}
const subscribePro = (l: () => void) => {
  proListeners.add(l)
  return () => void proListeners.delete(l)
}
export const getProStatus = () => current

if (DEMO_MODE) {
  void AsyncStorage.getItem(DEMO_PRO_KEY)
    .then((v) => {
      sources.demo = v === '1'
      recompute()
    })
    .catch(() => {})
}
/** Только демо без бэкенда: «как будто купили Pro» — для проверки экранов */
export function setDemoPro(on: boolean) {
  if (!DEMO_MODE) return
  sources.demo = on
  void (on ? AsyncStorage.setItem(DEMO_PRO_KEY, '1') : AsyncStorage.removeItem(DEMO_PRO_KEY)).catch(() => {})
  recompute()
}

/** Подписка с сайта (Polar): строку subscriptions пишет вебхук, читаем свою по RLS */
async function refreshPolar(userId: string | null) {
  if (!userId) return setSource('polar', FREE)
  try {
    const sb = await getSupabase()
    if (!sb) return
    const { data, error } = await sb.from('subscriptions').select('status, plan, current_period_end, trial_end, cancel_at_period_end').maybeSingle()
    if (error) return
    setSource('polar', fromPolar((data as PolarSubscriptionLike | null) ?? null))
  } catch {
    /* сеть — оставим прежний статус */
  }
}

/** Перечитать статус Pro: RevenueCat + Polar */
export async function refreshPro(userId: string | null) {
  const sdk = await loadSdk()
  await Promise.all([sdk ? sdk.default.getCustomerInfo().then(isPro).catch(() => undefined) : undefined, refreshPolar(userId)])
  proKnown = true
}

/** Один раз в корне приложения: при входе/выходе и при возврате в приложение (из настроек App Store) обновляем статус */
export function useProSync(userId: string | null) {
  useEffect(() => {
    void createBilling().identify(userId).finally(() => void refreshPro(userId))
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') void refreshPro(userId)
    })
    return () => sub.remove()
  }, [userId])
}

/** Итоговый статус Pro: тариф, «отменена», даты, магазин */
export const useProInfo = (): ProStatus => useSyncExternalStore(subscribePro, getProStatus, getProStatus)

/** true, если активна подписка Pro (RevenueCat, сайт или демо). Без SDK/ключа и подписки — false */
export function useIsPro(): boolean {
  const pro = useProInfo().pro
  useEffect(() => {
    void loadSdk().then((sdk) => sdk?.default.getCustomerInfo().then(isPro).catch(() => undefined))
  }, [])
  return pro
}

/** Pro и «ещё проверяем» — для пейвола на входе в урок/домашку */
export function useProStatus(): { pro: boolean; loading: boolean } {
  const pro = useIsPro()
  const [known, setKnown] = useState(proKnown)
  useEffect(() => {
    if (known) return
    let alive = true
    void loadSdk().then(async (sdk) => {
      if (sdk) await sdk.default.getCustomerInfo().then(isPro).catch(() => undefined)
      proKnown = true
      if (alive) setKnown(true)
    })
    return () => {
      alive = false
    }
  }, [known])
  return { pro, loading: !known && !pro }
}

/** Демо-цены — из общего веб-модуля pricing.ts (те же $9.99 / $59.99 и 3 дня пробного периода) */
export function demoOffers(): PlanOffer[] {
  return [
    { plan: 'annual', ...PLAN_META.annual, price: usd(PRICES.annual), trialDays: TRIAL_DAYS, badge: `−${annualSavePct}%`, perMonth: usd(annualPerMonth) },
    { plan: 'monthly', ...PLAN_META.monthly, price: usd(PRICES.monthly), trialDays: TRIAL_DAYS },
  ]
}

export function createBilling(): Billing {
  return {
    async state() {
      const sdk = await loadSdk()
      if (!sdk) {
        return {
          mode: 'demo',
          reason: Platform.OS === 'web' ? t('x06e94q2') : platformKey() ? t('x1msfcvt') : t('x1al1pw1'),
          pro: current.pro,
          offers: demoOffers(),
        }
      }
      try {
        const offerings = await sdk.default.getOfferings()
        const offers: PlanOffer[] = []
        for (const p of offerings.current?.availablePackages ?? []) {
          const plan = planOf(p)
          if (!plan || offers.some((o) => o.plan === plan)) continue
          const amount = typeof p.product.price === 'number' ? p.product.price : undefined
          const currency = p.product.currencyCode || undefined
          offers.push({ plan, ...PLAN_META[plan], price: p.product.priceString, per: PLAN_META[plan].per, trialDays: trialOf(p), amount, currency, pkg: p })
        }
        // «в месяц» для годового и скидка — только из цен стора в местной валюте (никаких «$5» рядом с ₸/€)
        const annual = offers.find((o) => o.plan === 'annual')
        const monthly = offers.find((o) => o.plan === 'monthly')
        if (annual) {
          const pkg = annual.pkg as RCPackage
          annual.perMonth = pkg.product.pricePerMonthString || (annual.amount != null && annual.currency ? formatMoney(annual.amount / 12, annual.currency) : undefined)
          if (monthly?.amount && annual.amount != null && monthly.currency === annual.currency) {
            const pct = Math.round((1 - annual.amount / (monthly.amount * 12)) * 100)
            if (pct > 0) annual.badge = `−${pct}%`
          }
        }
        offers.sort((a, b) => Number(b.plan === 'annual') - Number(a.plan === 'annual'))
        const info = await sdk.default.getCustomerInfo()
        isPro(info)
        return { mode: 'live', pro: current.pro, offers: offers.length ? offers : demoOffers(), managementURL: info.managementURL ?? null }
      } catch {
        return { mode: 'demo', reason: t('x0qp34vx'), pro: current.pro, offers: demoOffers() }
      }
    },
    async purchase(offer) {
      const sdk = await loadSdk()
      if (!sdk || !offer.pkg) return { ok: false, message: t('x05fnbyp') }
      try {
        const res = await sdk.default.purchasePackage(offer.pkg as RCPackage)
        // статус Pro обновляется сразу — карточка тарифа и пейвол исчезают без перезапуска
        return { ok: isPro(res.customerInfo) }
      } catch (e) {
        const err = e as { code?: string; userCancelled?: boolean }
        if (err.userCancelled || err.code === sdk.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return { ok: false, cancelled: true }
        return { ok: false, message: t('x0lirfw2') }
      }
    },
    async restore() {
      const sdk = await loadSdk()
      if (!sdk) return { ok: false, pro: false, message: t('x1akua1l') }
      try {
        const info = await sdk.default.restorePurchases()
        const pro = isPro(info)
        return { ok: true, pro, message: pro ? t('x1ipg9fm') : t('x139ci0e') }
      } catch {
        return { ok: false, pro: false, message: t('x05t8lkw') }
      }
    },
    async identify(userId) {
      const sdk = await loadSdk()
      if (!sdk) return
      try {
        if (userId) await sdk.default.logIn(userId)
        else await sdk.default.logOut()
      } catch {
        /* анонимный пользователь тоже ок */
      }
    },
  }
}

/** Сумма в валюте стора на языке интерфейса; без Intl — null (тогда «в месяц» просто не показываем) */
export function formatMoney(amount: number, currency: string): string | undefined {
  try {
    return new Intl.NumberFormat(LOCALE_META[getLocale()].tag, { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount)
  } catch {
    return undefined
  }
}

export const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions'
export const PLAY_SUBSCRIPTIONS_URL = 'https://play.google.com/store/account/subscriptions'

/**
 * Управление / отмена подписки. Отменить подписку App Store может только сам пользователь у Apple —
 * открываем системный экран подписок (RevenueCat showManageSubscriptions), иначе apps.apple.com/account/subscriptions.
 * Android — ссылка RevenueCat (managementURL) или страница подписок Google Play.
 */
export async function manageSubscriptions(url?: string | null) {
  if (Platform.OS === 'ios') {
    const sdk = await loadSdk()
    try {
      if (sdk?.default.showManageSubscriptions) {
        await sdk.default.showManageSubscriptions()
        return
      }
    } catch {
      /* нет StoreKit-листа — откроем страницу подписок */
    }
    await Linking.openURL(APPLE_SUBSCRIPTIONS_URL).catch(() => {})
    return
  }
  const fallback = Platform.OS === 'android' ? PLAY_SUBSCRIPTIONS_URL : APPLE_SUBSCRIPTIONS_URL
  await Linking.openURL(url || managementURL || fallback).catch(() => {})
}

/** Пейвол для раздела: Pro нужен (раздел не бесплатный) и подписки нет */
export { needsPro } from '@web/data/tiers'

/** Состояние оплаты для экранов (профиль, пейвол): грузится один раз на экран */
export function useBillingState(): BillingState | null {
  const [state, setState] = useState<BillingState | null>(null)
  useEffect(() => {
    let alive = true
    void createBilling()
      .state()
      .then((s) => alive && setState(s))
    return () => {
      alive = false
    }
  }, [])
  return state
}
