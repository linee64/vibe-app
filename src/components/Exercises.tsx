import type { Exercise } from '../data/course'
import { BugView } from './exercises/Bug'
import { DiffView } from './exercises/DiffReview'
import { DuelView } from './exercises/Duel'
import { NextMoveView } from './exercises/NextMove'
import { PipelineView } from './exercises/Pipeline'
import { PredictView } from './exercises/Predict'
import { ScenarioView } from './exercises/Scenario'
import { UpgradeView } from './exercises/Upgrade'
import type { ViewProps } from './exercises/shared'
import './exercises/exercises.css'

export type { ViewProps }

/** Фирменные упражнения Вайбика: каждое — в своей «рамке» (чат, редактор, дифф, превью, трек) */
export function ExerciseView(props: ViewProps<Exercise>) {
  const { ex } = props
  switch (ex.kind) {
    case 'duel':
      return <DuelView {...props} ex={ex} />
    case 'predict':
      return <PredictView {...props} ex={ex} />
    case 'upgrade':
      return <UpgradeView {...props} ex={ex} />
    case 'nextmove':
      return <NextMoveView {...props} ex={ex} />
    case 'diff':
      return <DiffView {...props} ex={ex} />
    case 'bug':
      return <BugView {...props} ex={ex} />
    case 'pipeline':
      return <PipelineView {...props} ex={ex} />
    case 'choice':
      return <ScenarioView {...props} ex={ex} />
  }
}
