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
