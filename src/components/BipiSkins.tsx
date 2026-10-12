/**
 * Рисунки вещей из «Гардероба Бипи» — слои inline SVG в координатах <Mascot /> (viewBox 0 0 200 220).
 * part="back" — то, что за телом (плащ, капюшон), part="front" — поверх. Палитра бренда: фиолетовый, коралловый,
 * бирюзовый, золото и «чернила»; зелёного нет.
 */
const INK = '#2F2A47'
const INK2 = '#433B66'
const V = '#7C4DFF'
const VD = '#5B2FD6'
const DEEP = '#3D2C8D'
const TEAL = '#13C2AE'
const CORAL = '#FF7A59'
const CORAL_D = '#E0573A'
const GOLD = '#FFC23D'
const GOLD_D = '#E5A100'

const star = (cx: number, cy: number, r: number) => {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 ? r * 0.45 : r
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

export function SkinArt({ id, part, happy = false }: { id: string; part: 'back' | 'front'; happy?: boolean }) {
  if (part === 'back') {
    if (id === 'cape')
      return (
        <g data-skin-art={id}>
          <path d="M68 134 L30 206 Q100 218 170 206 L132 134 Z" fill={DEEP} />
          <path d="M72 140 L42 203 Q100 213 158 203 L128 140 Z" fill={CORAL} />
        </g>
      )
    if (id === 'hacker-hood')
      return <path data-skin-art={id} d="M24 150 C14 82 40 14 100 12 C160 14 186 82 176 150 Z" fill={INK} />
    return null
  }
  switch (id) {
    case 'cap':
      return (
        <g data-skin-art={id}>
          {/* козырёк смотрит назад — виден из-за макушки */}
          <path d="M118 30 Q150 6 182 16 Q168 34 132 42 Z" fill={CORAL_D} />
          <path d="M36 68 Q34 24 100 22 Q166 24 164 68 Q100 56 36 68 Z" fill={CORAL} />
          <path d="M36 68 Q100 56 164 68" stroke={CORAL_D} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M86 64 Q100 42 114 64 Z" fill={V} />
          <path d="M84 60 H116" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity=".85" />
          <path d="M100 23 V58" stroke={CORAL_D} strokeWidth="2.5" opacity=".5" />
          <circle cx="100" cy="23" r="5" fill={CORAL_D} />
          <rect x="54" y="34" width="22" height="7" rx="3.5" fill="#fff" opacity=".3" />
        </g>
      )
    case 'headphones':
      return (
        <g data-skin-art={id}>
          <path d="M33 86 C30 8 170 8 167 86" stroke={INK} strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M44 50 C60 20 140 20 156 50" stroke={INK2} strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="16" y="64" width="32" height="48" rx="15" fill={CORAL} />
          <rect x="152" y="64" width="32" height="48" rx="15" fill={CORAL} />
          <rect x="16" y="64" width="12" height="48" rx="6" fill={CORAL_D} />
          <rect x="172" y="64" width="12" height="48" rx="6" fill={CORAL_D} />
          <circle cx="36" cy="78" r="3.5" fill={TEAL} />
          <circle cx="164" cy="78" r="3.5" fill={TEAL} />
        </g>
      )
    case 'top-hat':
      return (
        <g data-skin-art={id} transform="rotate(-7 100 44)">
          <rect x="66" y="2" width="68" height="46" rx="7" fill={INK} />
          <rect x="66" y="30" width="68" height="11" fill={CORAL} />
          <rect x="74" y="7" width="8" height="20" rx="4" fill="#fff" opacity=".16" />
          <ellipse cx="100" cy="47" rx="58" ry="9" fill={INK} />
          <ellipse cx="100" cy="45" rx="50" ry="5" fill={INK2} />
          <circle cx="124" cy="35.5" r="3.5" fill={GOLD} />
        </g>
      )
    case 'wizard-hat':
      return (
        <g data-skin-art={id}>
          <path d="M54 50 C70 32 82 14 96 5 C108 -2 128 2 138 14 C126 9 116 13 113 22 C120 32 134 42 146 50 Z" fill={DEEP} />
          <path d="M60 46 Q100 34 140 46" stroke={TEAL} strokeWidth="6" fill="none" strokeLinecap="round" />
          <ellipse cx="100" cy="51" rx="64" ry="9" fill={DEEP} />
          <ellipse cx="100" cy="49" rx="54" ry="4" fill="#5A45B8" />
          <polygon points={star(88, 30, 6)} fill={GOLD} />
          <polygon points={star(112, 40, 4)} fill={GOLD} />
          <path d="M104 18 a6 6 0 1 0 6 8 a4.6 4.6 0 1 1 -6 -8 z" fill={GOLD} />
          <circle cx="139" cy="14" r="5" fill={GOLD} />
        </g>
      )
    case 'crown':
      return (
        <g data-skin-art={id}>
          <path d="M58 48 L52 14 L77 31 L100 4 L123 31 L148 14 L142 48 Z" fill={GOLD} />
          <path d="M100 4 L123 31 L148 14 L142 48 L100 48 Z" fill={GOLD_D} opacity=".35" />
          <rect x="56" y="40" width="88" height="12" rx="5" fill={GOLD_D} />
          <circle cx="52" cy="14" r="5" fill={GOLD} />
          <circle cx="100" cy="4" r="5" fill={GOLD} />
          <circle cx="148" cy="14" r="5" fill={GOLD} />
          <circle cx="100" cy="46" r="5" fill={CORAL} />
          <circle cx="78" cy="46" r="3.8" fill={V} />
          <circle cx="122" cy="46" r="3.8" fill={TEAL} />
          <path d="M66 24 L70 38" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".5" />
        </g>
      )
    case 'astro-helmet':
      return (
        <g data-skin-art={id}>
          <path d="M39 138 A80 80 0 1 1 161 138 Z" fill="#DDF7FF" opacity=".22" />
          <path d="M39 138 A80 80 0 1 1 161 138" fill="none" stroke="#E7E3F2" strokeWidth="7" />
          <path d="M42 64 Q58 26 98 16" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".75" />
          <circle cx="150" cy="48" r="4" fill="#fff" opacity=".7" />
          <rect x="44" y="130" width="112" height="18" rx="9" fill="#E7E3F2" />
          <rect x="44" y="130" width="112" height="6" rx="3" fill="#fff" opacity=".6" />
          <circle cx="64" cy="139" r="3.5" fill={CORAL} />
          <circle cx="136" cy="139" r="3.5" fill={TEAL} />
          <rect x="86" y="136" width="28" height="6" rx="3" fill="#C9C3DD" />
        </g>
      )
    case 'hacker-hood':
      return (
        <g data-skin-art={id}>
          <path d="M21 138 C13 70 46 22 100 22 C154 22 187 70 179 138 L156 138 C160 82 140 46 100 46 C60 46 40 82 44 138 Z" fill={INK2} />
          <path d="M44 136 C40 82 60 46 100 46 C140 46 160 82 156 136" stroke={INK} strokeWidth="3" fill="none" />
          <g stroke={TEAL} strokeWidth="3" strokeLinecap="round">
            <path d="M74 130 V156" />
            <path d="M126 130 V156" />
          </g>
          <circle cx="74" cy="158" r="3.5" fill={TEAL} />
          <circle cx="126" cy="158" r="3.5" fill={TEAL} />
          <path d="M92 30 l-6 5 6 5 M108 30 l6 5 -6 5 M102 28 l-4 14" stroke={TEAL} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )
    case 'pixel-shades':
      return (
        <g data-skin-art={id} fill={INK}>
          <rect x="44" y="78" width="16" height="5" />
          <rect x="140" y="78" width="16" height="5" />
          <rect x="58" y="76" width="84" height="7" />
          <rect x="60" y="80" width="32" height="16" />
          <rect x="64" y="96" width="24" height="5" />
          <rect x="108" y="80" width="32" height="16" />
          <rect x="112" y="96" width="24" height="5" />
          <rect x="66" y="84" width="6" height="5" fill="#fff" />
          <rect x="72" y="89" width="5" height="4" fill="#fff" />
          <rect x="114" y="84" width="6" height="5" fill="#fff" />
          <rect x="120" y="89" width="5" height="4" fill="#fff" />
        </g>
      )
    case 'round-glasses':
      return (
        <g data-skin-art={id} stroke={CORAL_D} strokeWidth="4.5" strokeLinecap="round">
          <circle cx="80" cy="88" r="16" fill="#fff" fillOpacity=".25" />
          <circle cx="120" cy="88" r="16" fill="#fff" fillOpacity=".25" />
          <path d="M96 86 Q100 81 104 86" fill="none" />
          <path d="M64 84 L52 80 M136 84 L148 80" fill="none" />
          <path d="M72 80 Q76 76 80 76" stroke="#fff" strokeWidth="3" fill="none" opacity=".8" />
        </g>
      )
    case 'bowtie':
      return (
        <g data-skin-art={id}>
          <path d="M100 142 L80 131 Q75 142 80 153 Z" fill={CORAL} />
          <path d="M100 142 L120 131 Q125 142 120 153 Z" fill={CORAL} />
          <circle cx="85" cy="138" r="1.8" fill="#fff" />
          <circle cx="84" cy="147" r="1.8" fill="#fff" />
          <circle cx="115" cy="138" r="1.8" fill="#fff" />
          <circle cx="116" cy="147" r="1.8" fill="#fff" />
          <rect x="94" y="136" width="12" height="12" rx="4" fill={CORAL_D} />
        </g>
      )
    case 'hoodie':
      return (
        <g data-skin-art={id}>
          {happy && (
            <g stroke={CORAL} strokeWidth="15" strokeLinecap="round" fill="none">
              <path d="M72 162 Q52 161 38 147" />
              <path d="M128 162 Q148 161 162 147" />
            </g>
          )}
          <rect x="60" y="143" width="80" height="60" rx="25" fill={CORAL_D} />
          <rect x="60" y="136" width="80" height="60" rx="25" fill={CORAL} />
          <path d="M68 140 Q100 126 132 140 Q122 154 100 154 Q78 154 68 140 Z" fill={CORAL_D} />
          <g stroke="#fff" strokeWidth="3" strokeLinecap="round">
            <path d="M92 150 L90 168" />
            <path d="M108 150 L110 168" />
          </g>
          <path d="M80 180 H120 L116 194 H84 Z" fill={CORAL_D} />
          <path d="M88 166 l-6 5 6 5 M112 166 l6 5 -6 5 M103 164 l-6 14" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".75" />
        </g>
      )
    case 'cape':
      return (
        <g data-skin-art={id}>
          <path d="M76 142 L54 112 L88 132 Z" fill={DEEP} />
          <path d="M124 142 L146 112 L112 132 Z" fill={DEEP} />
          <path d="M76 142 L60 119 L86 134 Z" fill={CORAL} />
          <path d="M124 142 L140 119 L114 134 Z" fill={CORAL} />
          <path d="M80 141 Q100 148 120 141" stroke={GOLD_D} strokeWidth="2.5" fill="none" />
          <circle cx="100" cy="143" r="6" fill={GOLD} stroke={GOLD_D} strokeWidth="2" />
        </g>
      )
    default:
      return null
  }
}

/** Значок слота для вкладок гардероба */
export function SlotGlyph({ slot, size = 22 }: { slot: 'all' | 'head' | 'face' | 'body'; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      {slot === 'all' && <path d="M4 7 L9 4 Q12 6 15 4 L20 7 L18 11 L16 10 V20 H8 V10 L6 11 Z" fill={V} />}
      {slot === 'head' && (
        <g>
          <path d="M5 15 Q5 5 12 5 Q19 5 19 15 Z" fill={CORAL} />
          <rect x="3" y="14" width="18" height="4" rx="2" fill={CORAL_D} />
        </g>
      )}
      {slot === 'face' && (
        <g fill={INK}>
          <rect x="3" y="9" width="8" height="6" rx="2" />
          <rect x="13" y="9" width="8" height="6" rx="2" />
          <rect x="10" y="10" width="4" height="2" />
        </g>
      )}
      {slot === 'body' && (
        <g>
          <path d="M12 12 L4 7 Q2 12 4 17 Z" fill={VD} />
          <path d="M12 12 L20 7 Q22 12 20 17 Z" fill={VD} />
          <rect x="10" y="10" width="4" height="4" rx="1.5" fill={DEEP} />
        </g>
      )}
    </svg>
  )
}
