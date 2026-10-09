import { useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import type { PipelineExercise } from '../../data/types'
import { pipelineBank, pipelineCards } from '../../data/exerciseLogic'
import { Head, HintNote, type ViewProps } from './shared'
import { t } from '../../i18n/core'
import { tx } from '../../i18n/rich'

type Drag = { card: number; from: number | null; x: number; y: number; sx: number; sy: number; moved: boolean }

/**
 * «Собери пайплайн»: карточки шагов ставятся на трек.
 * Тап по карточке — в первый свободный слот, тап по слоту — вернуть карточку.
 * Перетаскивание: мышью — за всю карточку, пальцем — за ручку ⋮⋮.
 */
export function PipelineView({ ex, answer, setAnswer, status, hint }: ViewProps<PipelineExercise>) {
  const idle = status === 'idle'
  const cards = useMemo(() => pipelineCards(ex), [ex])
  const bank = useMemo(() => pipelineBank(ex), [ex])
  const n = ex.steps.length
  const slots = Array.isArray(answer) && answer.length === n ? answer : Array<number>(n).fill(-1)
  const placed = new Set(slots.filter((x) => x >= 0))
  const [drag, setDrag] = useState<Drag | null>(null)
  const [overSlot, setOverSlot] = useState<number | null>(null)
  const dragRef = useRef<Drag | null>(null)

  const put = (card: number, slot: number | null, from: number | null) => {
    const next = [...slots]
    if (from !== null) next[from] = -1
    if (slot === null) {
      const free = next.indexOf(-1)
      if (free < 0) return
      next[free] = card
    } else {
      const prev = next[slot]
      next[slot] = card
      if (prev >= 0 && from !== null) next[from] = prev // поменять местами
    }
    setAnswer(next)
  }
  const remove = (slot: number) => {
    if (!idle) return
    const next = [...slots]
    next[slot] = -1
    setAnswer(next)
  }

  const slotAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest('[data-slot]')
    return el ? Number(el.getAttribute('data-slot')) : null
  }

  const onDown = (e: RPointerEvent, card: number, from: number | null) => {
    if (!idle) return
    if (e.pointerType !== 'mouse' && !(e.target as HTMLElement).closest('[data-handle]')) return
    const d = { card, from, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false }
    dragRef.current = d
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: RPointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const moved = d.moved || Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6
    const nd = { ...d, x: e.clientX, y: e.clientY, moved }
    dragRef.current = nd
    if (moved) {
      setDrag(nd)
      setOverSlot(slotAt(e.clientX, e.clientY))
    }
  }
  const onUp = (e: RPointerEvent) => {
    const d = dragRef.current
    dragRef.current = null
    setDrag(null)
    setOverSlot(null)
    if (!d || !d.moved) return
    e.preventDefault()
    const target = slotAt(e.clientX, e.clientY)
    if (target !== null) put(d.card, target, d.from)
    else if (d.from !== null) remove(d.from)
  }
  // клик после перетаскивания не должен срабатывать как тап
  const wasDrag = useRef(false)
  const guard = (fn: () => void) => () => {
    if (wasDrag.current) {
      wasDrag.current = false
      return
    }
    fn()
  }
  const endDrag = (e: RPointerEvent) => {
    if (dragRef.current?.moved) {
      wasDrag.current = true
      setTimeout(() => (wasDrag.current = false), 60)
    }
    onUp(e)
  }

  return (
    <div>
      <Head kind="pipeline" title={ex.title} prompt={ex.prompt} />
      <HintNote hint={hint} />
      <div className="relative rounded-[20px] border-2 border-line bg-snow p-3 md:p-4" data-track>
        <div className="vx-rail absolute bottom-8 left-[33px] top-8 w-[3px] md:left-[37px]" aria-hidden />
        <ol className="relative space-y-2.5">
          {slots.map((card, i) => {
            const ok = !idle && card === i
            const bad = !idle && card !== i
            const over = overSlot === i
            return (
              <li key={i} className="flex items-center gap-2.5">
                <span
                  className={`relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] text-[14px] font-black md:h-10 md:w-10 ${
                    ok ? 'border-teal bg-teal text-white' : bad ? 'border-coral bg-coral text-white' : card >= 0 ? 'border-brand bg-brand text-white' : 'border-brand-mid bg-white text-brand'
                  }`}
                >
                  {ok ? '✓' : i + 1}
                </span>
                <div
                  data-slot={i}
                  className={`min-h-[50px] min-w-0 flex-1 rounded-2xl border-2 border-dashed transition-colors ${over ? 'border-brand bg-brand-light' : card >= 0 ? 'border-transparent' : 'border-brand-mid bg-white/60'}`}
                >
                  {card >= 0 ? (
                    <button
                      type="button"
                      disabled={!idle}
                      onClick={guard(() => remove(i))}
                      onPointerDown={(e) => onDown(e, card, i)}
                      onPointerMove={onMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      data-placed={card}
                      className={`tile vx-slot-in flex w-full items-center gap-2 px-3 py-2.5 text-[14.5px] font-bold leading-snug ${ok ? 'is-correct' : bad ? 'is-wrong' : 'is-selected'} ${drag?.card === card ? 'opacity-40' : ''}`}
                    >
                      <span data-handle className="vx-drag-handle -my-1 -ml-1 shrink-0 px-1 py-1 text-[16px] leading-none opacity-50" aria-hidden>
                        ⋮⋮
                      </span>
                      <span className="min-w-0 flex-1">{cards[card]}</span>
                      {idle && <span className="shrink-0 text-[13px] opacity-50" aria-hidden>✕</span>}
                    </button>
                  ) : (
                    <span className="flex h-full min-h-[46px] items-center px-3 text-[13px] font-bold text-brand/50">{i === 0 ? t('x146n632') : t('x0wxry6y', { v: i + 1 })}</span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {idle && (
        <>
          <div className="mb-2 mt-4 text-[14px] font-bold text-muted">{t('x0kr3ikn')}</div>
          <div className="flex flex-wrap gap-2.5" data-bank>
            {bank.map((card) =>
              placed.has(card) ? (
                <span key={card} className="rounded-2xl border-2 border-dashed border-line px-3 py-2.5 text-[14px] font-bold text-transparent select-none" aria-hidden>
                  {cards[card]}
                </span>
              ) : (
                <button
                  key={card}
                  type="button"
                  onClick={guard(() => put(card, null, null))}
                  onPointerDown={(e) => onDown(e, card, null)}
                  onPointerMove={onMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  data-card={card}
                  className={`tile vx-chip relative flex max-w-full items-center gap-2 px-3 py-2.5 text-[14.5px] font-bold leading-snug ${drag?.card === card ? 'opacity-40' : ''} ${hint?.mark === card ? 'ring-4 ring-brand-mid' : ''}`}
                >
                  <span data-handle className="vx-drag-handle -my-1 -ml-1 shrink-0 px-1 py-1 text-[16px] leading-none opacity-40" aria-hidden>
                    ⋮⋮
                  </span>
                  <span className="min-w-0">{cards[card]}</span>
                  {hint?.mark === card && <span className="shrink-0 rounded bg-brand px-1.5 text-[11px] font-black text-white">{t('x0vxnpo1')}</span>}
                </button>
              ),
            )}
          </div>
        </>
      )}
      {!idle && (ex.extra?.length ?? 0) > 0 && (
        <p className="anim-fade-up mt-3 text-[13.5px] font-bold text-muted">{tx('x19ryy5f', { v: ex.extra!.map((x) => `«${x}»`).join(', ') })}</p>
      )}
      {drag && (
        <div className="vx-ghost tile is-selected max-w-[280px] px-3 py-2.5 text-[14.5px] font-bold shadow-[0_10px_24px_rgba(47,42,71,.25)]" style={{ left: drag.x, top: drag.y }}>
          {cards[drag.card]}
        </div>
      )}
    </div>
  )
}
