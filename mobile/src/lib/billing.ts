/**
 * Оплата в приложении: Apple и Google требуют In-App Purchase для цифровых подписок,
 * поэтому веб-оплата Polar внутри приложения не используется. Здесь — RevenueCat
 * (react-native-purchases) за ключами EXPO_PUBLIC_REVENUECAT_*_KEY.
 * Без ключей — демо: пейвол показывает цены, но ничего не списывает.
 * Нативный SDK работает только в dev build / стор-сборке, не в Expo Go.
 */
import { Linking, Platform } from 'react-native'
import { useEffect, useState } from 'react'
import { PRICES, TRIAL_DAYS, annualPerMonth, annualSavePct, usd } from '@web/data/pricing'
import { LOCALE_META } from '@web/i18n/locales'
import { ENV } from './env'
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
interface RCInfo {
  entitlements: { active: Record<string, { productIdentifier: string }> }
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

function isPro(info: RCInfo) {
  proKnown = true
  const pro = Object.keys(info.entitlements?.active ?? {}).some((k) => ENTITLEMENT_ALIASES.includes(normEnt(k)) || normEnt(k) === normEnt(ENTITLEMENT))
  setProCache(pro)
  return pro
}

/** Кэш статуса Pro для экранов (путь обучения): обновляется при state/purchase/restore */
let proCache = false
/** Статус уже узнали у RevenueCat (или SDK нет) — до этого пейвол не показываем, чтобы Pro не мигал */
let proKnown = false
const proListeners = new Set<(v: boolean) => void>()
function setProCache(v: boolean) {
  if (v === proCache) return
  proCache = v
  proListeners.forEach((l) => l(v))
}
/** true, если активна подписка Pro (RevenueCat). Без SDK/ключа — false */
export function useIsPro(): boolean {
  const [pro, setPro] = useState(proCache)
  useEffect(() => {
    proListeners.add(setPro)
    void loadSdk().then((sdk) => sdk?.default.getCustomerInfo().then(isPro).catch(() => undefined))
    return () => {
      proListeners.delete(setPro)
    }
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
          pro: false,
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
        return { mode: 'live', pro: isPro(info), offers: offers.length ? offers : demoOffers(), managementURL: info.managementURL ?? null }
      } catch {
        return { mode: 'demo', reason: t('x0qp34vx'), pro: false, offers: demoOffers() }
      }
    },
    async purchase(offer) {
      const sdk = await loadSdk()
      if (!sdk || !offer.pkg) return { ok: false, message: t('x05fnbyp') }
      try {
        const res = await sdk.default.purchasePackage(offer.pkg as RCPackage)
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

/** Управление подпиской: ссылка RevenueCat, иначе страница подписок стора */
export function manageSubscriptions(url?: string | null) {
  const fallback = Platform.OS === 'android' ? 'https://play.google.com/store/account/subscriptions' : 'https://apps.apple.com/account/subscriptions'
  void Linking.openURL(url || fallback).catch(() => {})
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
