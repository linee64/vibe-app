import { describe, expect, it, vi } from 'vitest'
import { CHARGE_MAX, FULL_RESTORE_MS, RECHARGE_MS } from '../../src/data/economy'
import { addChargeState, fullChargeAt, hhmm, mergeCharge, nextChargeAt, settleCharge, spendCharge } from '../../src/data/charge'

vi.mock('../../src/lib/supabase', () => ({ getSupabase: async () => null }))
const { mergeProgress, sanitizeRemote } = await import('../../src/lib/progressSync')

const now = 1_800_000_000_000
const H = 3600_000

describe('заряд Бипи: таймстемпы', () => {
  it('полный заряд без таймеров', () => {
    expect(settleCharge({ hearts: CHARGE_MAX, chargeAt: now - 1000, depletedAt: now - 1000 }, now)).toEqual({ hearts: CHARGE_MAX })
  })
  it('ошибка с полного заряда запускает отсчёт', () => {
    expect(spendCharge({ hearts: CHARGE_MAX }, now)).toEqual({ hearts: 4, chargeAt: now })
  })
  it('последнее деление → запоминаем depletedAt', () => {
    const s = spendCharge({ hearts: 1, chargeAt: now - 1000 }, now)
    expect(s).toEqual({ hearts: 0, chargeAt: now - 1000, depletedAt: now })
  })
  it('постепенно: +1 каждые RECHARGE_MS, остаток отсчёта сохраняется', () => {
    const s = settleCharge({ hearts: 1, chargeAt: now - RECHARGE_MS * 2.5 }, now)
    expect(s.hearts).toBe(3)
    expect(s.chargeAt).toBe(now - RECHARGE_MS * 0.5)
  })
  it('гарантия: через 12 ч после нуля заряд полный — даже если отсчёт потерян/сброшен', () => {
    expect(settleCharge({ hearts: 0, chargeAt: now, depletedAt: now - FULL_RESTORE_MS }, now).hearts).toBe(CHARGE_MAX)
    expect(settleCharge({ hearts: 0, depletedAt: now - FULL_RESTORE_MS - 1 }, now).hearts).toBe(CHARGE_MAX)
    expect(settleCharge({ hearts: 0, chargeAt: now, depletedAt: now - FULL_RESTORE_MS + 60_000 }, now).hearts).toBe(0)
  })
  it('ноль без таймеров (старое сохранение) не застревает навсегда', () => {
    const s = settleCharge({ hearts: 0 }, now)
    expect(s.depletedAt).toBe(now)
    expect(settleCharge(s, now + FULL_RESTORE_MS).hearts).toBe(CHARGE_MAX)
  })
  it('таймстемпы из будущего игнорируются', () => {
    const s = settleCharge({ hearts: 2, chargeAt: now + 10 * H }, now)
    expect(s.chargeAt).toBe(now)
  })
  it('разбор ошибки добавляет деление и не теряет depletedAt', () => {
    expect(addChargeState({ hearts: 0, chargeAt: now, depletedAt: now }, 1, now)).toEqual({ hearts: 1, chargeAt: now, depletedAt: now })
  })
  it('время до полного заряда не позже depletedAt + 12 ч', () => {
    expect(fullChargeAt({ hearts: 0, chargeAt: now, depletedAt: now }, now)).toBe(now + CHARGE_MAX * RECHARGE_MS)
    expect(fullChargeAt({ hearts: 0, chargeAt: now, depletedAt: now - FULL_RESTORE_MS + 60_000 }, now)).toBe(now + 60_000)
    expect(fullChargeAt({ hearts: CHARGE_MAX }, now)).toBeNull()
    expect(nextChargeAt({ hearts: 3, chargeAt: now - 1000 }, now)).toBe(now - 1000 + RECHARGE_MS)
  })
  it('hhmm', () => {
    expect(hhmm(now + 11 * H + 59 * 60_000 + 1, now)).toBe('12:00')
    expect(hhmm(now + 100 * 60_000, now)).toBe('01:40')
    expect(hhmm(now - 5, now)).toBe('00:00')
  })
})

describe('заряд Бипи: облачный синк', () => {
  it('устаревшая облачная копия с нулём не «съедает» восстановленный заряд (корень бага)', () => {
    const dep = now - 13 * H
    const remote = { hearts: 0, chargeAt: dep, depletedAt: dep }
    expect(mergeCharge({ hearts: CHARGE_MAX }, remote, now).hearts).toBe(CHARGE_MAX)
  })
  it('старая облачная запись без таймеров не держит ноль', () => {
    expect(mergeCharge({ hearts: 3, chargeAt: now }, { hearts: 0 }, now).hearts).toBe(3)
  })
  it('свежая трата на другом устройстве учитывается', () => {
    const m = mergeCharge({ hearts: CHARGE_MAX }, { hearts: 2, chargeAt: now - 1000 }, now)
    expect(m).toEqual({ hearts: 2, chargeAt: now - 1000 })
  })
  it('sanitizeRemote/mergeProgress переносят таймеры', () => {
    const r = sanitizeRemote({ hearts: 0, chargeAt: now - 1000, depletedAt: now - 1000 })
    expect(r?.depletedAt).toBe(now - 1000)
    vi.useFakeTimers()
    vi.setSystemTime(now)
    const local = { completed: [], xp: 0, gems: 0, hearts: 5, streak: 0, todayXp: 0, perfectToday: 0, lessonsToday: 0, lastDay: '2026-10-12', homework: [], tiersByTest: [], tiersCelebrated: [], unlockAll: false, placementSeen: false, portfolioUrl: '' }
    const m = mergeProgress(local, r)
    expect(m.hearts).toBe(0)
    expect(m.depletedAt).toBe(now - 1000)
    vi.setSystemTime(now + FULL_RESTORE_MS)
    expect(mergeProgress(local, r).hearts).toBe(CHARGE_MAX)
    vi.useRealTimers()
  })
})
