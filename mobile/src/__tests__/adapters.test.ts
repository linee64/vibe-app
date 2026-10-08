/**
 * Тесты адаптеров мобильного приложения. Контент и логика упражнений живут в вебе (src/data) —
 * здесь проверяем только то, что мобильная обвязка не портит общий контракт.
 */
import { CHARGE_MAX, HINT_COST, RECHARGE_COST, RECHARGE_MS } from '@web/data/economy'
import { PRICES, TRIAL_DAYS } from '@web/data/pricing'
import { HOMEWORKS } from '@web/data/homework'
import { buildReviewRequest, mergeAiIntoPrompt } from '@web/homework/ai'
import { cardSim } from '@web/homework/sims'
import { mergeProgress, sanitizeRemote } from '@web/lib/progressSync'
import { accruedCharge, demoProgress, freshProgress, normalizeProgress, rollDay, today, type Progress } from '../store/progress'
import { demoOffers, PRODUCT_IDS } from '../lib/billing'
import { looksSecret } from '../lib/env'

const base = (): Progress => freshProgress()

describe('прогресс: форма, совместимая с вебом и Supabase', () => {
  it('normalizeProgress добирает поля и режет мусор', () => {
    const p = normalizeProgress({ xp: 10.9, gems: -3, hearts: 99, completed: ['u1-1', 5 as unknown as string], lastDay: 'не-дата', portfolioUrl: 'x'.repeat(400) } as Partial<Progress>, base())
    expect(p.xp).toBe(10)
    expect(p.gems).toBe(0)
    expect(p.hearts).toBe(CHARGE_MAX)
    expect(p.completed).toEqual(['u1-1'])
    expect(p.lastDay).toBe(today())
    expect(p.portfolioUrl.length).toBeLessThanOrEqual(300)
  })

  it('rollDay обнуляет дневные счётчики на новый день', () => {
    const p = rollDay({ ...base(), lastDay: '2020-01-01', todayXp: 40, lessonsToday: 2 })
    expect(p.todayXp).toBe(0)
    expect(p.lessonsToday).toBe(0)
    expect(p.lastDay).toBe(today())
  })

  it('слияние с облаком: max для счётчиков, min для заряда, объединение множеств', () => {
    const local = { ...base(), xp: 100, gems: 5, hearts: 4, completed: ['u1-1'], homework: [], lastDay: today() }
    const remote = sanitizeRemote({ xp: 80, gems: 30, hearts: 2, completed: ['u1-2'], homework: ['hw1'], lastDay: today(), unlockAll: true })
    const m = mergeProgress(local, remote) as Progress
    expect(m.xp).toBe(100)
    expect(m.gems).toBe(30)
    expect(m.hearts).toBe(2)
    expect(m.completed.sort()).toEqual(['u1-1', 'u1-2'])
    expect(m.homework).toEqual(['hw1'])
    expect(m.unlockAll).toBe(local.unlockAll)
  })

  it('демо-прогресс — та же форма, что и чистый', () => {
    const keys = Object.keys(demoProgress()).sort()
    expect(Object.keys(freshProgress()).sort()).toEqual(keys)
    expect(demoProgress().hearts).toBe(CHARGE_MAX)
  })
})

describe('заряд Бипи', () => {
  const now = 1_000_000_000_000
  it('полная батарейка не копит заряд', () => {
    expect(accruedCharge(CHARGE_MAX, now - RECHARGE_MS * 3, now)).toEqual({ hearts: CHARGE_MAX, chargeAt: null })
  })
  it('+1 деление за каждые RECHARGE_MS, не больше максимума', () => {
    const r = accruedCharge(2, now - RECHARGE_MS * 2.5, now)
    expect(r.hearts).toBe(4)
    expect(r.chargeAt).toBe(now - RECHARGE_MS * 2.5 + RECHARGE_MS * 2)
  })
  it('не переполняется', () => {
    expect(accruedCharge(4, now - RECHARGE_MS * 10, now).hearts).toBe(CHARGE_MAX)
  })
  it('цены магазина совпадают с веб-экономикой', () => {
    expect(HINT_COST).toBe(10)
    expect(RECHARGE_COST).toBe(30)
  })
})

describe('домашка: общий ИИ-мост', () => {
  const def = HOMEWORKS[0]
  it('buildReviewRequest собирает задачу и требования', () => {
    const req = buildReviewRequest(def, 'Напиши карточку', ['черновик'])
    expect(req.task.id).toBe(def.id)
    expect(req.requirements.map((r) => r.id)).toEqual(def.requirements.map((r) => r.id))
    expect(req.prompt).toBe('Напиши карточку')
    expect(req.history).toEqual(['черновик'])
  })
  it('mergeAiIntoPrompt только дополняет, не затирая засчитанное симулятором', () => {
    const s0 = cardSim.init()
    const after = cardSim.apply(s0, 'Напиши карточку товара для термокружки')
    const review = { score: 60, requirements: { role: true, goal: true, context: false, limits: false, format: false }, feedback: [], improved_prompt: '', detected_features: [], values: {} }
    const merged = mergeAiIntoPrompt(cardSim, def, after.state, 'Напиши карточку товара для термокружки', review)
    const again = cardSim.apply(after.state, merged.text)
    expect(cardSim.check(again.state, {})['goal']).toBe(true)
    expect(merged.added).toContain('role')
  })
})

describe('оплата', () => {
  it('демо-офферы совпадают с веб-тарифами и несут пробный период', () => {
    const offers = demoOffers()
    expect(offers.find((o) => o.plan === 'monthly')?.price).toBe('$9.99')
    expect(offers.find((o) => o.plan === 'annual')?.price).toBe('$59.99')
    expect(offers.every((o) => o.trialDays === TRIAL_DAYS)).toBe(true)
    expect(PRICES.monthly).toBe(999)
  })
  it('идентификаторы продуктов стабильны', () => {
    expect(PRODUCT_IDS).toEqual({ monthly: 'vaibik_pro_monthly', annual: 'vaibik_pro_annual' })
  })
  it('секретный ключ Supabase распознаётся и не пройдёт в клиент', () => {
    expect(looksSecret('sb_secret_xxx')).toBe(true)
    expect(looksSecret('sb_publishable_xxx')).toBe(false)
    const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')
    expect(looksSecret(`${header}.${payload}.sig`)).toBe(true)
  })
})
