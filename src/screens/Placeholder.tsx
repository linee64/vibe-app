import { Mascot } from '../components/Mascot'
import { useStore } from '../store'
import { useToast } from '../components/Toast'
import { useFeedback } from '../components/FeedbackProvider'
import { t } from '../i18n/core'
import { tx } from '../i18n/rich'

export function QuestsSoon() {
  return (
    <div className="mx-auto max-w-[600px]">
      <div className="mb-6 flex items-center gap-5 rounded-[24px] bg-gold-light px-6 py-5">
        <Mascot mood="think" size={96} className="shrink-0" />
        <div>
          <span className="rounded-full bg-gold px-2.5 py-1 text-[12px] font-black uppercase tracking-wider text-[#5a3d00]">{t('x036ap5y')}</span>
          <h1 className="mt-2 text-[24px] font-black leading-tight">{t('x1rejxdo')}</h1>
          <p className="text-[15px] font-semibold text-muted">{t('x1avsk02')}</p>
        </div>
      </div>
      <div className="card relative overflow-hidden p-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-extrabold uppercase tracking-wider text-brand">{t('x0awc7te')}</span>
          <span className="rounded-full bg-snow px-2.5 py-1 text-[12px] font-black uppercase tracking-wider text-muted">{t('x036ap5y')}</span>
        </div>
        <h2 className="mt-2 text-[20px] font-black">{t('x1r3knvp')}</h2>
        <p className="mt-1 text-[15px] font-semibold text-muted">{t('x1lf9vqx')}</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[t('x0ymyyns'), '✅ Todo', t('x1pzgpqu')].map((t) => (
            <div key={t} className="rounded-2xl border-2 border-dashed border-line py-4 text-center text-[15px] font-extrabold text-muted">
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MoreSoon() {
  const { logout } = useStore()
  const toast = useToast()
  const feedback = useFeedback()
  const items = [t('x01xs7fy'), t('x1f2lm2g'), t('x0m2n6mj'), t('x09a7sjx')]
  return (
    <div className="mx-auto max-w-[600px]">
      <div className="flex flex-col items-center py-6 text-center">
        <Mascot mood="think" size={130} />
        <h1 className="mt-3 text-[26px] font-black">{t('x11nz6ut')}</h1>
        <p className="mt-1 text-[16px] font-semibold text-muted">{t('x0ylw368')}</p>
      </div>
      <div className="card divide-y-2 divide-line">
        {items.map((item) => (
          <button key={item} onClick={() => toast(t('x1y4ob1e', { what: item }))} className="flex w-full items-center justify-between px-5 py-4 text-left text-[17px] font-extrabold hover:bg-snow">
            {item}
            <span className="rounded-full bg-snow px-2.5 py-1 text-[12px] font-black uppercase tracking-wider text-muted">{t('x036ap5y')}</span>
          </button>
        ))}
        <button onClick={() => feedback.open({ entry: 'more' })} className="flex w-full items-center justify-between px-5 py-4 text-left text-[17px] font-extrabold text-brand hover:bg-brand-light/50" data-feedback-open="more">{tx('x13itlzf', {}, [(chunk) => <span aria-hidden>{chunk}</span>])}</button>
        <button onClick={logout} className="flex w-full items-center px-5 py-4 text-left text-[17px] font-extrabold text-coral-dark hover:bg-coral-light/50">{t('x0gojai6')}</button>
      </div>
    </div>
  )
}
