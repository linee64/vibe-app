/**
 * Pro скрывает карточку тарифа: чистая логика (src/data/proStatus.ts) + рендер профиля, «Ещё», настроек, пейвола и тарифов
 * в демо с включённым/выключенным Pro.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { FREE, demoPro, fromPolar, fromStore, managePlan, mergePro, proLine, showPlanPurchase, storeOf } from '../../src/data/proStatus'

// --- localStorage для node (демо-переключатель Pro и стор читают его)
const mem = new Map<string, string>()
;(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, String(v)),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: (i: number) => [...mem.keys()][i] ?? null,
  get length() {
    return mem.size
  },
}

const NOW = Date.parse('2026-10-15T06:00:00Z')
const FUTURE = '2026-11-15T06:00:00Z'

describe('статус Pro из Polar', () => {
  it('нет подписки → Free, карточка тарифа видна', () => {
    expect(fromPolar(null)).toEqual(FREE)
    expect(showPlanPurchase(fromPolar(null))).toBe(true)
  })
  it('active / trialing → Pro, карточку тарифа не показываем', () => {
    const a = fromPolar({ status: 'active', plan: 'annual', current_period_end: FUTURE, trial_end: null, cancel_at_period_end: false })
    expect(a).toMatchObject({ pro: true, source: 'web', plan: 'annual', state: 'active', willRenew: true })
    expect(showPlanPurchase(a)).toBe(false)
    const tr = fromPolar({ status: 'trialing', plan: 'monthly', current_period_end: FUTURE, trial_end: FUTURE })
    expect(tr).toMatchObject({ pro: true, state: 'trialing', trialEnd: FUTURE })
    expect(proLine(tr)).toEqual({ kind: 'trial', date: FUTURE })
  })
  it('отменена, но период идёт → всё ещё Pro до конца периода', () => {
    const c = fromPolar({ status: 'active', plan: 'monthly', current_period_end: FUTURE, trial_end: null, cancel_at_period_end: true })
    expect(c).toMatchObject({ pro: true, state: 'cancelled', willRenew: false, periodEnd: FUTURE })
    expect(showPlanPurchase(c)).toBe(false)
    expect(proLine(c)).toEqual({ kind: 'until', date: FUTURE })
  })
  it('canceled / past_due / unpaid у Polar → Free', () => {
    for (const status of ['canceled', 'past_due', 'unpaid', 'incomplete'])
      expect(showPlanPurchase(fromPolar({ status, plan: 'monthly', current_period_end: FUTURE, trial_end: null }))).toBe(true)
  })
})

describe('статус Pro из App Store / Google Play (RevenueCat)', () => {
  it('активный entitlement → Pro; willRenew=false → «отменена»', () => {
    const s = fromStore({ isActive: true, willRenew: true, periodType: 'NORMAL', expirationDate: FUTURE, store: 'APP_STORE', productIdentifier: 'com.vaibik.app.pro.yearly' }, NOW)
    expect(s).toMatchObject({ pro: true, source: 'app_store', plan: 'annual', state: 'active' })
    const c = fromStore({ isActive: true, willRenew: false, periodType: 'NORMAL', expirationDate: FUTURE, store: 'APP_STORE', productIdentifier: 'com.vaibik.app.pro.monthly' }, NOW)
    expect(c).toMatchObject({ pro: true, plan: 'monthly', state: 'cancelled' })
    const tr = fromStore({ isActive: true, willRenew: true, periodType: 'trial', expirationDate: FUTURE, store: 'app_store', productIdentifier: 'com.vaibik.app.pro.monthly' }, NOW)
    expect(tr.state).toBe('trialing')
  })
  it('истёк или неактивен → Free', () => {
    expect(fromStore({ isActive: true, willRenew: false, expirationDate: '2026-10-01T00:00:00Z' }, NOW).pro).toBe(false)
    expect(fromStore({ isActive: false, willRenew: false }, NOW).pro).toBe(false)
    expect(fromStore(null).pro).toBe(false)
  })
  it('магазин', () => {
    expect(storeOf('PLAY_STORE')).toBe('play_store')
    expect(storeOf('app_store')).toBe('app_store')
    expect(storeOf('STRIPE')).toBe('web')
  })
})

describe('несколько источников и управление подпиской', () => {
  const web = fromPolar({ status: 'active', plan: 'annual', current_period_end: FUTURE, trial_end: null })
  const ios = fromStore({ isActive: true, willRenew: true, expirationDate: FUTURE, store: 'APP_STORE', productIdentifier: 'com.vaibik.app.pro.monthly' }, NOW)
  it('mergePro: Pro, если хоть один источник активен; родная платформа важнее', () => {
    expect(mergePro('web', FREE, ios).source).toBe('app_store')
    expect(mergePro('web', web, ios).source).toBe('web')
    expect(mergePro('ios', web, ios).source).toBe('app_store')
    expect(mergePro('ios', FREE, FREE).pro).toBe(false)
  })
  it('managePlan: веб → портал Polar, iPhone → App Store, чужая платформа → подсказка', () => {
    expect(managePlan(web, 'web')).toEqual({ action: 'polar_portal', elsewhere: null })
    expect(managePlan(ios, 'ios')).toEqual({ action: 'app_store', elsewhere: null })
    expect(managePlan(ios, 'web')).toEqual({ action: null, elsewhere: 'app_store' })
    expect(managePlan(web, 'ios')).toEqual({ action: null, elsewhere: 'web' })
    expect(managePlan(FREE, 'web')).toEqual({ action: null, elsewhere: null })
    expect(managePlan(demoPro(NOW), 'ios').action).toBe('demo')
  })
})

describe('экраны: Pro скрывает карточку тарифа (демо)', async () => {
  const { StoreProvider } = await import('../../src/store')
  const { SubscriptionProvider, setDemoPro } = await import('../../src/lib/billing')
  const { Profile } = await import('../../src/screens/Profile')
  const { MoreScreen, SettingsScreen } = await import('../../src/screens/More')
  const { PaywallScreen } = await import('../../src/components/Paywall')
  const { setLocale } = await import('../../src/i18n')

  const render = (el: ReactElement) => renderToStaticMarkup(createElement(StoreProvider, null, createElement(SubscriptionProvider, null, el)))
  const BUY = ['Попробовать Pro', 'Твой тариф: Free', 'бесплатно']

  beforeEach(() => {
    mem.clear()
    setLocale('ru')
  })

  it('Free: в профиле карточка «Твой тариф: Free · Попробовать Pro», в настройках нет блока подписки', () => {
    setDemoPro(false)
    const html = render(createElement(Profile))
    expect(html).toContain('data-plan="free"')
    expect(html).toContain('Попробовать Pro')
    expect(html).toContain('Демо: включить Pro')
    expect(render(createElement(SettingsScreen))).not.toContain('data-settings-subscription')
    expect(render(createElement(MoreScreen))).not.toContain('data-plan="pro"')
    expect(render(createElement(PaywallScreen, { title: 'Деплой' }))).toContain('data-paywall="true"')
  })

  it('Pro: вместо карточки тарифа — «Вайбик Pro активен», никаких кнопок покупки/пробного периода', () => {
    setDemoPro(true)
    const profile = render(createElement(Profile))
    expect(profile).toContain('data-plan="pro"')
    expect(profile).toContain('Вайбик Pro активен')
    expect(profile).toContain('Годовой тариф')
    expect(profile).not.toContain('data-plan="free"')
    for (const s of BUY.slice(0, 2)) expect(profile).not.toContain(s)

    const more = render(createElement(MoreScreen))
    expect(more).toContain('Вайбик Pro активен')

    const settings = render(createElement(SettingsScreen))
    expect(settings).toContain('data-settings-subscription')
    expect(settings).toContain('Управлять подпиской')
    expect(settings).toContain('Отменить подписку')
    expect(settings).toContain('Статус')

    const pay = render(createElement(PaywallScreen, { title: 'Деплой' }))
    expect(pay).toContain('data-paywall="pro"')
    for (const s of BUY) expect(pay).not.toContain(s)
  })
})
