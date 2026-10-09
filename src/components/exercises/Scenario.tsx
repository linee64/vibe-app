import type { ChoiceExercise } from '../../data/types'
import { Head, HintNote, Letter, type ViewProps } from './shared'
import { optState } from './meta'
import { t } from '../../i18n/core'

/** «Ситуация»: карточка-сценарий → что сделаешь? */
export function ScenarioView({ ex, answer, setAnswer, status, hint }: ViewProps<ChoiceExercise>) {
  const idle = status === 'idle'
  return (
    <div>
      <Head kind="choice" title={ex.title} prompt={ex.situation ? ex.prompt : undefined} />
      <div className="relative mb-4 overflow-hidden rounded-[20px] border-2 border-[#FFD58C] bg-[#FFF8EA] px-4 py-3.5 shadow-[0_4px_0_#FFD58C]">
        <span className="absolute -right-3 -top-3 text-[56px] opacity-15" aria-hidden>
          🧭
        </span>
        <div className="text-[11px] font-black uppercase tracking-wider text-[#B86A00]">{t('x0mg5v7s')}</div>
        <div className="relative mt-0.5 text-[16px] font-bold leading-snug text-ink md:text-[17px]">{ex.situation ?? ex.prompt}</div>
      </div>
      <div className="mb-2.5 text-[15px] font-black text-ink">{t('x0qv5swp')}</div>
      <HintNote hint={hint} />
      <div className="grid gap-2.5">
        {ex.options.map((o, i) => {
          const dim = hint?.dim?.includes(i) && idle
          return (
            <button
              key={i}
              type="button"
              disabled={!idle || dim}
              onClick={() => setAnswer(i)}
              data-option={i}
              className={`tile flex items-center gap-3 px-3.5 py-3 ${optState(i, answer, status, ex.correct)} ${dim ? 'line-through opacity-40' : ''}`}
            >
              <Letter i={i} on={answer === i || (!idle && i === ex.correct)} />
              <span className="min-w-0 text-[15px] font-bold leading-snug md:text-[16px]">{ex.quoted ? `«${o}»` : o}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
