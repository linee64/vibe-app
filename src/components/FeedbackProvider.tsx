/**
 * «Отзыв» доступен отовсюду: useFeedback().open(). Сама форма — отдельный ленивый чанк (Feedback.tsx).
 * MicroPromptHost — короткие контекстные вопросы (после первого урока, после пейвола, после домашки):
 * по одному, не во время урока, с лимитами в localStorage.
 */
import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { FeedbackCategory, MicroPromptKind } from '../data/feedback'
import { flushFeedbackOutbox, markMicroPromptShown, pendingMicroPrompt } from '../lib/feedback'
import { track } from '../lib/analytics'

const FeedbackSheet = lazy(() => import('./Feedback').then((m) => ({ default: m.FeedbackSheet })))
const MicroPromptCard = lazy(() => import('./Feedback').then((m) => ({ default: m.MicroPromptCard })))

export interface OpenFeedbackOptions {
  /** Откуда открыли (для аналитики): profile, header, more, landing, error */
  entry?: string
  category?: FeedbackCategory
}

const Ctx = createContext<{ open: (o?: OpenFeedbackOptions) => void }>({ open: () => {} })

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<OpenFeedbackOptions | null>(null)
  const open = useCallback((o: OpenFeedbackOptions = {}) => {
    track('feedback_opened', { entry: o.entry ?? 'unknown' })
    setOpts(o)
  }, [])
  useEffect(() => {
    void flushFeedbackOutbox()
  }, [])
  const value = useMemo(() => ({ open }), [open])
  return (
    <Ctx.Provider value={value}>
      {children}
      {opts && (
        <Suspense fallback={null}>
          <FeedbackSheet initialCategory={opts.category} onClose={() => setOpts(null)} />
        </Suspense>
      )}
    </Ctx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFeedback = () => useContext(Ctx)

/** Показывает ждущий микро-опрос. Рендерится только на экранах вне урока (AppShell). */
export function MicroPromptHost() {
  const [kind, setKind] = useState<MicroPromptKind | null>(null)
  const current = useRef<MicroPromptKind | null>(null)
  useEffect(() => {
    const check = () => {
      if (current.current) return
      const next = pendingMicroPrompt()
      if (!next) return
      current.current = next
      // показ засчитывается сразу: даже если ученик просто уйдёт, повторно этот вопрос не всплывёт
      markMicroPromptShown(next)
      track('micro_prompt_shown', { source: next })
      setKind(next)
    }
    const t = window.setTimeout(check, 600)
    window.addEventListener('vaibik:micro', check)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('vaibik:micro', check)
    }
  }, [])
  if (!kind) return null
  return (
    <Suspense fallback={null}>
      <MicroPromptCard
        kind={kind}
        onClose={() => {
          current.current = null
          setKind(null)
        }}
      />
    </Suspense>
  )
}
