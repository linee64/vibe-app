/** Вымышленные участники лиги — явно демо-данные */
export const SAMPLE_PLAYERS = [
  { name: 'Демо Дина', xp: 412, color: '#FF7A59' },
  { name: 'Тест Тимур', xp: 388, color: '#13C2AE' },
  { name: 'Пример Полина', xp: 351, color: '#2EB6F5' },
  { name: 'Бот Борис', xp: 297, color: '#FFC23D' },
  { name: 'Сэмпл Саша', xp: 276, color: '#FF4F6D' },
  { name: 'Макет Марат', xp: 198, color: '#7C4DFF' },
  { name: 'Фейк Фарида', xp: 164, color: '#0E9C8C' },
  { name: 'Заглушка Зарина', xp: 120, color: '#E0573A' },
  { name: 'Тест Тамара', xp: 87, color: '#5B2FD6' },
  { name: 'Лорем Ипсумов', xp: 41, color: '#8C86A3' },
  { name: 'Демо Данияр', xp: 12, color: '#2EB6F5' },
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
