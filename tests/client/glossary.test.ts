import { describe, expect, it } from 'vitest'
import { GLOSS_IDS, findTerm, glossPlan, splitGloss } from '../../src/data/glossary'
import { LOCALES } from '../../src/i18n/locales'
import { ru } from '../../src/i18n/ui/ru'
import { RAW_UNITS } from '../../src/i18n/content'

describe('словарик', () => {
  it('у каждого термина есть название и определение', () => {
    for (const id of GLOSS_IDS) {
      expect(ru).toHaveProperty(`gloss.${id}.term`)
      expect(ru).toHaveProperty(`gloss.${id}.def`)
    }
  })
  it('шаблоны компилируются для всех языков', () => {
    for (const l of LOCALES) for (const id of GLOSS_IDS) expect(() => findTerm('x', l, id)).not.toThrow()
  })
  it('находит слово с окончанием и не цепляет части других слов', () => {
    expect(findTerm('Хороший промпт решает', 'ru', 'prompt')).toEqual({ index: 8, length: 6 })
    expect(findTerm('в промптах', 'ru', 'prompt')?.length).toBe(8)
    expect(findTerm('вайб-кодинг — это', 'ru', 'code')).toBeNull()
    expect(findTerm('пришли код кнопки', 'ru', 'code')).toEqual({ index: 7, length: 3 })
    expect(findTerm('багаж', 'ru', 'bug')).toBeNull()
    expect(findTerm('ИИ-агент открыл файл', 'ru', 'ai')).toEqual({ index: 0, length: 2 })
    expect(findTerm('ИИ-агент открыл файл', 'ru', 'agent')).toEqual({ index: 3, length: 5 })
    expect(findTerm('maintain the plan', 'en', 'ai')).toBeNull()
    expect(findTerm('Ask the AI first', 'en', 'ai')).toEqual({ index: 8, length: 2 })
    expect(findTerm('用提示词描述', 'zh', 'prompt')).toEqual({ index: 1, length: 3 })
  })
  it('splitGloss режет текст без потерь', () => {
    const text = 'Опиши задачу: промпт → ИИ пишет код → проверь.'
    const segs = splitGloss(text, ['prompt', 'ai', 'code'], 'ru')
    expect(segs.map((s) => s.text).join('')).toBe(text)
    expect(segs.filter((s) => s.term).map((s) => s.term)).toEqual(['prompt', 'ai', 'code'])
  })
  it('план урока: каждый термин подсвечен ровно один раз — при первом появлении', () => {
    const lesson = RAW_UNITS[0].lessons[0]
    const plan = glossPlan(lesson.exercises, 'ru')
    const all = [...plan.values()].flatMap((m) => [...m.values()].flatMap((s) => [...s]))
    expect(new Set(all).size).toBe(all.length)
    // первый урок курса объясняет базовые слова
    for (const id of ['vibe', 'ai', 'code', 'prompt'] as const) expect(all).toContain(id)
    const first = plan.get(0)
    expect([...(first?.values() ?? [])].some((s) => s.has('vibe'))).toBe(true)
  })
})
