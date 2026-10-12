/**
 * Узлы пути: уроки раздела + домашка. Домашка встаёт перед итоговым тестом (сундук/кубок):
 * сначала практика на мини-проекте, потом испытание раздела.
 */
import type { Lesson, Unit } from './types'
import { UNITS } from './course'
import { homeworkForUnit, type HomeworkDef } from './homework'
import { checkpointOf, tierOfUnit } from './tiers'

export type PathItem = { type: 'lesson'; id: string; lesson: Lesson; index: number } | { type: 'homework'; id: string; hw: HomeworkDef }

export function unitNodes(unit: Unit): PathItem[] {
  const items: PathItem[] = unit.lessons.map((lesson, index) => ({ type: 'lesson', id: lesson.id, lesson, index }))
  const hw = homeworkForUnit(unit.id)
  if (!hw) return items
  const cp = checkpointOf(unit)
  const at = items.findIndex((i) => i.id === cp.id)
  items.splice(at < 0 ? items.length : at, 0, { type: 'homework', id: hw.id, hw })
  return items
}

export const isNodeDone = (item: PathItem, p: { completed: string[]; homework: string[] }) =>
  item.type === 'lesson' ? p.completed.includes(item.id) : p.homework.includes(item.id)

export type PathProgress = { completed: string[]; homework: string[]; tiersByTest?: string[]; unlockAll?: boolean }

/** Тир засчитан старым «тестом на уровень» (тест убран, но заработанный доступ не отбираем) */
const legacyByTest = (unitId: string, p: PathProgress) => !!p.tiersByTest?.includes(tierOfUnit(unitId).id)

/** Текущий узел — первый непройденный по порядку пути (урок или домашка) */
export function currentNodeId(p: PathProgress) {
  for (const u of UNITS) {
    if (legacyByTest(u.id, p)) continue
    for (const n of unitNodes(u)) if (!isNodeDone(n, p)) return n.id
  }
  return null
}

/** Раздел, к которому относится узел пути (урок или домашка) */
export function unitOfNode(id: string): Unit | undefined {
  return UNITS.find((u) => unitNodes(u).some((n) => n.id === id))
}

/**
 * Строго по шагам: открыт пройденный узел (можно повторить) и следующий по порядку.
 * Всё, что дальше, — закрыто, пока не пройден предыдущий уровень. Режим ревью открывает всё.
 */
export function isNodeReachable(id: string, p: PathProgress) {
  if (p.unlockAll) return true
  if (p.completed.includes(id) || p.homework.includes(id)) return true
  const unit = unitOfNode(id)
  if (!unit) return false
  if (legacyByTest(unit.id, p)) return true
  return currentNodeId(p) === id
}
