import { describe, expect, it, vi } from 'vitest'
import { SKINS, SKIN_SLOTS, buyBlocker, buySkin, emptySkins, equipSkin, findSkin, lookOf, mergeSkins, sanitizeSkins, unequipSlot, type SkinState } from '../../src/data/skins'
import { ru } from '../../src/i18n/ui/ru'
import { en } from '../../src/i18n/ui/en'
import { es } from '../../src/i18n/ui/es'
import { kk } from '../../src/i18n/ui/kk'
import { zh } from '../../src/i18n/ui/zh'

vi.mock('../../src/lib/supabase', () => ({ getSupabase: async () => null }))
const { mergeProgress, sanitizeRemote } = await import('../../src/lib/progressSync')

const price = (id: string) => findSkin(id)!.price

describe('каталог вещей', () => {
  it('10–12 вещей, уникальные id, слоты голова/лицо/образ', () => {
    expect(SKINS.length).toBeGreaterThanOrEqual(10)
    expect(SKINS.length).toBeLessThanOrEqual(12)
    expect(new Set(SKINS.map((s) => s.id)).size).toBe(SKINS.length)
    for (const slot of SKIN_SLOTS) expect(SKINS.some((s) => s.slot === slot)).toBe(true)
  })

  it('цены по редкости: обычные 30–60, редкие 100–200, легендарные 300–500', () => {
    for (const s of SKINS) {
      const [lo, hi] = s.rarity === 'common' ? [30, 60] : s.rarity === 'rare' ? [100, 200] : [300, 500]
      expect(s.price, s.id).toBeGreaterThanOrEqual(lo)
      expect(s.price, s.id).toBeLessThanOrEqual(hi)
    }
  })

  it('ровно две вещи — эксклюзив Pro', () => {
    expect(SKINS.filter((s) => s.pro).length).toBe(2)
  })

  it('у каждой вещи есть название и описание на всех 5 языках', () => {
    for (const cat of [ru, en, es, kk, zh] as Record<string, unknown>[])
      for (const s of SKINS) {
        expect(cat[`skins.${s.id}.name`], s.id).toBeTruthy()
        expect(cat[`skins.${s.id}.desc`], s.id).toBeTruthy()
      }
  })
})

describe('покупка', () => {
  it('без баланса купить нельзя — токены и гардероб не меняются', () => {
    const r = buySkin(undefined, price('crown') - 1, 'crown', false)
    expect(r).toEqual({ ok: false, reason: 'balance' })
    expect(buyBlocker(undefined, 0, 'bowtie', false)).toBe('balance')
  })

  it('ровно хватает — покупка проходит, токены списываются один раз, вещь сразу надета', () => {
    const r = buySkin(undefined, 30, 'bowtie', false)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.gems).toBe(0)
    expect(r.state.owned).toEqual(['bowtie'])
    expect(r.state.equipped.body).toBe('bowtie')
  })

  it('повторная покупка не списывает токены второй раз', () => {
    const first = buySkin(emptySkins(), 100, 'cap', false)
    if (!first.ok) throw new Error('не купилось')
    const again = buySkin(first.state, first.gems, 'cap', false)
    expect(again).toEqual({ ok: false, reason: 'owned' })
    expect(first.gems).toBe(100 - price('cap'))
  })

  it('Pro-вещь без подписки — пейвол, с подпиской — покупается', () => {
    const pro = SKINS.find((s) => s.pro)!
    expect(buySkin(undefined, 9999, pro.id, false)).toEqual({ ok: false, reason: 'pro' })
    const r = buySkin(undefined, 9999, pro.id, true)
    expect(r.ok && r.gems).toBe(9999 - pro.price)
  })

  it('неизвестную вещь купить нельзя', () => {
    expect(buySkin(undefined, 9999, 'jetpack', true)).toEqual({ ok: false, reason: 'unknown' })
  })

  it('новая вещь в том же слоте заменяет надетую, старая остаётся купленной', () => {
    let s: SkinState | undefined
    let gems = 1000
    for (const id of ['cap', 'top-hat']) {
      const r = buySkin(s, gems, id, false)
      if (!r.ok) throw new Error(id)
      s = r.state
      gems = r.gems
    }
    expect(s!.equipped.head).toBe('top-hat')
    expect(s!.owned).toEqual(['cap', 'top-hat'])
    expect(gems).toBe(1000 - price('cap') - price('top-hat'))
  })
})

describe('надеть / снять', () => {
  const owned: SkinState = { owned: ['cap', 'pixel-shades', 'hoodie'], equipped: {} }

  it('надеть можно только купленное', () => {
    expect(equipSkin(owned, 'crown')).toBeNull()
    expect(equipSkin(owned, 'cap')!.equipped).toEqual({ head: 'cap' })
  })

  it('по одной вещи на слот, снять — освобождает слот', () => {
    let s = equipSkin(owned, 'cap')!
    s = equipSkin(s, 'pixel-shades')!
    s = equipSkin(s, 'hoodie')!
    expect(lookOf(s)).toEqual({ head: 'cap', face: 'pixel-shades', body: 'hoodie' })
    s = unequipSlot(s, 'face')!
    expect(lookOf(s)).toEqual({ head: 'cap', body: 'hoodie' })
  })
})

describe('хранение и синхронизация', () => {
  it('sanitizeSkins выкидывает мусор, чужие слоты и некупленное', () => {
    const s = sanitizeSkins({ owned: ['cap', 'cap', 'jetpack', 7], equipped: { head: 'cap', face: 'cap', body: 'hoodie' } })
    expect(s).toEqual({ owned: ['cap'], equipped: { head: 'cap' } })
    expect(sanitizeSkins('oops')).toBeUndefined()
  })

  it('слияние: купленное объединяется, надетое — с этого устройства', () => {
    const local: SkinState = { owned: ['cap'], equipped: { head: 'cap' } }
    const remote: SkinState = { owned: ['crown', 'hoodie'], equipped: { head: 'crown', body: 'hoodie' } }
    expect(mergeSkins(local, remote)).toEqual({ owned: ['cap', 'crown', 'hoodie'], equipped: { head: 'cap' } })
    expect(mergeSkins({ owned: ['cap'], equipped: {} }, remote)!.equipped).toEqual({ head: 'crown', body: 'hoodie' })
    expect(mergeSkins(undefined, remote)).toBe(remote)
  })

  it('гардероб едет в облако и обратно вместе с прогрессом', () => {
    const remote = sanitizeRemote({ completed: [], skins: { owned: ['bowtie'], equipped: { body: 'bowtie' } } })
    expect(remote!.skins).toEqual({ owned: ['bowtie'], equipped: { body: 'bowtie' } })
    const local = { ...(sanitizeRemote({ completed: [] }) as object), unlockAll: false, skins: { owned: ['cap'], equipped: { head: 'cap' } } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const merged = mergeProgress(local as any, remote)
    expect(merged.skins!.owned.sort()).toEqual(['bowtie', 'cap'])
  })
})
