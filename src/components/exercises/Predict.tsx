import type { PredictExercise } from '../../data/types'
import { AiAvatar, CodeBlock, FrameCard, Head, HintNote, MeBubble, OutcomeView, type ViewProps } from './shared'
import { optState } from './meta'

/** «Предскажи результат»: промпт → какой результат выдаст ИИ */
export function PredictView({ ex, answer, setAnswer, status, hint }: ViewProps<PredictExercise>) {
  const idle = status === 'idle'
  const n = ex.outcomes.length
  return (
    <div>
      <Head kind="predict" title={ex.title} prompt={ex.prompt} />
      <FrameCard>
        <div className="flex items-center gap-2 border-b-2 border-line bg-snow px-3.5 py-2">
          <AiAvatar size={22} />
          <span className="text-[13px] font-black text-ink">{ex.tool ?? 'Чат с ИИ'}</span>
          <span className="ml-auto text-[12px] font-extrabold text-muted">{idle ? 'отправлено' : 'ответ получен'}</span>
        </div>
        <div className="space-y-2.5 p-3.5">
          <MeBubble text={ex.input} />
          {ex.code && <CodeBlock lines={ex.code} small />}
          <div className="flex items-center gap-2 text-brand">
            <AiAvatar size={24} />
            {idle ? (
              <span className="vx-typing rounded-2xl border-2 border-line bg-white px-3 py-2" aria-label="ИИ думает">
                <span />
                <span />
                <span />
              </span>
            ) : (
              <span className="anim-pop rounded-2xl border-2 border-line bg-white px-3 py-1.5 text-[13px] font-extrabold text-ink">
                Вот что вышло: {ex.outcomes[ex.correct].label.toLowerCase()}
              </span>
            )}
          </div>
        </div>
      </FrameCard>

      <div className="mb-2.5 mt-5 text-[16px] font-black">Что скорее всего выдаст ИИ?</div>
      <HintNote hint={hint} />
      <div className={`grid gap-3 ${n === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
        {ex.outcomes.map((o, i) => {
          const dim = hint?.dim?.includes(i) && idle
          return (
            <button
              key={i}
              type="button"
              disabled={!idle || dim}
              onClick={() => setAnswer(i)}
              data-outcome={i}
              className={`tile flex min-w-0 flex-col gap-2 p-2.5 ${optState(i, answer, status, ex.correct)} ${dim ? 'opacity-35 grayscale' : ''}`}
            >
              <span className="flex items-center justify-between text-[12px] font-black uppercase tracking-wider">
                Вариант {i + 1}
                {!idle && i === ex.correct && <span>✓</span>}
              </span>
              <span className="pointer-events-none block w-full">
                <OutcomeView o={o} />
              </span>
              {!idle && <span className="anim-fade-up text-[12.5px] font-extrabold leading-snug">{o.label}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
