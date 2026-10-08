import { useMemo } from 'react'
import type { ArrangeExercise, BugExercise, ChoiceExercise, Exercise, FillExercise } from '../data/course'
import { arrangeBank, type Answer, type Status } from '../data/exerciseLogic'
import { Mascot } from './Mascot'
import { highlight } from './Code'

interface ViewProps<E> {
  ex: E
  answer: Answer
  setAnswer: (a: Answer) => void
  status: Status
}

function Title({ children }: { children: string }) {
  return <h1 className="mb-5 text-[24px] font-black leading-tight md:mb-6 md:text-[30px]">{children}</h1>
}

function Speech({ text }: { text?: string }) {
  if (!text) return null
  return (
    <div className="mb-5 flex items-end gap-2 md:mb-6">
      <Mascot size={78} className="shrink-0 md:hidden" />
      <Mascot size={90} className="hidden shrink-0 md:block" />
      <div className="relative mb-6 rounded-2xl border-2 border-line bg-white px-4 py-3 text-[16px] font-bold leading-snug text-ink md:text-[17px]">
        <span className="absolute -left-[9px] bottom-4 h-4 w-4 rotate-45 border-b-2 border-l-2 border-line bg-white" />
        {text}
      </div>
    </div>
  )
}

function KeyHint({ n, active }: { n: number; active?: boolean }) {
  return (
    <span
      className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-[14px] font-extrabold sm:flex ${
        active ? 'border-current' : 'border-line text-muted'
      }`}
    >
      {n}
    </span>
  )
}

function stateClass(i: number, answer: Answer, status: Status, correct: number) {
  if (status === 'idle') return answer === i ? 'is-selected' : ''
  if (i === correct) return 'is-correct'
  if (answer === i) return 'is-wrong'
  return 'opacity-60'
}

export function ChoiceView({ ex, answer, setAnswer, status }: ViewProps<ChoiceExercise>) {
  return (
    <div>
      <Title>{ex.title}</Title>
      <Speech text={ex.prompt} />
      <div className="grid gap-3">
        {ex.options.map((o, i) => (
          <button
            key={i}
            disabled={status !== 'idle'}
            onClick={() => setAnswer(i)}
            className={`tile flex items-center gap-4 px-4 py-3.5 ${stateClass(i, answer, status, ex.correct)}`}
          >
            <KeyHint n={i + 1} active={answer === i || (status !== 'idle' && i === ex.correct)} />
            <span className="text-[16px] font-bold leading-snug md:text-[17px]">{ex.quoted ? `«${o}»` : o}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function FillView({ ex, answer, setAnswer, status }: ViewProps<FillExercise>) {
  const picked = typeof answer === 'number' ? ex.options[answer] : null
  const slotCls =
    status === 'correct' ? 'is-correct' : status === 'wrong' ? 'is-wrong' : 'is-selected'
  return (
    <div>
      <Title>{ex.title}</Title>
      <Speech text={ex.prompt} />
      <div className="card px-5 py-5 text-[19px] font-bold leading-[2.3] md:px-6 md:text-[21px]">
        {ex.before}{' '}
        <span className="mx-1 inline-flex min-w-[130px] justify-center border-b-[3px] border-brand-mid align-middle leading-none">
          {picked ? (
            <button
              disabled={status !== 'idle'}
              onClick={() => setAnswer(null)}
              className={`tile mb-1.5 px-3.5 py-2 text-[17px] font-extrabold ${slotCls}`}
            >
              {picked}
            </button>
          ) : (
            <span className="inline-block h-[42px]">&nbsp;</span>
          )}
        </span>{' '}
        {ex.after}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {ex.options.map((o, i) =>
          answer === i ? (
            <span key={i} className="rounded-2xl bg-line px-5 py-3 text-[17px] font-bold text-transparent">
              {o}
            </span>
          ) : (
            <button key={i} disabled={status !== 'idle'} onClick={() => setAnswer(i)} className="tile px-5 py-3 text-[17px] font-bold">
              {o}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

export function ArrangeView({ ex, answer, setAnswer, status }: ViewProps<ArrangeExercise>) {
  const bank = useMemo(() => arrangeBank(ex), [ex])
  const picked = Array.isArray(answer) ? answer : []
  const toggle = (i: number) => {
    if (status !== 'idle') return
    setAnswer(picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i])
  }
  const tileCls = status === 'correct' ? 'is-correct' : status === 'wrong' ? 'is-wrong' : ''
  return (
    <div>
      <Title>{ex.title}</Title>
      <Speech text={ex.prompt} />
      <div
        className="flex min-h-[132px] flex-wrap content-start gap-x-2 gap-y-[14px] border-t-2 border-line pt-[10px]"
        style={{
          backgroundImage: 'linear-gradient(to bottom, transparent 64px, #E7E3F1 64px, #E7E3F1 66px, transparent 66px)',
          backgroundSize: '100% 66px',
        }}
      >
        {picked.map((i) => (
          <button key={i} onClick={() => toggle(i)} disabled={status !== 'idle'} className={`tile h-[44px] px-3.5 text-[15px] font-bold md:text-[16px] ${tileCls}`}>
            {bank[i]}
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        {bank.map((t, i) =>
          picked.includes(i) ? (
            <span key={i} className="h-[44px] rounded-2xl bg-line px-3.5 text-[15px] font-bold leading-[44px] text-transparent md:text-[16px]">
              {t}
            </span>
          ) : (
            <button key={i} onClick={() => toggle(i)} disabled={status !== 'idle'} className="tile h-[44px] px-3.5 text-[15px] font-bold md:text-[16px]">
              {t}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

export function BugView({ ex, answer, setAnswer, status }: ViewProps<BugExercise>) {
  return (
    <div>
      <Title>{ex.title}</Title>
      <Speech text={ex.prompt} />
      <div className="overflow-hidden rounded-[20px] bg-[#272239] shadow-[0_6px_0_#1a1628]">
        <div className="flex items-center gap-2 bg-[#1f1b30] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-coral" />
          <span className="h-3 w-3 rounded-full bg-gold" />
          <span className="h-3 w-3 rounded-full bg-teal" />
          <span className="code-font ml-3 rounded-lg bg-white/10 px-2.5 py-1 text-[12px] text-white/70">{ex.file}</span>
          <span className="ml-auto rounded-full bg-brand/30 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#C9A8FF]">
            ✨ Код от ИИ
          </span>
        </div>
        <div className="overflow-x-auto py-3">
          {ex.code.map((line, i) => {
            const sel = answer === i
            let bg = sel ? 'bg-brand/35 border-brand' : 'border-transparent hover:bg-white/5'
            if (status !== 'idle') {
              if (i === ex.correct) bg = 'bg-teal/30 border-teal'
              else if (sel) bg = 'bg-coral/30 border-coral'
              else bg = 'border-transparent opacity-60'
            }
            return (
              <button
                key={i}
                disabled={status !== 'idle'}
                onClick={() => setAnswer(i)}
                className={`code-font flex w-full min-w-max items-center border-l-4 py-[7px] pr-4 text-left text-[14px] text-[#EDEAF6] transition-colors md:text-[15px] ${bg}`}
              >
                <span className="mr-4 w-8 select-none text-right text-white/30">{i + 1}</span>
                <code className="whitespace-pre">{highlight(line)}</code>
              </button>
            )
          })}
        </div>
      </div>
      <p className="mt-4 text-center text-[14px] font-bold text-muted">Нажми на строку, где спрятался баг</p>
    </div>
  )
}

export function ExerciseView(props: ViewProps<Exercise>) {
  const { ex } = props
  switch (ex.kind) {
    case 'choice':
      return <ChoiceView {...props} ex={ex} />
    case 'fill':
      return <FillView {...props} ex={ex} />
    case 'arrange':
      return <ArrangeView {...props} ex={ex} />
    case 'bug':
      return <BugView {...props} ex={ex} />
  }
}
