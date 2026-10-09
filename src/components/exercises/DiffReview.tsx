import type { DiffExercise } from '../../data/types'
import { Head, HintNote, type ViewProps } from './shared'
import { t } from '../../i18n/core'
import { tx } from '../../i18n/rich'

function lineStyle(l: string) {
  if (l.startsWith('+')) return { bg: 'bg-teal-light', sign: 'text-teal-dark', text: 'text-[#0B5E55]' }
  if (l.startsWith('-')) return { bg: 'bg-coral-light', sign: 'text-coral-dark', text: 'text-[#8A2E19]' }
  return { bg: '', sign: 'text-muted', text: 'text-ink/70' }
}

/** «Ревью правок ИИ»: дифф по кускам → принять или отклонить каждый */
export function DiffView({ ex, answer, setAnswer, status, hint }: ViewProps<DiffExercise>) {
  const idle = status === 'idle'
  const dec = Array.isArray(answer) && answer.length === ex.hunks.length ? answer : ex.hunks.map(() => 0)
  const decide = (i: number, v: number) => {
    if (!idle) return
    const next = [...dec]
    next[i] = next[i] === v ? 0 : v
    setAnswer(next)
  }
  const plus = ex.hunks.reduce((n, h) => n + h.lines.filter((l) => l.startsWith('+')).length, 0)
  const minus = ex.hunks.reduce((n, h) => n + h.lines.filter((l) => l.startsWith('-')).length, 0)
  const left = dec.filter((d) => d === 0).length

  return (
    <div>
      <Head kind="diff" title={ex.title} prompt={ex.prompt} />
      <div className="mb-3 rounded-2xl border-2 border-line bg-snow px-3.5 py-2.5">
        <div className="text-[11px] font-black uppercase tracking-wider text-muted">{t('x0jne507')}</div>
        <div className="text-[15px] font-bold leading-snug text-ink">«{ex.request}»</div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-extrabold">
          <span className="text-muted">{t('diff.changedPlaces', { n: ex.hunks.length })}</span>
          <span className="text-teal-dark">+{plus}</span>
          <span className="text-coral-dark">−{minus}</span>
        </div>
      </div>
      <HintNote hint={hint} />
      <div className="space-y-3">
        {ex.hunks.map((h, i) => {
          const d = dec[i]
          const right = !idle && (h.harmful ? d === 2 : d === 1)
          const border = !idle ? (right ? '#8BE3D7' : '#FFB8A6') : d === 1 ? '#9BE7DD' : d === 2 ? '#FFC2B2' : '#E7E3F1'
          const safeMark = hint?.mark === i && idle
          return (
            <div key={i} data-hunk={i} className="overflow-hidden rounded-[18px] border-2 bg-white transition-colors" style={{ borderColor: border, boxShadow: `0 4px 0 ${border}` }}>
              <div className="flex flex-wrap items-center gap-2 border-b-2 border-line bg-snow px-3 py-1.5">
                <span className="rounded-md bg-white px-1.5 text-[11px] font-black text-muted">{tx('x0gn7dpy', { v: i + 1 })}</span>
                <span className="code-font min-w-0 truncate text-[11.5px] font-semibold text-ink/80">{h.file}</span>
                {safeMark && <span className="rounded bg-teal px-1.5 text-[11px] font-black text-white">{t('x097x1dq')}</span>}
              </div>
              <div className="code-font py-1 text-[12px] leading-[1.6] md:text-[13px]">
                {h.lines.map((l, k) => {
                  const s = lineStyle(l)
                  return (
                    <div key={k} className={`flex px-2 ${s.bg}`}>
                      <span className={`w-4 shrink-0 select-none font-bold ${s.sign}`}>{l[0] === ' ' ? '' : l[0] === '-' ? '−' : l[0]}</span>
                      <code className={`min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere] ${s.text}`}>{l.slice(1) || ' '}</code>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-2 border-t-2 border-line px-2.5 py-2">
                <button
                  type="button"
                  disabled={!idle}
                  onClick={() => decide(i, 1)}
                  aria-pressed={d === 1}
                  className={`flex-1 rounded-xl border-2 px-2 py-2 text-[13px] font-black transition-colors ${d === 1 ? 'border-teal bg-teal text-white' : 'border-line bg-white text-teal-dark'} disabled:cursor-default`}
                >{t('x10znzux')}</button>
                <button
                  type="button"
                  disabled={!idle}
                  onClick={() => decide(i, 2)}
                  aria-pressed={d === 2}
                  className={`flex-1 rounded-xl border-2 px-2 py-2 text-[13px] font-black transition-colors ${d === 2 ? 'border-coral bg-coral text-white' : 'border-line bg-white text-coral-dark'} disabled:cursor-default`}
                >{t('x1ualmbs')}</button>
              </div>
              {!idle && h.harmful && (
                <div className="anim-fade-up border-t-2 border-line bg-coral-light px-3 py-2 text-[13px] font-bold leading-snug text-coral-dark">🚩 {h.harmful}</div>
              )}
            </div>
          )
        })}
      </div>
      {idle && left > 0 && <p className="mt-4 text-center text-[14px] font-bold text-muted">{t('x1257hue', { left })}</p>}
    </div>
  )
}
