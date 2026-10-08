import type { DuelExercise } from '../../data/types'
import { Head, HintNote, Letter, OutcomeView, type ViewProps } from './shared'

const SIDE = [
  { name: 'Промпт A', color: '#7C4DFF', light: '#EFE9FF', mid: '#C7B6FF' },
  { name: 'Промпт B', color: '#FF7A59', light: '#FFE9E2', mid: '#FFC2B2' },
]

/** «Дуэль промптов»: два промпта и что они дали → кто победил → почему */
export function DuelView({ ex, answer, setAnswer, status, hint }: ViewProps<DuelExercise>) {
  const [side, why] = Array.isArray(answer) ? answer : [-1, -1]
  const idle = status === 'idle'
  const pickSide = (s: number) => idle && setAnswer([s, s === side ? why : -1])
  const pickWhy = (r: number) => idle && setAnswer([side, r])

  return (
    <div>
      <Head kind="duel" title={ex.title} prompt={ex.prompt} />
      <div className="relative grid gap-4 sm:grid-cols-2 sm:gap-5">
        {ex.sides.map((s, i) => {
          const c = SIDE[i]
          const on = side === i
          const win = !idle && i === ex.winner
          const lost = !idle && on && i !== ex.winner
          return (
            <button
              key={i}
              type="button"
              disabled={!idle}
              onClick={() => pickSide(i)}
              data-side={i}
              aria-pressed={on}
              className="relative flex min-w-0 flex-col rounded-[20px] border-2 bg-white p-3 text-left transition-[transform,box-shadow,border-color] duration-150 active:translate-y-[3px] disabled:cursor-default"
              style={{
                borderColor: win ? '#8BE3D7' : lost ? '#FFB8A6' : on ? c.color : '#E7E3F1',
                boxShadow: `0 5px 0 ${win ? '#8BE3D7' : lost ? '#FFB8A6' : on ? c.mid : '#E7E3F1'}`,
                background: on && idle ? c.light : '#fff',
              }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full px-2.5 py-0.5 text-[12px] font-black uppercase tracking-wider text-white" style={{ background: c.color }}>
                  {c.name}
                </span>
                {win && <span className="anim-pop text-[13px] font-black text-teal-dark">🏆 Победитель</span>}
                {on && idle && <span className="text-[12px] font-black" style={{ color: c.color }}>Мой выбор</span>}
              </div>
              <div className="rounded-2xl rounded-br-md px-3 py-2 text-[13.5px] font-bold leading-snug text-white md:text-[14px]" style={{ background: c.color }}>
                {s.prompt}
              </div>
              <div className="my-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-muted">
                <span className="h-[2px] flex-1 rounded bg-line" /> ИИ выдал <span className="h-[2px] flex-1 rounded bg-line" />
              </div>
              <div className="pointer-events-none">
                <OutcomeView o={s.result} />
              </div>
            </button>
          )
        })}
        <span className="vx-vs pointer-events-none absolute left-1/2 top-1/2 hidden h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-ink text-[13px] font-black text-white shadow-[0_3px_0_#1a1628] sm:flex">
          VS
        </span>
      </div>

      {side >= 0 && (
        <div className="anim-fade-up mt-6">
          <div className="mb-2.5 text-[16px] font-black text-ink">Почему {SIDE[side].name} сильнее?</div>
          <HintNote hint={hint} />
          <div className="grid gap-2.5">
            {ex.reasons.map((r, i) => {
              const dim = hint?.dim?.includes(i) && idle
              let cls = ''
              if (idle) cls = why === i ? 'is-selected' : ''
              else if (side === ex.winner && i === ex.reason) cls = 'is-correct'
              else if (why === i) cls = 'is-wrong'
              else if (i === ex.reason) cls = 'is-correct'
              else cls = 'opacity-55'
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!idle || dim}
                  onClick={() => pickWhy(i)}
                  data-reason={i}
                  className={`tile flex items-center gap-3 px-3.5 py-3 text-[15px] font-bold leading-snug ${cls} ${dim ? 'line-through opacity-40' : ''}`}
                >
                  <Letter i={i} on={why === i} />
                  <span className="min-w-0">{r}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
      {side < 0 && <p className="mt-5 text-center text-[14px] font-bold text-muted">Нажми на карточку промпта, который победил</p>}
    </div>
  )
}
