export type NodeKind = 'star' | 'book' | 'dumbbell' | 'chest' | 'trophy'
export type UnitColor = 'brand' | 'coral' | 'teal' | 'deep' | 'amber'

/* ------------------------------------------------------------------ Мини-превью результатов ИИ */

/** Блоки, из которых рисуется мини-превью страницы (рамка браузера) */
export type UIBlock =
  | { t: 'nav'; items: string[]; logo?: string }
  | { t: 'h'; text: string; size?: 'xl' | 'lg' | 'md'; align?: 'center' }
  | { t: 'p'; text: string; muted?: boolean; align?: 'center' }
  | { t: 'btn'; text: string; tone?: 'brand' | 'coral' | 'teal' | 'grey' | 'ghost'; full?: boolean }
  | { t: 'img'; label?: string; h?: number }
  | { t: 'cards'; items: string[]; cols?: 1 | 2 | 3 }
  | { t: 'list'; items: string[] }
  | { t: 'input'; label: string; value?: string; error?: string }
  | { t: 'rows'; items: [string, string][] }
  | { t: 'note'; text: string; tone: 'coral' | 'teal' | 'amber' | 'violet' }
  | { t: 'lorem'; lines?: number }
  | { t: 'split'; left: UIBlock[]; right: UIBlock[] }

export interface MiniUI {
  url?: string
  /** plain — нейтрально-серый «шаблон», brand/warm/dark — оформленные */
  theme?: 'plain' | 'brand' | 'warm' | 'dark'
  /** узкая рамка телефона */
  mobile?: boolean
  blocks: UIBlock[]
}

/** Что «выдал» ИИ: превью страницы, ответ в чате, код или терминал */
export type Outcome =
  | { type: 'ui'; label: string; ui: MiniUI }
  | { type: 'chat'; label: string; text: string; code?: string[] }
  | { type: 'code'; label: string; file: string; lines: string[] }
  | { type: 'terminal'; label: string; lines: string[] }

/* ------------------------------------------------------------------ Упражнения */

interface ExerciseBase {
  title: string
  /** Реплика Бипи / условие задачи */
  prompt?: string
  /** Объяснение «почему» — показывается после проверки */
  explain: string
}

/** «Ситуация»: карточка-сценарий → что сделаешь? (не больше 25% упражнений) */
export interface ChoiceExercise extends ExerciseBase {
  kind: 'choice'
  /** Описание ситуации (карточка) */
  situation?: string
  options: string[]
  correct: number
  /** варианты — это реплики/промпты (показываются как цитаты) */
  quoted?: boolean
}

/** «Дуэль промптов»: два промпта и их результаты → кто победил → почему */
export interface DuelExercise extends ExerciseBase {
  kind: 'duel'
  sides: [DuelSide, DuelSide]
  /** индекс победившей стороны */
  winner: 0 | 1
  /** варианты причины победы */
  reasons: string[]
  reason: number
}
export interface DuelSide {
  prompt: string
  result: Outcome
}

/** «Предскажи результат»: промпт → какой результат выдаст ИИ */
export interface PredictExercise extends ExerciseBase {
  kind: 'predict'
  /** промпт / сообщение, которое отправили ИИ (или описание действия) */
  input: string
  /** код, о котором идёт речь (показывается под сообщением) */
  code?: string[]
  /** подпись окна: «Чат с ИИ», «ИИ-редактор», «Конструктор сайтов»… */
  tool?: string
  outcomes: Outcome[]
  correct: number
}

/** «Прокачай промпт»: слабый промпт + чипы-улучшения (часть — ловушки) → Вайб-метр */
export interface UpgradeExercise extends ExerciseBase {
  kind: 'upgrade'
  /** исходный слабый промпт */
  base: string
  /** стартовое значение Вайб-метра, 0–100 */
  start: number
  /** порог «Вайб достигнут» */
  target: number
  chips: UpgradeChip[]
}
export interface UpgradeChip {
  /** короткий ярлык: «Контекст», «Формат», «Стиль»… (у ловушек тоже правдоподобный) */
  tag: string
  /** текст, который вставится в промпт */
  text: string
  /** вклад в Вайб-метр: > 0 у полезных; у ловушек игнорируется (они всегда тянут вниз) */
  power: number
  /** если задано — чип-ловушка, а здесь объяснение почему */
  trap?: string
}

/** «Следующий ход»: короткий чат с ИИ (с неидеальным ответом) → лучшее следующее сообщение */
export interface NextMoveExercise extends ExerciseBase {
  kind: 'nextmove'
  chat: ChatMsg[]
  options: string[]
  correct: number
}
export interface ChatMsg {
  from: 'me' | 'ai'
  text: string
  code?: string[]
  preview?: MiniUI
}

/** «Ревью правок ИИ»: дифф по кускам → принять / отклонить каждый */
export interface DiffExercise extends ExerciseBase {
  kind: 'diff'
  /** о чём ты просил ИИ */
  request: string
  hunks: DiffHunk[]
}
export interface DiffHunk {
  file: string
  /** строки с префиксом '+', '-' или ' ' */
  lines: string[]
  /** вредный кусок — его нужно отклонить; текст = почему */
  harmful?: string
}

/** «Найди баг» / «Красный флаг»: тап по строке кода или фразе в ответе ИИ */
export interface BugExercise extends ExerciseBase {
  kind: 'bug'
  file: string
  code: string[]
  correct: number
  /** text — строки это фразы ответа ИИ в чате (красный флаг), по умолчанию — код */
  mode?: 'code' | 'text'
}

/** «Собери пайплайн»: расставь карточки шагов на трек (тап или перетаскивание) */
export interface PipelineExercise extends ExerciseBase {
  kind: 'pipeline'
  /** шаги в правильном порядке */
  steps: string[]
  /** лишние карточки, которым не место в пайплайне */
  extra?: string[]
}

export type Exercise = ChoiceExercise | DuelExercise | PredictExercise | UpgradeExercise | NextMoveExercise | DiffExercise | BugExercise | PipelineExercise
export type ExerciseKind = Exercise['kind']

export interface Lesson {
  id: string
  title: string
  kind: NodeKind
  exercises: Exercise[]
}

export interface Unit {
  id: string
  num: number
  title: string
  /** Короткая подпись (карточки на лендинге) */
  subtitle: string
  /** Описание в баннере раздела на пути */
  description: string
  color: UnitColor
  /** Раздел входит в Pro (в MVP — только метка, без блокировки) */
  pro?: boolean
  lessons: Lesson[]
}

export const UNIT_COLORS: Record<UnitColor, { main: string; dark: string; light: string; mid: string }> = {
  brand: { main: '#7C4DFF', dark: '#5B2FD6', light: '#EFE9FF', mid: '#C7B6FF' },
  coral: { main: '#FF7A59', dark: '#E0573A', light: '#FFE9E2', mid: '#FFC2B2' },
  teal: { main: '#13C2AE', dark: '#0E9C8C', light: '#DCF8F3', mid: '#9BE7DD' },
  deep: { main: '#5B2FD6', dark: '#3E1A9E', light: '#E8E0FF', mid: '#B4A0F0' },
  amber: { main: '#FFA41B', dark: '#D97F00', light: '#FFF1D9', mid: '#FFD58C' },
}
