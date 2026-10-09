import { UNIT_COLORS } from '../data/types'
import type { Tier } from '../data/tiers'
import { t } from '../i18n/core'

/** Значок тира: щит с 1–3 звёздами в цвете тира (серый — если закрыт) */
export function TierBadge({ tier, size = 56, locked = false }: { tier: Tier; size?: number; locked?: boolean }) {
  const c = UNIT_COLORS[tier.color]
  const main = locked ? '#C9C3DD' : c.main
  const dark = locked ? '#A39DBA' : c.dark
  const stars = tier.num
  const xs = stars === 1 ? [32] : stars === 2 ? [25, 39] : [20, 32, 44]
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label={t('x1bznf1q', { name: tier.name })} role="img">
      <path d="M32 4 56 13v17c0 15-10.6 24-24 30C18.6 54 8 45 8 30V13z" fill={dark} />
      <path d="M32 4 56 13v16c0 14.6-10.6 23.2-24 29C18.6 52.2 8 43.6 8 29V13z" fill={main} />
      <path d="M32 9.5 51 16.6v12.2c0 11.6-8.3 18.6-19 23.4-10.7-4.8-19-11.8-19-23.4V16.6z" fill="#fff" opacity=".18" />
      {xs.map((x, i) => (
        <path
          key={i}
          transform={`translate(${x - 32} ${stars === 3 && i === 1 ? -4 : 0})`}
          d="M32 20.5l3 6.1 6.7.9-4.9 4.6 1.2 6.6L32 35.6l-6 3.1 1.2-6.6-4.9-4.6 6.7-.9z"
          fill={locked ? '#fff' : '#FFC23D'}
          stroke={locked ? '#fff' : '#E5A100'}
          strokeWidth="1.2"
          strokeLinejoin="round"
          style={{ transformBox: 'fill-box', transformOrigin: 'center', scale: stars === 1 ? '1.25' : stars === 3 && i !== 1 ? '.8' : '1' }}
        />
      ))}
    </svg>
  )
}
