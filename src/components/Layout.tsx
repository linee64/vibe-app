import type { ReactNode } from 'react'
import { navigate } from '../router'
import { useStore } from '../store'
import { Spark, NavLearn, NavLeague, NavLogout, NavMore, NavProfile, NavQuests, Shield, Target, Clock, FeedbackBubble } from './Icons'
import { MicroPromptHost, useFeedback } from './FeedbackProvider'
import { EconomyBar } from './Economy'
import { Mascot, MascotHead } from './Mascot'
import { myStanding } from '../data/league'
import { t } from '../i18n/core'
import { tx } from '../i18n/rich'

const NAV = [
  { path: '/learn', get label() { return t('x192hq8j') }, Icon: NavLearn },
  { path: '/quests', get label() { return t('x1rejxdo') }, Icon: NavQuests },
  { path: '/leaderboard', get label() { return t('x04w787b') }, Icon: NavLeague },
  { path: '/profile', get label() { return t('x0ez1von') }, Icon: NavProfile },
  { path: '/more', get label() { return t('x0vosrby') }, Icon: NavMore },
]

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`select-none text-[30px] font-black lowercase leading-none tracking-tight text-brand ${className}`}>{tx('x1ctbm6o', {}, [(chunk) => <span className="text-coral">{chunk}</span>])}</span>
  )
}

function Sidebar({ active }: { active: string }) {
  const { logout } = useStore()
  const feedback = useFeedback()
  return (
    <nav className="fixed inset-y-0 left-0 z-30 hidden w-[88px] flex-col border-r-2 border-line bg-white px-3 py-6 md:flex lg:w-[256px] lg:px-4">
      <button onClick={() => navigate('/learn')} className="mb-7 flex h-10 items-center px-3 lg:px-4" aria-label={t('x0e7fxvq')}>
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
      <div className="mt-auto space-y-1">
        <button
          onClick={() => feedback.open({ entry: 'sidebar' })}
          className="flex h-[48px] w-full items-center justify-center gap-4 rounded-2xl border-2 border-transparent px-3 text-[15px] font-extrabold uppercase tracking-wider text-muted hover:bg-snow lg:justify-start lg:px-4"
          title={t('x1kira6i')}
          data-feedback-open="sidebar"
        >
          <FeedbackBubble size={30} />
          <span className="hidden lg:inline">{t('x078t777')}</span>
        </button>
        <button
          onClick={logout}
          className="flex h-[52px] w-full items-center justify-center gap-4 rounded-2xl border-2 border-transparent px-3 text-[15px] font-extrabold uppercase tracking-wider text-muted hover:bg-snow lg:justify-start lg:px-4"
          title={t('x0c80x6j')}
        >
          <NavLogout size={30} />
          <span className="hidden lg:inline">{t('x0c80x6j')}</span>
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

export function DailyQuests({ title = t('x00e91ep') }: { title?: string }) {
  const { progress } = useStore()
  return (
    <section className="card p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[19px] font-extrabold">{title}</h3>
        <button onClick={() => navigate('/quests')} className="text-[13px] font-extrabold uppercase tracking-wider text-brand hover:opacity-80">{t('x0xg36bv')}</button>
      </div>
      <div className="space-y-5">
        <QuestRow icon={<Spark size={32} />} title={t('x1rhal7i')} value={progress.todayXp} goal={30} />
        <QuestRow icon={<Target size={32} />} title={t('x08tsyug')} value={progress.perfectToday} goal={2} />
        <QuestRow icon={<Clock size={32} />} title={t('x1b9mx5z')} value={progress.lessonsToday} goal={3} />
      </div>
    </section>
  )
}

export function RightRail() {
  const { session, progress } = useStore()
  const { rank, toPromote } = myStanding(session?.name ?? t('x0prirvu'), progress.todayXp)
  return (
    <div className="space-y-5">
      <StatsBar />
      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[19px] font-extrabold">{t('x1p5r6fo')}</h3>
          <button onClick={() => navigate('/leaderboard')} className="text-[13px] font-extrabold uppercase tracking-wider text-brand hover:opacity-80">{t('x0d2psq6')}</button>
        </div>
        <div className="flex items-center gap-4">
          <Shield size={56} />
          <p className="text-[15px] font-semibold leading-snug text-muted">{tx('layout.rank', { rank }, [(chunk) => <b className="text-ink">{chunk}</b>])}{' '}
            {toPromote > 0 ? t('x0qy7zf4', { toPromote }) : t('x1kgwnza')}
          </p>
        </div>
      </section>
      <DailyQuests />
      <section className="card relative overflow-hidden bg-brand-light/50 p-5 pr-[118px]">
        <h3 className="mb-1.5 text-[17px] font-extrabold">{t('x1yulza9')}</h3>
        <p className="text-[14px] font-semibold leading-snug text-muted">{t('x10hq5ca')}</p>
        <Mascot size={104} className="absolute -bottom-3 right-2" mood="think" />
      </section>
      <p className="px-2 text-center text-[12px] font-bold uppercase tracking-wider text-[#b5b0c8]">{t('x04sfds3')}</p>
    </div>
  )
}

export function AppShell({ active, children, rail = true }: { active: string; children: ReactNode; rail?: boolean }) {
  const feedback = useFeedback()
  return (
    <div className="min-h-screen bg-white">
      <Sidebar active={active} />
      <header className="sticky top-0 z-30 flex items-center gap-1 border-b-2 border-line bg-white/95 py-2 pl-4 pr-2 backdrop-blur md:hidden">
        <div className="min-w-0 flex-1">
          <StatsBar compact />
        </div>
        <button
          onClick={() => feedback.open({ entry: 'header' })}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-snow"
          aria-label={t('x1kira6i')}
          title={t('x1kira6i')}
          data-feedback-open="header"
        >
          <FeedbackBubble size={26} />
        </button>
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
      <MicroPromptHost />
    </div>
  )
}
