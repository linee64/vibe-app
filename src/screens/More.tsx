/**
 * Вкладка «Ещё»: настройки, магазин образов Бипи, помощь, приглашение друзей, отзыв и выход.
 * Здесь же экраны «Настройки» (#/settings) и «Помощь» (#/help).
 */
import type { ReactNode } from 'react'
import { useStore } from '../store'
import { useToast } from '../components/Toast'
import { useFeedback } from '../components/FeedbackProvider'
import { FeedbackBubble } from '../components/Icons'
import { Mascot } from '../components/Mascot'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { SoundToggle, Switch } from '../components/SettingsControls'
import { navigate } from '../router'
import { t, type UIKey } from '../i18n/core'
import { track } from '../lib/analytics'
import {
  GOAL_OPTIONS,
  INVITE_URL,
  SUPPORT_EMAIL,
  mailto,
  setDailyGoal,
  setRemindersOn,
  shareInvite,
  useDailyGoal,
  useRemindersOn,
} from '../lib/prefs'

function Row({ icon, bg, title, desc, onClick, href, tone = 'ink', data }: { icon: ReactNode; bg: string; title: string; desc?: string; onClick?: () => void; href?: string; tone?: 'ink' | 'coral'; data: string }) {
  const cls = `flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors ${tone === 'coral' ? 'hover:bg-coral-light/50' : 'hover:bg-snow'}`
  const inner = (
    <>
      <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-2xl text-[24px]" style={{ background: bg }} aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[17px] font-black leading-tight ${tone === 'coral' ? 'text-coral-dark' : ''}`}>{title}</span>
        {desc && <span className="block text-[13px] font-semibold leading-snug text-muted">{desc}</span>}
      </span>
      {tone === 'ink' && (
        <span className="shrink-0 text-[22px] font-black text-brand" aria-hidden>
          ›
        </span>
      )}
    </>
  )
  return href ? (
    <a href={href} className={cls} data-more={data}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls} data-more={data}>
      {inner}
    </button>
  )
}

function DailyGoalCard() {
  const { progress } = useStore()
  const goal = useDailyGoal()
  const xp = progress.todayXp
  const done = xp >= goal
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-brand p-5 text-white shadow-[0_5px_0_#5B2FD6]" data-daily-goal={goal}>
      <span className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
      <div className="relative flex items-center gap-4">
        <Mascot mood="happy" size={72} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-[18px] font-black leading-tight">{t('more.today', { xp, goal })}</div>
          <div className="progress-track mt-2 !h-[12px] !bg-white/25">
            <div className="progress-fill bg-gold" style={{ width: `${Math.max(Math.min(xp / goal, 1) * 100, 4)}%` }} />
          </div>
          <div className="mt-1.5 text-[13px] font-bold text-white/85">{done ? t('more.goalDone') : t('more.goalLeft', { n: goal - xp })}</div>
        </div>
      </div>
    </div>
  )
}

export function MoreScreen() {
  const { logout } = useStore()
  const toast = useToast()
  const feedback = useFeedback()

  const invite = async () => {
    const res = await shareInvite({ title: t('invite.title'), text: t('invite.text'), url: INVITE_URL })
    track('invite_shared', { method: res })
    if (res === 'copied') toast(t('invite.copied'))
    else if (res === 'failed') toast(t('invite.manual', { url: INVITE_URL }))
  }

  return (
    <div className="mx-auto max-w-[600px]" data-more-screen>
      <h1 className="text-[28px] font-black leading-tight">{t('x0vosrby')}</h1>
      <p className="mb-5 text-[15px] font-semibold text-muted">{t('more.subtitle')}</p>
      <DailyGoalCard />
      <div className="card mt-6 divide-y-2 divide-line overflow-hidden">
        <Row icon="⚙️" bg="#EFE9FF" title={t('x01xs7fy')} desc={t('more.settingsDesc')} onClick={() => navigate('/settings')} data="settings" />
        <Row icon="🛍️" bg="#FFF4D6" title={t('x1f2lm2g')} desc={t('more.shopDesc')} onClick={() => navigate('/wardrobe')} data="shop" />
        <Row icon="❓" bg="#DCF8F3" title={t('x0m2n6mj')} desc={t('more.helpDesc')} onClick={() => navigate('/help')} data="help" />
        <Row icon="💌" bg="#FFE9E2" title={t('x09a7sjx')} desc={t('more.inviteDesc')} onClick={invite} data="invite" />
        <Row icon={<FeedbackBubble size={30} />} bg="#EFE9FF" title={t('x1kira6i')} desc={t('x1pyd1w5')} onClick={() => feedback.open({ entry: 'more' })} data="feedback" />
      </div>
      <div className="card mt-6 overflow-hidden">
        <Row icon="👋" bg="#FFE9E2" title={t('x0gojai6')} onClick={logout} tone="coral" data="logout" />
      </div>
    </div>
  )
}

function BackHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <button type="button" onClick={() => navigate('/more')} className="mb-2 text-[14px] font-extrabold uppercase tracking-wider text-brand hover:opacity-80" data-back>
        ‹ {t('more.back')}
      </button>
      <h1 className="text-[28px] font-black leading-tight">{title}</h1>
      {sub && <p className="text-[15px] font-semibold text-muted">{sub}</p>}
    </div>
  )
}

function RemindersToggle() {
  const on = useRemindersOn()
  const toast = useToast()
  const toggle = async () => {
    const next = !on
    if (next && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission().catch(() => 'denied' as NotificationPermission)
      if (perm !== 'granted') {
        toast(t('settings.remindDenied'))
        return
      }
    }
    setRemindersOn(next)
    track('setting_changed', { setting: 'reminders', value: next })
    toast(next ? t('settings.remindOn') : t('settings.remindOff'))
  }
  return (
    <section className="card mt-6 flex items-center gap-4 p-4" data-reminders={on ? 'on' : 'off'}>
      <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-2xl bg-coral-light text-[28px]" aria-hidden>
        {on ? '🔔' : '🔕'}
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="settings-remind" className="text-[18px] font-black leading-tight">{t('settings.remindLabel')}</h2>
        <p className="text-[14px] font-semibold leading-snug text-muted">{t('settings.remindHint')}</p>
      </div>
      <Switch on={on} onToggle={toggle} labelledBy="settings-remind" data="reminders" />
    </section>
  )
}

function GoalPicker() {
  const goal = useDailyGoal()
  const toast = useToast()
  return (
    <section className="card mt-6 p-4" aria-labelledby="settings-goal">
      <h2 id="settings-goal" className="text-[18px] font-black leading-tight">{t('settings.goalLabel')}</h2>
      <p className="mb-3 text-[14px] font-semibold leading-snug text-muted">{t('settings.goalHint')}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-labelledby="settings-goal">
        {GOAL_OPTIONS.map((g) => {
          const active = g === goal
          return (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={active}
              data-goal={g}
              onClick={() => {
                setDailyGoal(g)
                track('setting_changed', { setting: 'daily_goal', value: g })
                toast(t('settings.goalSaved', { xp: g }))
              }}
              className={`rounded-2xl border-2 px-3 py-2.5 text-center transition-colors ${active ? 'border-brand bg-brand-light text-brand' : 'border-line hover:bg-snow'}`}
            >
              <span className="block text-[15px] font-black">{t(`settings.goal.${g}` as UIKey)}</span>
              <span className="block text-[13px] font-bold text-muted">{g} XP</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function SettingsScreen() {
  const { session } = useStore()
  const email = session?.email ?? ''
  return (
    <div className="mx-auto max-w-[600px]" data-settings-screen>
      <BackHeader title={t('x01xs7fy')} />
      <section className="card p-4" aria-labelledby="settings-lang">
        <h2 id="settings-lang" className="text-[18px] font-black leading-tight">{t('lang.label')}</h2>
        <p className="mb-3 text-[14px] font-semibold leading-snug text-muted">{t('lang.hint')}</p>
        <LanguageSwitcher variant="list" />
      </section>
      <SoundToggle where="settings" />
      <GoalPicker />
      <RemindersToggle />
      <section className="card mt-6 p-4" aria-labelledby="settings-account" data-settings-account>
        <h2 id="settings-account" className="text-[18px] font-black leading-tight">{t('settings.account')}</h2>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-snow px-4 py-3">
          <span className="text-[14px] font-extrabold text-muted">{t('settings.email')}</span>
          <span className="min-w-0 truncate text-[15px] font-black" data-account-email>
            {email || '—'}
          </span>
        </div>
        <a
          href={mailto(t('settings.deleteSubject'), t('settings.deleteBody', { email }))}
          className="mt-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-coral-light px-4 py-3 transition-colors hover:bg-coral-light/50"
          data-delete-account
        >
          <span className="min-w-0">
            <span className="block text-[16px] font-black text-coral-dark">{t('settings.deleteLabel')}</span>
            <span className="block text-[13px] font-semibold leading-snug text-muted">{t('settings.deleteHint')}</span>
          </span>
        </a>
      </section>
    </div>
  )
}

const FAQ = [1, 2, 3, 4, 5] as const

export function HelpScreen() {
  return (
    <div className="mx-auto max-w-[600px]" data-help-screen>
      <BackHeader title={t('x0m2n6mj')} sub={t('help.subtitle')} />
      <div className="card divide-y-2 divide-line overflow-hidden">
        {FAQ.map((n) => (
          <details key={n} className="group px-4 py-3.5" data-faq={n}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[16px] font-black leading-snug">
              {t(`help.q${n}` as UIKey)}
              <span className="shrink-0 text-[20px] text-brand transition-transform group-open:rotate-90" aria-hidden>
                ›
              </span>
            </summary>
            <p className="mt-2 text-[15px] font-semibold leading-snug text-muted">{t(`help.a${n}` as UIKey)}</p>
          </details>
        ))}
      </div>
      <section className="card mt-6 flex flex-col items-center gap-2 p-5 text-center" data-help-contact>
        <Mascot mood="think" size={90} />
        <h2 className="text-[20px] font-black">{t('help.contactTitle')}</h2>
        <p className="text-[15px] font-semibold text-muted">{t('help.contactBody')}</p>
        <a href={mailto()} className="btn mt-2">
          {t('help.contactCta')}
        </a>
        <span className="text-[13px] font-bold text-muted">{SUPPORT_EMAIL}</span>
      </section>
    </div>
  )
}
