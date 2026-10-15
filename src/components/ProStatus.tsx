/**
 * Вайбик Pro для тех, кто уже купил: компактный статус вместо карточки тарифа и блок «Подписка» в настройках.
 * Логика (что показывать, где управлять) — src/data/proStatus.ts, тексты — src/data/proText.ts.
 */
import { useState } from 'react'
import { Check } from './Icons'
import { useToast } from './Toast'
import { navigate } from '../router'
import { t } from '../i18n/core'
import { openPortal, usePro } from '../lib/billing'
import { track } from '../lib/analytics'
import { managePlan, type ProStatus } from '../data/proStatus'
import { proPlanName, proStateLine, proSummary, proViaName } from '../data/proText'

/** Компактный статус «Вайбик Pro активен» (профиль, лендинг, пейвол) — без кнопок покупки */
export function ProActiveCard({ pro, className = 'mt-8', action }: { pro: ProStatus; className?: string; action?: { label: string; onClick: () => void } }) {
  const summary = proSummary(pro)
  return (
    <div className={`relative overflow-hidden rounded-[20px] bg-brand p-4 text-white shadow-[0_5px_0_#5B2FD6] sm:p-5 ${className}`} data-plan="pro" data-pro-state={pro.state ?? ''}>
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10" />
      <div className="relative flex items-center gap-3">
        <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-gold text-[#5a3d00] shadow-[0_3px_0_#E5A100]" aria-hidden>
          <Check size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[18px] font-black leading-tight">{t('pro.activeTitle')}</h3>
          {summary && <p className="mt-0.5 text-[14px] font-semibold leading-snug text-white/85" data-pro-summary>{summary}</p>}
        </div>
        {action && (
          <button className="btn btn-white btn-sm shrink-0" onClick={action.onClick} data-pro-action>
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}

/** «Подписка» в настройках: тариф, статус (активна / отменена, до …), где оплачено, «Управлять» / «Отменить» */
export function SubscriptionSettings() {
  const pro = usePro()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  if (!pro.pro) return null
  const plan = managePlan(pro, 'web')

  const manage = async (intent: 'manage' | 'cancel') => {
    if (busy) return
    track('subscription_manage_opened', { intent, source: pro.source ?? 'none' })
    if (plan.action === 'demo') return toast(t('pro.hint.demo'))
    setBusy(true)
    const err = await openPortal()
    if (err) {
      toast(err)
      setBusy(false)
    }
  }

  const rows: [string, string, string][] = [
    [t('pro.planLabel'), proPlanName(pro) || '—', 'plan'],
    [t('pro.statusLabel'), proStateLine(pro), 'status'],
    [t('pro.viaLabel'), proViaName(pro.source), 'via'],
  ]
  return (
    <section className="card mt-6 p-4" aria-labelledby="settings-sub" data-settings-subscription data-pro-source={pro.source ?? ''}>
      <div className="flex items-center gap-3">
        <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-2xl bg-brand-light text-[22px]" aria-hidden>
          ✨
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="settings-sub" className="text-[18px] font-black leading-tight">{t('pro.section')}</h2>
          <p className="text-[14px] font-bold leading-snug text-brand">{t('pro.activeTitle')}</p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map(([label, value, key]) => (
          <div key={key} className="flex items-center justify-between gap-3 rounded-2xl bg-snow px-4 py-3" data-sub-row={key}>
            <span className="text-[14px] font-extrabold text-muted">{label}</span>
            <span className={`min-w-0 text-right text-[15px] font-black ${key === 'status' && pro.state === 'cancelled' ? 'text-coral-dark' : ''}`}>{value}</span>
          </div>
        ))}
      </div>
      {plan.action ? (
        <>
          <button className="btn btn-block mt-4" onClick={() => void manage('manage')} disabled={busy} data-sub-manage>
            {busy ? t('x0vfsu1y') : t('pro.manage')}
          </button>
          {pro.state !== 'cancelled' && (
            <button
              className="mt-3 flex w-full items-center justify-center rounded-2xl border-2 border-coral-light px-4 py-3 text-[15px] font-black text-coral-dark transition-colors hover:bg-coral-light/50"
              onClick={() => void manage('cancel')}
              disabled={busy}
              data-sub-cancel
            >
              {t('pro.cancel')}
            </button>
          )}
          <p className="mt-3 text-[13px] font-semibold leading-snug text-muted">{t(`pro.hint.${plan.action}`)}</p>
        </>
      ) : plan.elsewhere ? (
        <p className="mt-4 rounded-2xl bg-gold-light px-4 py-3 text-[14px] font-bold leading-snug text-[#8a6a1e]" data-sub-elsewhere={plan.elsewhere}>
          {t(`pro.elsewhere.${plan.elsewhere}`)}
        </p>
      ) : null}
    </section>
  )
}

/** Кнопка «Подробнее» с компактной карточки → настройки подписки */
export const toSubscriptionSettings = { get label() { return t('pro.details') }, onClick: () => navigate('/settings') }
