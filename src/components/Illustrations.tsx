export function BrowserArt({ className = '', size = 170 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 170 150" width={size} height={(size * 150) / 170} className={className} aria-hidden>
      <ellipse cx="85" cy="142" rx="62" ry="6" fill="#2F2A47" opacity=".08" />
      <rect x="12" y="20" width="146" height="112" rx="18" fill="#E7E3F1" />
      <rect x="12" y="14" width="146" height="112" rx="18" fill="#fff" stroke="#E7E3F1" strokeWidth="3" />
      <path d="M12 32a18 18 0 0 1 18-18h110a18 18 0 0 1 18 18v4H12z" fill="#FF7A59" />
      <circle cx="30" cy="26" r="4" fill="#fff" />
      <circle cx="43" cy="26" r="4" fill="#fff" opacity=".7" />
      <circle cx="56" cy="26" r="4" fill="#fff" opacity=".45" />
      <rect x="26" y="48" width="118" height="34" rx="10" fill="#FFE9E2" />
      <rect x="36" y="56" width="58" height="7" rx="3.5" fill="#2F2A47" opacity=".75" />
      <rect x="36" y="68" width="40" height="5" rx="2.5" fill="#2F2A47" opacity=".3" />
      <rect x="108" y="58" width="28" height="14" rx="7" fill="#FF7A59" />
      <rect x="26" y="92" width="34" height="24" rx="8" fill="#EFE9FF" />
      <rect x="68" y="92" width="34" height="24" rx="8" fill="#DCF8F3" />
      <rect x="110" y="92" width="34" height="24" rx="8" fill="#FFF4D6" />
      <circle cx="43" cy="104" r="5" fill="#7C4DFF" />
      <circle cx="85" cy="104" r="5" fill="#13C2AE" />
      <circle cx="127" cy="104" r="5" fill="#FFC23D" />
      <path d="M150 4l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFC23D" />
      <path d="M8 120l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2z" fill="#7C4DFF" />
    </svg>
  )
}

export function BugArt({ className = '', size = 170 }: { className?: string; size?: number }) {
  const INK = '#2F2A47'
  return (
    <svg viewBox="0 0 170 150" width={size} height={(size * 150) / 170} className={className} aria-hidden>
      <ellipse cx="85" cy="143" rx="62" ry="6" fill={INK} opacity=".08" />
      <g stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M40 82 L22 74" />
        <path d="M38 98 L18 100" />
        <path d="M42 114 L26 126" />
        <path d="M100 82 L114 72" />
        <path d="M102 114 L116 126" />
        <path d="M58 40 Q50 22 40 18" />
        <path d="M82 40 Q90 22 100 18" />
      </g>
      <circle cx="40" cy="17" r="6" fill="#13C2AE" />
      <circle cx="100" cy="17" r="6" fill="#13C2AE" />
      <ellipse cx="70" cy="98" rx="36" ry="34" fill="#E0573A" />
      <ellipse cx="70" cy="94" rx="36" ry="34" fill="#FF7A59" />
      <path d="M70 62 V128" stroke="#E0573A" strokeWidth="3" />
      <circle cx="54" cy="88" r="6" fill="#E0573A" />
      <circle cx="86" cy="84" r="5" fill="#E0573A" />
      <circle cx="58" cy="110" r="4.5" fill="#E0573A" />
      <circle cx="88" cy="108" r="6" fill="#E0573A" />
      <circle cx="70" cy="54" r="21" fill={INK} />
      <circle cx="62" cy="51" r="7" fill="#fff" />
      <circle cx="78" cy="51" r="7" fill="#fff" />
      <circle cx="63.5" cy="52" r="3.3" fill={INK} />
      <circle cx="79.5" cy="52" r="3.3" fill={INK} />
      <path d="M64 63 Q70 67 76 63" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <line x1="134" y1="112" x2="152" y2="132" stroke="#0E9C8C" strokeWidth="10" strokeLinecap="round" />
      <circle cx="120" cy="96" r="24" fill="#DCF8F3" fillOpacity=".55" stroke="#13C2AE" strokeWidth="7" />
      <path d="M108 88 a14 14 0 0 1 10 -8" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  )
}

/** База данных с ключом — иллюстрация раздела «Данные и бэкенд» */
export function DatabaseArt({ className = '', size = 170 }: { className?: string; size?: number }) {
  const INK = '#2F2A47'
  const D = '#5B2FD6'
  const DD = '#3E1A9E'
  return (
    <svg viewBox="0 0 170 150" width={size} height={(size * 150) / 170} className={className} aria-hidden>
      <ellipse cx="80" cy="143" rx="60" ry="6" fill={INK} opacity=".08" />
      {/* три «диска» базы данных */}
      {[96, 66, 36].map((y, i) => (
        <g key={y}>
          <path d={`M30 ${y} v26 a42 13 0 0 0 84 0 v-26`} fill={i === 1 ? '#7C4DFF' : D} />
          <path d={`M30 ${y + 26} a42 13 0 0 0 84 0 v4 a42 13 0 0 1 -84 0z`} fill={DD} />
          <ellipse cx="72" cy={y} rx="42" ry="13" fill={i === 1 ? '#9B78FF' : '#7C4DFF'} />
          <circle cx="98" cy={y + 16} r="3.5" fill="#13C2AE" />
          <rect x="40" y={y + 13} width="26" height="5" rx="2.5" fill="#fff" opacity=".35" />
        </g>
      ))}
      <ellipse cx="72" cy="36" rx="42" ry="13" fill="#B4A0F0" />
      <ellipse cx="72" cy="36" rx="30" ry="8" fill="#E8E0FF" />
      {/* ключ */}
      <g transform="rotate(-28 132 92)">
        <circle cx="132" cy="70" r="17" fill="#FFC23D" />
        <circle cx="132" cy="70" r="7" fill="#fff" />
        <rect x="127" y="84" width="10" height="44" rx="5" fill="#FFC23D" />
        <rect x="137" y="108" width="10" height="7" rx="3" fill="#E5A100" />
        <rect x="137" y="119" width="7" height="7" rx="3" fill="#E5A100" />
      </g>
      <path d="M148 18l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FF7A59" />
      <path d="M14 70l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2z" fill="#13C2AE" />
    </svg>
  )
}

/** Ракета на старте — иллюстрация раздела «Запуск» */
export function RocketArt({ className = '', size = 170 }: { className?: string; size?: number }) {
  const INK = '#2F2A47'
  return (
    <svg viewBox="0 0 170 150" width={size} height={(size * 150) / 170} className={className} aria-hidden>
      <ellipse cx="85" cy="144" rx="62" ry="6" fill={INK} opacity=".08" />
      {/* облака выхлопа */}
      <circle cx="58" cy="128" r="14" fill="#FFF1D9" />
      <circle cx="112" cy="128" r="14" fill="#FFF1D9" />
      <circle cx="85" cy="130" r="16" fill="#FFE2B0" />
      {/* пламя */}
      <path d="M74 104 Q85 140 96 104z" fill="#FF7A59" />
      <path d="M79 104 Q85 126 91 104z" fill="#FFC23D" />
      {/* крылья */}
      <path d="M64 70 L44 98 L66 96z" fill="#E0573A" />
      <path d="M106 70 L126 98 L104 96z" fill="#E0573A" />
      {/* корпус */}
      <path d="M85 10 C110 30 112 70 106 104 H64 C58 70 60 30 85 10z" fill="#fff" stroke="#E7E3F1" strokeWidth="3" />
      <path d="M85 10 C98 20 105 34 108 48 H62 C65 34 72 20 85 10z" fill="#FFA41B" />
      <rect x="66" y="96" width="38" height="10" rx="5" fill="#D97F00" />
      {/* иллюминатор */}
      <circle cx="85" cy="68" r="13" fill="#7C4DFF" />
      <circle cx="85" cy="68" r="8" fill="#C7B6FF" />
      <circle cx="81.5" cy="64.5" r="3" fill="#fff" opacity=".8" />
      <path d="M85 104 V112" stroke="#D97F00" strokeWidth="4" strokeLinecap="round" />
      {/* звёзды */}
      <path d="M140 24l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFC23D" />
      <path d="M26 40l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2z" fill="#7C4DFF" />
      <circle cx="146" cy="70" r="3" fill="#13C2AE" />
      <circle cx="22" cy="86" r="3" fill="#FF7A59" />
    </svg>
  )
}
