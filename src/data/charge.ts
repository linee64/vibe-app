/**
 * Заряд Бипи — чистая логика по таймстемпам (общая для веба и мобилки, покрыта тестами).
 *  • Постепенно: +1 деление каждые RECHARGE_MS от chargeAt (момент начала отсчёта).
 *  • Гарантия: когда заряд дошёл до 0, запоминаем depletedAt; через FULL_RESTORE_MS после него
 *    заряд восстанавливается полностью — даже если таймер где-то потерялся.
 * Всё считается из таймстемпов при загрузке/фокусе, поэтому переживает перезагрузки и синк с облаком.
 */
import { CHARGE_MAX, FULL_RESTORE_MS, RECHARGE_MS } from './economy'

export interface ChargeState {
  hearts: number
  /** начало отсчёта до следующего деления (мс); нет — заряд полный */
  chargeAt?: number
  /** когда заряд сел до 0 (мс); нет — не садился с последнего полного */
  depletedAt?: number
}

const valid = (v: unknown, now: number): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= now

/** Пересчитать заряд на момент now */
export function settleCharge(s: ChargeState, now = Date.now()): ChargeState {
  let hearts = Math.max(0, Math.min(CHARGE_MAX, Math.floor(Number.isFinite(s.hearts) ? s.hearts : CHARGE_MAX)))
  if (hearts >= CHARGE_MAX) return { hearts: CHARGE_MAX }
  let depletedAt = valid(s.depletedAt, now) ? s.depletedAt : undefined
  if (hearts === 0 && !depletedAt) depletedAt = valid(s.chargeAt, now) ? s.chargeAt : now
  if (depletedAt && now - depletedAt >= FULL_RESTORE_MS) return { hearts: CHARGE_MAX }
  let chargeAt = valid(s.chargeAt, now) ? s.chargeAt : now
  const n = Math.floor((now - chargeAt) / RECHARGE_MS)
  if (n > 0) {
    hearts = Math.min(CHARGE_MAX, hearts + n)
    chargeAt += n * RECHARGE_MS
  }
  if (hearts >= CHARGE_MAX) return { hearts: CHARGE_MAX }
  return depletedAt ? { hearts, chargeAt, depletedAt } : { hearts, chargeAt }
}

/** Минус одно деление (ошибка) */
export function spendCharge(s: ChargeState, now = Date.now()): ChargeState {
  const cur = settleCharge(s, now)
  if (cur.hearts <= 0) return cur
  const hearts = cur.hearts - 1
  return {
    hearts,
    chargeAt: cur.chargeAt ?? now,
    ...(hearts === 0 ? { depletedAt: cur.depletedAt ?? now } : cur.depletedAt ? { depletedAt: cur.depletedAt } : {}),
  }
}

/** Плюс n делений (разбор ошибки, магазин) */
export function addChargeState(s: ChargeState, n: number, now = Date.now()): ChargeState {
  const cur = settleCharge(s, now)
  return settleCharge({ ...cur, hearts: Math.min(CHARGE_MAX, cur.hearts + n) }, now)
}

/** Когда будет следующее деление (null — заряд полный) */
export function nextChargeAt(s: ChargeState, now = Date.now()): number | null {
  const cur = settleCharge(s, now)
  if (cur.hearts >= CHARGE_MAX || !cur.chargeAt) return null
  const next = cur.chargeAt + RECHARGE_MS
  return cur.depletedAt ? Math.min(next, cur.depletedAt + FULL_RESTORE_MS) : next
}

/** Когда заряд будет полным (null — уже полный). Не позже depletedAt + 12 ч. */
export function fullChargeAt(s: ChargeState, now = Date.now()): number | null {
  const cur = settleCharge(s, now)
  if (cur.hearts >= CHARGE_MAX || !cur.chargeAt) return null
  const gradual = cur.chargeAt + (CHARGE_MAX - cur.hearts) * RECHARGE_MS
  return cur.depletedAt ? Math.min(gradual, cur.depletedAt + FULL_RESTORE_MS) : gradual
}

/** «ЧЧ:ММ» до момента at (округление минут вверх) */
export function hhmm(at: number, now = Date.now()) {
  const min = Math.max(0, Math.ceil((at - now) / 60000))
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

/**
 * Слияние заряда двух копий прогресса (локальная/облачная): каждую пересчитываем на now
 * и берём меньший заряд вместе с его таймерами. Старые облачные записи без таймеров
 * не могут «застрять» на нуле — для них верим локальной копии.
 */
export function mergeCharge(local: ChargeState, remote: Partial<ChargeState> | null | undefined, now = Date.now()): ChargeState {
  const l = settleCharge(local, now)
  if (!remote || typeof remote.hearts !== 'number') return l
  if (remote.hearts < CHARGE_MAX && !remote.chargeAt && !remote.depletedAt) return l
  const r = settleCharge(remote as ChargeState, now)
  return r.hearts < l.hearts ? r : l
}

/** Подставить пересчитанный заряд в объект прогресса (поля таймеров — только если есть) */
export function withChargeFields<T extends ChargeState>(p: T, c: ChargeState): T {
  const next = { ...p, hearts: c.hearts }
  delete next.chargeAt
  delete next.depletedAt
  if (c.chargeAt) next.chargeAt = c.chargeAt
  if (c.depletedAt) next.depletedAt = c.depletedAt
  return next
}
