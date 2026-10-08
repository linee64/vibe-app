import { useState } from 'react'
import { navigate } from '../router'
import { useToast } from './Toast'
import { Mascot } from './Mascot'
import { PRICES, PRO_FEATURES, TRIAL_DAYS, annualPerMonth, annualSavePct, usd } from '../data/pricing'
import { startCheckout, type Plan } from '../lib/billing'

/** Дружелюбный пейвол: раздел доступен в Pro (или в пробный период) */
export function PaywallScreen({ title }: { title?: string }) {
  const toast = useToast()
  const [plan, setPlan] = useState<Plan>('annual')
  const [busy, setBusy] = useState(false)
  const annual = plan === 'annual'

  const go = async () => {
    if (busy) return
    setBusy(true)
    const err = await startCheckout(plan)
    if (err) {
      toast(err)
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-end justify-center bg-ink/40 sm:items-center sm:p-6" data-paywall>
      <div className="anim-fade-up w-full max-w-[460px] rounded-t-[28px] bg-white p-6 pb-8 shadow-[0_-6px_0_rgba(47,42,71,.08)] sm:rounded-[28px] sm:shadow-[0_8px_0_rgba(47,42,71,.12)]">
        <div className="flex items-center gap-4">
          <Mascot mood="happy" size={84} className="anim-float shrink-0" />
          <div>
            <div className="text-[13px] font-black uppercase tracking-wider text-coral">Вайбик Pro</div>
            <h1 className="text-[24px] font-black leading-tight">{title ? `«${title}» — в Pro` : 'Этот раздел — в Pro'}</h1>
          </div>
        </div>
        <p className="mt-3 text-[16px] font-semibold text-muted">
          Первый раздел бесплатный навсегда. Дальше — {TRIAL_DAYS} дня Pro бесплатно, отменить можно в любой момент.
        </p>
        <ul className="mt-4 space-y-2">
          {PRO_FEATURES.slice(0, 4).map((f) => (
            <li key={f} className="flex items-start gap-2 text-[15px] font-bold">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-light text-[12px] text-teal-dark">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-snow p-1.5" role="radiogroup" aria-label="Тариф">
          {(['monthly', 'annual'] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={plan === p}
              onClick={() => setPlan(p)}
              className={`rounded-xl px-3 py-2.5 text-center text-[15px] font-extrabold transition-colors ${plan === p ? 'bg-white text-brand shadow-[0_3px_0_var(--color-line)]' : 'text-muted hover:text-ink'}`}
            >
              {p === 'monthly' ? `${usd(PRICES.monthly)} / мес` : `${usd(annualPerMonth)} / мес`}
              {p === 'annual' && <span className="ml-1 rounded-full bg-gold px-1.5 py-0.5 text-[11px] font-black text-[#5a3d00]">−{annualSavePct}%</span>}
            </button>
          ))}
        </div>

        <button className="btn btn-coral btn-block btn-bouncy mt-4 !min-h-[54px] !text-[16px]" onClick={go} disabled={busy}>
          {busy ? 'Открываю оплату…' : `Попробовать ${TRIAL_DAYS} дня бесплатно`}
        </button>
        <p className="mt-2 text-center text-[13px] font-semibold text-muted">
          Сегодня $0. Через {TRIAL_DAYS} дня — {usd(annual ? PRICES.annual : PRICES.monthly)} {annual ? 'за год' : 'в месяц'}, если не отменишь.
        </p>
        <button className="btn btn-ghost btn-block mt-3" onClick={() => navigate('/learn')}>
          Вернуться к бесплатному
        </button>
      </div>
    </div>
  )
}
