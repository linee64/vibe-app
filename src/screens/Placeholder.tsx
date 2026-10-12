import { Mascot } from '../components/Mascot'
import { useStore } from '../store'
import { useToast } from '../components/Toast'
import { useFeedback } from '../components/FeedbackProvider'
import { t } from '../i18n/core'
import { tx } from '../i18n/rich'

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
