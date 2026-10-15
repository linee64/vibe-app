/**
 * Pro скрывает карточку тарифа в приложении: статус из RevenueCat (CustomerInfo), демо-переключатель
 * и правила общего модуля @web/data/proStatus для iPhone.
 */
import { FREE, fromPolar, managePlan, mergePro, showPlanPurchase } from '@web/data/proStatus'
import { getProStatus, setDemoPro, statusFromInfo } from '../lib/billing'

const FUTURE = new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString()
const info = (active: Record<string, object>) => ({ entitlements: { active: active as never } })

describe('статус Pro из RevenueCat', () => {
  it('нет entitlement → Free, карточка тарифа видна', () => {
    const s = statusFromInfo(info({}))
    expect(s).toEqual(FREE)
    expect(showPlanPurchase(s)).toBe(true)
  })

  it('«Vaibik Pro» (годовой, App Store) → Pro, карточка тарифа скрыта', () => {
    const s = statusFromInfo(info({ 'Vaibik Pro': { productIdentifier: 'com.vaibik.app.pro.yearly', isActive: true, willRenew: true, periodType: 'NORMAL', expirationDate: FUTURE, store: 'APP_STORE' } }))
    expect(s).toMatchObject({ pro: true, source: 'app_store', plan: 'annual', state: 'active', periodEnd: FUTURE })
    expect(showPlanPurchase(s)).toBe(false)
  })

  it('отменили в App Store (willRenew=false) → «отменена», но Pro до конца периода', () => {
    const s = statusFromInfo(info({ 'vaibik pro': { productIdentifier: 'com.vaibik.app.pro.monthly', isActive: true, willRenew: false, periodType: 'NORMAL', expirationDate: FUTURE, store: 'APP_STORE' } }))
    expect(s).toMatchObject({ pro: true, state: 'cancelled', plan: 'monthly' })
    expect(showPlanPurchase(s)).toBe(false)
  })

  it('пробный период', () => {
    const s = statusFromInfo(info({ pro: { productIdentifier: 'com.vaibik.app.pro.monthly', isActive: true, willRenew: true, periodType: 'TRIAL', expirationDate: FUTURE, store: 'APP_STORE' } }))
    expect(s).toMatchObject({ state: 'trialing', trialEnd: FUTURE })
  })
})

describe('управление подпиской на iPhone', () => {
  it('куплено в App Store → кнопка «Управлять/Отменить» открывает Apple; куплено на сайте → подсказка', () => {
    const ios = statusFromInfo(info({ 'Vaibik Pro': { productIdentifier: 'com.vaibik.app.pro.yearly', isActive: true, willRenew: true, expirationDate: FUTURE, store: 'APP_STORE' } }))
    expect(managePlan(ios, 'ios')).toEqual({ action: 'app_store', elsewhere: null })
    const web = fromPolar({ status: 'active', plan: 'annual', current_period_end: FUTURE, trial_end: null })
    expect(managePlan(web, 'ios')).toEqual({ action: null, elsewhere: 'web' })
    // подписка с сайта тоже даёт Pro в приложении — карточку тарифа не показываем
    expect(showPlanPurchase(mergePro('ios', web, FREE))).toBe(false)
  })
})

describe('демо: «Pro включён / выключен»', () => {
  it('setDemoPro переключает общий статус сразу', () => {
    setDemoPro(true)
    expect(getProStatus()).toMatchObject({ pro: true, source: 'demo', plan: 'annual' })
    expect(showPlanPurchase(getProStatus())).toBe(false)
    setDemoPro(false)
    expect(getProStatus().pro).toBe(false)
    expect(showPlanPurchase(getProStatus())).toBe(true)
  })
})
