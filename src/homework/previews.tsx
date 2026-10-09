/**
 * Живые превью домашек: каждое рисует результат по состоянию симулятора (src/homework/sims.ts).
 */
import { useState, type CSSProperties, type ReactNode } from 'react'
import { BrowserFrame, PhoneFrame, Scaled } from './frames'
import {
  BUG_CODE,
  BUG_ERROR,
  FIX_CODE,
  type CardState,
  type DebugState,
  type DebugUi,
  type DeployState,
  type DeployUi,
  type FormRow,
  type FormState,
  type FormUi,
  type LandingState,
  type LandingUi,
  type PaletteKey,
} from './sims'
import { highlight } from '../components/Code'
import { Mascot } from '../components/Mascot'
import { Check, Cross, Lock } from '../components/Icons'
import { useStore } from '../store'
import { t } from '../i18n/core'
import { tx } from '../i18n/rich'

export interface PreviewProps<S, U> {
  state: S
  ui: U
  setUi: (f: (u: U) => U) => void
  /** Вставить текст в поле промпта (кнопки «Скопировать» в превью) */
  insert: (text: string) => void
  /** Счётчик ответов ИИ — для анимации «обновилось» */
  version: number
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <Mascot mood="think" size={84} />
      <p className="max-w-[260px] text-[14px] font-bold text-muted">{text}</p>
    </div>
  )
}

// ================================================================ 1. Карточка товара

function Mug({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
      <ellipse cx="58" cy="108" rx="34" ry="6" fill="#2F2A47" opacity=".08" />
      <path d="M88 44h8a14 14 0 0 1 0 28h-8" stroke="#5B2FD6" strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="26" y="30" width="64" height="76" rx="14" fill="#7C4DFF" />
      <rect x="26" y="30" width="64" height="16" rx="8" fill="#5B2FD6" />
      <rect x="36" y="58" width="44" height="22" rx="8" fill="#fff" opacity=".9" />
      <text x="58" y="74" textAnchor="middle" fontSize="13" fontWeight="900" fill="#7C4DFF" fontFamily="Nunito, sans-serif">{t('x162fwge')}</text>
      <path d="M46 22c0-6 6-6 6-12M62 22c0-6 6-6 6-12" stroke="#FF7A59" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  )
}

const QUALITY = () => [t('preview.quality.1'), t('preview.quality.2'), t('preview.quality.3'), t('preview.quality.4'), t('preview.quality.5'), t('preview.quality.6')]

export function CardPreview({ state: s, version }: PreviewProps<CardState, Record<string, never>>) {
  const score = [s.role, s.goal, s.context, s.limits, s.format].filter(Boolean).length
  let title: string | null = null
  let body: ReactNode = null
  if (s.asked && s.goal) {
    const intro = s.role
      ? s.context
        ? (s.friendly ? t('preview.card.introFriendly') : t('preview.card.introFormal'))
        : t('x0rhs48l')
      : s.context
        ? t('x1wteu36')
        : t('x0kdn1dy')
    const bullets = s.context ? [t('x07jtkk9'), t('x1jt4vnf'), t('x07s0h87')] : [t('x10d55m5'), t('x179xy6d'), t('x114f7mk')]
    const cta = s.context ? (s.friendly ? t('x1lxv5n9') : t('x0dsakga')) : t('x0s1pywm')
    title = s.format ? (s.context ? t('x11pp66v') : t('x0wz1wgz')) : null
    const filler = !s.limits ? (
      <p className="relative mt-2 max-h-[64px] overflow-hidden text-[12.5px] font-semibold leading-snug text-muted">{tx('x031n6kk', {}, [() => <span className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white" />])}</p>
    ) : null
    body = s.format ? (
      <>
        <p className="text-[13.5px] font-semibold leading-snug text-ink">{intro}</p>
        <ul className="mt-2 space-y-1">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2 text-[13.5px] font-bold text-ink">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                <Check size={10} />
              </span>
              {b}
            </li>
          ))}
        </ul>
        {filler}
        <p className="mt-2 text-[13.5px] font-extrabold text-brand-dark">{cta}</p>
      </>
    ) : (
      <>
        <p className="text-[13.5px] font-semibold leading-snug text-ink">
          {intro} {bullets.join('. ')}. {cta}
        </p>
        {filler}
      </>
    )
  }
  const wordsN = s.limits ? (s.format ? 54 : 46) : 340
  return (
    <div className="space-y-3">
      <BrowserFrame url="market.example/teplyi-dom/termo">
        <div key={version} className="anim-fade-up p-3 @container">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-lg bg-coral px-2 py-0.5 text-[11px] font-black uppercase text-white">{t('x0r5b4hk')}</span>
            <span className="h-7 flex-1 rounded-lg bg-snow" />
          </div>
          <div className="grid gap-3 @sm:grid-cols-[130px_1fr]">
            <div className="flex items-center justify-center rounded-2xl bg-brand-light py-3">
              <Mug size={110} />
            </div>
            <div className="min-w-0">
              {!s.asked ? (
                <div className="space-y-2 py-1" aria-label={t('x1hqh1nb')}>
                  <div className="h-5 w-4/5 rounded-md bg-line" />
                  <div className="h-3 w-full rounded-md bg-snow" />
                  <div className="h-3 w-11/12 rounded-md bg-snow" />
                  <div className="h-3 w-3/5 rounded-md bg-snow" />
                  <p className="pt-1 text-[12.5px] font-bold text-muted">{t('x1trmmw4')}</p>
                </div>
              ) : !s.goal ? (
                <div className="rounded-2xl border-2 border-dashed border-line p-3 text-[13.5px] font-bold text-muted">{t('x1gkwbut')}</div>
              ) : (
                <>
                  {title ? <h4 className="text-[17px] font-black leading-tight">{title}</h4> : <h4 className="text-[15px] font-black text-muted">{t('x1ifcvmc')}</h4>}
                  <div className="mt-0.5 flex items-center gap-2 text-[12px] font-extrabold text-gold-dark">
                    ★★★★★ <span className="text-muted">{t('x0loduu3')}</span>
                  </div>
                  <div className="mt-2">{body}</div>
                </>
              )}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-[18px] font-black">1 290 ₽</span>
                <span className="rounded-xl bg-brand px-3 py-1.5 text-[12px] font-black uppercase text-white shadow-[0_3px_0_#5B2FD6]">{t('x0hx5vti')}</span>
              </div>
            </div>
          </div>
        </div>
      </BrowserFrame>
      <div className="card p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-extrabold uppercase tracking-wider text-muted">{t('x18lpc17')}</span>
          <span className={`text-[14px] font-black ${score === 5 ? 'text-teal-dark' : score >= 3 ? 'text-gold-dark' : 'text-coral-dark'}`}>
            {QUALITY()[score]} · {score}/5
          </span>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="h-3 rounded-full transition-colors duration-500" style={{ background: i < score ? (score === 5 ? '#13C2AE' : score >= 3 ? '#FFC23D' : '#FF7A59') : '#E7E3F1' }} />
          ))}
        </div>
        {s.asked && s.goal && (
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11.5px] font-extrabold">
            <span className={`rounded-full px-2 py-0.5 ${s.limits ? 'bg-teal-light text-teal-dark' : 'bg-coral-light text-coral-dark'}`}>{tx('x19fg7qy', { wordsN })}</span>
            <span className={`rounded-full px-2 py-0.5 ${s.format ? 'bg-teal-light text-teal-dark' : 'bg-coral-light text-coral-dark'}`}>{s.format ? t('x01dktza') : t('x17vsf2w')}</span>
            <span className={`rounded-full px-2 py-0.5 ${s.context ? 'bg-teal-light text-teal-dark' : 'bg-coral-light text-coral-dark'}`}>{s.context ? t('x1uj7jzl') : t('x0cup0mk')}</span>
            <span className={`rounded-full px-2 py-0.5 ${s.role ? 'bg-teal-light text-teal-dark' : 'bg-coral-light text-coral-dark'}`}>{s.role ? t('x1snq3dx') : t('x08b0wsu')}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ================================================================ 2. Лендинг кофейни

interface Pal {
  bg: string
  hero: string
  accent: string
  dark: string
  text: string
  soft: string
}
const PALETTES: Record<PaletteKey, Pal> = {
  none: { bg: '#F6F6F8', hero: '#E9E9EE', accent: '#A3A3B2', dark: '#6E6E80', text: '#55556A', soft: '#FFFFFF' },
  coffee: { bg: '#FFF8F0', hero: '#F3DFC9', accent: '#8B5A3C', dark: '#5C3A24', text: '#4A3326', soft: '#FFFFFF' },
  violet: { bg: '#F7F4FF', hero: '#EFE9FF', accent: '#7C4DFF', dark: '#5B2FD6', text: '#2F2A47', soft: '#FFFFFF' },
  coral: { bg: '#FFF7F4', hero: '#FFE9E2', accent: '#FF7A59', dark: '#E0573A', text: '#3A2A2A', soft: '#FFFFFF' },
  teal: { bg: '#F2FCFA', hero: '#DCF8F3', accent: '#13C2AE', dark: '#0E9C8C', text: '#21333A', soft: '#FFFFFF' },
  amber: { bg: '#FFFAF0', hero: '#FFF1D9', accent: '#FFA41B', dark: '#D97F00', text: '#3D2E12', soft: '#FFFFFF' },
}

function Cup({ size = 150, color = '#8B5A3C', dark = '#5C3A24' }: { size?: number; color?: string; dark?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" aria-hidden>
      <ellipse cx="76" cy="146" rx="56" ry="8" fill="#2F2A47" opacity=".08" />
      <path d="M112 66h10a18 18 0 0 1 0 36h-12" stroke={dark} strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M26 56h96l-10 70a16 16 0 0 1-16 14H52a16 16 0 0 1-16-14z" fill={color} />
      <ellipse cx="74" cy="57" rx="48" ry="10" fill={dark} />
      <ellipse cx="74" cy="56" rx="40" ry="6" fill="#C8875A" />
      <path d="M60 86c8-6 20-6 28 0-8 6-20 6-28 0z" fill="#fff" opacity=".85" />
      <path d="M56 38c0-8 8-8 8-18M76 38c0-8 8-8 8-18M96 38c0-8 8-8 8-18" stroke="#FF7A59" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

const MENU = () => [
  [t('preview.menu.1'), t('preview.menuPrice.1')],
  [t('preview.menu.2'), t('preview.menuPrice.2')],
  [t('preview.menu.3'), t('preview.menuPrice.3')],
  [t('preview.menu.4'), t('preview.menuPrice.4')],
]

function LandingPage({ s }: { s: LandingState }) {
  const p = PALETTES[s.palette]
  const btnPal = PALETTES[s.ctaColor ?? (s.palette === 'none' ? 'none' : s.palette)]
  const btn: CSSProperties = { background: btnPal.accent, boxShadow: `0 4px 0 ${btnPal.dark}` }
  const name = s.name ?? (s.coffee ? t('x02qydcd') : t('x1kdqii8'))
  const a = s.adaptive
  // без адаптива вёрстка жёстко держит ширину 760px — на телефоне вылезает за экран
  return (
    <div className={a ? 'w-full' : 'w-[760px]'} style={{ background: p.bg, color: p.text }}>
      <nav className="flex items-center justify-between gap-3 px-6 py-4">
        <span className="flex items-center gap-2 text-[20px] font-black" style={{ color: p.dark }}>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl text-[16px] text-white" style={{ background: p.accent }}>
            {s.coffee ? '☕' : '◆'}
          </span>
          {name}
        </span>
        {(s.nav || s.menu) && (
          <span className={`items-center gap-5 text-[14px] font-extrabold ${a ? 'hidden @md:flex' : 'flex'}`}>
            {s.menu && <span>{t('x03ufco1')}</span>}
            {s.reviews && <span>{t('x0554ciw')}</span>}
            {s.contacts && <span>{t('x1kivthv')}</span>}
          </span>
        )}
        {a && (s.nav || s.menu) && <span className="text-[22px] font-black @md:hidden">☰</span>}
      </nav>
      <section className={`mx-4 grid items-center gap-4 rounded-[28px] px-6 py-8 ${a ? 'grid-cols-1 @md:grid-cols-[1.2fr_1fr] @md:px-10 @md:py-12' : 'grid-cols-[1.2fr_1fr] px-10 py-12'}`} style={{ background: p.hero }}>
        <div className={a ? 'text-center @md:text-left' : ''}>
          {s.coffee && <div className="mb-2 text-[12px] font-black uppercase tracking-[.16em]" style={{ color: p.accent }}>{t('x0vc8p3j')}</div>}
          <h1 className={`font-black leading-[1.05] ${a ? 'text-[34px] @md:text-[52px]' : 'text-[52px]'}`} style={{ color: p.dark }}>
            {name}
          </h1>
          <p className="mt-3 text-[16px] font-bold opacity-80 @md:text-[19px]">
            {s.slogan ?? (s.coffee ? t('x18l7aww') : t('x18xw3i2'))}
          </p>
          {s.cta && (
            <span className="mt-5 inline-block rounded-2xl px-6 py-3 text-[15px] font-black uppercase tracking-wide text-white" style={btn}>
              {s.ctaText}
            </span>
          )}
        </div>
        <div className="flex justify-center">
          {s.coffee ? <Cup size={a ? 150 : 190} color={p.accent} dark={p.dark} /> : <div className="h-[150px] w-[200px] rounded-2xl bg-white/70" />}
        </div>
      </section>
      {s.menu && (
        <section className="px-6 py-8">
          <h2 className="mb-4 text-[26px] font-black" style={{ color: p.dark }}>{t('x03ufco1')}</h2>
          <div className={`grid gap-3 ${a ? 'grid-cols-2 @md:grid-cols-4' : 'grid-cols-4'}`}>
            {MENU().map(([n, price], i) => (
              <div key={n} className="rounded-2xl p-4 text-center" style={{ background: p.soft, boxShadow: `0 4px 0 ${p.hero}` }}>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: p.hero }}>
                  <Cup size={34} color={p.accent} dark={p.dark} />
                </div>
                <div className="text-[16px] font-black">{s.coffee ? n : t('x0bh8bpx', { v: i + 1 })}</div>
                <div className="text-[15px] font-extrabold" style={{ color: p.accent }}>
                  {s.coffee ? price : '100 ₽'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {s.about && (
        <section className="px-6 pb-6">
          <h2 className="mb-2 text-[24px] font-black" style={{ color: p.dark }}>{t('x1xu950d')}</h2>
          <p className="text-[15px] font-semibold opacity-80">{t('x065fzxq')}</p>
        </section>
      )}
      {s.reviews && (
        <section className="px-6 pb-8">
          <h2 className="mb-4 text-[26px] font-black" style={{ color: p.dark }}>{t('x0554ciw')}</h2>
          <div className={`grid gap-3 ${a ? 'grid-cols-1 @md:grid-cols-3' : 'grid-cols-3'}`}>
            {[
              [t('x0rgbakp'), t('x1cvhc39')],
              [t('x0w5dgwi'), t('x0m1oojj')],
              [t('x17pka0r'), t('x0jj609v')],
            ].map(([n, q]) => (
              <div key={n} className="rounded-2xl p-4" style={{ background: p.soft }}>
                <div className="text-[13px] font-black" style={{ color: '#FFB61D' }}>
                  ★★★★★
                </div>
                <p className="mt-1 text-[14px] font-bold">«{q}»</p>
                <div className="mt-1 text-[13px] font-extrabold opacity-60">— {n}</div>
              </div>
            ))}
          </div>
        </section>
      )}
      {s.contacts && (
        <section className={`mx-4 mb-6 grid items-center gap-4 rounded-[24px] p-6 ${a ? 'grid-cols-1 @md:grid-cols-2' : 'grid-cols-2'}`} style={{ background: p.hero }}>
          <div>
            <h2 className="text-[22px] font-black" style={{ color: p.dark }}>{t('x1rfwz02')}</h2>
            <p className="mt-1 text-[15px] font-bold opacity-80">{t('x1tw6u31')}</p>
          </div>
          <div className="relative h-[90px] overflow-hidden rounded-2xl bg-white/70">
            <span className="absolute left-0 right-0 top-1/2 h-2 -rotate-6 bg-white" />
            <span className="absolute bottom-0 left-1/3 top-0 w-2 rotate-12 bg-white" />
            <span className="absolute left-[46%] top-[30%] h-6 w-6 rounded-full border-4 border-white" style={{ background: p.accent }} />
          </div>
        </section>
      )}
      <footer className="px-6 pb-6 pt-2 text-[13px] font-bold opacity-60">© 2026 {name}</footer>
    </div>
  )
}

export function LandingPreview({ state: s, ui, setUi, version }: PreviewProps<LandingState, LandingUi>) {
  const url = s.name ? `${s.name.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-')}.local` : 'localhost:5173'
  const toggle = (
    <div className="flex shrink-0 rounded-xl border-2 border-line bg-white p-0.5" role="group" aria-label={t('x061wti5')}>
      {(['desktop', 'phone'] as const).map((d) => (
        <button
          key={d}
          onClick={() => setUi((u) => ({ ...u, device: d, viewedMobile: u.viewedMobile || d === 'phone' }))}
          className={`rounded-lg px-2 py-0.5 text-[12px] font-extrabold ${ui.device === d ? 'bg-brand text-white' : 'text-muted'}`}
          aria-pressed={ui.device === d}
        >
          {d === 'desktop' ? t('x1n7iari') : t('x1f7u5w6')}
        </button>
      ))}
    </div>
  )
  if (!s.built)
    return (
      <BrowserFrame url={url} right={toggle}>
        <Empty text={t('x00lfllo')} />
      </BrowserFrame>
    )
  if (ui.device === 'phone')
    return (
      <div className="card p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-[13px] font-extrabold uppercase tracking-wider text-muted">{t('x0ufv6o7')}</span>
          {toggle}
        </div>
        <PhoneFrame
          warn={
            !s.adaptive && (
              <div className="absolute inset-x-2 bottom-2 rounded-xl bg-coral px-3 py-2 text-center text-[12px] font-black text-white shadow-[0_3px_0_#E0573A]">{t('x1tlxfs1')}</div>
            )
          }
        >
          <div key={version} className="anim-fade-up">
            <LandingPage s={s} />
          </div>
        </PhoneFrame>
        {s.adaptive && <p className="mt-3 text-center text-[13px] font-extrabold text-teal-dark">{t('x0vtg924')}</p>}
      </div>
    )
  return (
    <BrowserFrame url={url} right={toggle}>
      <Scaled width={1000}>
        <div key={version} className="anim-fade-up">
          <LandingPage s={s} />
        </div>
      </Scaled>
    </BrowserFrame>
  )
}

// ================================================================ 3. Список дел с багом

function CodeBox({ title, lines, start, mark, markColor, action }: { title: string; lines: string[]; start: number; mark?: number; markColor?: string; action?: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#272239]">
      <div className="flex items-center gap-2 bg-[#1f1b30] px-3 py-2">
        <span className="code-font rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-white/70">{title}</span>
        <span className="ml-auto">{action}</span>
      </div>
      <div className="overflow-x-auto py-2">
        {lines.map((l, i) => {
          const diff = l.startsWith('+') ? 'add' : l.startsWith('-') ? 'del' : null
          return (
            <div
              key={i}
              className="code-font flex border-l-4 px-2 py-[2px] text-[12px] text-[#EDEAF6]"
              style={{
                borderColor: i === mark ? markColor : diff === 'add' ? '#13C2AE' : diff === 'del' ? '#FF7A59' : 'transparent',
                background: i === mark ? `${markColor}40` : diff === 'add' ? '#13C2AE30' : diff === 'del' ? '#FF7A5930' : undefined,
              }}
            >
              <span className="mr-3 w-5 shrink-0 select-none text-right text-white/30">{start + i}</span>
              <code className="whitespace-pre">{highlight(l)}</code>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TodoPreview({ state: s, ui, setUi, insert, version }: PreviewProps<DebugState, DebugUi>) {
  const [text, setText] = useState('')
  const [shake, setShake] = useState(0)
  const [note, setNote] = useState<string | null>(null)
  const [codeOpen, setCodeOpen] = useState(true)
  const tasks = [t('x11j4ynb'), t('x1w35vuw'), ...ui.added]
  const add = () => {
    if (!s.fixed) {
      setUi((u) => ({ ...u, failedClicks: u.failedClicks + 1 }))
      setShake((n) => n + 1)
      setNote(null)
      return
    }
    if (!text.trim()) {
      setNote(t('x1nj6q60'))
      return
    }
    setUi((u) => ({ ...u, added: [...u.added, text.trim()], verified: true }))
    setText('')
    setNote(t('x183bcyg'))
  }
  const btnStyle: CSSProperties = s.restyled && !s.fixed ? { background: '#7C4DFF', boxShadow: '0 3px 0 #5B2FD6' } : { background: '#13C2AE', boxShadow: '0 3px 0 #0E9C8C' }
  const errCount = 1 + ui.failedClicks
  return (
    <div className="space-y-3">
      <BrowserFrame url={t('x0su2q67')}>
        <div key={version} className="anim-fade-up p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-[19px] font-black">{t('x09c3foy')}</h4>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${s.fixed ? 'bg-teal-light text-teal-dark' : 'bg-coral-light text-coral-dark'}`}>{s.fixed ? t('x10qvwh7') : t('x0fx4202')}</span>
          </div>
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder={t('x036reyf')}
              aria-label={t('x02zu33f')}
              className="input !h-[42px] min-w-0 flex-1 !rounded-xl !px-3 !text-[14px]"
            />
            <button key={shake} onClick={add} className={`shrink-0 rounded-xl px-4 text-[13px] font-black uppercase text-white ${shake ? 'anim-shake' : ''}`} style={btnStyle}>{tx('x0629yc4', { v: s.restyled && !s.fixed ? '✨ ' : '' })}</button>
          </div>
          {note && <p className="mt-2 text-[13px] font-extrabold text-teal-dark">{note}</p>}
          <ul className="mt-3 space-y-2">
            {tasks.map((t, i) => (
              <li key={i} className={`flex items-center gap-2.5 rounded-xl border-2 border-line px-3 py-2 text-[14px] font-bold ${i >= 2 ? 'anim-pop' : ''}`}>
                <span className={`h-5 w-5 shrink-0 rounded-md border-2 ${i === 0 ? 'border-teal bg-teal' : 'border-line'}`} />
                <span className={i === 0 ? 'text-muted line-through' : ''}>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </BrowserFrame>
      <div className="overflow-hidden rounded-2xl border-2 border-[#1f1b30] bg-[#1b1726]">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <span className="text-[12px] font-extrabold uppercase tracking-wider text-white/60">{t('x02tvcg4')}</span>
          {!s.fixed && <span className="rounded-full bg-coral px-1.5 text-[11px] font-black text-white">{errCount}</span>}
          {!s.fixed && (
            <button onClick={() => insert(BUG_ERROR)} className="ml-auto rounded-lg bg-white/10 px-2.5 py-1 text-[12px] font-extrabold text-white hover:bg-white/20">{t('x1rxyg3l')}</button>
          )}
        </div>
        <div className="code-font px-3 py-2.5 text-[12px] leading-relaxed">
          {s.fixed ? (
            <div className="text-[#6FE3D3]">{t('x1ajrisk', { length: tasks.length })}</div>
          ) : (
            <div className="text-[#FF9C85]">
              <div className="flex gap-2">
                <Cross size={14} className="mt-0.5 shrink-0" />
                <span className="[overflow-wrap:anywhere]">TypeError: Cannot read properties of undefined (reading 'push')</span>
              </div>
              <div className="pl-[22px] text-[#FF9C85]/70">at addTask (App.jsx:14:16)</div>
              <div className="pl-[22px] text-[#FF9C85]/70">at onClick (App.jsx:31:22)</div>
            </div>
          )}
        </div>
      </div>
      <div>
        <button onClick={() => setCodeOpen((o) => !o)} className="mb-2 text-[13px] font-extrabold uppercase tracking-wider text-muted hover:text-ink" aria-expanded={codeOpen}>{tx('x1fh8mcj', { v: codeOpen ? '▾' : '▸' })}</button>
        {codeOpen &&
          (s.fixed ? (
            <CodeBox title={t('x13ounq1')} lines={FIX_CODE} start={13} />
          ) : (
            <CodeBox
              title="App.jsx"
              lines={BUG_CODE}
              start={11}
              mark={3}
              markColor="#FF7A59"
              action={
                <button onClick={() => insert(BUG_CODE.join('\n'))} className="rounded-lg bg-white/10 px-2.5 py-1 text-[12px] font-extrabold text-white hover:bg-white/20">{t('x0vzto2h')}</button>
              }
            />
          ))}
      </div>
    </div>
  )
}

// ================================================================ 4. Форма + таблица

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function FormPreview({ state: s, ui, setUi, version }: PreviewProps<FormState, FormUi>) {
  const [vals, setVals] = useState({ name: '', email: '', message: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [note, setNote] = useState<{ text: string; ok: boolean } | null>(null)
  const anyField = s.name || s.email || s.message
  const fields: { k: 'name' | 'email' | 'message'; label: string; ph: string; on: boolean }[] = [
    { k: 'name', label: t('x143058q'), ph: t('x0t92out'), on: s.name },
    { k: 'email', label: 'Email', ph: 'you@example.com', on: s.email },
    { k: 'message', label: anyField ? t('x0hpflgb') : t('x0extke5'), ph: t('x0mxfyil'), on: s.message || !anyField },
  ]
  const submit = () => {
    const e: Record<string, string> = {}
    if (s.validation) {
      for (const f of fields) if (f.on && !vals[f.k].trim()) e[f.k] = t('x1yidf3v')
      if (s.email && vals.email.trim() && !EMAIL_RE.test(vals.email.trim())) e.email = t('x1oktxfd')
    }
    setErrs(e)
    if (Object.keys(e).length) {
      setNote(null)
      return
    }
    if (!s.table) {
      setNote({ text: t('x0o8vhll'), ok: false })
      return
    }
    const row: FormRow = {
      id: ui.rows.length + 1,
      name: s.name ? vals.name.trim() || '—' : '—',
      email: s.email ? vals.email.trim() || '—' : '—',
      message: vals.message.trim() || '—',
      bad: !EMAIL_RE.test(vals.email.trim()) || !vals.message.trim(),
    }
    setUi((u) => ({ rows: [...u.rows, row], saved: true }))
    setVals({ name: '', email: '', message: '' })
    setNote({ text: s.thanks ? t('x1vn8pqv') : t('x1xzzaiq'), ok: true })
  }
  if (!s.form)
    return (
      <BrowserFrame url="zerno.local/feedback">
        <Empty text={t('x1muaj3g')} />
      </BrowserFrame>
    )
  return (
    <div className="space-y-3">
      <BrowserFrame url="zerno.local/feedback">
        <div key={version} className="anim-fade-up p-4">
          <h4 className="text-[18px] font-black">{t('x1vsvra6')}</h4>
          <p className="mb-3 text-[13px] font-semibold text-muted">{t('x0chjnj9')}</p>
          <div className="space-y-2.5">
            {fields
              .filter((f) => f.on)
              .map((f) => (
                <label key={f.k} className="block">
                  <span className="mb-1 block text-[12px] font-extrabold uppercase tracking-wider text-muted">
                    {f.label}
                    {s.validation && <span className="text-coral"> *</span>}
                  </span>
                  {f.k === 'message' ? (
                    <textarea
                      value={vals[f.k]}
                      onChange={(e) => setVals((v) => ({ ...v, [f.k]: e.target.value }))}
                      placeholder={f.ph}
                      aria-label={f.label}
                      rows={2}
                      className={`input !h-auto !rounded-xl !px-3 !py-2 !text-[14px] ${errs[f.k] ? 'has-error' : ''}`}
                    />
                  ) : (
                    <input
                      value={vals[f.k]}
                      onChange={(e) => setVals((v) => ({ ...v, [f.k]: e.target.value }))}
                      placeholder={f.ph}
                      aria-label={f.label}
                      className={`input !h-[40px] !rounded-xl !px-3 !text-[14px] ${errs[f.k] ? 'has-error' : ''}`}
                    />
                  )}
                  {errs[f.k] && <span className="mt-0.5 block text-[12px] font-extrabold text-coral-dark">{errs[f.k]}</span>}
                </label>
              ))}
          </div>
          <button onClick={submit} className="btn btn-sm btn-block mt-3">{t('x0ekdgze')}</button>
          {note && <p className={`mt-2 text-[13px] font-extrabold ${note.ok ? 'text-teal-dark' : 'text-coral-dark'}`}>{note.text}</p>}
        </div>
      </BrowserFrame>

      <div className={`rounded-2xl border-2 px-3 py-2.5 ${s.keyLeaked ? 'border-coral bg-coral-light' : s.keySafe ? 'border-[#8be3d7] bg-teal-light' : 'border-dashed border-line'}`}>
        <div className={`flex items-center gap-2 text-[13px] font-black ${s.keyLeaked ? 'text-coral-dark' : s.keySafe ? 'text-teal-dark' : 'text-muted'}`}>
          <Lock size={16} />
          {s.keyLeaked ? t('x11urnpq') : s.keySafe ? t('x165w5a1') : t('x1m1ruop')}
        </div>
        {(s.keyLeaked || s.keySafe) && (
          <div className="code-font mt-1.5 truncate rounded-lg bg-white/70 px-2 py-1 text-[11.5px] text-ink">
            {s.keyLeaked ? "supabase.js: createClient(url, 'sk_live_51HxQ9vZr8aKeY2')" : 'supabase.js: createClient(url, import.meta.env.VITE_SUPABASE_KEY)'}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-line">
        <div className="flex items-center gap-2 border-b-2 border-line bg-snow px-3 py-2 text-[13px] font-black">
          <span className="flex h-5 w-5 items-center justify-center rounded-md text-[11px] text-white" style={{ background: '#5B2FD6' }}>
            ▦
          </span>
          {s.table ? t('x0r0mcnu') : t('x1slhbfn')}
          {s.table && <span className="ml-auto text-[12px] font-bold text-muted">{t('x1ibajk4', { length: ui.rows.length })}</span>}
        </div>
        {s.table ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-[12px]">
              <thead className="code-font bg-white text-[11px] text-muted">
                <tr>
                  {['id', 'name', 'email', 'message'].map((h) => (
                    <th key={h} className="border-b-2 border-line px-2.5 py-1.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ui.rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-2.5 py-3 text-center font-bold text-muted">{t('x1s4c65n')}</td>
                  </tr>
                )}
                {ui.rows.map((r) => (
                  <tr key={r.id} className={`anim-fade-up border-b border-line font-bold ${r.bad && !s.validation ? 'bg-coral-light' : ''}`}>
                    <td className="px-2.5 py-1.5 text-muted">{r.id}</td>
                    <td className="px-2.5 py-1.5">{r.name}</td>
                    <td className="max-w-[110px] truncate px-2.5 py-1.5">{r.email}</td>
                    <td className="max-w-[140px] truncate px-2.5 py-1.5">
                      {r.message}
                      {r.bad && !s.validation && <span className="ml-1 text-coral-dark">{t('x149z5sl')}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-3 py-4 text-center text-[13px] font-bold text-muted">{t('x1r5rgi2')}</p>
        )}
      </div>
    </div>
  )
}

// ================================================================ 5. Деплой

const STEPS: { key: keyof ReturnType<typeof deployDone>; label: string }[] = [
  { key: 'commit', get label() { return t('x1f52pub') } },
  { key: 'push', label: 'GitHub' },
  { key: 'deploy', label: 'Vercel' },
  { key: 'domain', get label() { return t('x0zlixar') } },
  { key: 'analytics', get label() { return t('x1s2h2mh') } },
]
const deployDone = (s: DeployState) => ({ commit: !!s.commit && !s.commitVague, push: s.pushed, deploy: s.deployed, domain: !!s.domain, analytics: s.analytics })

function logColor(l: string) {
  if (/error/i.test(l)) return '#FF9C85'
  if (l.startsWith('✓')) return '#6FE3D3'
  if (l.startsWith('$') || l.startsWith('▲') || l.startsWith('+')) return '#FFFFFF'
  return '#B9B3CF'
}

export function DeployPreview({ state: s, ui, setUi, version }: PreviewProps<DeployState, DeployUi>) {
  const { progress, setPortfolioUrl } = useStore()
  const [draft, setDraft] = useState(progress.portfolioUrl)
  const [err, setErr] = useState('')
  const done = deployDone(s)
  const url = s.domain ? `https://${s.domain}` : `https://${s.repo}.vercel.app`
  const save = () => {
    const v = draft.trim()
    if (v && !/^https?:\/\/[^\s.]+\.[^\s]{2,}/i.test(v)) {
      setErr(t('x0fabp1p'))
      return
    }
    setErr('')
    setPortfolioUrl(v)
  }
  return (
    <div className="space-y-3">
      <div className="card p-3">
        <div className="grid grid-cols-5 gap-1">
          {STEPS.map((st, i) => (
            <div key={st.key} className="relative flex flex-col items-center gap-1 text-center">
              {i > 0 && <span className="absolute right-1/2 top-[15px] h-[3px] w-full" style={{ background: done[STEPS[i - 1].key] ? '#13C2AE' : '#E7E3F1' }} />}
              <span
                className={`relative z-[1] flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors duration-500 ${done[st.key] ? 'anim-pop' : ''}`}
                style={{ background: done[st.key] ? '#13C2AE' : '#E7E3F1', boxShadow: done[st.key] ? '0 3px 0 #0E9C8C' : '0 3px 0 #D6D1E4' }}
              >
                {done[st.key] ? <Check size={16} /> : <span className="text-[12px] font-black text-muted">{i + 1}</span>}
              </span>
              <span className="text-[10.5px] font-extrabold leading-tight text-muted sm:text-[11.5px]">{st.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-[#1b1726]">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-[12px] font-extrabold uppercase tracking-wider text-white/60">{t('x0628sjf')}</div>
        <div key={version} className="code-font max-h-[190px] overflow-y-auto px-3 py-2.5 text-[12px] leading-relaxed">
          {s.log.length === 0 ? (
            <div className="text-white/40">{t('x0o9bi0v')}</div>
          ) : (
            s.log.map((l, i) => (
              <div key={i} className="anim-fade-up [overflow-wrap:anywhere]" style={{ color: logColor(l), animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                {l}
              </div>
            ))
          )}
        </div>
      </div>

      {s.deployed ? (
        <div className="anim-pop overflow-hidden rounded-[20px] border-2 border-[#8be3d7] bg-white shadow-[0_5px_0_#8be3d7]">
          <div className="flex items-center gap-2 bg-teal-light px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal" style={{ animation: 'ring-pulse 1.6s ease-in-out infinite' }} />
            <span className="text-[12px] font-black uppercase tracking-wider text-teal-dark">{t('x1ggt8hz')}</span>
            <span className="code-font ml-auto min-w-0 truncate text-[12px] font-bold text-teal-dark">🔒 {url.replace('https://', '')}</span>
          </div>
          <div className="grid gap-3 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="overflow-hidden rounded-xl border-2 border-line">
              <div className="flex items-center justify-between bg-[#F3DFC9] px-3 py-3">
                <div>
                  <div className="text-[15px] font-black text-[#5C3A24]">{t('x0kbjd6z')}</div>
                  <div className="text-[11px] font-bold text-[#4A3326]/70">{t('x0fstw4l')}</div>
                </div>
                <span className="rounded-lg bg-coral px-2 py-1 text-[10px] font-black uppercase text-white">{t('x03o8dkf')}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 bg-[#FFF8F0] p-2">
                {MENU().map(([n]) => (
                  <span key={n} className="rounded-md bg-white py-1 text-center text-[9px] font-extrabold text-[#5C3A24]">
                    {n}
                  </span>
                ))}
              </div>
            </div>
            <button className="btn btn-teal btn-sm" onClick={() => setUi((u) => ({ ...u, opened: true }))}>{t('x1guc8l0')}</button>
          </div>
          {ui.opened && <p className="px-3 pb-3 text-[13px] font-extrabold text-teal-dark">{t('x0z8slsu')}</p>}
          {s.analytics && (
            <div className="border-t-2 border-line px-3 py-2.5">
              <div className="flex items-center justify-between text-[12px] font-extrabold text-muted">
                <span>{t('x117it1r')}</span>
                <span className="text-ink">128 👀</span>
              </div>
              <div className="mt-1.5 flex h-[42px] items-end gap-1">
                {[18, 26, 14, 34, 40, 30, 52].map((h, i) => (
                  <span key={i} className="flex-1 rounded-t-md" style={{ height: `${(h / 52) * 100}%`, background: i === 6 ? '#FFA41B' : '#FFD58C' }} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-[20px] border-2 border-dashed border-line px-4 py-6 text-center text-[13.5px] font-bold text-muted">{t('x19w7320')}</div>
      )}

      <div className="card p-3">
        <div className="text-[13px] font-black">{tx('x1iz9r6d', {}, [(chunk) => <span className="font-bold text-muted">{chunk}</span>])}</div>
        <p className="text-[12px] font-semibold text-muted">{t('x0urdf7b')}</p>
        <div className="mt-2 flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="https://my-app.vercel.app" aria-label={t('x1jekfdh')} className="input !h-[40px] min-w-0 flex-1 !rounded-xl !px-3 !text-[14px]" />
          <button className="btn btn-ghost btn-sm shrink-0" onClick={save}>{t('x04njbq2')}</button>
        </div>
        {err && <p className="mt-1 text-[12px] font-extrabold text-coral-dark">{err}</p>}
        {!err && progress.portfolioUrl && (
          <p className="mt-1 truncate text-[12px] font-extrabold text-teal-dark">{tx('x1yiyl1k', { portfolioUrl: progress.portfolioUrl }, [(chunk) => <span className="code-font">{chunk}</span>])}</p>
        )}
      </div>
    </div>
  )
}
