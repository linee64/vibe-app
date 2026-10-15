/**
 * Графика приложения — та же, что в вебе. Иконки, Бипи, вещи гардероба и иллюстрации разделов импортируются
 * прямо из ../src/components (inline SVG → react-native-svg, см. scripts/babel-plugin-web-svg.js),
 * так что правка рисунка в вебе сразу попадает и в приложение.
 */
import Svg, { G, Path } from 'react-native-svg'
import { UNIT_COLORS } from '@web/data/types'
import type { Tier } from '@web/data/tiers'
import { t } from '@web/i18n/core'

export {
  Battery,
  Book,
  Check,
  Chest,
  Clock,
  Cross,
  Dumbbell,
  FeedbackBubble,
  House,
  Lock,
  NavLearn,
  NavLeague,
  NavLogout,
  NavMore,
  NavProfile,
  NavQuests,
  Rocket,
  Shield,
  Spark,
  Star,
  Target,
  Token,
  Trophy,
} from '@web/components/Icons'
export { Mascot, MascotHead } from '@web/components/Mascot'
export { SkinArt, SlotGlyph } from '@web/components/BipiSkins'
export { AgentArt, AiChatArt, BrowserArt, BugArt, DatabaseArt, DesignArt, PhoneArt, RocketArt } from '@web/components/Illustrations'
export { MascotLookContext } from '@web/components/mascotLook'

const STAR = 'M32 20.5l3 6.1 6.7.9-4.9 4.6 1.2 6.6L32 35.6l-6 3.1 1.2-6.6-4.9-4.6 6.7-.9z'

/**
 * Значок тира (щит с 1–3 звёздами) — рисунок как в src/components/TierBadge.tsx; там масштаб звёзд задан
 * CSS-стилем (transform-box), которого нет в react-native-svg, поэтому масштаб здесь — обычным transform.
 */
export function TierBadge({ tier, size = 56, locked = false }: { tier: Tier; size?: number; locked?: boolean }) {
  const c = UNIT_COLORS[tier.color]
  const main = locked ? '#C9C3DD' : c.main
  const dark = locked ? '#A39DBA' : c.dark
  const stars = tier.num
  const xs = stars === 1 ? [32] : stars === 2 ? [25, 39] : [20, 32, 44]
  // центр звезды ≈ (32, 29.6)
  const cy = 29.6
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel={t('x1bznf1q', { name: tier.name })}>
      <Path d="M32 4 56 13v17c0 15-10.6 24-24 30C18.6 54 8 45 8 30V13z" fill={dark} />
      <Path d="M32 4 56 13v16c0 14.6-10.6 23.2-24 29C18.6 52.2 8 43.6 8 29V13z" fill={main} />
      <Path d="M32 9.5 51 16.6v12.2c0 11.6-8.3 18.6-19 23.4-10.7-4.8-19-11.8-19-23.4V16.6z" fill="#fff" opacity={0.18} />
      {xs.map((x, i) => {
        const s = stars === 1 ? 1.25 : stars === 3 && i !== 1 ? 0.8 : 1
        const dy = stars === 3 && i === 1 ? -4 : 0
        return (
          <G key={i} transform={`translate(${x} ${cy + dy}) scale(${s}) translate(-32 -${cy})`}>
            <Path d={STAR} fill={locked ? '#fff' : '#FFC23D'} stroke={locked ? '#fff' : '#E5A100'} strokeWidth={1.2} strokeLinejoin="round" />
          </G>
        )
      })}
    </Svg>
  )
}
