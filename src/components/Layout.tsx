import type { ReactNode } from 'react'
import { navigate } from '../router'
import { useStore } from '../store'
import { Spark, NavLearn, NavLeague, NavLogout, NavMore, NavProfile, NavQuests, Shield, Target, Clock } from './Icons'
import { EconomyBar } from './Economy'
import { Mascot, MascotHead } from './Mascot'
import { myStanding } from '../data/league'

const NAV = [
  { path: '/learn', label: 'Учиться', Icon: NavLearn },
  { path: '/quests', label: 'Задания', Icon: NavQuests },
  { path: '/leaderboard', label: 'Рейтинг', Icon: NavLeague },
  { path: '/profile', label: 'Профиль', Icon: NavProfile },
  { path: '/more', label: 'Ещё', Icon: NavMore },
]

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`select-none text-[30px] font-black lowercase leading-none tracking-tight text-brand ${className}`}>
      вайбик<span className="text-coral">.</span>
    </span>
  )
}

function Sidebar({ active }: { active: string }) {
  const { logout } = useStore()
  return (
    <nav className="fixed inset-y-0 left-0 z-30 hidden w-[88px] flex-col border-r-2 border-line bg-white px-3 py-6 md:flex lg:w-[256px] lg:px-4">
      <button onClick={() => navigate('/learn')} className="mb-7 flex h-10 items-center px-3 lg:px-4" aria-label="Вайбик — на главную">
        <span className="lg:hidden"><MascotHead size={40} /></span>
        <Logo className="hidden lg:inline" />
      </button>
      <ul className="flex flex-col gap-2">
        {NAV.map(({ path, label, Icon }) => {
          const on = active === path
          return (
            <li key={path}>
              <button
                onClick={() => navigate(path)}
                className={`flex h-[52px] w-full items-center justify-center gap-4 rounded-2xl border-2 px-3 text-[15px] font-extrabold uppercase tracking-wider transition-colors lg:justify-start lg:px-4 ${
                  on ? 'border-brand-mid bg-brand-light text-brand' : 'border-transparent text-muted hover:bg-snow'
                }`}
                aria-current={on ? 'page' : undefined}
                title={label}
              >
                <Icon size={30} />
                <span className="hidden lg:inline">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex h-[52px] w-full items-center justify-center gap-4 rounded-2xl border-2 border-transparent px-3 text-[15px] font-extrabold uppercase tracking-wider text-muted hover:bg-snow lg:justify-start lg:px-4"
          title="Выйти"
        >
          <NavLogout size={30} />
          <span className="hidden lg:inline">Выйти</span>
        </button>
      </div>
    </nav>
  )
}

function BottomNav({ active }: { active: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t-2 border-line bg-white px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 md:hidden">
      {NAV.map(({ path, label, Icon }) => {
        const on = active === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            aria-label={label}
            className={`flex h-12 w-14 items-center justify-center rounded-2xl border-2 ${on ? 'border-brand-mid bg-brand-light' : 'border-transparent'}`}
          >
            <Icon size={30} />
          </button>
        )
      })}
    </nav>
  )
}

export function StatsBar({ compact = false }: { compact?: boolean }) {
  return <EconomyBar compact={compact} />
}

function QuestRow({ icon, title, value, goal }: { icon: ReactNode; title: string; value: number; goal: number }) {
  const v = Math.min(value, goal)
  return (
    <div className="flex items-center gap-4">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 text-[15px] font-bold text-ink">{title}</div>
        <div className="progress-track !h-[18px] bg-line">
          <div className="progress-fill bg-gold" style={{ width: `${(v / goal) * 100}%` }} />
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-[#8a6a1e]">
            {v} / {goal}
          </span>
        </div>
      </div>
    </div>
  )
}

export function DailyQuests({ title = 'Задания на день' }: { title?: string }) {
  const { progress } = useStore()
  return (
    <section className="card p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[19px] font-extrabold">{title}</h3>
        <button onClick={() => navigate('/quests')} className="text-[13px] font-extrabold uppercase tracking-wider text-brand hover:opacity-80">
          Все
        </button>
      </div>
      <div className="space-y-5">
        <QuestRow icon={<Spark size={32} />} title="Набери 30 вайб-поинтов" value={progress.todayXp} goal={30} />
        <QuestRow icon={<Target size={32} />} title="Пройди 2 урока без ошибок" value={progress.perfectToday} goal={2} />
        <QuestRow icon={<Clock size={32} />} title="Пройди 3 урока" value={progress.lessonsToday} goal={3} />
      </div>
    </section>
  )
}

export function RightRail() {
  const { session, progress } = useStore()
  const { rank, toPromote } = myStanding(session?.name ?? 'Ты', progress.todayXp)
  return (
    <div className="space-y-5">
      <StatsBar />
      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[19px] font-extrabold">Аметистовая лига</h3>
          <button onClick={() => navigate('/leaderboard')} className="text-[13px] font-extrabold uppercase tracking-wider text-brand hover:opacity-80">
            Открыть
          </button>
        </div>
        <div className="flex items-center gap-4">
          <Shield size={56} />
          <p className="text-[15px] font-semibold leading-snug text-muted">
            Ты на <b className="text-ink">{rank}-м месте</b>.{' '}
            {toPromote > 0 ? `Ещё ${toPromote} ВП — и ты в зоне повышения!` : 'Ты в зоне повышения — так держать!'}
          </p>
        </div>
      </section>
      <DailyQuests />
      <section className="card relative overflow-hidden bg-brand-light/50 p-5 pr-[118px]">
        <h3 className="mb-1.5 text-[17px] font-extrabold">Совет от Бипи</h3>
        <p className="text-[14px] font-semibold leading-snug text-muted">
          Начинай промпт с цели: что должно получиться в итоге и для кого.
        </p>
        <Mascot size={104} className="absolute -bottom-3 right-2" mood="think" />
      </section>
      <p className="px-2 text-center text-[12px] font-bold uppercase tracking-wider text-[#b5b0c8]">
        Прототип · все данные демонстрационные
      </p>
    </div>
  )
}

export function AppShell({ active, children, rail = true }: { active: string; children: ReactNode; rail?: boolean }) {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar active={active} />
      <header className="sticky top-0 z-30 border-b-2 border-line bg-white/95 px-4 py-2 backdrop-blur md:hidden">
        <StatsBar compact />
      </header>
      <div className="md:pl-[88px] lg:pl-[256px]">
        <div className="mx-auto flex max-w-[1080px] gap-10 px-4 pb-28 md:px-8 md:pb-12 xl:gap-12 xl:px-10">
          <main className="min-w-0 flex-1 py-5 md:py-6">{children}</main>
          {rail && (
            <aside className="hidden w-[330px] shrink-0 lg:block xl:w-[350px]">
              <div className="sticky top-0 py-6">
                <RightRail />
              </div>
            </aside>
          )}
        </div>
      </div>
      <BottomNav active={active} />
    </div>
  )
}
