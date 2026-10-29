/** Пейвол без выдуманных цен: при ключе RevenueCat сбой загрузки — режим error (кнопка «Повторить»), а не демо */
type Pkg = { identifier: string; packageType: string; product: { identifier: string; title?: string; priceString: string; price?: number; currencyCode?: string; introPrice?: { price: number; periodNumberOfUnits: number; periodUnit: string } | null } }
const pkgs: Pkg[] = [
  { identifier: '$rc_monthly', packageType: 'MONTHLY', product: { identifier: 'com.vaibik.app.pro.monthly', title: 'Vaibik Pro — monthly', priceString: '$9.99', price: 9.99, currencyCode: 'USD', introPrice: { price: 0, periodNumberOfUnits: 3, periodUnit: 'DAY' } } },
  { identifier: '$rc_annual', packageType: 'ANNUAL', product: { identifier: 'com.vaibik.app.pro.yearly', title: 'Vaibik Pro — yearly', priceString: '$59.99', price: 59.99, currencyCode: 'USD', introPrice: { price: 0, periodNumberOfUnits: 3, periodUnit: 'DAY' } } },
]

function load(key: string, sdk: Record<string, unknown>) {
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY = key
  jest.resetModules()
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const billing = require('../lib/billing') as typeof import('../lib/billing')
  if (key) billing.__setSdkForTests({ default: { isConfigured: async () => true, configure: () => {}, getCustomerInfo: async () => ({ entitlements: { active: {} } }), ...sdk }, PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: '1' } })
  return billing
}

describe('billing.state', () => {
  it('ключ есть, getOfferings падает → error, без демо-цен', async () => {
    const { createBilling } = load('appl_test', { getOfferings: async () => { throw new Error('StoreKit: no products') } })
    const s = await createBilling().state()
    expect(s.mode).toBe('error')
    expect(s.offers).toEqual([])
  })
  it('ключ есть, offering пустой → error', async () => {
    const { createBilling } = load('appl_test', { getOfferings: async () => ({ current: { availablePackages: [] } }) })
    const s = await createBilling().state()
    expect(s.mode).toBe('error')
    expect(s.offers).toEqual([])
  })
  it('оба пакета из стора → live, названия и цены из стора, пробный 3 дня', async () => {
    const { createBilling } = load('appl_test', { getOfferings: async () => ({ current: { availablePackages: pkgs } }) })
    const s = await createBilling().state()
    expect(s.mode).toBe('live')
    expect(s.offers.map((o) => [o.plan, o.price, o.storeTitle, o.trialDays])).toEqual([
      ['annual', '$59.99', 'Vaibik Pro — yearly', 3],
      ['monthly', '$9.99', 'Vaibik Pro — monthly', 3],
    ])
  })
  it('current нет, но есть offering default → берём его', async () => {
    const { createBilling } = load('appl_test', { getOfferings: async () => ({ current: null, all: { default: { availablePackages: pkgs } } }) })
    expect((await createBilling().state()).mode).toBe('live')
  })
  it('ключа нет (разработка) → демо', async () => {
    const { createBilling } = load('', {})
    expect((await createBilling().state()).mode).toBe('demo')
  })
})
