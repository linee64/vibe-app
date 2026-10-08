/**
 * Экономика Вайбика (своя, не «сердечки и кристаллы»):
 *  • Заряд Бипи — батарейка из 5 делений (поле progress.hearts). Ошибка тратит деление,
 *    заряд сам восстанавливается со временем и за разбор/исправление ошибок — это не наказание, а пауза.
 *  • Токены — валюта (поле progress.gems): подсказки Бипи, мгновенная подзарядка, косметика.
 *  • Деплой-серия — дни подряд с уроками (поле progress.streak).
 *  • Вайб-поинты (ВП) — очки за уроки (поле progress.xp).
 * Имена полей в сторе не меняются — так совместимы облачная синхронизация и старые сохранения.
 */
export const CHARGE_MAX = 5
/** +1 деление заряда каждые N минут */
export const RECHARGE_MINUTES = 20
export const RECHARGE_MS = RECHARGE_MINUTES * 60 * 1000
/** Подсказка Бипи в упражнении */
export const HINT_COST = 10
/** Мгновенная полная подзарядка */
export const RECHARGE_COST = 30

export const VP = 'ВП'

export interface ShopItem {
  id: string
  title: string
  desc: string
  cost: number
  soon?: boolean
}

export const SHOP: ShopItem[] = [
  { id: 'hint', title: 'Подсказка Бипи', desc: 'В уроке: Бипи вычеркнет неверный вариант или пометит ловушку', cost: HINT_COST },
  { id: 'recharge', title: 'Полная подзарядка', desc: 'Сразу все 5 делений заряда', cost: RECHARGE_COST },
  { id: 'skin', title: 'Скин Бипи «Неон»', desc: 'Косметика для маскота', cost: 150, soon: true },
]

/** 1 токен, 2 токена, 5 токенов */
export function plural(n: number, one: string, few: string, many: string) {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return many
  if (b === 1) return one
  if (b >= 2 && b <= 4) return few
  return many
}
export const tokens = (n: number) => `${n} ${plural(n, 'токен', 'токена', 'токенов')}`
export const days = (n: number) => `${n} ${plural(n, 'день', 'дня', 'дней')}`

/** «через 12 мин» до следующего деления */
export function waitText(at: number | null, now = Date.now()) {
  if (!at) return ''
  const min = Math.max(1, Math.ceil((at - now) / 60000))
  return `через ${min} мин`
}
