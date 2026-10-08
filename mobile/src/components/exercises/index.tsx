import type { Exercise } from '@web/data/types'
import type { Answer, Hint, Status } from '@web/data/exerciseLogic'
import { BugView } from './Bug'
import { DiffView } from './DiffReview'
import { DuelView } from './Duel'
import { NextMoveView } from './NextMove'
import { PipelineView } from './Pipeline'
import { PredictView } from './Predict'
import { ScenarioView } from './Scenario'
import { UpgradeView } from './Upgrade'

/** Все 8 типов упражнений */
export function ExerciseView({ ex, answer, setAnswer, status, hint }: { ex: Exercise; answer: Answer; setAnswer: (a: Answer) => void; status: Status; hint?: Hint | null }) {
  const props = { answer, setAnswer, status, hint }
  switch (ex.kind) {
    case 'choice':
      return <ScenarioView ex={ex} {...props} />
    case 'duel':
      return <DuelView ex={ex} {...props} />
    case 'predict':
      return <PredictView ex={ex} {...props} />
    case 'upgrade':
      return <UpgradeView ex={ex} {...props} />
    case 'nextmove':
      return <NextMoveView ex={ex} {...props} />
    case 'diff':
      return <DiffView ex={ex} {...props} />
    case 'bug':
      return <BugView ex={ex} {...props} />
    case 'pipeline':
      return <PipelineView ex={ex} {...props} />
  }
}
