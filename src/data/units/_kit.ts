// Мини-конструктор для контента: короткие хелперы для результатов ИИ (Outcome)
import type { MiniUI, Outcome, UIBlock } from '../types'

export const ui = (label: string, blocks: UIBlock[], opts: Omit<MiniUI, 'blocks'> = {}): Outcome => ({ type: 'ui', label, ui: { ...opts, blocks } })
export const page = (blocks: UIBlock[], opts: Omit<MiniUI, 'blocks'> = {}): MiniUI => ({ ...opts, blocks })
export const chat = (label: string, text: string, code?: string[]): Outcome => ({ type: 'chat', label, text, code })
export const code = (label: string, file: string, lines: string[]): Outcome => ({ type: 'code', label, file, lines })
export const term = (label: string, lines: string[]): Outcome => ({ type: 'terminal', label, lines })

/** Безликий «шаблон по умолчанию», который ИИ выдаёт на расплывчатый промпт */
export const GENERIC: UIBlock[] = [
  { t: 'nav', items: ['Главная', 'О нас', 'Контакты'], logo: 'My Website' },
  { t: 'h', text: 'Welcome to our website', size: 'lg' },
  { t: 'lorem', lines: 3 },
  { t: 'btn', text: 'Learn more', tone: 'grey' },
]
