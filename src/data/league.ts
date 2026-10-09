import { t } from '../i18n/core'
/** Вымышленные участники лиги — явно демо-данные */
export const SAMPLE_PLAYERS = [
  { get name() { return t('x0ce42t9') }, xp: 412, color: '#FF7A59' },
  { get name() { return t('x0mh4qme') }, xp: 388, color: '#13C2AE' },
  { get name() { return t('x13qjpte') }, xp: 351, color: '#2EB6F5' },
  { get name() { return t('x00ttl92') }, xp: 297, color: '#FFC23D' },
  { get name() { return t('x0z7ski4') }, xp: 276, color: '#FF4F6D' },
  { get name() { return t('x1enl4ww') }, xp: 198, color: '#7C4DFF' },
  { get name() { return t('x0jxpsoj') }, xp: 164, color: '#0E9C8C' },
  { get name() { return t('x17n5tmp') }, xp: 120, color: '#E0573A' },
  { get name() { return t('x0c68gnz') }, xp: 87, color: '#5B2FD6' },
  { get name() { return t('x0jnjqa2') }, xp: 41, color: '#8C86A3' },
  { get name() { return t('x1i6bevm') }, xp: 12, color: '#2EB6F5' },
]

export const PROMOTE = 5
export const DEMOTE = 3

export interface Row {
  name: string
  xp: number
  color: string
  me?: boolean
}

export function leagueRows(myName: string, todayXp: number): Row[] {
  const me: Row = { name: myName, xp: 231 + todayXp, color: '#7C4DFF', me: true }
  return [...SAMPLE_PLAYERS, me].sort((a, b) => b.xp - a.xp)
}

export function myStanding(myName: string, todayXp: number) {
  const rows = leagueRows(myName, todayXp)
  const rank = rows.findIndex((r) => r.me) + 1
  const me = rows[rank - 1]
  const toPromote = rank <= PROMOTE ? 0 : rows[PROMOTE - 1].xp - me.xp + 1
  return { rank, toPromote }
}
