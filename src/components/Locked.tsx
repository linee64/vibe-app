import { navigate } from '../router'
import { useStore } from '../store'
import { TIERS, tierItems, type Tier } from '../data/tiers'
import { Mascot } from './Mascot'
import { TierBadge } from './TierBadge'

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
      <h1 className="text-[26px] font-black leading-tight">Тир «{tier.name}» пока закрыт</h1>
      {prev && (
        <p className="max-w-[380px] text-[16px] font-semibold text-muted">
          Заверши тир {prev.name}, чтобы открыть: {done}/{items.length} — итоговые тесты и домашки. Или докажи знания тестом на уровень.
        </p>
      )}
      <div className="mt-2 flex w-full max-w-[360px] flex-col gap-3">
        <button className="btn btn-block" onClick={() => navigate(`/placement/${tier.id}`)}>
          Тест на уровень
        </button>
        <button className="btn btn-ghost btn-block" onClick={() => navigate('/learn')}>
          На главную
        </button>
      </div>
    </div>
  )
}
