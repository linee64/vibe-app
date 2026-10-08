/**
 * Узлы пути: уроки раздела + домашка. Домашка встаёт перед итоговым тестом (сундук/кубок):
 * сначала практика на мини-проекте, потом испытание раздела.
 */
import type { Lesson, Unit } from './types'
import { UNITS } from './course'
import { homeworkForUnit, type HomeworkDef } from './homework'
import { checkpointOf } from './tiers'

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

/** Текущий узел — первый непройденный по порядку пути (урок или домашка) */
export function currentNodeId(p: { completed: string[]; homework: string[] }) {
  for (const u of UNITS) for (const n of unitNodes(u)) if (!isNodeDone(n, p)) return n.id
  return null
}
