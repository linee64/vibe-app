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

const ruDate = (iso: string | null, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }) =>
  iso ? new Date(iso).toLocaleDateString('ru-RU', opts) : ''

const STATUS_RU: Record<string, string> = {
  trialing: 'пробный период',
  active: 'активна',
  past_due: 'не прошла оплата',
  unpaid: 'не оплачена',
  incomplete: 'ожидает оплаты',
  incomplete_expired: 'не оформлена',
  canceled: 'отменена',
}

function subLine(sub: Subscription): string {
  if (sub.status === 'trialing') return `Пробный период до ${ruDate(sub.trial_end ?? sub.current_period_end)}${sub.cancel_at_period_end ? ' · автопродление выключено' : ''}`
  if (sub.status === 'active')
    return sub.cancel_at_period_end ? `Pro до ${ruDate(sub.current_period_end)}, дальше — Free` : `Следующее списание ${ruDate(sub.current_period_end)}`
  return `Подписка: ${STATUS_RU[sub.status] ?? sub.status}`
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
              <span className="text-[13px] font-black uppercase tracking-wider text-white/75">
                Твой тариф: Pro{sub.plan ? ` · ${sub.plan === 'annual' ? 'на год' : 'помесячно'}` : ''}
              </span>
              <span className="rounded-full bg-gold px-2.5 py-0.5 text-[12px] font-black text-[#5a3d00]">{STATUS_RU[sub.status]}</span>
            </div>
            <h3 className="mt-1.5 text-[20px] font-black leading-tight">Все разделы открыты 🚀</h3>
            <p className="mt-1 text-[14px] font-semibold text-white/80">{subLine(sub)}</p>
          </div>
          <button className="btn btn-white btn-sm shrink-0" onClick={manage} disabled={busy}>
            {busy ? 'Открываю…' : 'Управлять подпиской'}
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
            <span className="text-[13px] font-black uppercase tracking-wider text-white/75">Твой тариф: Free</span>
            <span className="rounded-full bg-gold px-2.5 py-0.5 text-[12px] font-black text-[#5a3d00]">🎁 {TRIAL_DAYS} дня бесплатно</span>
          </div>
          <h3 className="mt-1.5 text-[20px] font-black leading-tight">Открой все разделы с Вайбик Pro</h3>
          <p className="mt-1 text-[14px] font-semibold text-white/80">Безлимитный заряд Бипи и ИИ-разбор кода. Потом от {usd(annualPerMonth)}/мес при оплате за год.</p>
          {BILLING_ENABLED && sub && <p className="mt-1 text-[14px] font-bold text-white">{subLine(sub)}</p>}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button className="btn btn-white btn-sm" onClick={() => navigate('/pricing')}>
            Попробовать Pro
          </button>
          {BILLING_ENABLED && sub && (
            <button className="text-[13px] font-extrabold text-white/85 underline-offset-2 hover:underline" onClick={manage} disabled={busy}>
              Управлять подпиской
            </button>
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

const ACHIEVEMENTS = [
  { unit: 'u1', emoji: '✍️', color: '#7C4DFF', title: 'Промпт-мастер' },
  { unit: 'u3', emoji: '🐞', color: '#13C2AE', title: 'Охотник за багами' },
  { unit: 'u4', emoji: '🗄️', color: '#5B2FD6', title: 'Бэкендер' },
  { unit: 'u5', emoji: '🚀', color: '#FFA41B', title: 'Запуск!' },
]

export function Profile() {
  const { session, progress, logout, resetProgress, setUnlockAll } = useStore()
  const tier = currentTier(progress)
  const tierDone = isTierComplete(tier, progress)
  const tierStatus = tierDone ? 'пройден' : tier.num === 1 ? 'начальный' : 'в процессе'
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
            <p className="mt-1 text-[14px] font-semibold text-muted">
              {session?.real ? `В Вайбике с ${ruDate(session.since, { month: 'long', year: 'numeric' }).replace(/ г\.$/, '')}` : 'В Вайбике с октября 2026 · демо-профиль'}
            </p>
          </div>
        </div>
      </div>

      <div className="card mt-6 flex items-center gap-4 p-4" data-profile-tier={tier.id}>
        <TierBadge tier={tier} size={64} />
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-black uppercase tracking-wider text-muted">Текущий тир · {tierStatus}</div>
          <div className="text-[22px] font-black leading-tight">{tier.name}</div>
          <div className="mt-1 flex gap-1.5">
            {TIERS.map((t) => (
              <span key={t.id} className={`h-2.5 w-10 rounded-full ${t.num < tier.num || (t.num === tier.num && tierDone) ? 'bg-teal' : t.num === tier.num ? 'bg-brand-mid' : 'bg-line'}`} title={t.name} />
            ))}
          </div>
        </div>
        {progress.unlockAll && <span className="shrink-0 rounded-full bg-gold-light px-2.5 py-1 text-[11px] font-black uppercase text-[#8a6a1e]">демо: всё открыто</span>}
      </div>

      <h2 className="mb-3 mt-8 text-[22px] font-black">Статистика</h2>
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Rocket size={30} />} value={progress.streak} label="деплой-серия, дней" />
        <Stat icon={<Spark size={30} />} value={progress.xp} label="вайб-поинтов" />
        <Stat icon={<Token size={30} />} value={progress.gems} label="токенов" />
        <Stat icon={<Shield size={30} />} value="Аметист" label="текущая лига" />
        <Stat icon={<span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-teal text-white"><Check size={20} /></span>} value={`${done} из ${ALL_LESSONS.length}`} label="уроков пройдено" />
        <Stat icon={<span className="text-[26px] leading-none">🏠</span>} value={`${progress.homework.length} из ${HOMEWORKS.length}`} label="домашек сдано" />
        <Stat
          icon={<span className="text-[26px] leading-none">🌐</span>}
          value={progress.portfolioUrl ? 'Есть' : '—'}
          label={progress.portfolioUrl ? progress.portfolioUrl.replace(/^https?:\/\//, '') : 'мой проект (домашка 5)'}
        />
      </div>

      <PlanCard />

      <h2 className="mb-3 mt-8 text-[22px] font-black">Достижения</h2>
      <div className="card divide-y-2 divide-line">
        <Achievement emoji="🚀" color="#7C4DFF" title="Стабильный релиз" desc="Деплой-серия 14 дней подряд" value={progress.streak} goal={14} level={3} />
        {ACHIEVEMENTS.map((a) => {
          const unit = UNITS.find((u) => u.id === a.unit)!
          return (
            <Achievement
              key={a.unit}
              emoji={a.emoji}
              color={a.color}
              title={a.title}
              desc={`Пройди раздел «${unit.title}»`}
              value={unit.lessons.filter((l) => progress.completed.includes(l.id)).length}
              goal={unit.lessons.length}
              level={1}
            />
          )
        })}
        <Achievement emoji="🪙" color="#13C2AE" title="Токен-магнат" desc="Накопи 1000 токенов" value={progress.gems} goal={1000} level={2} />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {(DEMO_MODE || REVIEW_MODE) && (
          <>
        <button
          className="btn btn-ghost"
          onClick={() => {
            resetProgress()
            toast(DEMO_MODE ? 'Демо-прогресс сброшен' : 'Прогресс сброшен')
          }}
        >
          Сбросить демо-прогресс
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            setUnlockAll(!progress.unlockAll)
            toast(progress.unlockAll ? 'Блокировки тиров вернулись 🔒' : 'Демо: все тиры открыты 🔓')
          }}
        >
          {progress.unlockAll ? 'Вернуть блокировки' : 'Разблокировать всё (демо)'}
        </button>
          </>
        )}
        <button className="btn btn-coral sm:col-span-2" onClick={logout}>
          Выйти
        </button>
      </div>
    </div>
  )
}
