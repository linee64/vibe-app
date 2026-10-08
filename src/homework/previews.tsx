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
      <text x="58" y="74" textAnchor="middle" fontSize="13" fontWeight="900" fill="#7C4DFF" fontFamily="Nunito, sans-serif">ТЕРМО</text>
      <path d="M46 22c0-6 6-6 6-12M62 22c0-6 6-6 6-12" stroke="#FF7A59" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  )
}

const QUALITY = ['Пусто', 'Слабо', 'Слабо', 'Неплохо', 'Почти', 'Отлично!']

export function CardPreview({ state: s, version }: PreviewProps<CardState, Record<string, never>>) {
  const score = [s.role, s.goal, s.context, s.limits, s.format].filter(Boolean).length
  let title: string | null = null
  let body: ReactNode = null
  if (s.asked && s.goal) {
    const intro = s.role
      ? s.context
        ? `${s.friendly ? 'Твой' : 'Ваш'} утренний кофе остаётся горячим до самого обеда — даже если пары или созвоны затянулись.`
        : 'Этот товар точно поднимет вам настроение и станет любимым!'
      : s.context
        ? 'Кружка. Держит тепло 6 часов. Объём 350 мл. Подходит для студентов и офиса.'
        : 'Это хорошая кружка. Она подходит для напитков и имеет хорошее качество.'
    const bullets = s.context ? ['Держит тепло 6 часов', '350 мл — как большой капучино', 'Не протекает в сумке'] : ['Высокое качество', 'Стильный дизайн', 'Удобная в использовании']
    const cta = s.context ? (s.friendly ? 'Закажи сегодня — и завтра твой кофе уже в дороге с тобой.' : 'Закажите сегодня — и завтра ваш кофе уже поедет с вами.') : 'Купите прямо сейчас!'
    title = s.format ? (s.context ? 'Термокружка «Термо»: кофе горячий 6 часов' : 'Кружка — отличный выбор') : null
    const filler = !s.limits ? (
      <p className="relative mt-2 max-h-[64px] overflow-hidden text-[12.5px] font-semibold leading-snug text-muted">
        🔥🔥 Кроме того, хотим отметить, что в современном мире очень важно иметь качественную посуду, ведь каждый день мы пьём напитки, и от выбора кружки зависит
        очень многое, в том числе настроение, продуктивность, а также общее впечатление от утра, которое, как известно, задаёт тон всему дню… ✨✨
        <span className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white" />
      </p>
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
            <span className="rounded-lg bg-coral px-2 py-0.5 text-[11px] font-black uppercase text-white">Маркет</span>
            <span className="h-7 flex-1 rounded-lg bg-snow" />
          </div>
          <div className="grid gap-3 @sm:grid-cols-[130px_1fr]">
            <div className="flex items-center justify-center rounded-2xl bg-brand-light py-3">
              <Mug size={110} />
            </div>
            <div className="min-w-0">
              {!s.asked ? (
                <div className="space-y-2 py-1" aria-label="Пока пусто">
                  <div className="h-5 w-4/5 rounded-md bg-line" />
                  <div className="h-3 w-full rounded-md bg-snow" />
                  <div className="h-3 w-11/12 rounded-md bg-snow" />
                  <div className="h-3 w-3/5 rounded-md bg-snow" />
                  <p className="pt-1 text-[12.5px] font-bold text-muted">Здесь появится текст от ИИ</p>
                </div>
              ) : !s.goal ? (
                <div className="rounded-2xl border-2 border-dashed border-line p-3 text-[13.5px] font-bold text-muted">«Чем помочь? 🙂 Уточни задачу.» — ИИ не понял, что писать</div>
              ) : (
                <>
                  {title ? <h4 className="text-[17px] font-black leading-tight">{title}</h4> : <h4 className="text-[15px] font-black text-muted">Кружка</h4>}
                  <div className="mt-0.5 flex items-center gap-2 text-[12px] font-extrabold text-gold-dark">
                    ★★★★★ <span className="text-muted">4,9 · 312 отзывов</span>
                  </div>
                  <div className="mt-2">{body}</div>
                </>
              )}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-[18px] font-black">1 290 ₽</span>
                <span className="rounded-xl bg-brand px-3 py-1.5 text-[12px] font-black uppercase text-white shadow-[0_3px_0_#5B2FD6]">В корзину</span>
              </div>
            </div>
          </div>
        </div>
      </BrowserFrame>
      <div className="card p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-extrabold uppercase tracking-wider text-muted">Качество ответа</span>
          <span className={`text-[14px] font-black ${score === 5 ? 'text-teal-dark' : score >= 3 ? 'text-gold-dark' : 'text-coral-dark'}`}>
            {QUALITY[score]} · {score}/5
          </span>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="h-3 rounded-full transition-colors duration-500" style={{ background: i < score ? (score === 5 ? '#13C2AE' : score >= 3 ? '#FFC23D' : '#FF7A59') : '#E7E3F1' }} />
          ))}
        </div>
        {s.asked && s.goal && (
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11.5px] font-extrabold">
            <span className={`rounded-full px-2 py-0.5 ${s.limits ? 'bg-teal-light text-teal-dark' : 'bg-coral-light text-coral-dark'}`}>≈ {wordsN} слов</span>
            <span className={`rounded-full px-2 py-0.5 ${s.format ? 'bg-teal-light text-teal-dark' : 'bg-coral-light text-coral-dark'}`}>{s.format ? 'есть структура' : 'сплошной текст'}</span>
            <span className={`rounded-full px-2 py-0.5 ${s.context ? 'bg-teal-light text-teal-dark' : 'bg-coral-light text-coral-dark'}`}>{s.context ? 'конкретные факты' : 'общие слова'}</span>
            <span className={`rounded-full px-2 py-0.5 ${s.role ? 'bg-teal-light text-teal-dark' : 'bg-coral-light text-coral-dark'}`}>{s.role ? 'продающий тон' : 'сухой тон'}</span>
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

const MENU = [
  ['Эспрессо', '150 ₽'],
  ['Капучино', '220 ₽'],
  ['Латте', '240 ₽'],
  ['Раф', '260 ₽'],
]

function LandingPage({ s }: { s: LandingState }) {
  const p = PALETTES[s.palette]
  const btnPal = PALETTES[s.ctaColor ?? (s.palette === 'none' ? 'none' : s.palette)]
  const btn: CSSProperties = { background: btnPal.accent, boxShadow: `0 4px 0 ${btnPal.dark}` }
  const name = s.name ?? (s.coffee ? 'Кофейня' : 'Мой сайт')
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
            {s.menu && <span>Меню</span>}
            {s.reviews && <span>Отзывы</span>}
            {s.contacts && <span>Контакты</span>}
          </span>
        )}
        {a && (s.nav || s.menu) && <span className="text-[22px] font-black @md:hidden">☰</span>}
      </nav>
      <section className={`mx-4 grid items-center gap-4 rounded-[28px] px-6 py-8 ${a ? 'grid-cols-1 @md:grid-cols-[1.2fr_1fr] @md:px-10 @md:py-12' : 'grid-cols-[1.2fr_1fr] px-10 py-12'}`} style={{ background: p.hero }}>
        <div className={a ? 'text-center @md:text-left' : ''}>
          {s.coffee && <div className="mb-2 text-[12px] font-black uppercase tracking-[.16em]" style={{ color: p.accent }}>Кофейня · с 2026</div>}
          <h1 className={`font-black leading-[1.05] ${a ? 'text-[34px] @md:text-[52px]' : 'text-[52px]'}`} style={{ color: p.dark }}>
            {name}
          </h1>
          <p className="mt-3 text-[16px] font-bold opacity-80 @md:text-[19px]">
            {s.slogan ?? (s.coffee ? 'Лучший кофе в городе' : 'Добро пожаловать на наш сайт! Lorem ipsum dolor sit amet, consectetur.')}
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
          <h2 className="mb-4 text-[26px] font-black" style={{ color: p.dark }}>
            Меню
          </h2>
          <div className={`grid gap-3 ${a ? 'grid-cols-2 @md:grid-cols-4' : 'grid-cols-4'}`}>
            {MENU.map(([n, price], i) => (
              <div key={n} className="rounded-2xl p-4 text-center" style={{ background: p.soft, boxShadow: `0 4px 0 ${p.hero}` }}>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: p.hero }}>
                  <Cup size={34} color={p.accent} dark={p.dark} />
                </div>
                <div className="text-[16px] font-black">{s.coffee ? n : `Товар ${i + 1}`}</div>
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
          <h2 className="mb-2 text-[24px] font-black" style={{ color: p.dark }}>
            О нас
          </h2>
          <p className="text-[15px] font-semibold opacity-80">Обжариваем зерно сами, каждое утро. Приходи с ноутбуком — у нас быстрый Wi‑Fi.</p>
        </section>
      )}
      {s.reviews && (
        <section className="px-6 pb-8">
          <h2 className="mb-4 text-[26px] font-black" style={{ color: p.dark }}>
            Отзывы
          </h2>
          <div className={`grid gap-3 ${a ? 'grid-cols-1 @md:grid-cols-3' : 'grid-cols-3'}`}>
            {[
              ['Лиза', 'Лучший раф в районе!'],
              ['Тимур', 'Работаю здесь по утрам — уютно.'],
              ['Аня', 'Круассаны тают во рту.'],
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
            <h2 className="text-[22px] font-black" style={{ color: p.dark }}>
              Ждём в гости
            </h2>
            <p className="mt-1 text-[15px] font-bold opacity-80">ул. Кофейная, 7 · ежедневно 8:00–22:00</p>
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
    <div className="flex shrink-0 rounded-xl border-2 border-line bg-white p-0.5" role="group" aria-label="Устройство">
      {(['desktop', 'phone'] as const).map((d) => (
        <button
          key={d}
          onClick={() => setUi((u) => ({ ...u, device: d, viewedMobile: u.viewedMobile || d === 'phone' }))}
          className={`rounded-lg px-2 py-0.5 text-[12px] font-extrabold ${ui.device === d ? 'bg-brand text-white' : 'text-muted'}`}
          aria-pressed={ui.device === d}
        >
          {d === 'desktop' ? '🖥 Компьютер' : '📱 Телефон'}
        </button>
      ))}
    </div>
  )
  if (!s.built)
    return (
      <BrowserFrame url={url} right={toggle}>
        <Empty text="Отправь промпт — и здесь появится сайт кофейни" />
      </BrowserFrame>
    )
  if (ui.device === 'phone')
    return (
      <div className="card p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-[13px] font-extrabold uppercase tracking-wider text-muted">Превью</span>
          {toggle}
        </div>
        <PhoneFrame
          warn={
            !s.adaptive && (
              <div className="absolute inset-x-2 bottom-2 rounded-xl bg-coral px-3 py-2 text-center text-[12px] font-black text-white shadow-[0_3px_0_#E0573A]">
                ↔ Страница шире экрана — нужен адаптив
              </div>
            )
          }
        >
          <div key={version} className="anim-fade-up">
            <LandingPage s={s} />
          </div>
        </PhoneFrame>
        {s.adaptive && <p className="mt-3 text-center text-[13px] font-extrabold text-teal-dark">✓ Всё в одну колонку, ничего не вылезает</p>}
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
  const tasks = ['Купить зёрна для кофейни', 'Позвонить Бипи', ...ui.added]
  const add = () => {
    if (!s.fixed) {
      setUi((u) => ({ ...u, failedClicks: u.failedClicks + 1 }))
      setShake((n) => n + 1)
      setNote(null)
      return
    }
    if (!text.trim()) {
      setNote('Пустую задачу не добавить — ИИ добавил проверку 👌')
      return
    }
    setUi((u) => ({ ...u, added: [...u.added, text.trim()], verified: true }))
    setText('')
    setNote('Задача добавлена — баг побеждён! 🎉')
  }
  const btnStyle: CSSProperties = s.restyled && !s.fixed ? { background: '#7C4DFF', boxShadow: '0 3px 0 #5B2FD6' } : { background: '#13C2AE', boxShadow: '0 3px 0 #0E9C8C' }
  const errCount = 1 + ui.failedClicks
  return (
    <div className="space-y-3">
      <BrowserFrame url="localhost:5173 — Список дел">
        <div key={version} className="anim-fade-up p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-[19px] font-black">📝 Мои задачи</h4>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${s.fixed ? 'bg-teal-light text-teal-dark' : 'bg-coral-light text-coral-dark'}`}>{s.fixed ? 'работает' : 'сломано'}</span>
          </div>
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder="Новая задача…"
              aria-label="Новая задача"
              className="input !h-[42px] min-w-0 flex-1 !rounded-xl !px-3 !text-[14px]"
            />
            <button key={shake} onClick={add} className={`shrink-0 rounded-xl px-4 text-[13px] font-black uppercase text-white ${shake ? 'anim-shake' : ''}`} style={btnStyle}>
              {s.restyled && !s.fixed ? '✨ ' : ''}Добавить
            </button>
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
          <span className="text-[12px] font-extrabold uppercase tracking-wider text-white/60">Консоль</span>
          {!s.fixed && <span className="rounded-full bg-coral px-1.5 text-[11px] font-black text-white">{errCount}</span>}
          {!s.fixed && (
            <button onClick={() => insert(BUG_ERROR)} className="ml-auto rounded-lg bg-white/10 px-2.5 py-1 text-[12px] font-extrabold text-white hover:bg-white/20">
              Скопировать ошибку
            </button>
          )}
        </div>
        <div className="code-font px-3 py-2.5 text-[12px] leading-relaxed">
          {s.fixed ? (
            <div className="text-[#6FE3D3]">✓ Ошибок нет · задач в списке: {tasks.length}</div>
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
        <button onClick={() => setCodeOpen((o) => !o)} className="mb-2 text-[13px] font-extrabold uppercase tracking-wider text-muted hover:text-ink" aria-expanded={codeOpen}>
          {codeOpen ? '▾' : '▸'} Код App.jsx
        </button>
        {codeOpen &&
          (s.fixed ? (
            <CodeBox title="App.jsx · исправлено ИИ" lines={FIX_CODE} start={13} />
          ) : (
            <CodeBox
              title="App.jsx"
              lines={BUG_CODE}
              start={11}
              mark={3}
              markColor="#FF7A59"
              action={
                <button onClick={() => insert(BUG_CODE.join('\n'))} className="rounded-lg bg-white/10 px-2.5 py-1 text-[12px] font-extrabold text-white hover:bg-white/20">
                  Скопировать код
                </button>
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
    { k: 'name', label: 'Имя', ph: 'Как тебя зовут?', on: s.name },
    { k: 'email', label: 'Email', ph: 'you@example.com', on: s.email },
    { k: 'message', label: anyField ? 'Сообщение' : 'Текст', ph: 'Что понравилось?', on: s.message || !anyField },
  ]
  const submit = () => {
    const e: Record<string, string> = {}
    if (s.validation) {
      for (const f of fields) if (f.on && !vals[f.k].trim()) e[f.k] = 'Обязательное поле'
      if (s.email && vals.email.trim() && !EMAIL_RE.test(vals.email.trim())) e.email = 'Похоже, email с ошибкой'
    }
    setErrs(e)
    if (Object.keys(e).length) {
      setNote(null)
      return
    }
    if (!s.table) {
      setNote({ text: 'Отправлено… но данные никуда не сохранились: таблицы нет 🤷', ok: false })
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
    setNote({ text: s.thanks ? 'Спасибо за отзыв! 💜' : 'Сохранено в таблицу feedback', ok: true })
  }
  if (!s.form)
    return (
      <BrowserFrame url="zerno.local/feedback">
        <Empty text="Опиши форму — и здесь появится она и таблица в базе данных" />
      </BrowserFrame>
    )
  return (
    <div className="space-y-3">
      <BrowserFrame url="zerno.local/feedback">
        <div key={version} className="anim-fade-up p-4">
          <h4 className="text-[18px] font-black">☕ Отзывы о кофейне «Зерно»</h4>
          <p className="mb-3 text-[13px] font-semibold text-muted">Расскажи, как тебе у нас</p>
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
          <button onClick={submit} className="btn btn-sm btn-block mt-3">
            Отправить отзыв
          </button>
          {note && <p className={`mt-2 text-[13px] font-extrabold ${note.ok ? 'text-teal-dark' : 'text-coral-dark'}`}>{note.text}</p>}
        </div>
      </BrowserFrame>

      <div className={`rounded-2xl border-2 px-3 py-2.5 ${s.keyLeaked ? 'border-coral bg-coral-light' : s.keySafe ? 'border-[#8be3d7] bg-teal-light' : 'border-dashed border-line'}`}>
        <div className={`flex items-center gap-2 text-[13px] font-black ${s.keyLeaked ? 'text-coral-dark' : s.keySafe ? 'text-teal-dark' : 'text-muted'}`}>
          <Lock size={16} />
          {s.keyLeaked ? 'Ключ вписан прямо в код — утечёт с репозиторием!' : s.keySafe ? 'Ключ в .env, а .env — в .gitignore' : 'Ключ к базе ещё не настроен'}
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
          {s.table ? 'Таблица feedback' : 'База данных'}
          {s.table && <span className="ml-auto text-[12px] font-bold text-muted">{ui.rows.length} строк</span>}
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
                    <td colSpan={4} className="px-2.5 py-3 text-center font-bold text-muted">
                      Пока пусто — отправь отзыв через форму
                    </td>
                  </tr>
                )}
                {ui.rows.map((r) => (
                  <tr key={r.id} className={`anim-fade-up border-b border-line font-bold ${r.bad && !s.validation ? 'bg-coral-light' : ''}`}>
                    <td className="px-2.5 py-1.5 text-muted">{r.id}</td>
                    <td className="px-2.5 py-1.5">{r.name}</td>
                    <td className="max-w-[110px] truncate px-2.5 py-1.5">{r.email}</td>
                    <td className="max-w-[140px] truncate px-2.5 py-1.5">
                      {r.message}
                      {r.bad && !s.validation && <span className="ml-1 text-coral-dark">⚠ мусор</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-3 py-4 text-center text-[13px] font-bold text-muted">Таблицы ещё нет — данные формы никуда не попадают</p>
        )}
      </div>
    </div>
  )
}

// ================================================================ 5. Деплой

const STEPS: { key: keyof ReturnType<typeof deployDone>; label: string }[] = [
  { key: 'commit', label: 'Коммит' },
  { key: 'push', label: 'GitHub' },
  { key: 'deploy', label: 'Vercel' },
  { key: 'domain', label: 'Домен' },
  { key: 'analytics', label: 'Аналитика' },
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
      setErr('Нужна ссылка вида https://my-app.vercel.app')
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
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-[12px] font-extrabold uppercase tracking-wider text-white/60">Терминал агента</div>
        <div key={version} className="code-font max-h-[190px] overflow-y-auto px-3 py-2.5 text-[12px] leading-relaxed">
          {s.log.length === 0 ? (
            <div className="text-white/40">$ _ ждём команду…</div>
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
            <span className="text-[12px] font-black uppercase tracking-wider text-teal-dark">Сайт в сети</span>
            <span className="code-font ml-auto min-w-0 truncate text-[12px] font-bold text-teal-dark">🔒 {url.replace('https://', '')}</span>
          </div>
          <div className="grid gap-3 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="overflow-hidden rounded-xl border-2 border-line">
              <div className="flex items-center justify-between bg-[#F3DFC9] px-3 py-3">
                <div>
                  <div className="text-[15px] font-black text-[#5C3A24]">☕ Зерно</div>
                  <div className="text-[11px] font-bold text-[#4A3326]/70">Свежая обжарка каждый день</div>
                </div>
                <span className="rounded-lg bg-coral px-2 py-1 text-[10px] font-black uppercase text-white">Бронь</span>
              </div>
              <div className="grid grid-cols-4 gap-1 bg-[#FFF8F0] p-2">
                {MENU.map(([n]) => (
                  <span key={n} className="rounded-md bg-white py-1 text-center text-[9px] font-extrabold text-[#5C3A24]">
                    {n}
                  </span>
                ))}
              </div>
            </div>
            <button className="btn btn-teal btn-sm" onClick={() => setUi((u) => ({ ...u, opened: true }))}>
              Открыть сайт
            </button>
          </div>
          {ui.opened && <p className="px-3 pb-3 text-[13px] font-extrabold text-teal-dark">Открылось за 0,4 с — всё работает ✨ (демо-ссылка, по-настоящему не откроется)</p>}
          {s.analytics && (
            <div className="border-t-2 border-line px-3 py-2.5">
              <div className="flex items-center justify-between text-[12px] font-extrabold text-muted">
                <span>Посетители за неделю</span>
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
        <div className="rounded-[20px] border-2 border-dashed border-line px-4 py-6 text-center text-[13.5px] font-bold text-muted">Здесь появится карточка живого сайта со ссылкой</div>
      )}

      <div className="card p-3">
        <div className="text-[13px] font-black">Есть настоящий проект? <span className="font-bold text-muted">(по желанию)</span></div>
        <p className="text-[12px] font-semibold text-muted">Вставь ссылку — сохраним в портфолио у тебя в профиле (только в этом браузере).</p>
        <div className="mt-2 flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="https://my-app.vercel.app" aria-label="Ссылка на мой проект" className="input !h-[40px] min-w-0 flex-1 !rounded-xl !px-3 !text-[14px]" />
          <button className="btn btn-ghost btn-sm shrink-0" onClick={save}>
            Сохранить
          </button>
        </div>
        {err && <p className="mt-1 text-[12px] font-extrabold text-coral-dark">{err}</p>}
        {!err && progress.portfolioUrl && (
          <p className="mt-1 truncate text-[12px] font-extrabold text-teal-dark">
            ✓ В портфолио: <span className="code-font">{progress.portfolioUrl}</span>
          </p>
        )}
      </div>
    </div>
  )
}
