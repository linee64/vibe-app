/**
 * Гардероб Бипи: косметика для маскота за токены (progress.gems). Чистая логика без DOM — общая для веба и мобилки.
 *
 *  • Три слота: голова, лицо, образ (тело) — в каждом надето не больше одной вещи.
 *  • Цены — относительно дохода от заданий (~40 токенов в день за дневные + 70 за недельные):
 *    обычные 30–60 (день-два), редкие 100–200 (неделя), легендарные 300–500 (пара недель).
 *  • Две вещи — эксклюзив Pro: купить их можно только с подпиской (без неё — пейвол).
 *  • Купленное навсегда: progress.skins.owned; надетое — progress.skins.equipped. Синхронизируется с облаком
 *    (sanitizeSkins / mergeSkins). Повторная покупка и покупка без баланса невозможны (buySkin).
 *  • Рисунки вещей — src/components/BipiSkins.tsx, подписи — UI-каталоги skins.<id>.name / .desc.
 */

export type SkinSlot = 'head' | 'face' | 'body'
export type SkinRarity = 'common' | 'rare' | 'legendary'

export interface SkinDef {
  id: string
  slot: SkinSlot
  /** цена в токенах */
  price: number
  rarity: SkinRarity
  /** эксклюзив Pro */
  pro?: boolean
}

export const SKIN_SLOTS: SkinSlot[] = ['head', 'face', 'body']

export const SKINS: SkinDef[] = [
  { id: 'bowtie', slot: 'body', price: 30, rarity: 'common' },
  { id: 'cap', slot: 'head', price: 40, rarity: 'common' },
  { id: 'pixel-shades', slot: 'face', price: 50, rarity: 'common' },
  { id: 'headphones', slot: 'head', price: 60, rarity: 'common' },
  { id: 'round-glasses', slot: 'face', price: 100, rarity: 'rare' },
  { id: 'hoodie', slot: 'body', price: 150, rarity: 'rare' },
  { id: 'top-hat', slot: 'head', price: 180, rarity: 'rare' },
  { id: 'cape', slot: 'body', price: 200, rarity: 'rare' },
  { id: 'wizard-hat', slot: 'head', price: 200, rarity: 'rare' },
  { id: 'hacker-hood', slot: 'head', price: 300, rarity: 'legendary', pro: true },
  { id: 'astro-helmet', slot: 'head', price: 400, rarity: 'legendary', pro: true },
  { id: 'crown', slot: 'head', price: 500, rarity: 'legendary' },
]

export const findSkin = (id: string) => SKINS.find((s) => s.id === id)

export type SkinLook = Partial<Record<SkinSlot, string>>

export interface SkinState {
  /** купленные вещи (id из SKINS) */
  owned: string[]
  /** что надето: слот → id */
  equipped: SkinLook
}

export const emptySkins = (): SkinState => ({ owned: [], equipped: {} })

export type BuyFail = 'unknown' | 'owned' | 'pro' | 'balance'
export type BuyResult = { ok: true; state: SkinState; gems: number; skin: SkinDef } | { ok: false; reason: BuyFail }

/** Почему вещь нельзя купить прямо сейчас (null — можно) */
export function buyBlocker(state: SkinState | undefined, gems: number, id: string, isPro: boolean): BuyFail | null {
  const skin = findSkin(id)
  if (!skin) return 'unknown'
  if (state?.owned.includes(id)) return 'owned'
  if (skin.pro && !isPro) return 'pro'
  if (gems < skin.price) return 'balance'
  return null
}

/** Покупка: списываем токены ровно один раз и сразу надеваем вещь в её слот */
export function buySkin(state: SkinState | undefined, gems: number, id: string, isPro: boolean): BuyResult {
  const reason = buyBlocker(state, gems, id, isPro)
  if (reason) return { ok: false, reason }
  const skin = findSkin(id)!
  const s = state ?? emptySkins()
  return {
    ok: true,
    skin,
    gems: gems - skin.price,
    state: { owned: [...s.owned, id], equipped: { ...s.equipped, [skin.slot]: id } },
  }
}

/** Надеть купленную вещь (null — не куплена или неизвестна) */
export function equipSkin(state: SkinState | undefined, id: string): SkinState | null {
  const skin = findSkin(id)
  if (!skin || !state?.owned.includes(id)) return null
  if (state.equipped[skin.slot] === id) return state
  return { ...state, equipped: { ...state.equipped, [skin.slot]: id } }
}

/** Снять вещь из слота */
export function unequipSlot(state: SkinState | undefined, slot: SkinSlot): SkinState | undefined {
  if (!state?.equipped[slot]) return state
  const equipped = { ...state.equipped }
  delete equipped[slot]
  return { ...state, equipped }
}

/** Надетое, которое можно рисовать: только купленное и в своём слоте */
export function lookOf(state: SkinState | undefined): SkinLook {
  const look: SkinLook = {}
  if (!state) return look
  for (const slot of SKIN_SLOTS) {
    const id = state.equipped[slot]
    if (id && state.owned.includes(id) && findSkin(id)?.slot === slot) look[slot] = id
  }
  return look
}

/** Аккуратно читаем то, что пришло из облака/хранилища */
export function sanitizeSkins(raw: unknown): SkinState | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const r = raw as Record<string, unknown>
  const owned = Array.isArray(r.owned) ? [...new Set(r.owned.filter((x): x is string => typeof x === 'string' && !!findSkin(x)))] : []
  const eq = r.equipped && typeof r.equipped === 'object' && !Array.isArray(r.equipped) ? (r.equipped as Record<string, unknown>) : {}
  const state: SkinState = { owned, equipped: {} }
  for (const slot of SKIN_SLOTS) {
    const id = eq[slot]
    if (typeof id === 'string') state.equipped[slot] = id
  }
  state.equipped = lookOf(state)
  return state
}

/** Слияние: купленное — объединяем (ничего не теряем), надетое — как на этом устройстве, если тут что-то есть */
export function mergeSkins(local: SkinState | undefined, remote: SkinState | undefined): SkinState | undefined {
  if (!local) return remote
  if (!remote) return local
  const owned = [...new Set([...local.owned, ...remote.owned])]
  const localHas = Object.keys(lookOf(local)).length > 0
  const state: SkinState = { owned, equipped: { ...(localHas ? local.equipped : remote.equipped) } }
  state.equipped = lookOf(state)
  return state
}
