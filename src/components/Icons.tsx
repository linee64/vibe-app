import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }
const base = (size = 24, p: P) => ({ width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true, ...p })

export const Fire = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 1.8c1.2 3.7 5.6 5.6 5.6 11a5.6 5.6 0 0 1-11.2 0c0-2.3 1-3.9 2.3-5.1 0 2 .9 3.2 2.1 3.4C10.4 8 10 5 12 1.8z" fill="#FF9A1F" />
    <path d="M12 12.6c1.3 1.4 2.8 2.4 2.8 4.4a2.8 2.8 0 0 1-5.6 0c0-1.8 1.4-2.9 2.8-4.4z" fill="#FFD23D" />
  </svg>
)
export const Gem = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M6.5 3h11L22 9 12 21.5 2 9z" fill="#2EB6F5" />
    <path d="M6.5 3h11L22 9H2z" fill="#7FD3FA" />
    <path d="M8.5 9 12 21.5 15.5 9" fill="#1C9FDB" />
    <path d="M5 5.5 7.5 3.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
  </svg>
)
export const Heart = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 21s-9-5.6-9-11.6A5 5 0 0 1 12 6.6a5 5 0 0 1 9 2.8C21 15.4 12 21 12 21z" fill="#FF4F6D" />
    <ellipse cx="7.6" cy="9" rx="1.8" ry="1.2" fill="#fff" opacity=".6" transform="rotate(-35 7.6 9)" />
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
