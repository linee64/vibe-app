import type { ReactNode } from 'react'
import type { ExerciseKind, MiniUI, Outcome, UIBlock } from '../../data/types'
import type { Answer, Hint, Status } from '../../data/exerciseLogic'
import { KIND_META } from './meta'
import { Mascot } from '../Mascot'
import { highlight } from '../Code'
import { t } from '../../i18n/core'

export interface ViewProps<E> {
  ex: E
  answer: Answer
  setAnswer: (a: Answer) => void
  status: Status
  /** подсказка Бипи (куплена за токены) */
  hint?: Hint | null
}

/* ------------------------------------------------------------------ Шапка упражнения */


export function Head({ kind, title, prompt }: { kind: ExerciseKind | 'flag'; title: string; prompt?: string }) {
  const m = KIND_META[kind]
  return (
    <div className="mb-4 md:mb-5">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-black uppercase tracking-wider"
        style={{ color: m.color, background: m.bg }}
        data-kind={kind}
      >
        <span aria-hidden>{m.icon}</span>
        {m.name}
      </span>
      <h1 className="mt-2 text-[23px] font-black leading-tight md:text-[28px]">{title}</h1>
      {prompt && <Speech text={prompt} />}
    </div>
  )
}

function Speech({ text }: { text: string }) {
  return (
    <div className="mt-3 flex items-end gap-2">
      <Mascot size={56} className="shrink-0" />
      <div className="relative mb-3 min-w-0 rounded-2xl border-2 border-line bg-white px-3.5 py-2.5 text-[15px] font-bold leading-snug text-ink md:text-[16px]">
        <span className="absolute -left-[9px] bottom-3 h-4 w-4 rotate-45 border-b-2 border-l-2 border-line bg-white" />
        {text}
      </div>
    </div>
  )
}

export function HintNote({ hint }: { hint?: Hint | null }) {
  if (!hint) return null
  return (
    <div className="anim-fade-up mb-3 flex items-center gap-2 rounded-2xl border-2 border-dashed border-brand-mid bg-brand-light px-3 py-2 text-[14px] font-extrabold text-brand-dark" data-hint>
      <span aria-hidden>💡</span> {hint.text}
    </div>
  )
}


export function Letter({ i, on }: { i: number; on?: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-[13px] font-black ${on ? 'border-current' : 'border-line text-muted'}`}
      aria-hidden
    >
      {String.fromCharCode(65 + i)}
    </span>
  )
}

/* ------------------------------------------------------------------ Аватар ИИ и пузыри чата */

export function AiAvatar({ size = 30 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-[#B18CFF] text-white shadow-[0_2px_0_#5B2FD6]"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-label={t('x1crlu99')}
    >
      ✦
    </span>
  )
}

export function CodeBlock({ lines, file, small }: { lines: string[]; file?: string; small?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl bg-[#272239]">
      {file && <div className="code-font border-b border-white/10 px-3 py-1.5 text-[10.5px] text-white/60">{file}</div>}
      <pre className={`code-font whitespace-pre-wrap px-3 py-2 text-[#EDEAF6] [overflow-wrap:anywhere] ${small ? 'text-[10.5px] leading-[1.55]' : 'text-[12px] leading-[1.6] md:text-[13px]'}`}>
        {lines.map((l, i) => (
          <div key={i}>{l ? highlight(l) : ' '}</div>
        ))}
      </pre>
    </div>
  )
}

export function AiBubble({ text, code, preview, small }: { text: string; code?: string[]; preview?: MiniUI; small?: boolean }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <AiAvatar size={small ? 24 : 30} />
      <div className={`min-w-0 flex-1 rounded-2xl rounded-tl-md border-2 border-line bg-white ${small ? 'px-2.5 py-2 text-[12px]' : 'px-3 py-2.5 text-[14px] md:text-[15px]'} font-semibold leading-snug text-ink`}>
        <div className="whitespace-pre-line [overflow-wrap:anywhere]">{text}</div>
        {code && (
          <div className="mt-2">
            <CodeBlock lines={code} small={small} />
          </div>
        )}
        {preview && (
          <div className="mt-2">
            <MiniBrowser ui={preview} />
          </div>
        )}
      </div>
    </div>
  )
}

export function MeBubble({ text, small, className = '' }: { text: string; small?: boolean; className?: string }) {
  return (
    <div className={`flex justify-end ${className}`}>
      <div className={`max-w-[92%] rounded-2xl rounded-br-md bg-brand ${small ? 'px-2.5 py-2 text-[12px]' : 'px-3 py-2.5 text-[14px] md:text-[15px]'} whitespace-pre-line [overflow-wrap:anywhere] font-bold leading-snug text-white`}>
        {text}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Мини-превью страницы */

const THEMES = {
  plain: { bg: '#F4F3F7', ink: '#4A4658', muted: '#9C98A8', accent: '#9C98A8', accentInk: '#fff', card: '#E6E4EC', font: 'font-sans' },
  brand: { bg: '#FFFFFF', ink: '#2F2A47', muted: '#8C86A3', accent: '#7C4DFF', accentInk: '#fff', card: '#EFE9FF', font: 'font-sans' },
  warm: { bg: '#FFF7EE', ink: '#4A2E1F', muted: '#A07E66', accent: '#FF7A59', accentInk: '#fff', card: '#FFE6D2', font: 'font-sans' },
  dark: { bg: '#221E33', ink: '#F1EEFA', muted: '#A39DBA', accent: '#13C2AE', accentInk: '#062A26', card: '#332D4A', font: 'font-sans' },
} as const

const TONES: Record<string, { bg: string; ink: string }> = {
  coral: { bg: '#FF7A59', ink: '#fff' },
  teal: { bg: '#13C2AE', ink: '#fff' },
  brand: { bg: '#7C4DFF', ink: '#fff' },
  grey: { bg: '#C9C5D3', ink: '#fff' },
  violet: { bg: '#EFE9FF', ink: '#5B2FD6' },
  amber: { bg: '#FFF1D9', ink: '#B86A00' },
}

function Block({ b, th }: { b: UIBlock; th: (typeof THEMES)[keyof typeof THEMES] }) {
  switch (b.t) {
    case 'nav':
      return (
        <div className="flex items-center justify-between gap-2 border-b pb-1.5" style={{ borderColor: th.card }}>
          <span className="truncate text-[10.5px] font-black" style={{ color: th.ink }}>
            {b.logo ?? '◆'}
          </span>
          <span className="flex min-w-0 gap-2 overflow-hidden">
            {b.items.map((x) => (
              <span key={x} className="shrink-0 text-[9.5px] font-bold" style={{ color: th.muted }}>
                {x}
              </span>
            ))}
          </span>
        </div>
      )
    case 'h':
      return (
        <div className={`font-black leading-tight ${b.size === 'xl' ? 'text-[16px]' : b.size === 'md' ? 'text-[12px]' : 'text-[13.5px]'} ${b.align === 'center' ? 'text-center' : ''}`} style={{ color: th.ink }}>
          {b.text}
        </div>
      )
    case 'p':
      return (
        <div className={`text-[10.5px] font-semibold leading-snug ${b.align === 'center' ? 'text-center' : ''}`} style={{ color: b.muted ? th.muted : th.ink }}>
          {b.text}
        </div>
      )
    case 'btn': {
      const tone = b.tone === 'ghost' ? null : b.tone ? TONES[b.tone] : { bg: th.accent, ink: th.accentInk }
      return (
        <div className={b.full ? '' : 'flex'}>
          <span
            className={`inline-block rounded-lg px-2.5 py-1 text-center text-[10px] font-extrabold ${b.full ? 'w-full' : ''}`}
            style={tone ? { background: tone.bg, color: tone.ink } : { border: `1.5px solid ${th.muted}`, color: th.ink }}
          >
            {b.text}
          </span>
        </div>
      )
    }
    case 'img':
      return (
        <div className="relative flex items-center justify-center overflow-hidden rounded-lg" style={{ height: b.h ?? 44, background: th.card }}>
          <svg viewBox="0 0 40 24" className="h-[60%] opacity-50" aria-hidden>
            <circle cx="11" cy="8" r="3.5" fill={th.muted} />
            <path d="M2 22 L14 12 L21 18 L28 10 L38 22 Z" fill={th.muted} />
          </svg>
          {b.label && <span className="absolute bottom-0.5 right-1.5 text-[8.5px] font-bold" style={{ color: th.muted }}>{b.label}</span>}
        </div>
      )
    case 'cards':
      return (
        <div className={`grid gap-1.5 ${b.cols === 1 ? 'grid-cols-1' : b.cols === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {b.items.map((x, i) => (
            <div key={i} className="rounded-md px-1.5 py-1.5 text-[9.5px] font-bold leading-tight" style={{ background: th.card, color: th.ink }}>
              {x}
            </div>
          ))}
        </div>
      )
    case 'list':
      return (
        <ul className="space-y-0.5">
          {b.items.map((x, i) => (
            <li key={i} className="flex gap-1 text-[10.5px] font-semibold leading-snug" style={{ color: th.ink }}>
              <span style={{ color: th.accent }}>•</span>
              {x}
            </li>
          ))}
        </ul>
      )
    case 'input':
      return (
        <div>
          <div className="text-[9px] font-bold" style={{ color: th.muted }}>{b.label}</div>
          <div className="mt-0.5 rounded-md border px-1.5 py-1 text-[10px] font-semibold" style={{ borderColor: b.error ? '#FF7A59' : th.card, color: b.value ? th.ink : th.muted, background: th.bg }}>
            {b.value ?? ' '}
          </div>
          {b.error && <div className="mt-0.5 text-[9px] font-bold text-coral-dark">{b.error}</div>}
        </div>
      )
    case 'rows':
      return (
        <div className="space-y-0.5">
          {b.items.map(([k, v], i) => (
            <div key={i} className="flex items-baseline justify-between gap-2 text-[10.5px] font-semibold" style={{ color: th.ink }}>
              <span className="min-w-0 truncate">{k}</span>
              <span className="shrink-0 font-black" style={{ color: th.accent === '#9C98A8' ? th.ink : th.accent }}>{v}</span>
            </div>
          ))}
        </div>
      )
    case 'note': {
      const t = TONES[b.tone]
      const soft = b.tone === 'violet' || b.tone === 'amber'
      return (
        <div className="rounded-md px-2 py-1 text-[10px] font-extrabold leading-snug" style={soft ? { background: t.bg, color: t.ink } : { background: t.bg + '22', color: b.tone === 'coral' ? '#E0573A' : '#0E9C8C' }}>
          {b.text}
        </div>
      )
    }
    case 'lorem':
      return (
        <div className="space-y-1">
          {Array.from({ length: b.lines ?? 3 }, (_, i) => (
            <div key={i} className="h-1.5 rounded-full" style={{ background: th.card, width: `${92 - ((i * 17) % 35)}%` }} />
          ))}
        </div>
      )
    case 'split':
      return (
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="space-y-1.5">{b.left.map((x, i) => <Block key={i} b={x} th={th} />)}</div>
          <div className="space-y-1.5">{b.right.map((x, i) => <Block key={i} b={x} th={th} />)}</div>
        </div>
      )
  }
}

export function MiniBrowser({ ui }: { ui: MiniUI }) {
  const th = THEMES[ui.theme ?? 'brand']
  return (
    <div className={`overflow-hidden rounded-xl border-2 border-line bg-white ${ui.mobile ? 'mx-auto w-[150px]' : 'w-full'}`}>
      <div className="flex items-center gap-1 border-b-2 border-line bg-snow px-2 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-coral" />
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="h-1.5 w-1.5 rounded-full bg-teal" />
        <span className="code-font ml-1.5 min-w-0 truncate rounded bg-white px-1.5 text-[8.5px] text-muted">{ui.url ?? 'localhost:5173'}</span>
      </div>
      <div className="space-y-1.5 p-2.5" style={{ background: th.bg }}>
        {ui.blocks.map((b, i) => (
          <Block key={i} b={b} th={th} />
        ))}
      </div>
    </div>
  )
}

/** Результат работы ИИ в одном из форматов */
export function OutcomeView({ o }: { o: Outcome }) {
  switch (o.type) {
    case 'ui':
      return <MiniBrowser ui={o.ui} />
    case 'chat':
      return <AiBubble text={o.text} code={o.code} small />
    case 'code':
      return <CodeBlock lines={o.lines} file={o.file} small />
    case 'terminal':
      return (
        <div className="overflow-hidden rounded-xl bg-[#1B1828] px-3 py-2">
          {o.lines.map((l, i) => {
            const c = /^(✓|ready|Ready|VITE|Local)/.test(l.trim()) ? '#6FE3D3' : /(error|Error|ERR|✗|failed|Failed)/.test(l) ? '#FF9C85' : '#D9D4EA'
            return (
              <div key={i} className="code-font whitespace-pre-wrap text-[10.5px] leading-[1.6] [overflow-wrap:anywhere]" style={{ color: c }}>
                {l}
              </div>
            )
          })}
        </div>
      )
  }
}

export function FrameCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden rounded-[20px] border-2 border-line bg-white shadow-[0_5px_0_#E7E3F1] ${className}`}>{children}</div>
}
