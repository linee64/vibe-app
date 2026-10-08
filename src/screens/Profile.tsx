import type { ReactNode } from 'react'
import { useStore } from '../store'
import { useToast } from '../components/Toast'
import { Bolt, Check, Fire, Shield } from '../components/Icons'
import { MascotHead } from '../components/Mascot'
import { ALL_LESSONS } from '../data/course'

function Stat({ icon, value, label }: { icon: ReactNode; value: string | number; label: string }) {
  return (
    <div className="card flex items-center gap-3 px-4 py-3.5">
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[19px] font-black leading-tight">{value}</div>
        <div className="truncate text-[14px] font-semibold text-muted">{label}</div>
      </div>
    </div>
  )
}

function Achievement({ emoji, color, title, desc, value, goal, level }: { emoji: string; color: string; title: string; desc: string; value: number; goal: number; level: number }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="relative flex h-[76px] w-[64px] shrink-0 flex-col items-center justify-center rounded-2xl text-[30px]" style={{ background: color, boxShadow: '0 4px 0 rgba(47,42,71,.18)' }}>
        {emoji}
        <span className="absolute bottom-1 text-[10px] font-black uppercase text-white/90">ур. {level}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="text-[17px] font-extrabold">{title}</h4>
          <span className="text-[14px] font-bold text-muted">
            {Math.min(value, goal)}/{goal}
          </span>
        </div>
        <div className="progress-track my-2 !h-[14px]">
          <div className="progress-fill bg-gold" style={{ width: `${(Math.min(value, goal) / goal) * 100}%` }} />
        </div>
        <p className="text-[14px] font-semibold text-muted">{desc}</p>
      </div>
    </div>
  )
}

export function Profile() {
  const { session, progress, logout, resetProgress } = useStore()
  const toast = useToast()
  const done = progress.completed.length
  const handle = (session?.email.split('@')[0] ?? 'user').toLowerCase()
  return (
    <div className="mx-auto max-w-[600px]">
      <div className="relative overflow-hidden rounded-[24px] bg-brand-light px-6 pb-6 pt-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-mid/40" />
        <div className="absolute right-8 top-24 h-7 w-7 rotate-12 rounded-lg bg-teal/60" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-end">
          <div className="flex h-[112px] w-[112px] items-center justify-center rounded-full border-4 border-white bg-white shadow-[0_5px_0_#C7B6FF]">
            <MascotHead size={84} />
          </div>
          <div className="text-center sm:pb-2 sm:text-left">
            <h1 className="text-[28px] font-black leading-tight">{session?.name}</h1>
            <p className="text-[16px] font-bold text-muted">@{handle}</p>
            <p className="mt-1 text-[14px] font-semibold text-muted">В Вайбике с октября 2026 · демо-профиль</p>
          </div>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-[22px] font-black">Статистика</h2>
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Fire size={30} />} value={progress.streak} label="дней подряд" />
        <Stat icon={<Bolt size={30} />} value={progress.xp} label="всего XP" />
        <Stat icon={<Shield size={30} />} value="Аметист" label="текущая лига" />
        <Stat icon={<span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-teal text-white"><Check size={20} /></span>} value={`${done} из ${ALL_LESSONS.length}`} label="уроков пройдено" />
      </div>

      <h2 className="mb-3 mt-8 text-[22px] font-black">Достижения</h2>
      <div className="card divide-y-2 divide-line">
        <Achievement emoji="🔥" color="#FF9A1F" title="Огонёк" desc="Учись 14 дней подряд" value={progress.streak} goal={14} level={3} />
        <Achievement emoji="✍️" color="#7C4DFF" title="Промпт-мастер" desc="Пройди раздел «Первый промпт»" value={progress.completed.filter((c) => c.startsWith('u1')).length} goal={5} level={1} />
        <Achievement emoji="🐞" color="#13C2AE" title="Охотник за багами" desc="Пройди раздел «Отладка с ИИ»" value={progress.completed.filter((c) => c.startsWith('u3')).length} goal={5} level={1} />
        <Achievement emoji="💎" color="#2EB6F5" title="Коллекционер" desc="Накопи 1000 кристаллов" value={progress.gems} goal={1000} level={2} />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          className="btn btn-ghost flex-1"
          onClick={() => {
            resetProgress()
            toast('Демо-прогресс сброшен')
          }}
        >
          Сбросить демо-прогресс
        </button>
        <button className="btn btn-coral flex-1" onClick={logout}>
          Выйти
        </button>
      </div>
    </div>
  )
}
