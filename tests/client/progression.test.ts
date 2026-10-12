import { describe, expect, it } from 'vitest'
import { UNITS } from '../../src/data/course'
import { currentNodeId, isNodeReachable, unitNodes } from '../../src/data/path'

const fresh = () => ({ completed: [] as string[], homework: [] as string[], tiersByTest: [] as string[], unlockAll: false })
const all = UNITS.flatMap((u) => unitNodes(u))

describe('путь строго по шагам', () => {
  it('новичку открыт только первый узел', () => {
    const p = fresh()
    expect(currentNodeId(p)).toBe(all[0].id)
    expect(isNodeReachable(all[0].id, p)).toBe(true)
    for (const n of all.slice(1)) expect(isNodeReachable(n.id, p), n.id).toBe(false)
  })

  it('после прохождения открывается ровно следующий, пройденные можно повторить', () => {
    const p = fresh()
    for (let i = 0; i < all.length - 1; i++) {
      const n = all[i]
      if (n.type === 'lesson') p.completed.push(n.id)
      else p.homework.push(n.id)
      expect(isNodeReachable(all[i + 1].id, p), all[i + 1].id).toBe(true)
      if (all[i + 2]) expect(isNodeReachable(all[i + 2].id, p), all[i + 2].id).toBe(false)
      expect(isNodeReachable(n.id, p)).toBe(true)
    }
  })

  it('уроки второго раздела (Pro) закрыты, пока не пройден первый — пейвол раньше времени не показывается', () => {
    const p = fresh()
    const u2 = unitNodes(UNITS[1])
    for (const n of u2) expect(isNodeReachable(n.id, p)).toBe(false)
  })

  it('режим ревью открывает всё', () => {
    const p = { ...fresh(), unlockAll: true }
    for (const n of all) expect(isNodeReachable(n.id, p)).toBe(true)
  })

  it('неизвестный узел закрыт', () => {
    expect(isNodeReachable('nope', fresh())).toBe(false)
  })
})
