import { useEffect, useMemo, useRef, useState } from 'react'
import type { UpgradeExercise } from '../../data/types'
import { chipOrder, upgradeScore } from '../../data/exerciseLogic'
import { Head, HintNote, type ViewProps } from './shared'
import { vibeMood } from './meta'
import { t } from '../../i18n/core'

const polar = (v: number, r: number) => {
  const a = Math.PI * (1 - v / 100)
  return [100 + r * Math.cos(a), 100 - r * Math.sin(a)]
}
const arc = (from: number, to: number, r: number) => {
  const [x1, y1] = polar(from, r)
  const [x2, y2] = polar(to, r)
  return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
}


/** Вайб-метр: полукруглая шкала качества промпта со стрелкой и отметкой цели */
export function VibeMeter({ value, target, size = 190, dropped = false }: { value: number; target: number; size?: number; dropped?: boolean }) {
  const mood = vibeMood(value, target)
  const [tx, ty] = polar(target, 92)
  const [tx2, ty2] = polar(target, 64)
  return (
    <div className="flex flex-col items-center" data-vibe={value} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={t('x0xb3t3p')}>
      <svg viewBox="0 0 200 116" width={size} height={(size * 116) / 200} className={dropped ? 'vx-wobble' : ''}>
        <path d={arc(0, 100, 78)} stroke="#EEEAF6" strokeWidth="20" fill="none" strokeLinecap="round" />
        <path d={arc(0.5, 44, 78)} stroke="#FFC2B2" strokeWidth="20" fill="none" strokeLinecap="round" />
        <path d={arc(46, 72, 78)} stroke="#FFD58C" strokeWidth="20" fill="none" />
        <path d={arc(74, 99.5, 78)} stroke="#9BE7DD" strokeWidth="20" fill="none" strokeLinecap="round" />
        {value > 0 && (
          <path
            d={arc(0.5, Math.max(1, value - 0.5), 78)}
            stroke={mood.color}
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
            style={{ transition: 'all .5s cubic-bezier(.3,1.4,.5,1)' }}
          />
        )}
        <line x1={tx2} y1={ty2} x2={tx} y2={ty} stroke="#2F2A47" strokeWidth="3.5" strokeLinecap="round" />
        <text x={tx} y={ty - 6} textAnchor="middle" fontSize="10" fontWeight="900" fill="#2F2A47">{t('x1xpzq6r')}</text>
        <g style={{ transform: `rotate(${value * 1.8 - 90}deg)`, transformOrigin: '100px 100px', transition: 'transform .6s cubic-bezier(.3,1.5,.5,1)' }}>
          <path d="M100 34 L106 100 L94 100 Z" fill="#2F2A47" />
        </g>
        <circle cx="100" cy="100" r="11" fill="#2F2A47" />
        <circle cx="100" cy="100" r="4.5" fill="#FF7A59" />
      </svg>
      <div className="-mt-1 text-center">
        <div className="text-[26px] font-black leading-none" style={{ color: mood.color }}>
          {value}%
        </div>
        <div className="mt-0.5 text-[13px] font-extrabold" style={{ color: mood.color }}>
          {mood.emoji} {mood.text}
        </div>
      </div>
    </div>
  )
}

/** «Прокачай промпт»: слабый промпт + чипы-улучшения; Вайб-метр реагирует вживую */
export function UpgradeView({ ex, answer, setAnswer, status, hint, compact = false }: ViewProps<UpgradeExercise> & { compact?: boolean }) {
  const picked = useMemo(() => (Array.isArray(answer) ? answer : []), [answer])
  const idle = status === 'idle'
  const order = useMemo(() => chipOrder(ex), [ex])
  const score = upgradeScore(ex, picked)
  const prev = useRef(score)
  const [dropped, setDropped] = useState(false)
  useEffect(() => {
    if (score < prev.current) {
      setDropped(true)
      const t = setTimeout(() => setDropped(false), 750)
      prev.current = score
      return () => clearTimeout(t)
    }
    prev.current = score
  }, [score])

  const toggle = (i: number) => {
    if (!idle) return
    setAnswer(picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i])
  }
  const inserted = ex.chips.map((c, i) => ({ c, i })).filter(({ i }) => picked.includes(i))

  return (
    <div>
      {!compact && <Head kind="upgrade" title={ex.title} prompt={ex.prompt} />}
      <div className={`grid items-center gap-4 ${compact ? '' : 'md:grid-cols-[1fr_200px]'}`}>
        {/* редактор промпта */}
        <div className="overflow-hidden rounded-[18px] border-2 border-line bg-white shadow-[0_4px_0_#E7E3F1]">
          <div className="flex items-center gap-1.5 border-b-2 border-line bg-snow px-3 py-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-coral" />
            <span className="h-2.5 w-2.5 rounded-full bg-gold" />
            <span className="h-2.5 w-2.5 rounded-full bg-teal" />
            <span className="code-font ml-2 rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-muted">prompt.md</span>
            <span className="ml-auto text-[11px] font-extrabold text-muted">{picked.length ? t('upgrade.edits', { n: picked.length }) : t('x0r512do')}</span>
          </div>
          <div className="min-h-[96px] px-3.5 py-3 text-[15px] font-semibold leading-relaxed text-ink md:text-[16px]" data-prompt-text>
            <span>{ex.base}</span>
            {inserted.map(({ c, i }) => {
              const bad = !idle && !!c.trap
              return (
                <span key={i}>
                  {' '}
                  <span
                    className={`vx-insert rounded px-0.5 ${bad ? 'bg-coral-light text-coral-dark line-through decoration-2' : !idle ? 'bg-teal-light text-teal-dark' : 'bg-brand-light text-brand-dark'}`}
                  >
                    {c.text}
                  </span>
                </span>
              )
            })}
            {idle && <span className="vx-caret" aria-hidden />}
          </div>
        </div>
        <div className={`flex justify-center ${compact ? '' : 'md:order-none'}`}>
          <VibeMeter value={score} target={ex.target} size={compact ? 170 : 190} dropped={dropped} />
        </div>
      </div>

      <div className="mb-2 mt-4 flex items-center justify-between gap-2">
        <div className="text-[15px] font-black">{t('x1w3kwsx')}</div>
      </div>
      <HintNote hint={hint} />
      <div className="flex flex-wrap gap-2.5" data-chips>
        {order.map((i) => {
          const c = ex.chips[i]
          const on = picked.includes(i)
          const marked = hint?.mark === i && idle
          let cls = on ? 'is-selected' : ''
          if (!idle) cls = c.trap ? (on ? 'is-wrong' : 'opacity-60') : on ? 'is-correct' : 'is-wrong'
          return (
            <button
              key={i}
              type="button"
              disabled={!idle}
              onClick={() => toggle(i)}
              data-chip={i}
              aria-pressed={on}
              className={`tile vx-chip flex min-w-0 max-w-full flex-col items-start px-3 py-2 text-left ${cls}`}
            >
              <span className="flex items-center gap-1 text-[10.5px] font-black uppercase tracking-wider opacity-70">
                {on ? '✓' : '+'} {c.tag}
                {marked && <span className="ml-1 rounded bg-coral px-1 text-[10px] text-white">{t('x1nv5xco')}</span>}
              </span>
              <span className="text-[14px] font-bold leading-snug">{c.text}</span>
            </button>
          )
        })}
      </div>
      {!idle && (
        <ul className="anim-fade-up mt-4 space-y-1.5 rounded-2xl bg-snow px-3.5 py-3">
          {ex.chips
            .filter((c) => c.trap)
            .map((c, k) => (
              <li key={k} className="text-[13.5px] font-semibold leading-snug text-ink">
                <b className="text-coral-dark">🚩 «{c.text}»</b> — {c.trap}
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
