import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }
const base = (size = 24, p: P) => ({ width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true, ...p })

/** Батарейка Бипи: 5 делений заряда. Цвет — по уровню (teal → amber → coral), без «сердечек» */
export const Battery = ({ size = 24, level = 5, max = 5, ...p }: P & { level?: number; max?: number }) => {
  const color = level >= 3 ? '#13C2AE' : level === 2 ? '#FFB61D' : '#FF7A59'
  const w = 15 / max
  return (
    <svg width={size * 1.25} height={size} viewBox="0 0 30 24" aria-hidden {...p}>
      <rect x="1.5" y="5" width="23.5" height="14" rx="4" fill="#fff" stroke={level ? color : '#B3ADC8'} strokeWidth="2.2" />
      <rect x="25.6" y="9" width="3" height="6" rx="1.4" fill={level ? color : '#B3ADC8'} />
      {Array.from({ length: max }, (_, i) => (
        <rect key={i} x={4.6 + i * (w + 0.85)} y="8" width={w - 0.4} height="8" rx="1.3" fill={i < level ? color : '#EEEAF6'} />
      ))}
      {level === 0 && <path d="M14.2 6.8 10.6 12.6h3l-.8 4.6 3.8-6h-3z" fill="#FF7A59" />}
    </svg>
  )
}
/** Токен: шестигранная фишка — валюта для подсказок и подзарядки */
export const Token = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 1.8 21 7v10l-9 5.2L3 17V7z" fill="#0E9C8C" />
    <path d="M12 1.8 21 7v9l-9 5.2L3 16V7z" fill="#13C2AE" />
    <path d="M12 5.4 17.8 8.7v6.4L12 18.4l-5.8-3.3V8.7z" fill="#9BE7DD" />
    <path d="M12 8.2c.4 1.7 1.5 2.8 3.2 3.2-1.7.4-2.8 1.5-3.2 3.2-.4-1.7-1.5-2.8-3.2-3.2 1.7-.4 2.8-1.5 3.2-3.2z" fill="#fff" />
  </svg>
)
/** Ракета: деплой-серия (дни подряд с уроками) */
export const Rocket = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M9.2 16.6c-1.6.6-2.6 2.6-2.8 5 2.4-.2 4.4-1.2 5-2.8z" fill="#FFB61D" />
    <path d="M9.6 16.8c-.8.5-1.3 1.6-1.4 2.8 1.2-.1 2.3-.6 2.8-1.4z" fill="#FF7A59" />
    <path d="M7.4 12.8 4 13.6l3-4.6 3.4-.6zM11.2 16.6l-.8 3.4 4.6-3 .6-3.4z" fill="#5B2FD6" />
    <path d="M20.8 3.2c-5.2-.3-9.6 2.9-12 8.6l3.4 3.4c5.7-2.4 8.9-6.8 8.6-12z" fill="#7C4DFF" />
    <circle cx="15.4" cy="8.6" r="2" fill="#fff" stroke="#5B2FD6" strokeWidth="1.2" />
  </svg>
)
/** Вайб-поинт: искра (вместо «опыта») */
export const Spark = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 1.8c.9 4.6 3.6 7.3 8.2 8.2-4.6.9-7.3 3.6-8.2 8.2-.9-4.6-3.6-7.3-8.2-8.2 4.6-.9 7.3-3.6 8.2-8.2z" fill="#7C4DFF" />
    <path d="M12 6.4c.5 2.4 1.9 3.8 4.3 4.3-2.4.5-3.8 1.9-4.3 4.3-.5-2.4-1.9-3.8-4.3-4.3 2.4-.5 3.8-1.9 4.3-4.3z" fill="#FFC23D" />
    <path d="M19 15.6c.3 1.6 1.3 2.6 2.9 2.9-1.6.3-2.6 1.3-2.9 2.9-.3-1.6-1.3-2.6-2.9-2.9 1.6-.3 2.6-1.3 2.9-2.9z" fill="#FF7A59" />
  </svg>
)
export const Bolt = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M13.5 1.8 4.2 13.6h6.6l-1.3 8.6 9.3-12h-6.6z" fill="#FFC23D" stroke="#E5A100" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
)
export const Clock = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="9.5" fill="#7C4DFF" />
    <circle cx="12" cy="12" r="7" fill="#fff" />
    <path d="M12 8v4.3l2.8 1.7" stroke="#2F2A47" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
)
export const Target = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="10" fill="#FF7A59" />
    <circle cx="12" cy="12" r="6.6" fill="#fff" />
    <circle cx="12" cy="12" r="3.4" fill="#FF7A59" />
  </svg>
)
export const Lock = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10" stroke="currentColor" strokeWidth="2.6" fill="none" />
    <rect x="4.5" y="10" width="15" height="11" rx="3.5" fill="currentColor" />
  </svg>
)
export const Check = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M4.5 12.5 9.5 17.5 19.5 6.5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)
export const Cross = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
)
export const Star = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)
export const Book = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M3 5.5C5.8 4.2 8.8 4.3 12 6.3v13.4c-3.2-2-6.2-2.1-9-.8z" fill="currentColor" />
    <path d="M21 5.5c-2.8-1.3-5.8-1.2-9 .8v13.4c3.2-2 6.2-2.1 9-.8z" fill="currentColor" opacity=".75" />
  </svg>
)
export const Dumbbell = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <rect x="2" y="8.5" width="3.5" height="7" rx="1.4" fill="currentColor" />
    <rect x="5" y="6" width="4" height="12" rx="1.6" fill="currentColor" />
    <rect x="18.5" y="8.5" width="3.5" height="7" rx="1.4" fill="currentColor" />
    <rect x="15" y="6" width="4" height="12" rx="1.6" fill="currentColor" />
    <rect x="9" y="10.5" width="6" height="3" rx="1" fill="currentColor" />
  </svg>
)
export const Trophy = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M7 3h10v6a5 5 0 0 1-10 0z" fill="currentColor" />
    <path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5a3.5 3.5 0 0 1-3.5 3.5" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="10.8" y="13.5" width="2.4" height="4" fill="currentColor" />
    <rect x="7.5" y="17.5" width="9" height="3.5" rx="1.4" fill="currentColor" />
  </svg>
)
export const Chest = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M3 10a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6v1H3z" fill="currentColor" opacity=".8" />
    <rect x="3" y="11" width="18" height="9" rx="2.5" fill="currentColor" />
    <rect x="10" y="9" width="4" height="5.5" rx="1.2" fill="#fff" opacity=".9" />
  </svg>
)

/* ---------- Цветные иконки навигации ---------- */
export const NavLearn = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <path d="M5 15 16 5l11 10v11a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 5 26z" fill="#7C4DFF" />
    <path d="M3 15.5 16 4l13 11.5" stroke="#FF7A59" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="12.5" y="18" width="7" height="10.5" rx="2" fill="#FFC23D" />
  </svg>
)
export const NavQuests = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <path d="M4 14a8 8 0 0 1 8-8h8a8 8 0 0 1 8 8v1H4z" fill="#FF9A1F" />
    <rect x="4" y="14.5" width="24" height="13" rx="3" fill="#FFC23D" />
    <rect x="4" y="14" width="24" height="3" fill="#E5A100" />
    <rect x="13.5" y="12" width="5" height="8" rx="1.6" fill="#7C4DFF" />
  </svg>
)
export const NavLeague = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <path d="M16 3 27 7v8c0 7-5 11.5-11 14C10 26.5 5 22 5 15V7z" fill="#FFC23D" />
    <path d="M16 6.5 24 9.4v5.8c0 5-3.6 8.4-8 10.4-4.4-2-8-5.4-8-10.4V9.4z" fill="#FF9A1F" />
    <path d="M16 10.5l1.7 3.5 3.8.5-2.8 2.6.7 3.8-3.4-1.9-3.4 1.9.7-3.8-2.8-2.6 3.8-.5z" fill="#fff" />
  </svg>
)
export const NavProfile = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="16" r="13" fill="#13C2AE" />
    <circle cx="16" cy="13" r="5" fill="#fff" />
    <path d="M7.5 25.5c1.8-3.6 5-5.5 8.5-5.5s6.7 1.9 8.5 5.5A12.9 12.9 0 0 1 16 29a12.9 12.9 0 0 1-8.5-3.5z" fill="#fff" />
  </svg>
)
export const NavMore = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="16" r="13" fill="#FF7A59" />
    <circle cx="10" cy="16" r="2.4" fill="#fff" />
    <circle cx="16" cy="16" r="2.4" fill="#fff" />
    <circle cx="22" cy="16" r="2.4" fill="#fff" />
  </svg>
)
export const NavLogout = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <rect x="5" y="5" width="15" height="22" rx="4" fill="#C9C3DD" />
    <path d="M15 16h13M23.5 11.5 28 16l-4.5 4.5" stroke="#8C86A3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)
export const Shield = ({ size = 32, color = '#7C4DFF', dark = '#5B2FD6' }: { size?: number; color?: string; dark?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <path d="M16 2.5 28 7v8.5c0 7.3-5.3 12-12 14.5C9.3 27.5 4 22.8 4 15.5V7z" fill={dark} />
    <path d="M16 2.5 28 7v8c0 7.3-5.3 11.6-12 14C9.3 26.6 4 22.3 4 15V7z" fill={color} />
    <path d="M16 9.5 20.5 14 16 20.5 11.5 14z" fill="#fff" opacity=".9" />
  </svg>
)

/** Домашка: домик с молотком */
export const House = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M3.5 11.2 12 4l8.5 7.2" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M6 10.5V19a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19v-8.5L12 5.5z" fill="currentColor" opacity=".85" />
    <rect x="10" y="14" width="4" height="6.5" rx="1" fill="#fff" opacity=".9" />
    <path d="M15.6 2.6l3.2 1.9-1 1.7-3.2-1.9z" fill="currentColor" />
    <path d="M17.6 5.4 15.8 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)
