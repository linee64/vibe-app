/**
 * Переводы контента — это данные-«накладки» (overlay) поверх русского источника.
 *
 * Накладка повторяет форму исходного объекта, но содержит только текстовые поля:
 *  • строка заменяет строку (пустая строка = нет перевода → остаётся русский текст);
 *  • объект накладывается по ключам;
 *  • массив накладывается поэлементно; вместо массива можно дать «разреженный» объект
 *    с индексами ({ 2: '…' }) — тогда переводятся только эти элементы.
 * Числа, флаги и служебные поля (kind, correct, power, tone…) накладкой не меняются никогда —
 * поэтому правильные ответы и их позиции совпадают с русским источником по построению.
 */
export type Tr = string | TrList | TrMap
export type TrList = Tr[]
export interface TrMap {
  [key: string]: Tr | undefined
}

/** Перевод одного упражнения: накладка на объект Exercise (только текстовые поля) */
export type ExerciseTr = TrMap

export interface LessonTr {
  title?: string
  /** По индексу упражнения в уроке (как в src/data/units/*.ts). Длина = числу упражнений. */
  ex: ExerciseTr[]
}

export interface UnitTr {
  title?: string
  subtitle?: string
  description?: string
  /** Ключ — стабильный id урока (u1-1 …) */
  lessons: Record<string, LessonTr>
}

export interface TierTr {
  name: string
  outcome: string
  skills: string[]
}

export interface TiersTr {
  tiers: Record<'novice' | 'mid' | 'pro', TierTr>
  soon: string[]
}

export interface EconomyTr {
  /** Сокращение очков: ВП / VP */
  vp: string
  terms: {
    charge: string
    tokens: string
    streak: string
    vibePoints: string
  }
  shop: Record<'hint' | 'recharge' | 'skin', { title: string; desc: string }>
}

/** Перевод домашки: накладка на HomeworkDef (requirements/blocks/solution — по индексам) */
export type HomeworkTr = TrMap

export interface ContentPack {
  units: Record<'u1' | 'u2' | 'u3' | 'u4' | 'u5', UnitTr>
  homework: Record<'hw1' | 'hw2' | 'hw3' | 'hw4' | 'hw5', HomeworkTr>
  tiers: TiersTr
  economy: EconomyTr
  /**
   * Общие строки из src/data/units/_kit.ts (например, GENERIC-шаблон), которые встречаются во многих
   * упражнениях как один и тот же объект. Подставляются по точному совпадению, если накладка их не перевела.
   */
  kit: Record<string, string>
}
