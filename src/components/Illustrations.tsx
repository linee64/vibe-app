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

/** Палитра и карточка интерфейса — иллюстрация раздела «Дизайн и UI с ИИ» */
export function DesignArt({ className = '', size = 170 }: { className?: string; size?: number }) {
  const INK = '#2F2A47'
  return (
    <svg viewBox="0 0 170 150" width={size} height={(size * 150) / 170} className={className} aria-hidden>
      <ellipse cx="85" cy="144" rx="62" ry="6" fill={INK} opacity=".08" />
      {/* карточка интерфейса */}
      <rect x="22" y="22" width="92" height="112" rx="16" fill="#fff" stroke="#E7E3F1" strokeWidth="4" />
      <rect x="34" y="34" width="68" height="34" rx="9" fill="#FFE9E2" />
      <circle cx="52" cy="51" r="9" fill="#FF7A59" />
      <rect x="66" y="44" width="28" height="6" rx="3" fill="#FFC2B2" />
      <rect x="66" y="54" width="20" height="6" rx="3" fill="#FFC2B2" />
      <rect x="34" y="78" width="56" height="7" rx="3.5" fill="#C7B6FF" />
      <rect x="34" y="91" width="44" height="7" rx="3.5" fill="#E7E3F1" />
      <rect x="34" y="108" width="68" height="16" rx="8" fill="#7C4DFF" />
      <rect x="34" y="122" width="68" height="4" rx="2" fill="#5B2FD6" />
      {/* палитра */}
      <g transform="rotate(14 128 92)">
        <path d="M104 70c18-16 50-10 54 12 3 16-10 20-18 18-6-1-9 4-6 9 4 8-4 15-14 13-20-4-32-34-16-52z" fill="#FFC23D" />
        <path d="M104 70c18-16 50-10 54 12 3 16-10 20-18 18-6-1-9 4-6 9 4 8-4 15-14 13-20-4-32-34-16-52z" fill="none" stroke="#E5A100" strokeWidth="3" />
        <circle cx="118" cy="76" r="6" fill="#7C4DFF" />
        <circle cx="136" cy="74" r="6" fill="#FF7A59" />
        <circle cx="148" cy="88" r="5.5" fill="#13C2AE" />
        <circle cx="116" cy="94" r="6" fill="#5B2FD6" />
      </g>
      <path d="M150 20l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#7C4DFF" />
      <path d="M12 96l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2z" fill="#13C2AE" />
    </svg>
  )
}

/** Телефон с приложением — иллюстрация раздела «Мобильное приложение с ИИ» */
export function PhoneArt({ className = '', size = 170 }: { className?: string; size?: number }) {
  const INK = '#2F2A47'
  return (
    <svg viewBox="0 0 170 150" width={size} height={(size * 150) / 170} className={className} aria-hidden>
      <ellipse cx="85" cy="144" rx="56" ry="6" fill={INK} opacity=".08" />
      <rect x="50" y="8" width="70" height="130" rx="16" fill={INK} />
      <rect x="56" y="14" width="58" height="118" rx="11" fill="#F7F5FC" />
      <rect x="73" y="18" width="24" height="5" rx="2.5" fill={INK} />
      {/* шапка */}
      <rect x="62" y="30" width="34" height="7" rx="3.5" fill="#2F2A47" opacity=".8" />
      {/* строки привычек */}
      {[44, 66, 88].map((y, i) => (
        <g key={y}>
          <rect x="62" y={y} width="46" height="17" rx="6" fill="#fff" />
          <circle cx="71" cy={y + 8.5} r="5" fill={i < 2 ? '#13C2AE' : '#fff'} stroke={i < 2 ? 'none' : '#C9C4D8'} strokeWidth="2" />
          {i < 2 && <path d={`M68.5 ${y + 8.5}l2 2 3.5-4`} stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          <rect x="80" y={y + 6} width={i === 1 ? 18 : 22} height="5" rx="2.5" fill="#C7B6FF" />
        </g>
      ))}
      <rect x="62" y="112" width="46" height="13" rx="6.5" fill="#FF7A59" />
      {/* QR / Expo Go */}
      <g transform="rotate(-10 140 62)">
        <rect x="122" y="44" width="36" height="36" rx="8" fill="#fff" stroke="#E7E3F1" strokeWidth="3" />
        <rect x="129" y="51" width="9" height="9" rx="2" fill="#7C4DFF" />
        <rect x="142" y="51" width="9" height="9" rx="2" fill="#7C4DFF" />
        <rect x="129" y="64" width="9" height="9" rx="2" fill="#7C4DFF" />
        <rect x="143" y="65" width="4" height="4" rx="1" fill="#FF7A59" />
        <rect x="148" y="70" width="3" height="3" rx="1" fill="#FF7A59" />
      </g>
      <path d="M26 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFC23D" />
      <path d="M30 108l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2z" fill="#7C4DFF" />
    </svg>
  )
}

/** Чат с искрой ИИ — иллюстрация раздела «ИИ-фичи в продукте» */
export function AiChatArt({ className = '', size = 170 }: { className?: string; size?: number }) {
  const INK = '#2F2A47'
  return (
    <svg viewBox="0 0 170 150" width={size} height={(size * 150) / 170} className={className} aria-hidden>
      <ellipse cx="85" cy="144" rx="60" ry="6" fill={INK} opacity=".08" />
      {/* вопрос */}
      <path d="M100 18h46a12 12 0 0 1 12 12v18a12 12 0 0 1-12 12h-6l-8 9-2-9h-30a12 12 0 0 1-12-12V30a12 12 0 0 1 12-12z" fill="#FFE9E2" />
      <rect x="98" y="32" width="44" height="6" rx="3" fill="#FF7A59" />
      <rect x="98" y="43" width="28" height="6" rx="3" fill="#FFC2B2" />
      {/* ответ ИИ */}
      <path d="M26 54h70a14 14 0 0 1 14 14v34a14 14 0 0 1-14 14H50l-12 12-2-12h-10a14 14 0 0 1-14-14V68a14 14 0 0 1 14-14z" fill="#7C4DFF" />
      <rect x="26" y="70" width="58" height="7" rx="3.5" fill="#fff" opacity=".9" />
      <rect x="26" y="84" width="66" height="7" rx="3.5" fill="#fff" opacity=".6" />
      <rect x="26" y="98" width="38" height="7" rx="3.5" fill="#fff" opacity=".6" />
      <rect x="68" y="97" width="4" height="10" rx="2" fill="#13C2AE" />
      {/* искра */}
      <path d="M134 84l6 14 14 6-14 6-6 14-6-14-14-6 14-6z" fill="#FFC23D" />
      <path d="M134 84l6 14 14 6-14 6-6 14-6-14-14-6 14-6z" fill="none" stroke="#E5A100" strokeWidth="2" />
      <path d="M156 66l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2z" fill="#13C2AE" />
      <path d="M14 30l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#FF7A59" />
    </svg>
  )
}

/** Робот-агент с шестерёнкой — иллюстрация раздела «Автоматизация и агенты» */
export function AgentArt({ className = '', size = 170 }: { className?: string; size?: number }) {
  const INK = '#2F2A47'
  const gear = (cx: number, cy: number, r: number, fill: string) => (
    <g>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={cx - r * 0.22} y={cy - r * 1.28} width={r * 0.44} height={r * 0.6} rx={r * 0.1} fill={fill} transform={`rotate(${i * 45} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle cx={cx} cy={cy} r={r * 0.42} fill="#fff" />
    </g>
  )
  return (
    <svg viewBox="0 0 170 150" width={size} height={(size * 150) / 170} className={className} aria-hidden>
      <ellipse cx="80" cy="144" rx="58" ry="6" fill={INK} opacity=".08" />
      <g>
        {gear(138, 40, 15, '#13C2AE')}
      </g>
      {gear(150, 82, 9, '#FFC23D')}
      {/* антенна */}
      <rect x="71" y="14" width="6" height="18" rx="3" fill="#5B2FD6" />
      <circle cx="74" cy="12" r="7" fill="#FF7A59" />
      {/* голова */}
      <rect x="34" y="30" width="80" height="58" rx="20" fill="#7C4DFF" />
      <rect x="44" y="42" width="60" height="34" rx="14" fill="#2F2A47" />
      <circle cx="61" cy="59" r="7" fill="#6FE3D3" />
      <circle cx="87" cy="59" r="7" fill="#6FE3D3" />
      <rect x="26" y="50" width="10" height="20" rx="5" fill="#5B2FD6" />
      <rect x="112" y="50" width="10" height="20" rx="5" fill="#5B2FD6" />
      {/* тело и чек-лист */}
      <rect x="44" y="92" width="60" height="46" rx="14" fill="#5B2FD6" />
      <rect x="52" y="100" width="44" height="30" rx="7" fill="#fff" />
      {[106, 116].map((y) => (
        <g key={y}>
          <path d={`M57 ${y}l2.5 2.5 4.5-5`} stroke="#13C2AE" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="68" y={y - 3} width="22" height="5" rx="2.5" fill="#C7B6FF" />
        </g>
      ))}
      <path d="M16 104l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#FFC23D" />
    </svg>
  )
}
