export type NodeKind = 'star' | 'book' | 'dumbbell' | 'chest' | 'trophy'
export type UnitColor = 'brand' | 'coral' | 'teal' | 'deep' | 'amber'

interface ExerciseBase {
  title: string
  /** Реплика маскота / условие задачи */
  prompt?: string
  explain: string
}

export interface ChoiceExercise extends ExerciseBase {
  kind: 'choice'
  options: string[]
  correct: number
  /** если true — варианты показываются как промпты (моноширинным/цитатой) */
  quoted?: boolean
}
export interface ArrangeExercise extends ExerciseBase {
  kind: 'arrange'
  /** Правильный порядок фрагментов */
  tiles: string[]
  distractors: string[]
}
export interface BugExercise extends ExerciseBase {
  kind: 'bug'
  file: string
  code: string[]
  correct: number
}
export interface FillExercise extends ExerciseBase {
  kind: 'fill'
  before: string
  after: string
  options: string[]
  correct: number
}
export type Exercise = ChoiceExercise | ArrangeExercise | BugExercise | FillExercise

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
