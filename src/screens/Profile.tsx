import { useState, type ReactNode } from 'react'
import { useStore } from '../store'
import { useToast } from '../components/Toast'
import { Check, Rocket, Shield, Spark, Token } from '../components/Icons'
import { MascotHead } from '../components/Mascot'
import { ALL_LESSONS, UNITS } from '../data/course'
import { TRIAL_DAYS, annualPerMonth, usd } from '../data/pricing'
import { navigate } from '../router'
import { HOMEWORKS } from '../data/homework'
import { TIERS, currentTier, isTierComplete } from '../data/tiers'
import { TierBadge } from '../components/TierBadge'
import { BILLING_ENABLED, DEMO_MODE, REVIEW_MODE } from '../lib/config'
import { openPortal, useSubscription, type Subscription } from '../lib/billing'
import { useFeedback } from '../components/FeedbackProvider'
import { FeedbackBubble } from '../components/Icons'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { formatDate, t } from '../i18n/core'
import { tx } from '../i18n/rich'


const ruDate = (iso: string | null, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }) => (iso ? formatDate(iso, opts) : '')

const STATUS_RU: Record<string, string> = {
  get trialing() { return t('x14w006o') },
  get active() { return t('x0ygsevk') },
  get past_due() { return t('x0ys4xsb') },
  get unpaid() { return t('x1my0my8') },
  get incomplete() { return t('x0izwd5v') },
  get incomplete_expired() { return t('x19ax2ra') },
  get canceled() { return t('x0utts6p') },
}

function subLine(sub: Subscription): string {
  if (sub.status === 'trialing') return t('profile.trialUntil', { date: ruDate(sub.trial_end ?? sub.current_period_end) }) + (sub.cancel_at_period_end ? t('x1osyqyg') : '')
  if (sub.status === 'active')
    return sub.cancel_at_period_end ? t('x06k4wot', { current_period_end: ruDate(sub.current_period_end) }) : t('x1fez7ec', { current_period_end: ruDate(sub.current_period_end) })
  return t('x0shboys', { status: STATUS_RU[sub.status] ?? sub.status })
}

/** Карточка тарифа: Free → «Попробовать Pro», Pro → статус и «Управлять подпиской» */
function PlanCard() {
  const toast = useToast()
  const { isPro, subscription: sub } = useSubscription()
  const [busy, setBusy] = useState(false)
  const manage = async () => {
    if (busy) return
    setBusy(true)
    const err = await openPortal()
    if (err) {
      toast(err)
      setBusy(false)
    }
  }
  if (BILLING_ENABLED && isPro && sub) {
    return (
      <div className="relative mt-8 overflow-hidden rounded-[20px] bg-brand p-5 text-white shadow-[0_5px_0_#5B2FD6] sm:p-6" data-plan="pro">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-black uppercase tracking-wider text-white/75">{t('x0qd05yb')}{sub.plan ? ` · ${sub.plan === 'annual' ? t('x0y80z8r') : t('x0bptiqn')}` : ''}
              </span>
              <span className="rounded-full bg-gold px-2.5 py-0.5 text-[12px] font-black text-[#5a3d00]">{STATUS_RU[sub.status]}</span>
            </div>
            <h3 className="mt-1.5 text-[20px] font-black leading-tight">{t('x1abqfqj')}</h3>
            <p className="mt-1 text-[14px] font-semibold text-white/80">{subLine(sub)}</p>
          </div>
          <button className="btn btn-white btn-sm shrink-0" onClick={manage} disabled={busy}>
            {busy ? t('x0vfsu1y') : t('x0nbowwd')}
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="relative mt-8 overflow-hidden rounded-[20px] bg-brand p-5 text-white shadow-[0_5px_0_#5B2FD6] sm:p-6" data-plan="free">
      <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-black uppercase tracking-wider text-white/75">{t('x1sl243q')}</span>
            <span className="rounded-full bg-gold px-2.5 py-0.5 text-[12px] font-black text-[#5a3d00]">{tx('x1i0nujw', { TRIAL_DAYS })}</span>
          </div>
          <h3 className="mt-1.5 text-[20px] font-black leading-tight">{t('x1xtdtme')}</h3>
          <p className="mt-1 text-[14px] font-semibold text-white/80">{tx('x1fcvmfh', { annualPerMonth: usd(annualPerMonth) })}</p>
          {BILLING_ENABLED && sub && <p className="mt-1 text-[14px] font-bold text-white">{subLine(sub)}</p>}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button className="btn btn-white btn-sm" onClick={() => navigate('/pricing')}>{t('x17v6d93')}</button>
          {BILLING_ENABLED && sub && (
            <button className="text-[13px] font-extrabold text-white/85 underline-offset-2 hover:underline" onClick={manage} disabled={busy}>{t('x0nbowwd')}</button>
          )}
        </div>
      </div>
    </div>
  )
}

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
        <span className="absolute bottom-1 text-[10px] font-black uppercase text-white/90">{t('x1o81k78', { level })}</span>
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

const ACHIEVEMENTS = [
  { unit: 'u1', emoji: '✍️', color: '#7C4DFF', get title() { return t('x0hdclx6') } },
  { unit: 'u3', emoji: '🐞', color: '#13C2AE', get title() { return t('x0vaktnm') } },
  { unit: 'u4', emoji: '🗄️', color: '#5B2FD6', get title() { return t('x18i6kuu') } },
  { unit: 'u5', emoji: '🚀', color: '#FFA41B', get title() { return t('x1wvqlg2') } },
]

export function Profile() {
  const { session, progress, logout, resetProgress, setUnlockAll } = useStore()
  const tier = currentTier(progress)
  const tierDone = isTierComplete(tier, progress)
  const tierStatus = tierDone ? t('x0eei137') : tier.num === 1 ? t('x1y4r5mn') : t('x1psb0nk')
  const toast = useToast()
  const feedback = useFeedback()
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
            <p className="mt-1 text-[14px] font-semibold text-muted">
              {session?.real ? t('profile.since', { date: ruDate(session.since, { month: 'long', year: 'numeric' }).replace(/ г\.$/, '') }) : t('x1y1fgkx')}
            </p>
          </div>
        </div>
      </div>

      <div className="card mt-6 flex items-center gap-4 p-4" data-profile-tier={tier.id}>
        <TierBadge tier={tier} size={64} />
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-black uppercase tracking-wider text-muted">{tx('x1c4daqg', { tierStatus })}</div>
          <div className="text-[22px] font-black leading-tight">{tier.name}</div>
          <div className="mt-1 flex gap-1.5">
            {TIERS.map((t) => (
              <span key={t.id} className={`h-2.5 w-10 rounded-full ${t.num < tier.num || (t.num === tier.num && tierDone) ? 'bg-teal' : t.num === tier.num ? 'bg-brand-mid' : 'bg-line'}`} title={t.name} />
            ))}
          </div>
        </div>
        {progress.unlockAll && <span className="shrink-0 rounded-full bg-gold-light px-2.5 py-1 text-[11px] font-black uppercase text-[#8a6a1e]">{t('x158vhft')}</span>}
      </div>

      <h2 className="mb-3 mt-8 text-[22px] font-black">{t('x123wqr3')}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Rocket size={30} />} value={progress.streak} label={t('x01f3koa')} />
        <Stat icon={<Spark size={30} />} value={progress.xp} label={t('x0b4ze50')} />
        <Stat icon={<Token size={30} />} value={progress.gems} label={t('x0zjmj8f')} />
        <Stat icon={<Shield size={30} />} value={t('x0yt6bkd')} label={t('x1ozxi5t')} />
        <Stat icon={<span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-teal text-white"><Check size={20} /></span>} value={t('x14ncjwy', { done, length: ALL_LESSONS.length })} label={t('x1djcpis')} />
        <Stat icon={<span className="text-[26px] leading-none">🏠</span>} value={t('x1kb2n7y', { length: progress.homework.length, length2: HOMEWORKS.length })} label={t('x1sse3vq')} />
        <Stat
          icon={<span className="text-[26px] leading-none">🌐</span>}
          value={progress.portfolioUrl ? t('x19al7ql') : '—'}
          label={progress.portfolioUrl ? progress.portfolioUrl.replace(/^https?:\/\//, '') : t('x1i7mfk2')}
        />
      </div>

      <PlanCard />

      <section className="card mt-6 p-4" aria-labelledby="profile-lang">
        <h2 id="profile-lang" className="text-[18px] font-black leading-tight">{t('lang.label')}</h2>
        <p className="mb-3 text-[14px] font-semibold leading-snug text-muted">{t('lang.hint')}</p>
        <LanguageSwitcher variant="list" />
      </section>

      <button
        className="card mt-6 flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-snow"
        onClick={() => feedback.open({ entry: 'profile' })}
        data-feedback-open="profile"
      >
        <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-2xl bg-brand-light">
          <FeedbackBubble size={36} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[18px] font-black leading-tight">{t('x1kira6i')}</span>
          <span className="block text-[14px] font-semibold leading-snug text-muted">{t('x1pyd1w5')}</span>
        </span>
        <span className="shrink-0 text-[22px] font-black text-brand" aria-hidden>
          ›
        </span>
      </button>

      <h2 className="mb-3 mt-8 text-[22px] font-black">{t('x1rhz5dh')}</h2>
      <div className="card divide-y-2 divide-line">
        <Achievement emoji="🚀" color="#7C4DFF" title={t('x1hwakh2')} desc={t('x0k082nd')} value={progress.streak} goal={14} level={3} />
        {ACHIEVEMENTS.map((a) => {
          const unit = UNITS.find((u) => u.id === a.unit)!
          return (
            <Achievement
              key={a.unit}
              emoji={a.emoji}
              color={a.color}
              title={a.title}
              desc={t('x04fhpw2', { title: unit.title })}
              value={unit.lessons.filter((l) => progress.completed.includes(l.id)).length}
              goal={unit.lessons.length}
              level={1}
            />
          )
        })}
        <Achievement emoji="🪙" color="#13C2AE" title={t('x1675awg')} desc={t('x0ifxvm8')} value={progress.gems} goal={1000} level={2} />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {(DEMO_MODE || REVIEW_MODE) && (
          <>
        <button
          className="btn btn-ghost"
          onClick={() => {
            resetProgress()
            toast(DEMO_MODE ? t('x1elewd8') : t('x10sq1zi'))
          }}
        >{t('x0cghtrn')}</button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            setUnlockAll(!progress.unlockAll)
            toast(progress.unlockAll ? t('x0p3aj4m') : t('x1y16fjs'))
          }}
        >
          {progress.unlockAll ? t('x1tl2xlk') : t('x0wtvn78')}
        </button>
          </>
        )}
        <button className="btn btn-coral sm:col-span-2" onClick={logout}>{t('x0c80x6j')}</button>
      </div>
    </div>
  )
}
