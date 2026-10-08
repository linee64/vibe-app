import { describe, expect, it } from 'vitest'
import { HOMEWORKS } from '../../src/data/homework'
import { cardSim, debugSim, deploySim, formSim, landingSim, type Sim } from '../../src/homework/sims'
import { AI_PROFILES, buildReviewRequest, mergeAiIntoPrompt } from '../../src/homework/ai'
import type { PromptReview } from '../../src/lib/review'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SIMS: Record<string, Sim<any, any>> = { hw1: cardSim, hw2: landingSim, hw3: debugSim, hw4: formSim, hw5: deploySim }

const review = (reqs: string[], features: string[] = [], values: Record<string, string> = {}): PromptReview => ({
  score: 80,
  requirements: Object.fromEntries(reqs.map((r) => [r, true])),
  feedback: ['ok'],
  improved_prompt: '',
  detected_features: features,
  values,
})

describe('ИИ → симулятор: канонические фразы', () => {
  for (const def of HOMEWORKS) {
    const sim = SIMS[def.id]
    const p = AI_PROFILES[def.id]
    it(`${def.id}: профиль есть для каждой домашки`, () => {
      expect(sim).toBeTruthy()
      expect(p).toBeTruthy()
    })
    const promptReqs = def.requirements.filter((r) => !p.uiReqs.includes(r.id) || def.id === 'hw2')

    it(`${def.id}: всё, что засчитал ИИ, засчитывает и симулятор (с UI-действиями)`, () => {
      // промпт своими словами — симулятор по ключевым словам ничего не видит
      const userPrompt = 'Пожалуйста, сделай всё как надо по заданию.'
      const ids = def.requirements.map((r) => r.id)
      const { text, added } = mergeAiIntoPrompt(sim, def, sim.init(), userPrompt, review(ids))
      expect(text.startsWith(userPrompt)).toBe(true)
      const turn = sim.apply(sim.init(), text)
      const ck = sim.check(turn.state, p.fullUi)
      for (const r of promptReqs) expect(ck[r.id], `${def.id}.${r.id}`).toBe(true)
      for (const r of promptReqs) expect(added).toContain(r.id)
    })

    it(`${def.id}: ИИ ничего не засчитал → промпт не меняется`, () => {
      const { text, added } = mergeAiIntoPrompt(sim, def, sim.init(), 'сделай красиво', review([]))
      expect(text).toBe('сделай красиво')
      expect(added).toEqual([])
    })

    it(`${def.id}: уже засчитанное симулятором не дублируется`, () => {
      const ids = def.requirements.map((r) => r.id)
      const full = mergeAiIntoPrompt(sim, def, sim.init(), 'x', review(ids)).text
      const again = mergeAiIntoPrompt(sim, def, sim.init(), full, review(ids))
      expect(again.added).toEqual([])
    })

    it(`${def.id}: запрос к API в допустимых границах`, () => {
      const req = buildReviewRequest(def, 'промпт', ['раньше'])
      expect(req.requirements.length).toBeGreaterThan(0)
      expect(req.requirements.length).toBeLessThanOrEqual(12)
      expect((req.features ?? []).length).toBeLessThanOrEqual(20)
      expect((req.values ?? []).length).toBeLessThanOrEqual(8)
      for (const r of req.requirements) expect(r.id).toMatch(/^[a-z0-9_-]{1,40}$/i)
    })
  }

  it('hw2: значения (название, кнопка, палитра) доходят до превью', () => {
    const def = HOMEWORKS.find((d) => d.id === 'hw2')!
    const { text } = mergeAiIntoPrompt(landingSim, def, landingSim.init(), 'Сайт для моей кофейной точки', review(['hero', 'cta', 'colors'], ['reviews'], { cafe_name: 'Бобы', cta_text: 'Заказать кофе', palette: 'бирюзовая' }))
    const s = landingSim.apply(landingSim.init(), text).state
    expect(s.name).toBe('Бобы')
    expect(s.ctaText).toBe('Заказать кофе')
    expect(s.palette).toBe('teal')
    expect(s.reviews).toBe(true)
  })

  it('hw4: утечка ключа не «лечится» ИИ-фразой', () => {
    const def = HOMEWORKS.find((d) => d.id === 'hw4')!
    const leaked = 'Подключи supabase, ключ sk_live_abcdef123456'
    const { text } = mergeAiIntoPrompt(formSim, def, formSim.init(), leaked, review(['secret']))
    const ck = formSim.check(formSim.apply(formSim.init(), text).state, { rows: [], saved: true })
    expect(ck.secret).toBe(false)
  })

  it('hw5: домен из ИИ используется, мусор — нет', () => {
    const def = HOMEWORKS.find((d) => d.id === 'hw5')!
    const all = ['commit', 'push', 'deploy', 'domain', 'analytics']
    const ok = mergeAiIntoPrompt(deploySim, def, deploySim.init(), 'выкати сайт', review(all, [], { domain: 'https://bobi.uz/', commit_message: 'Меню и контакты' }))
    const s = deploySim.apply(deploySim.init(), ok.text).state
    expect(s.domain).toBe('bobi.uz')
    expect(s.commit).toBe('Меню и контакты')
    const bad = mergeAiIntoPrompt(deploySim, def, deploySim.init(), 'выкати сайт', review(all, [], { domain: 'rm -rf /' }))
    expect(deploySim.apply(deploySim.init(), bad.text).state.domain).toBe('zerno-coffee.ru')
  })
})
