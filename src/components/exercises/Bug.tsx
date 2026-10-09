import type { BugExercise } from '../../data/types'
import { highlight } from '../Code'
import { AiAvatar, Head, HintNote, type ViewProps } from './shared'
import { t } from '../../i18n/core'

/** «Найди баг» (код) и «Красный флаг» (фраза в ответе ИИ): тап по строке */
export function BugView({ ex, answer, setAnswer, status, hint }: ViewProps<BugExercise>) {
  const idle = status === 'idle'
  const text = ex.mode === 'text'
  return (
    <div>
      <Head kind={text ? 'flag' : 'bug'} title={ex.title} prompt={ex.prompt} />
      <HintNote hint={hint} />
      {text ? (
        <div className="overflow-hidden rounded-[20px] border-2 border-line bg-white shadow-[0_5px_0_#E7E3F1]">
          <div className="flex items-center gap-2 border-b-2 border-line bg-snow px-3.5 py-2">
            <AiAvatar size={22} />
            <span className="min-w-0 truncate text-[13px] font-black">{ex.file}</span>
            <span className="ml-auto shrink-0 rounded-full bg-coral-light px-2 py-0.5 text-[11px] font-black text-coral-dark">{t('x1ng1cus')}</span>
          </div>
          <div className="space-y-1.5 p-2.5">
            {ex.code.map((line, i) => {
              const sel = answer === i
              const dim = hint?.dim?.includes(i) && idle
              let cls = sel ? 'border-coral bg-coral-light' : 'border-transparent hover:bg-snow'
              if (!idle) cls = i === ex.correct ? 'border-teal bg-teal-light' : sel ? 'border-coral bg-coral-light' : 'border-transparent opacity-55'
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!idle || dim}
                  onClick={() => setAnswer(i)}
                  data-line={i}
                  className={`flex w-full items-start gap-2 rounded-xl border-2 px-2.5 py-2 text-left text-[14.5px] font-semibold leading-snug text-ink transition-colors md:text-[15px] ${cls} ${dim ? 'opacity-35' : ''}`}
                >
                  <span className={`mt-0.5 shrink-0 text-[14px] ${sel || (!idle && i === ex.correct) ? '' : 'opacity-0'}`} aria-hidden>
                    🚩
                  </span>
                  <span className="min-w-0 whitespace-pre-line">{line}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] bg-[#272239] shadow-[0_6px_0_#1a1628]">
          <div className="flex items-center gap-2 bg-[#1f1b30] px-3 py-2.5">
            <span className="h-3 w-3 rounded-full bg-coral" />
            <span className="h-3 w-3 rounded-full bg-gold" />
            <span className="h-3 w-3 rounded-full bg-teal" />
            <span className="code-font ml-2 min-w-0 truncate rounded-t-lg border-b-2 border-brand bg-white/10 px-2.5 py-1 text-[12px] text-white/80">{ex.file}</span>
            <span className="ml-auto shrink-0 rounded-full bg-brand/30 px-2 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-[#C9A8FF]">{t('x1syoofh')}</span>
          </div>
          <div className="relative py-2.5">
            {idle && <div className="vx-scan" aria-hidden />}
            {ex.code.map((line, i) => {
              const sel = answer === i
              const dim = hint?.dim?.includes(i) && idle
              let bg = sel ? 'bg-brand/35 border-brand' : 'border-transparent hover:bg-white/5'
              if (!idle) bg = i === ex.correct ? 'bg-teal/30 border-teal' : sel ? 'bg-coral/30 border-coral' : 'border-transparent opacity-55'
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!idle || dim}
                  onClick={() => setAnswer(i)}
                  data-line={i}
                  className={`code-font relative flex w-full items-start border-l-4 py-[6px] pr-3 text-left text-[13px] text-[#EDEAF6] transition-colors md:text-[14px] ${bg} ${dim ? 'opacity-30' : ''}`}
                >
                  <span className="mr-3 w-6 shrink-0 select-none text-right text-white/30">{i + 1}</span>
                  <code className="min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere]">{line ? highlight(line) : ' '}</code>
                  {!idle && i === ex.correct && <span className="anim-pop ml-auto shrink-0 pl-2">🐞</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
      <p className="mt-3 text-center text-[14px] font-bold text-muted">{text ? t('x0k81lf8') : t('x1o415sx')}</p>
    </div>
  )
}
