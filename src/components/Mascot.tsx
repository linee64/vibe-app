type Mood = 'default' | 'happy' | 'think'

interface Props {
  mood?: Mood
  size?: number
  className?: string
  laptop?: boolean
}

const INK = '#2F2A47'
const V = '#7C4DFF'
const VD = '#5B2FD6'
const TEAL = '#13C2AE'
const CORAL = '#FF7A59'

/** Бипи — робот-талисман Вайбика (оригинальная иллюстрация, inline SVG) */
export function Mascot({ mood = 'default', size = 160, className, laptop }: Props) {
  const happy = mood === 'happy'
  const think = mood === 'think'
  const showLaptop = laptop ?? !happy
  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={(size * 220) / 200}
      className={className}
      role="img"
      aria-label="Бипи — робот-талисман Вайбика"
    >
      <ellipse cx="100" cy="211" rx="58" ry="7" fill={INK} opacity=".08" />

      {/* antenna */}
      <path d="M100 42 V22" stroke={VD} strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy="17" r="10" fill={CORAL} />
      <circle cx="96.5" cy="13.5" r="3.2" fill="#fff" opacity=".75" />

      {/* arms (raised when happy) */}
      {happy && (
        <g>
          <path d="M72 162 Q40 160 20 128" stroke={VD} strokeWidth="13" strokeLinecap="round" fill="none" />
          <path d="M128 162 Q160 160 180 128" stroke={VD} strokeWidth="13" strokeLinecap="round" fill="none" />
          <circle cx="18" cy="122" r="12" fill={V} stroke={VD} strokeWidth="3" />
          <circle cx="182" cy="122" r="12" fill={V} stroke={VD} strokeWidth="3" />
        </g>
      )}

      {/* body */}
      <rect x="86" y="126" width="28" height="18" rx="6" fill={VD} />
      <rect x="62" y="144" width="76" height="58" rx="24" fill={VD} />
      <rect x="62" y="138" width="76" height="58" rx="24" fill={V} />
      {happy && (
        <g>
          <rect x="80" y="152" width="40" height="28" rx="10" fill="#EFE9FF" />
          <path d="M100 173 c-7-4.5-10-8-10-11.5a4.6 4.6 0 0 1 10-1.6a4.6 4.6 0 0 1 10 1.6c0 3.5-3 7-10 11.5z" fill={CORAL} />
          <rect x="70" y="194" width="24" height="13" rx="6.5" fill={VD} />
          <rect x="106" y="194" width="24" height="13" rx="6.5" fill={VD} />
        </g>
      )}

      {/* ears */}
      <rect x="25" y="70" width="19" height="36" rx="9.5" fill={TEAL} />
      <rect x="156" y="70" width="19" height="36" rx="9.5" fill={TEAL} />
      <rect x="29" y="76" width="5" height="12" rx="2.5" fill="#fff" opacity=".45" />

      {/* head */}
      <rect x="37" y="44" width="126" height="98" rx="38" fill={VD} />
      <rect x="37" y="37" width="126" height="98" rx="38" fill={V} />
      <rect x="56" y="45" width="36" height="9" rx="4.5" fill="#fff" opacity=".22" />

      {/* face screen */}
      <rect x="53" y="57" width="94" height="64" rx="26" fill="#F4F0FF" />

      {/* eyes */}
      {happy ? (
        <g stroke={INK} strokeWidth="5.5" strokeLinecap="round" fill="none">
          <path d="M70 91 Q79 78 88 91" />
          <path d="M112 91 Q121 78 130 91" />
        </g>
      ) : (
        <g>
          <ellipse cx="80" cy="87" rx="9.5" ry="11.5" fill={INK} />
          <ellipse cx="120" cy="87" rx="9.5" ry="11.5" fill={INK} />
          <circle cx={think ? 84 : 83.5} cy={think ? 80 : 82} r="3.4" fill="#fff" />
          <circle cx={think ? 124 : 123.5} cy={think ? 80 : 82} r="3.4" fill="#fff" />
        </g>
      )}

      {/* cheeks */}
      <ellipse cx="66" cy="105" rx="7.5" ry="4.5" fill="#FF9C85" opacity=".85" />
      <ellipse cx="134" cy="105" rx="7.5" ry="4.5" fill="#FF9C85" opacity=".85" />

      {/* mouth */}
      {happy ? (
        <g>
          <path d="M85 101 H115 Q114 117 100 117 Q86 117 85 101 Z" fill={INK} />
          <ellipse cx="100" cy="112.5" rx="7" ry="3.6" fill={CORAL} />
        </g>
      ) : think ? (
        <path d="M93 107 Q100 104 107 107" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M89 103 Q100 113 111 103" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      )}

      {/* laptop */}
      {showLaptop && (
        <g>
          <rect x="50" y="150" width="100" height="54" rx="10" fill={INK} />
          <rect x="50" y="150" width="100" height="6" rx="3" fill="#fff" opacity=".08" />
          <g stroke={TEAL} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M90 168 L81 177 L90 186" />
            <path d="M110 168 L119 177 L110 186" />
            <path d="M103 166 L97 188" stroke={CORAL} />
          </g>
          <rect x="42" y="200" width="116" height="9" rx="4.5" fill="#C9C3DD" />
          <circle cx="50" cy="180" r="10" fill={V} stroke={VD} strokeWidth="3" />
          <circle cx="150" cy="180" r="10" fill={V} stroke={VD} strokeWidth="3" />
        </g>
      )}
    </svg>
  )
}

/** Маленькая голова маскота для аватаров/иконок */
export function MascotHead({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      <path d="M32 13V6" stroke={VD} strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="6" r="4.5" fill={CORAL} />
      <rect x="4" y="26" width="7" height="16" rx="3.5" fill={TEAL} />
      <rect x="53" y="26" width="7" height="16" rx="3.5" fill={TEAL} />
      <rect x="8" y="17" width="48" height="41" rx="17" fill={VD} />
      <rect x="8" y="14" width="48" height="41" rx="17" fill={V} />
      <rect x="15" y="21" width="34" height="26" rx="11" fill="#F4F0FF" />
      <ellipse cx="25" cy="33" rx="3.6" ry="4.4" fill={INK} />
      <ellipse cx="39" cy="33" rx="3.6" ry="4.4" fill={INK} />
      <path d="M28 40 Q32 43.5 36 40" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  )
}
