import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { GLOSS_IDS, splitGloss, type GlossField, type GlossId } from '../data/glossary'
import { useLocale } from '../i18n/react'
import { t } from '../i18n/core'
import { glossDef, glossTerm } from './glossText'
import { track } from '../lib/analytics'
import { Book, Cross } from './Icons'
import { Mascot } from './Mascot'


type Where = 'lesson_term' | 'lesson_list' | 'profile' | 'intro'

interface GlossCtx {
  /** какие термины подсвечивать в каждом поле текущего упражнения */
  fields: Map<GlossField, Set<GlossId>> | undefined
  openTerm: (id: GlossId, el: HTMLElement) => void
}
const Ctx = createContext<GlossCtx | null>(null)

/** Подсветка терминов в уроке: оборачивает упражнение и подвал с объяснением */
export function GlossProvider({ fields, children }: { fields: Map<GlossField, Set<GlossId>> | undefined; children: ReactNode }) {
  const [open, setOpen] = useState<{ id: GlossId; rect: DOMRect } | null>(null)
  const [list, setList] = useState(false)
  const openTerm = useCallback((id: GlossId, el: HTMLElement) => {
    track('glossary_opened', { term: id, where: 'lesson_term' })
    setOpen({ id, rect: el.getBoundingClientRect() })
  }, [])
  const value = useMemo(() => ({ fields, openTerm }), [fields, openTerm])
  return (
    <Ctx.Provider value={value}>
      {children}
      {open && (
        <TermTip
          id={open.id}
          rect={open.rect}
          onClose={() => setOpen(null)}
          onAll={() => {
            setOpen(null)
            setList(true)
            track('glossary_opened', { where: 'lesson_list' })
          }}
        />
      )}
      {list && <GlossarySheet onClose={() => setList(false)} />}
    </Ctx.Provider>
  )
}

/** Текст с подсвеченными терминами (вне урока — просто текст) */
export function GlossText({ text, field }: { text: string; field: GlossField }) {
  const ctx = useContext(Ctx)
  const locale = useLocale()
  const terms = ctx?.fields?.get(field)
  if (!ctx || !terms?.size) return <>{text}</>
  return (
    <>
      {splitGloss(text, terms, locale).map((s, i) =>
        s.term ? (
          <button
            key={i}
            type="button"
            className="gloss-term"
            data-gloss={s.term}
            aria-label={t('gloss.what', { term: s.text })}
            onClick={(e) => {
              e.stopPropagation()
              ctx.openTerm(s.term!, e.currentTarget)
            }}
          >
            {s.text}
          </button>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  )
}

/** Подсказка у термина: что это простыми словами */
function TermTip({ id, rect, onClose, onAll }: { id: GlossId; rect: DOMRect; onClose: () => void; onAll: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  useLayoutEffect(() => {
    const w = Math.min(300, window.innerWidth - 24)
    const h = ref.current?.offsetHeight ?? 160
    const left = Math.max(12, Math.min(rect.left + rect.width / 2 - w / 2, window.innerWidth - w - 12))
    const below = rect.bottom + 10
    const top = below + h > window.innerHeight - 12 ? Math.max(12, rect.top - h - 10) : below
    setPos({ left, top })
  }, [rect])
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-label={glossTerm(id)}
        data-gloss-tip={id}
        className="anim-pop fixed z-[61] w-[300px] max-w-[calc(100vw-24px)] rounded-[20px] border-2 border-brand-mid bg-white p-4 text-left shadow-[0_6px_0_#C7B6FF]"
        style={pos ?? { left: 12, top: rect.bottom + 10, visibility: 'hidden' }}
      >
        <div className="flex items-start gap-2">
          <Mascot size={40} mood="happy" className="-mt-1 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[17px] font-black leading-tight text-brand-dark">{glossTerm(id)}</div>
            <p className="mt-1 text-[14px] font-semibold leading-snug text-ink">{glossDef(id)}</p>
          </div>
          <button onClick={onClose} className="shrink-0 text-muted hover:text-ink" aria-label={t('gloss.close')}>
            <Cross size={20} />
          </button>
        </div>
        <button onClick={onAll} className="mt-3 flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-wider text-brand hover:opacity-80" data-gloss-all>
          <Book size={16} /> {t('gloss.all')}
        </button>
      </div>
    </>
  )
}

/** Весь словарик: список терминов с определениями */
export function GlossaryList({ highlight }: { highlight?: GlossId }) {
  return (
    <ul className="divide-y-2 divide-line" data-glossary>
      {GLOSS_IDS.map((id) => (
        <li key={id} id={`gloss-${id}`} className={`px-1 py-3 ${highlight === id ? 'bg-brand-light/60' : ''}`}>
          <div className="text-[16px] font-black text-brand-dark">{glossTerm(id)}</div>
          <p className="mt-0.5 text-[14px] font-semibold leading-snug text-ink">{glossDef(id)}</p>
        </li>
      ))}
    </ul>
  )
}

/** Словарик в модалке (из урока — чтобы не уходить из урока) */
export function GlossarySheet({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[62] flex items-end justify-center bg-ink/50 p-3 sm:items-center" role="dialog" aria-modal="true" aria-label={t('gloss.title')} onClick={onClose}>
      <div className="anim-pop flex max-h-[86dvh] w-full max-w-[480px] flex-col rounded-[24px] bg-white" onClick={(e) => e.stopPropagation()} data-glossary-sheet>
        <div className="flex items-center gap-3 border-b-2 border-line px-5 py-4">
          <Book size={26} className="text-brand" />
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-black leading-tight">{t('gloss.title')}</h2>
            <p className="text-[13px] font-semibold text-muted">{t('gloss.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label={t('gloss.close')}>
            <Cross size={26} />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 pb-4">
          <GlossaryList />
        </div>
      </div>
    </div>
  )
}

/** Кнопка «Словарик» (шапка урока) */
export function GlossaryButton({ where }: { where: Where }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => {
          track('glossary_opened', { where })
          setOpen(true)
        }}
        className="flex items-center gap-1 rounded-xl p-1 text-[#B3ADC8] transition-colors hover:text-brand"
        aria-label={t('gloss.title')}
        title={t('gloss.title')}
        data-glossary-open
      >
        <Book size={26} />
      </button>
      {open && <GlossarySheet onClose={() => setOpen(false)} />}
    </>
  )
}
