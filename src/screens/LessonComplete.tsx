import type { ReactNode } from 'react'
import { Mascot } from '../components/Mascot'
import { Clock, Spark, Target, Token } from '../components/Icons'
import { useToast } from '../components/Toast'

export interface LessonResult {
  xp: number
  accuracy: number
  seconds: number
  gems: number
}

const CONFETTI_COLORS = ['#7C4DFF', '#FF7A59', '#13C2AE', '#FFC23D', '#5B2FD6', '#FFB61D']

export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[340px] overflow-hidden" aria-hidden>
      {Array.from({ length: 36 }, (_, i) => {
        const left = (i * 37 + 11) % 100
        const w = i % 3 === 0 ? 8 : 10
        const h = i % 3 === 0 ? 16 : 10
        return (
          <span
            key={i}
            className="absolute top-0 block"
            style={{
              left: `${left}%`,
              width: w,
              height: h,
              borderRadius: i % 4 === 0 ? 999 : 3,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animation: `confetti-fall ${2.4 + (i % 5) * 0.35}s ${(i % 9) * 0.22}s ease-in infinite`,
            }}
          />
        )
      })}
    </div>
  )
}

function StatCard({ label, value, icon, color, edge }: { label: string; value: string; icon: ReactNode; color: string; edge: string }) {
  return (
    <div className="anim-pop rounded-[18px] border-2 p-[2px]" style={{ background: color, borderColor: color, boxShadow: `0 4px 0 ${edge}` }}>
      <div className="px-2 pb-1.5 pt-1 text-center text-[11px] font-black uppercase tracking-wider text-white md:text-[13px]">{label}</div>
      <div className="flex items-center justify-center gap-1.5 rounded-[14px] bg-white py-4 text-[22px] font-black md:gap-2 md:text-[24px]" style={{ color }}>
        {icon}
        {value}
      </div>
    </div>
  )
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export function LessonComplete({ result, lessonTitle, unitLabel, onContinue }: { result: LessonResult; lessonTitle: string; unitLabel?: string; onContinue: () => void }) {
  const toast = useToast()
  const perfect = result.accuracy === 100
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        <Confetti />
        <div className="relative">
          <div className="absolute left-1/2 top-[54%] h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-light" />
          <Mascot mood="happy" size={210} className="anim-pop relative" />
        </div>
        {unitLabel && <div className="mt-4 text-[13px] font-extrabold uppercase tracking-wider text-muted">{unitLabel}</div>}
        <h1 className={`${unitLabel ? 'mt-1' : 'mt-4'} text-[30px] font-black leading-tight text-brand md:text-[36px]`}>{perfect ? 'Безупречно!' : 'Урок пройден!'}</h1>
        <p className="mt-1 max-w-[460px] text-[17px] font-semibold text-muted">
          <b className="text-ink">{lessonTitle}</b> — готово! Ты на шаг ближе к своему первому приложению.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal-light px-3 py-1 text-[15px] font-black text-teal-dark" data-reward-tokens>
          <Token size={20} /> +{result.gems} токенов
        </p>
        <div className="mt-8 grid w-full max-w-[540px] grid-cols-3 gap-3 md:gap-4">
          <StatCard label="Вайб-поинты" value={`+${result.xp}`} icon={<Spark size={26} />} color="#FFB61D" edge="#E5A100" />
          <StatCard label="Точность" value={`${result.accuracy}%`} icon={<Target size={24} />} color="#13C2AE" edge="#0E9C8C" />
          <StatCard label="Время" value={fmt(result.seconds)} icon={<Clock size={24} />} color="#7C4DFF" edge="#5B2FD6" />
        </div>
      </main>
      <footer className="border-t-2 border-line">
        <div className="mx-auto flex max-w-[1040px] flex-col-reverse gap-3 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
          <button className="btn btn-ghost w-full md:w-[180px]" onClick={() => toast('Скопировали ссылку… шутка, это демо 😄')}>
            Поделиться
          </button>
          <button className="btn w-full md:w-[180px]" onClick={onContinue} autoFocus>
            Продолжить
          </button>
        </div>
      </footer>
    </div>
  )
}
