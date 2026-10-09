import { beforeAll, describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LOCALES, PLURAL_CATEGORIES, detectLocale, formatUsd, getLocale, loadLocale, placeholders, pluralCategory, setLocale, t, type Catalog, type Locale } from '../../src/i18n'
import { tx } from '../../src/i18n/rich'
import { ru } from '../../src/i18n/ui/ru'
import { RAW_UNITS, getLocalizedHomework, getLocalizedLesson } from '../../src/i18n/content'
import { getLocalizedSims } from '../../src/i18n/homework/sims'
import { HOMEWORKS_RU, type HomeworkDef } from '../../src/data/homework'
import { AI_PROFILES, mergeAiIntoPrompt } from '../../src/homework/ai'
import { BUG_CODE, BUG_ERROR, type Sim } from '../../src/homework/sims'

const OTHER = LOCALES.filter((l) => l !== 'ru') as Exclude<Locale, 'ru'>[]
const catalogs: Partial<Record<Locale, Catalog>> = {}

beforeAll(async () => {
  for (const l of OTHER) {
    await loadLocale(l)
    catalogs[l] = (await import(`../../src/i18n/ui/${l}.ts`))[l] as Catalog
  }
})

describe('плюралы', () => {
  it('ru: one/few/many', () => {
    expect([1, 2, 5, 11, 21, 22, 25].map((n) => pluralCategory('ru', n))).toEqual(['one', 'few', 'many', 'many', 'one', 'few', 'many'])
  })
  it('en/es/kk: one/other, zh: other', () => {
    expect(pluralCategory('en', 1)).toBe('one')
    expect(pluralCategory('en', 3)).toBe('other')
    expect(pluralCategory('es', 1)).toBe('one')
    expect(pluralCategory('kk', 2)).toBe('other')
    expect(pluralCategory('zh', 1)).toBe('other')
  })
  it('t() выбирает форму по n', async () => {
    expect(t('economy.tokens', { n: 2 }, 'ru')).toBe('2 токена')
    expect(t('economy.tokens', { n: 5 }, 'ru')).toBe('5 токенов')
    expect(t('economy.tokens', { n: 1 }, 'en')).toBe('1 token')
    expect(t('economy.tokens', { n: 3 }, 'en')).toBe('3 tokens')
    expect(t('diff.changedPlaces', { n: 3 }, 'zh')).toBe('AI 改了 3 处：')
  })
})

describe('каталоги UI', () => {
  const keys = Object.keys(ru) as (keyof typeof ru)[]
  for (const l of OTHER) {
    it(`${l}: все ключи, те же плейсхолдеры и теги, нужные плюральные формы`, () => {
      const cat = catalogs[l]!
      const forms = (m: unknown) => (typeof m === 'string' ? [m] : Object.values(m as object) as string[])
      const ph = (m: unknown) => [...new Set(forms(m).flatMap(placeholders))].sort().join()
      const tags = (m: unknown) => [...new Set(forms(m).flatMap((f) => f.match(/<\/?\d+\/?>/g) ?? []))].sort().join()
      for (const k of keys) {
        const m = cat[k]
        expect(m, `${l}.${k}`).toBeDefined()
        expect(ph(m), `${l}.${k}`).toBe(ph(ru[k]))
        expect(tags(m), `${l}.${k}`).toBe(tags(ru[k]))
        if (typeof m !== 'string') expect(Object.keys(m).sort(), `${l}.${k}`).toEqual([...PLURAL_CATEGORIES[l]].sort())
      }
      for (const k of Object.keys(cat)) expect(k in ru, `${l}: лишний ${k}`).toBe(true)
    })
  }
  it('фолбэк на ru для неизвестного ключа в языке', () => {
    // @ts-expect-error — намеренно несуществующий ключ
    expect(t('no.such.key', undefined, 'en')).toBe('no.such.key')
    expect(t('meta.title', undefined, 'en')).toBe('Vaibik — learn vibe coding')
  })
  it('интерполяция', () => {
    expect(t('layout.rank', { rank: 3 }, 'es')).toBe('Estás en el <0>puesto 3</0>.')
  })
})

describe('detectLocale', () => {
  it('сохранённый выбор важнее системы', () => expect(detectLocale({ stored: 'kk', languages: ['en-US'] })).toBe('kk'))
  it('uk/be → ru', () => expect(detectLocale({ stored: null, languages: ['uk-UA'] })).toBe('ru'))
  it('zh-TW / zh-Hans → zh', () => {
    expect(detectLocale({ stored: null, languages: ['zh-TW'] })).toBe('zh')
    expect(detectLocale({ stored: null, languages: ['zh-Hans-CN'] })).toBe('zh')
  })
  it('es-MX → es, kk-KZ → kk', () => {
    expect(detectLocale({ stored: null, languages: ['es-MX'] })).toBe('es')
    expect(detectLocale({ stored: null, languages: ['kk-KZ'] })).toBe('kk')
  })
  it('незнакомый язык → en; мусор в хранилище игнорируется', () => {
    expect(detectLocale({ stored: 'xx', languages: ['de-DE', 'fr'] })).toBe('en')
    expect(detectLocale({ stored: null, languages: [] })).toBe('en')
  })
})

describe('цены в USD во всех языках', () => {
  for (const l of LOCALES) it(l, () => expect(formatUsd(999, l)).toMatch(/\$|US\$|USD/))
})

describe('tx: разметка в переводах', () => {
  it('теги и параметры рендерятся', async () => {
    await setLocale('en', { persist: false })
    const html = renderToStaticMarkup(createElement('p', null, tx('layout.rank', { rank: 2 }, [(c) => createElement('b', null, c)])))
    expect(html).toBe('<p>You’re <b>#2</b>.</p>')
    await setLocale('ru', { persist: false })
    expect(getLocale()).toBe('ru')
  })
})

/** Строковые поля → '' : структура (ответы, id, порядок) должна совпадать с ru */
const shape = (x: unknown): unknown =>
  typeof x === 'string' ? '' : Array.isArray(x) ? x.map(shape) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, shape(v)])) : x

describe('контент курса', () => {
  const lessons = RAW_UNITS.flatMap((u) => u.lessons)
  for (const l of OTHER) {
    it(`${l}: структура уроков и позиции ответов как в ru`, () => {
      for (const ls of lessons) {
        const loc = getLocalizedLesson(ls.id, l)!
        const src = getLocalizedLesson(ls.id, 'ru')!
        expect(shape(loc), `${l}/${ls.id}`).toEqual(shape(src))
        if (l !== 'kk') expect(loc.title, `${l}/${ls.id}`).not.toBe(src.title) // kk: «Аналитика» и т.п. совпадают законно
      }
    })
  }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySim = Sim<any, any>
const UI_ACTIONS: Record<string, Record<string, unknown>> = {
  viewMobile: { viewedMobile: true, device: 'phone' },
  addTask: { verified: true },
  submitForm: { saved: true },
  openSite: { opened: true },
}
function run(sim: AnySim, hw: HomeworkDef, steps: HomeworkDef['solution']) {
  let s = sim.init()
  let ui = sim.initUi()
  let draft = ''
  for (const st of steps) {
    if ('block' in st) draft += (draft ? ' ' : '') + hw.blocks.find((b) => b.label === st.block)!.text
    else if ('type' in st) draft += (draft ? ' ' : '') + st.type
    else if ('send' in st) {
      s = sim.apply(s, draft).state
      draft = ''
    } else if (st.action === 'copyError') draft += (draft ? '\n' : '') + BUG_ERROR
    else if (st.action === 'copyCode') draft += (draft ? '\n' : '') + BUG_CODE.join('\n')
    else ui = { ...ui, ...UI_ACTIONS[st.action] }
  }
  return sim.check(s, ui) as Record<string, boolean>
}

describe('домашки: локализованные симуляторы', () => {
  for (const l of LOCALES) {
    const sims = getLocalizedSims(l) as unknown as Record<string, AnySim>
    for (const base of HOMEWORKS_RU) {
      it(`${l}/${base.id}: «правильный путь» проходит, расплывчатый промпт — нет`, () => {
        const hw = l === 'ru' ? base : getLocalizedHomework(base.id, l)!
        const sim = sims[hw.id]
        for (const st of hw.solution) if ('block' in st) expect(hw.blocks.some((b) => b.label === st.block), `${l}/${hw.id} блок ${st.block}`).toBe(true)
        const ok = run(sim, hw, hw.solution)
        for (const r of hw.requirements) expect(ok[r.id], `${l}/${hw.id}.${r.id}`).toBe(true)
        const vague = run(sim, hw, [{ type: hw.vague }, { send: true }])
        expect(hw.requirements.filter((r) => vague[r.id]).length).toBeLessThan(2)
      })
      it(`${l}/${base.id}: то, что засчитал ИИ, засчитывает и симулятор`, () => {
        const hw = l === 'ru' ? base : getLocalizedHomework(base.id, l)!
        const sim = sims[hw.id]
        const p = AI_PROFILES[hw.id]
        const ids = hw.requirements.map((r) => r.id)
        const review = { score: 80, requirements: Object.fromEntries(ids.map((r) => [r, true])), feedback: [], improved_prompt: '', detected_features: [], values: {} }
        const { text } = mergeAiIntoPrompt(sim, hw, sim.init(), 'Please do everything the task asks.', review)
        const ck = sim.check(sim.apply(sim.init(), text).state, p.fullUi) as Record<string, boolean>
        for (const r of hw.requirements.filter((r) => !p.uiReqs.includes(r.id) || hw.id === 'hw2')) expect(ck[r.id], `${l}/${hw.id}.${r.id}`).toBe(true)
      })
    }
  }
})
