import { navigate } from '../router'
import { useStore } from '../store'
import { TIERS, tierItems, type Tier } from '../data/tiers'
import { Mascot } from './Mascot'
import { TierBadge } from './TierBadge'
import { t } from '../i18n/core'

/** Экран для прямого перехода по ссылке на урок/домашку закрытого тира */
export function LockedScreen({ tier }: { tier: Tier }) {
  const { progress } = useStore()
  const prev = TIERS[TIERS.findIndex((t) => t.id === tier.id) - 1]
  const items = prev ? tierItems(prev, progress) : []
  const done = items.filter((i) => i.done).length
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center" data-locked-screen>
      <div className="relative">
        <Mascot mood="think" size={130} />
        <span className="absolute -right-4 bottom-2">
          <TierBadge tier={tier} size={56} locked />
        </span>
      </div>
      <h1 className="text-[26px] font-black leading-tight">{t('x0sn18rr', { name: tier.name })}</h1>
      {prev && (
        <p className="max-w-[380px] text-[16px] font-semibold text-muted">{t('x0m3s23k', { name: prev.name, done, length: items.length })}</p>
      )}
      <div className="mt-2 flex w-full max-w-[360px] flex-col gap-3">
        <button className="btn btn-block" onClick={() => navigate(`/placement/${tier.id}`)}>{t('x0tw0ozv')}</button>
        <button className="btn btn-ghost btn-block" onClick={() => navigate('/learn')}>{t('x0povobi')}</button>
      </div>
    </div>
  )
}
