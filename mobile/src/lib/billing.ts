/**
 * Оплата в приложении: Apple и Google требуют In-App Purchase для цифровых подписок,
 * поэтому веб-оплата Polar внутри приложения не используется. Здесь — RevenueCat
 * (react-native-purchases) за ключами EXPO_PUBLIC_REVENUECAT_*_KEY.
 * Без ключей — демо: пейвол показывает цены, но ничего не списывает.
 * Нативный SDK работает только в dev build / стор-сборке, не в Expo Go.
 */
import { Platform } from 'react-native'
import { PRICES, TRIAL_DAYS, annualSavePct, usd } from '@web/data/pricing'
import { ENV } from './env'

export const ENTITLEMENT = 'pro'
/** Идентификаторы продуктов в App Store Connect / Play Console — совпадают с тарифами веба */
export const PRODUCT_IDS = { monthly: 'vaibik_pro_monthly', annual: 'vaibik_pro_annual' } as const
export type Plan = 'monthly' | 'annual'

export interface PlanOffer {
  plan: Plan
  title: string
  /** Строка цены из стора («$9.99») или расчётная в демо */
  price: string
  per: string
  trialDays: number | null
  badge?: string
  /** Пакет RevenueCat (есть только в живом режиме) */
  pkg?: unknown
}

export interface BillingState {
  mode: 'live' | 'demo'
  /** Почему не live (для экрана настроек/пейвола) */
  reason?: string
  pro: boolean
  offers: PlanOffer[]
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
    introPrice?: { price: number; periodNumberOfUnits: number; periodUnit: string } | null
  }
}
interface RCInfo {
  entitlements: { active: Record<string, { productIdentifier: string }> }
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
  monthly: { title: 'Месяц', per: 'в месяц' },
  annual: { title: 'Год', per: 'в год' },
}

function planOf(p: RCPackage): Plan | null {
  const id = p.product.identifier
  if (id === PRODUCT_IDS.monthly || p.packageType === 'MONTHLY') return 'monthly'
  if (id === PRODUCT_IDS.annual || p.packageType === 'ANNUAL') return 'annual'
  return null
}

function trialOf(p: RCPackage): number | null {
  const i = p.product.introPrice
  if (!i || i.price !== 0) return null
  if (i.periodUnit === 'DAY') return i.periodNumberOfUnits
  if (i.periodUnit === 'WEEK') return i.periodNumberOfUnits * 7
  return null
}

const isPro = (info: RCInfo) => !!info.entitlements.active[ENTITLEMENT]

/** Демо-цены — из общего веб-модуля pricing.ts (те же $9.99 / $59.99 и 3 дня пробного периода) */
export function demoOffers(): PlanOffer[] {
  return [
    { plan: 'annual', ...PLAN_META.annual, price: usd(PRICES.annual), trialDays: TRIAL_DAYS, badge: `−${annualSavePct}%` },
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
          reason: Platform.OS === 'web' ? 'На вебе покупки внутри приложения недоступны.' : platformKey() ? 'Нужна сборка dev build — в Expo Go нативный SDK не работает.' : 'Ключ RevenueCat не задан.',
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
          offers.push({ plan, ...PLAN_META[plan], price: p.product.priceString, per: PLAN_META[plan].per, trialDays: trialOf(p), badge: plan === 'annual' ? `−${annualSavePct}%` : undefined, pkg: p })
        }
        offers.sort((a, b) => Number(b.plan === 'annual') - Number(a.plan === 'annual'))
        const info = await sdk.default.getCustomerInfo()
        return { mode: 'live', pro: isPro(info), offers: offers.length ? offers : demoOffers() }
      } catch {
        return { mode: 'demo', reason: 'Не удалось получить цены из стора.', pro: false, offers: demoOffers() }
      }
    },
    async purchase(offer) {
      const sdk = await loadSdk()
      if (!sdk || !offer.pkg) return { ok: false, message: 'Покупки доступны в сборке приложения с ключом RevenueCat. Сейчас это демо — ничего не списано.' }
      try {
        const res = await sdk.default.purchasePackage(offer.pkg as RCPackage)
        return { ok: isPro(res.customerInfo) }
      } catch (e) {
        const err = e as { code?: string; userCancelled?: boolean }
        if (err.userCancelled || err.code === sdk.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return { ok: false, cancelled: true }
        return { ok: false, message: 'Покупка не прошла. Попробуй ещё раз или восстанови покупки.' }
      }
    },
    async restore() {
      const sdk = await loadSdk()
      if (!sdk) return { ok: false, pro: false, message: 'Восстановление доступно в сборке приложения с ключом RevenueCat.' }
      try {
        const info = await sdk.default.restorePurchases()
        const pro = isPro(info)
        return { ok: true, pro, message: pro ? 'Pro восстановлен ✨' : 'Активных покупок не нашлось.' }
      } catch {
        return { ok: false, pro: false, message: 'Не получилось связаться со стором.' }
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
