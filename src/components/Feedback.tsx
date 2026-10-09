/** Форма «Отзыв» и микро-опросы. Ленивый чанк — грузится, только когда что-то открывают. */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useStore } from '../store'
import { Mascot, MascotHead } from './Mascot'
import { Cross } from './Icons'
import {
  FEEDBACK_MAX_MESSAGE,
  canSubmitFeedback,
  isValidEmail,
  type FeedbackCategory,
  type FeedbackSource,
  type MicroPromptKind,
} from '../data/feedback'
import { collectContext, submitFeedback } from '../lib/feedback'
import { track } from '../lib/analytics'
import { t } from '../i18n/core'
import { feedbackCategoryLabel, manualCategories, paywallReasons, ratingLabel } from '../i18n/labels'

// ---------------------------------------------------------------- лица Бипи (оценка 1–5)

const INK = '#2F2A47'
const FACE_SCREEN = ['#FFE9E2', '#FFF1E6', '#FFF4D6', '#DCF8F3', '#EFE9FF']
const FACE_CHEEK = ['#FF9C85', '#FF9C85', '#FFB98A', '#7FDCCF', '#C7B6FF']

/** Голова Бипи с настроением от 1 (грустит) до 5 (сияет) */
export function BipiFace({ rating, size = 44 }: { rating: number; size?: number }) {
  const i = Math.min(5, Math.max(1, rating)) - 1
  const eyes =
    rating >= 5 ? (
      <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M21 34 Q25 28.5 29 34" />
        <path d="M35 34 Q39 28.5 43 34" />
      </g>
    ) : (
      <g fill={INK}>
        <ellipse cx="25" cy="33" rx="3.4" ry={rating <= 2 ? 3.2 : 4.2} />
        <ellipse cx="39" cy="33" rx="3.4" ry={rating <= 2 ? 3.2 : 4.2} />
        <circle cx="26.2" cy="31.6" r="1.2" fill="#fff" />
        <circle cx="40.2" cy="31.6" r="1.2" fill="#fff" />
      </g>
    )
  const brows =
    rating === 1 ? (
      <g stroke={INK} strokeWidth="2.2" strokeLinecap="round">
        <path d="M20.5 26.5 L28 28.5" />
        <path d="M43.5 26.5 L36 28.5" />
      </g>
    ) : null
  const mouth = [
    <path key="1" d="M26 44 Q32 38.5 38 44" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />,
    <path key="2" d="M27 43 Q32 40.5 37 43" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />,
    <path key="3" d="M27 41.5 H37" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />,
    <path key="4" d="M26.5 39.5 Q32 44.5 37.5 39.5" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />,
    <g key="5">
      <path d="M25.5 38.5 H38.5 Q38 46 32 46 Q26 46 25.5 38.5 Z" fill={INK} />
      <ellipse cx="32" cy="43.6" rx="3.4" ry="1.7" fill="#FF7A59" />
    </g>,
  ][i]
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      {/* антенна: грустный Бипи её опускает */}
      {rating <= 2 ? <path d="M32 13 Q30 8 24 7" stroke="#5B2FD6" strokeWidth="3.4" strokeLinecap="round" fill="none" /> : <path d="M32 13V6" stroke="#5B2FD6" strokeWidth="3.4" strokeLinecap="round" />}
      <circle cx={rating <= 2 ? 23 : 32} cy={rating <= 2 ? 7.5 : 6} r="4.2" fill={rating >= 4 ? '#FF7A59' : rating === 3 ? '#FFC23D' : '#C9C3DD'} />
      <rect x="4" y="26" width="7" height="16" rx="3.5" fill="#13C2AE" />
      <rect x="53" y="26" width="7" height="16" rx="3.5" fill="#13C2AE" />
      <rect x="8" y="17" width="48" height="41" rx="17" fill="#5B2FD6" />
      <rect x="8" y="14" width="48" height="41" rx="17" fill="#7C4DFF" />
      <rect x="14" y="20" width="36" height="29" rx="12" fill={FACE_SCREEN[i]} />
      {brows}
      {eyes}
      {rating >= 3 && <ellipse cx="19.5" cy="40" rx="2.8" ry="1.7" fill={FACE_CHEEK[i]} opacity=".9" />}
      {rating >= 3 && <ellipse cx="44.5" cy="40" rx="2.8" ry="1.7" fill={FACE_CHEEK[i]} opacity=".9" />}
      {mouth}
      {rating === 1 && <path d="M45 36 q1.6 2.6 0 4 q-1.6 -1.4 0 -4z" fill="#2EB6F5" />}
    </svg>
  )
}

export function RatingFaces({ value, onChange, size = 44, label = t('x0thkpd1') }: { value: number | null; onChange: (r: number) => void; size?: number; label?: string }) {
  return (
    <div>
      <div className="flex justify-between gap-1.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((r) => {
          const on = value === r
          return (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={t('x1ie1arr', { r, v: ratingLabel(r) })}
              title={ratingLabel(r)}
              data-rating={r}
              onClick={() => onChange(r)}
              className={`flex flex-1 items-center justify-center rounded-2xl border-2 py-1.5 transition-transform ${
                on ? 'scale-105 border-brand-mid bg-brand-light shadow-[0_4px_0_var(--color-brand-mid)]' : 'border-line bg-white shadow-[0_3px_0_var(--color-line)] hover:bg-snow'
              } ${value !== null && !on ? 'opacity-55' : ''}`}
            >
              <BipiFace rating={r} size={size} />
            </button>
          )
        })}
      </div>
      <div className="mt-1.5 h-5 text-center text-[14px] font-extrabold text-brand" aria-live="polite">
        {value ? ratingLabel(value) : ''}
      </div>
    </div>
  )
}

function Chips({ items, value, onChange, label }: { items: { id: FeedbackCategory; label: string; emoji?: string }[]; value: FeedbackCategory | null; onChange: (c: FeedbackCategory | null) => void; label: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
      {items.map((c) => {
        const on = value === c.id
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={on}
            data-chip={c.id}
            onClick={() => onChange(on ? null : c.id)}
            className={`rounded-full border-2 px-3.5 py-1.5 text-[14px] font-extrabold transition-colors ${
              on ? 'border-brand bg-brand text-white shadow-[0_3px_0_#5B2FD6]' : 'border-line bg-white text-ink shadow-[0_3px_0_var(--color-line)] hover:bg-snow'
            }`}
          >
            {c.emoji ? `${c.emoji} ` : ''}
            {c.label}
          </button>
        )
      })}
    </div>
  )
}

function Toggle({ on, onChange, children }: { on: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`relative h-[28px] w-[48px] shrink-0 rounded-full transition-colors ${on ? 'bg-teal' : 'bg-line'}`}
        data-context-toggle
      >
        <span className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-[left] ${on ? 'left-[23px]' : 'left-[3px]'}`} />
      </button>
      <span className="min-w-0 text-[14px] font-bold leading-snug text-ink">{children}</span>
    </label>
  )
}

const PLACEHOLDER: Partial<Record<FeedbackCategory, string>> = {
  get bug() { return t('x0a2omak') },
  get idea() { return t('x12m8vkz') },
  get hard() { return t('x0kvmebt') },
  get other() { return t('x182sijc') },
}

function Thanks({ onClose, compact }: { onClose: () => void; compact?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center" data-feedback-thanks>
      <Mascot mood="happy" size={compact ? 84 : 128} className="anim-pop" />
      <h2 className={`${compact ? 'mt-1 text-[19px]' : 'mt-3 text-[24px]'} font-black leading-tight`}>{t('x00nmb14')}</h2>
      <p className="mt-1 max-w-[340px] text-[15px] font-semibold leading-snug text-muted">{t('x1pfyx8d')}</p>
      {!compact && (
        <button className="btn btn-block mt-6" onClick={onClose} autoFocus>{t('x1e0jmys')}</button>
      )}
    </div>
  )
}

/** Модальная форма «Отзыв» */
export function FeedbackSheet({ onClose, initialCategory, source = 'manual' }: { onClose: () => void; initialCategory?: FeedbackCategory; source?: FeedbackSource }) {
  const { session } = useStore()
  const [rating, setRating] = useState<number | null>(null)
  const [category, setCategory] = useState<FeedbackCategory | null>(initialCategory ?? null)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [withContext, setWithContext] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [context] = useState(() => collectContext())
  const askEmail = !session?.real
  const ids = useId()
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  useEffect(() => {
    box.current?.querySelector<HTMLElement>('[role="radio"]')?.focus({ preventScroll: true })
  }, [])

  const emailBad = email.trim() !== '' && !isValidEmail(email.trim())
  const ready = canSubmitFeedback({ rating, category, message, email: askEmail ? email : undefined }) && !busy

  const send = async () => {
    if (!ready) return
    setBusy(true)
    setError(null)
    const res = await submitFeedback({
      rating,
      category,
      message,
      email: askEmail ? email.trim() || undefined : undefined,
      source,
      context: withContext ? context : {},
    })
    setBusy(false)
    if (res.ok) setDone(true)
    else setError(res.message)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={`${ids}-t`} data-feedback-sheet>
      <button className="absolute inset-0 cursor-default" aria-label={t('x09wpu9j')} tabIndex={-1} onClick={onClose} />
      <div ref={box} className="anim-sheet relative max-h-[94dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-5 shadow-[0_-6px_0_rgba(47,42,71,.08)] sm:rounded-[28px] sm:p-7 sm:shadow-[0_8px_0_rgba(47,42,71,.12)]">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-xl p-1 text-[#B3ADC8] hover:text-muted" aria-label={t('x09wpu9j')}>
          <Cross size={26} />
        </button>
        {done ? (
          <div className="py-4">
            <Thanks onClose={onClose} />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 pr-8">
              <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-brand-light">
                <MascotHead size={40} />
              </span>
              <div className="min-w-0">
                <h2 id={`${ids}-t`} className="text-[21px] font-black leading-tight">{t('x17htg15')}</h2>
                <p className="text-[14px] font-semibold leading-snug text-muted">{t('x1r3mbi8')}</p>
              </div>
            </div>

            <div className="mt-5">
              <RatingFaces value={rating} onChange={setRating} label={t('x04ct6yl')} />
            </div>

            <div className="mt-2 text-[13px] font-black uppercase tracking-wider text-muted">{t('x0iqczup')}</div>
            <div className="mt-2">
              <Chips items={manualCategories()} value={category} onChange={setCategory} label={t('x0iqczup')} />
            </div>

            <div className="relative mt-4">
              <textarea
                className="input min-h-[112px] resize-none !py-3 leading-snug"
                aria-label={t('x1oz6pfb')}
                placeholder={(category && PLACEHOLDER[category]) || t('x1rcq5p5')}
                maxLength={FEEDBACK_MAX_MESSAGE}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                data-feedback-text
              />
              <span className={`pointer-events-none absolute bottom-2 right-3 text-[12px] font-bold ${message.length > FEEDBACK_MAX_MESSAGE - 100 ? 'text-coral-dark' : 'text-[#B3ADC8]'}`}>
                {message.length}/{FEEDBACK_MAX_MESSAGE}
              </span>
            </div>

            {askEmail && (
              <div className="mt-3">
                <input
                  className={`input ${emailBad ? 'has-error' : ''}`}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  aria-label={t('x1hs61up')}
                  placeholder={t('x1s6yp2m')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailBad && <p className="mt-1 text-[13px] font-bold text-coral-dark">{t('x12isppe')}</p>}
              </div>
            )}

            <div className="mt-4 rounded-2xl bg-snow px-4 py-3">
              <Toggle on={withContext} onChange={setWithContext}>{t('x0awe2t4')}<button type="button" className="ml-1.5 text-[13px] font-extrabold text-brand hover:underline" onClick={(e) => {
                    e.preventDefault()
                    setShowDetails((v) => !v)
                  }} aria-expanded={showDetails}>
                  {showDetails ? t('x0oeirp5') : t('x0kmtlhe')}
                </button>
              </Toggle>
              {showDetails && (
                <p className="mt-2 text-[12px] font-semibold leading-snug text-muted" data-context-details>{t('x046lzup')}{' '}{context.route}
                  {context.lesson_id ? t('x0oiwtg9', { lesson_id: context.lesson_id }) : ''}
                  {context.homework_id ? t('x0ja1p3w', { homework_id: context.homework_id }) : ''}{' '}{t('x0dh7tc1')}{' '}{context.app_version} · {context.platform} · {context.viewport}
                  {context.browser ? ` · ${context.browser}` : ''}
                  {context.os ? ` · ${context.os}` : ''}{t('x0fo7t4f')}</p>
              )}
            </div>

            {error && (
              <p role="alert" className="mt-3 rounded-2xl border-2 border-coral/60 bg-coral-light/60 px-4 py-2.5 text-[14px] font-bold text-coral-dark">
                {error}
              </p>
            )}

            <button className="btn btn-block btn-bouncy mt-5" disabled={!ready || emailBad} onClick={send} data-feedback-send>
              {busy ? t('x0xqc2da') : t('x0x5ywt2')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- микро-опросы

const MICRO_COPY: Record<MicroPromptKind, { title: string; sub: string }> = {
  first_lesson: { get title() { return t('x1mjvjpo') }, get sub() { return t('x0boknei') } },
  homework: { get title() { return t('x18i9gb7') }, get sub() { return t('x1e8mfhz') } },
  paywall_exit: { get title() { return t('x1pdlh9q') }, get sub() { return t('x0lxb58t') } },
}

/** Небольшая карточка внизу экрана: не закрывает путь целиком, крестик — и её нет */
export function MicroPromptCard({ kind, onClose }: { kind: MicroPromptKind; onClose: () => void }) {
  const [rating, setRating] = useState<number | null>(null)
  const [category, setCategory] = useState<FeedbackCategory | null>(null)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const copy = MICRO_COPY[kind]
  const picked = kind === 'paywall_exit' ? category !== null : rating !== null

  useEffect(() => {
    if (!done) return
    const t = window.setTimeout(onClose, 2600)
    return () => window.clearTimeout(t)
  }, [done, onClose])

  const dismiss = () => {
    if (!done) track('micro_prompt_dismissed', { source: kind })
    onClose()
  }
  const send = async () => {
    if (!picked || busy) return
    setBusy(true)
    await submitFeedback({ rating, category, message, source: kind, context: collectContext() })
    setBusy(false)
    setDone(true)
  }

  return (
    <aside
      className="anim-fade-up fixed inset-x-3 bottom-[84px] z-40 mx-auto max-w-[400px] rounded-[22px] border-2 border-line bg-white p-4 shadow-[0_6px_0_rgba(47,42,71,.10)] md:inset-x-auto md:bottom-6 md:right-6"
      aria-label={copy.title}
      data-micro-prompt={kind}
    >
      <button onClick={dismiss} className="absolute right-2.5 top-2.5 rounded-xl p-1 text-[#B3ADC8] hover:text-muted" aria-label={t('x1y40goj')}>
        <Cross size={22} />
      </button>
      {done ? (
        <Thanks onClose={onClose} compact />
      ) : (
        <>
          <div className="flex items-center gap-3 pr-7">
            <MascotHead size={38} />
            <div className="min-w-0">
              <h3 className="text-[17px] font-black leading-tight">{copy.title}</h3>
              <p className="text-[13px] font-semibold text-muted">{copy.sub}</p>
            </div>
          </div>
          <div className="mt-3">
            {kind === 'paywall_exit' ? (
              <Chips items={paywallReasons()} value={category} onChange={setCategory} label={t('x0l8ob51')} />
            ) : (
              <RatingFaces value={rating} onChange={setRating} size={38} />
            )}
          </div>
          {picked && (
            <div className="anim-fade-up mt-2">
              <textarea
                className="input min-h-[64px] resize-none !py-2.5 !text-[14px] leading-snug"
                aria-label={t('x00apcr5')}
                placeholder={kind === 'paywall_exit' ? (category ? t('x04ixszn', { v: feedbackCategoryLabel(category) }) : '') : t('x09b04yc')}
                maxLength={FEEDBACK_MAX_MESSAGE}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="btn btn-sm btn-block mt-2.5" onClick={send} disabled={busy} data-micro-send>
                {busy ? t('x0xqc2da') : t('x0x5ywt2')}
              </button>
            </div>
          )}
        </>
      )}
    </aside>
  )
}
