import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { findLesson } from '../data/course'
import { useStore } from '../store'
import { navigate } from '../router'
import { useToast } from '../components/Toast'
import { Check, Cross, Heart } from '../components/Icons'
import { Mascot } from '../components/Mascot'
import { ExerciseView } from '../components/Exercises'
import { canCheck, correctText, isCorrect, type Answer, type Status } from '../data/exerciseLogic'
import { LessonComplete, type LessonResult } from './LessonComplete'

const PRAISE = ['Отлично!', 'Супер!', 'В точку!', 'Так держать!', 'Прекрасно!']

function Modal({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
      <div className="anim-pop w-full max-w-[420px] rounded-[24px] bg-white p-6 text-center">{children}</div>
    </div>
  )
}

export function LessonScreen({ id }: { id: string }) {
  const found = findLesson(id)
  const { progress, loseHeart, refillHearts, completeLesson } = useStore()
  const toast = useToast()

  const exercises = found?.unit.exercises ?? []
  const [queue, setQueue] = useState<number[]>(() => exercises.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [answer, setAnswer] = useState<Answer>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [solved, setSolved] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [praise, setPraise] = useState(PRAISE[0])
  const [result, setResult] = useState<LessonResult | null>(null)
  const [quitOpen, setQuitOpen] = useState(false)
  const [noHearts, setNoHearts] = useState(false)
  const startRef = useRef(0)
  const wasDone = useRef(false)

  useEffect(() => {
    startRef.current = Date.now()
    wasDone.current = progress.completed.includes(id)
    if (progress.hearts === 0) {
      refillHearts()
      toast('Демо: сердечки восстановлены ❤️')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const ex = exercises[queue[pos]]

  const check = useCallback(
    (skip = false) => {
      if (!ex || status !== 'idle') return
      if (!skip && !canCheck(answer)) return
      setAttempts((a) => a + 1)
      if (!skip && isCorrect(ex, answer)) {
        setSolved((s) => s + 1)
        setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)])
        setStatus('correct')
      } else {
        setMistakes((m) => m + 1)
        setStatus('wrong')
        if (!skip) loseHeart()
        setQueue((q) => [...q, q[pos]])
      }
    },
    [ex, status, answer, pos, loseHeart],
  )

  const next = useCallback(() => {
    if (status === 'wrong' && progress.hearts === 0) {
      setNoHearts(true)
      return
    }
    if (pos + 1 >= queue.length) {
      const seconds = Math.max(1, Math.round((Date.now() - startRef.current) / 1000))
      const perfect = mistakes === 0
      const xp = wasDone.current ? 5 : perfect ? 15 : 10
      const accuracy = Math.round((exercises.length / Math.max(attempts, 1)) * 100)
      completeLesson(id, xp, perfect)
      setResult({ xp, accuracy, seconds, gems: perfect ? 10 : 5 })
      return
    }
    setPos((p) => p + 1)
    setAnswer(null)
    setStatus('idle')
  }, [status, progress.hearts, pos, queue.length, mistakes, exercises.length, attempts, completeLesson, id])

  // Клавиатура: Enter — проверить/продолжить, цифры — выбрать вариант
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (quitOpen || noHearts || result || !ex) return
      if (e.key === 'Enter') {
        e.preventDefault()
        if (status === 'idle') check()
        else next()
        return
      }
      const n = Number(e.key)
      if (status === 'idle' && n >= 1 && n <= 9) {
        if (ex.kind === 'arrange') return
        const max = ex.kind === 'bug' ? ex.code.length : ex.options.length
        if (n <= max) setAnswer(n - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [check, next, status, ex, quitOpen, noHearts, result])

  if (!found) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <Mascot mood="think" size={140} />
        <h1 className="text-[24px] font-black">Урок не найден</h1>
        <button className="btn" onClick={() => navigate('/learn')}>
          На главную
        </button>
      </div>
    )
  }

  if (result) return <LessonComplete result={result} lessonTitle={found.title} onContinue={() => navigate('/learn')} />

  const pct = (solved / exercises.length) * 100
  const sheet =
    status === 'correct'
      ? { bg: 'bg-teal-light', text: 'text-teal-dark', btn: 'btn-teal' }
      : status === 'wrong'
        ? { bg: 'bg-coral-light', text: 'text-coral-dark', btn: 'btn-coral' }
        : null

  return (
    <div className="flex h-[100dvh] flex-col bg-white">
      <header className="mx-auto flex w-full max-w-[1040px] items-center gap-4 px-4 pt-5 md:gap-5 md:px-8 md:pt-10">
        <button onClick={() => setQuitOpen(true)} className="rounded-xl p-1 text-[#B3ADC8] transition-colors hover:text-muted" aria-label="Закрыть урок">
          <Cross size={30} />
        </button>
        <div className="progress-track flex-1 !h-[18px]">
          <div className="progress-fill bg-brand" style={{ width: `${Math.max(pct, 3)}%` }} />
        </div>
        <div className={`flex items-center gap-1.5 text-[19px] font-black text-heart ${status === 'wrong' ? 'anim-shake' : ''}`} key={progress.hearts}>
          <Heart size={30} />
          {progress.hearts}
        </div>
      </header>

      <main className="flex min-h-0 flex-1 justify-center overflow-y-auto px-4 md:px-8">
        <div key={`${pos}`} className="anim-fade-up w-full max-w-[620px] py-5 md:py-7">
          {ex && <ExerciseView ex={ex} answer={answer} setAnswer={setAnswer} status={status} />}
        </div>
      </main>

      <footer className={`shrink-0 border-t-2 ${sheet ? `anim-sheet border-transparent ${sheet.bg}` : 'border-line bg-white'}`}>
        <div className={`mx-auto flex max-w-[1040px] flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8 ${sheet ? 'md:py-6' : 'md:py-8'}`}>
          {sheet ? (
            <>
              <div className={`flex min-w-0 items-start gap-4 ${sheet.text}`}>
                <span className="hidden h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-white sm:flex">
                  {status === 'correct' ? <Check size={36} /> : <Cross size={34} />}
                </span>
                <div className="min-w-0">
                  <div className="text-[22px] font-black leading-tight md:text-[24px]">{status === 'correct' ? praise : 'Не совсем так'}</div>
                  {status === 'wrong' && (
                    <div className="mt-1 text-[16px] font-extrabold">
                      Правильный ответ: <span className="font-bold">{correctText(ex)}</span>
                    </div>
                  )}
                  <p className="mt-1 max-w-[640px] text-[15px] font-semibold leading-snug opacity-90">{ex.explain}</p>
                </div>
              </div>
              <button className={`btn ${sheet.btn} w-full shrink-0 md:w-[180px]`} onClick={next} autoFocus>
                {status === 'correct' ? 'Продолжить' : 'Понятно'}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost hidden md:inline-flex md:w-[160px]" onClick={() => check(true)}>
                Пропустить
              </button>
              <button className="btn w-full md:w-[180px]" disabled={!canCheck(answer)} onClick={() => check()}>
                Проверить
              </button>
            </>
          )}
        </div>
      </footer>

      {quitOpen && (
        <Modal>
          <Mascot mood="think" size={120} className="mx-auto" />
          <h2 className="mt-3 text-[22px] font-black">Уже уходишь?</h2>
          <p className="mb-6 mt-1 text-[16px] font-semibold text-muted">Прогресс этого урока не сохранится.</p>
          <button className="btn btn-block" onClick={() => setQuitOpen(false)}>
            Продолжить урок
          </button>
          <button className="mt-4 w-full py-2 text-[15px] font-extrabold uppercase tracking-wider text-coral-dark hover:opacity-80" onClick={() => navigate('/learn')}>
            Выйти
          </button>
        </Modal>
      )}

      {noHearts && (
        <Modal>
          <Mascot mood="think" size={120} className="mx-auto" />
          <h2 className="mt-3 text-[22px] font-black">Сердечки закончились</h2>
          <p className="mb-6 mt-1 text-[16px] font-semibold text-muted">В демо-версии их можно восстановить бесплатно.</p>
          <button
            className="btn btn-coral btn-block"
            onClick={() => {
              refillHearts()
              setNoHearts(false)
              setPos((p) => p + 1)
              setAnswer(null)
              setStatus('idle')
            }}
          >
            ❤️ Восстановить
          </button>
          <button className="mt-4 w-full py-2 text-[15px] font-extrabold uppercase tracking-wider text-muted hover:opacity-80" onClick={() => navigate('/learn')}>
            Выйти
          </button>
        </Modal>
      )}
    </div>
  )
}
