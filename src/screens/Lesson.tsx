import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { findLesson } from '../data/course'
import { useStore } from '../store'
import { continueAfter } from '../flow'
import { navigate } from '../router'
import { useToast } from '../components/Toast'
import { Battery, Check, Cross, Token } from '../components/Icons'
import { ChargeMeter } from '../components/Economy'
import { Mascot } from '../components/Mascot'
import { ExerciseView } from '../components/Exercises'
import { canCheck, correctText, hintFor, isCorrect, keyOptions, type Answer, type Hint, type Status } from '../data/exerciseLogic'
import { HINT_COST, RECHARGE_COST, RECHARGE_MINUTES, tokens, waitText } from '../data/economy'
import type { Exercise } from '../data/types'
import { LessonComplete, type LessonResult } from './LessonComplete'
import { track } from '../lib/analytics'
import { requestMicroPrompt } from '../lib/feedback'
import { t } from '../i18n/core'
import { tx } from '../i18n/rich'


const PRAISE = () => [t('lesson.praise.1'), t('lesson.praise.2'), t('lesson.praise.3'), t('lesson.praise.4'), t('lesson.praise.5')]

function Modal({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={label}>
      <div className="anim-pop max-h-[92dvh] w-full max-w-[440px] overflow-y-auto rounded-[24px] bg-white p-6 text-center">{children}</div>
    </div>
  )
}

export function LessonScreen({ id }: { id: string }) {
  const found = findLesson(id)
  const { progress, loseHeart, refillHearts, addCharge, spendGems, chargeAt, completeLesson } = useStore()
  const toast = useToast()

  const exercises = found?.exercises ?? []
  const [queue, setQueue] = useState<number[]>(() => exercises.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [answer, setAnswer] = useState<Answer>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [solved, setSolved] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [praise, setPraise] = useState(PRAISE()[0])
  const [result, setResult] = useState<LessonResult | null>(null)
  const [quitOpen, setQuitOpen] = useState(false)
  /** Модалка «заряд сел»: 'menu' — варианты, 'review' — разбор последней ошибки */
  const [empty, setEmpty] = useState<null | 'menu' | 'review'>(null)
  const [hint, setHint] = useState<Hint | null>(null)
  /** +1 деление за исправленную ошибку (показываем в нижней панели) */
  const [recharged, setRecharged] = useState(false)
  const [lastWrong, setLastWrong] = useState<Exercise | null>(null)
  const startRef = useRef(0)
  const wasDone = useRef(false)
  /** Урок закончен (или уход уже записан) — «брошенный урок» больше не считаем */
  const finished = useRef(false)
  const exitReason = useRef<'quit' | 'charge_empty' | 'left'>('left')
  const live = useRef({ pos: 0, mistakes: 0 })
  live.current = { pos, mistakes }
  const unitNum = found?.unit.num

  useEffect(() => {
    startRef.current = Date.now()
    wasDone.current = progress.completed.includes(id)
    finished.current = false
    track('lesson_started', { lesson_id: id, unit: unitNum, repeat: wasDone.current })
    if (progress.hearts === 0) {
      refillHearts()
      toast(t('x1imvgi9'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Ушли из урока (крестик, «Бипи на нуле» → выйти, другая вкладка/закрыли страницу) — lesson_abandoned
  useEffect(() => {
    const abandon = () => {
      if (finished.current) return
      finished.current = true
      track('lesson_abandoned', {
        lesson_id: id,
        unit: unitNum,
        step: live.current.pos + 1,
        mistakes: live.current.mistakes,
        duration_s: Math.round((Date.now() - startRef.current) / 1000),
        reason: exitReason.current,
      })
    }
    const onHash = () => {
      if (!window.location.hash.startsWith(`#/lesson/${id}`)) abandon()
    }
    window.addEventListener('hashchange', onHash)
    window.addEventListener('pagehide', abandon)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('pagehide', abandon)
    }
  }, [id, unitNum])

  const ex = exercises[queue[pos]]
  /** Это упражнение уже решали с ошибкой (вернулось в очередь) */
  const isRetry = queue.indexOf(queue[pos]) < pos

  const check = useCallback(
    (skip = false) => {
      if (!ex || status !== 'idle') return
      if (!skip && !canCheck(ex, answer)) return
      setAttempts((a) => a + 1)
      const ok = !skip && isCorrect(ex, answer)
      track('exercise_answered', { lesson_id: id, type: ex.kind, correct: ok, retry: isRetry, skipped: skip })
      if (ok) {
        setSolved((s) => s + 1)
        setPraise(PRAISE()[Math.floor(Math.random() * PRAISE().length)])
        setStatus('correct')
        if (isRetry) {
          addCharge(1)
          setRecharged(true)
        }
      } else {
        setMistakes((m) => m + 1)
        setStatus('wrong')
        setLastWrong(ex)
        if (!skip) loseHeart()
        setQueue((q) => [...q, q[pos]])
      }
    },
    [ex, status, answer, pos, isRetry, loseHeart, addCharge, id],
  )

  const advance = useCallback(() => {
    setPos((p) => p + 1)
    setAnswer(null)
    setStatus('idle')
    setHint(null)
    setRecharged(false)
  }, [])

  const next = useCallback(() => {
    if (status === 'wrong' && progress.hearts === 0) {
      track('charge_empty', { lesson_id: id, step: pos + 1 })
      setEmpty('menu')
      return
    }
    if (pos + 1 >= queue.length) {
      const seconds = Math.max(1, Math.round((Date.now() - startRef.current) / 1000))
      const perfect = mistakes === 0
      const xp = wasDone.current ? 5 : perfect ? 15 : 10
      const accuracy = Math.round((exercises.length / Math.max(attempts, 1)) * 100)
      completeLesson(id, xp, perfect)
      finished.current = true
      track('lesson_completed', { lesson_id: id, unit: unitNum, mistakes, duration_s: seconds, perfect, accuracy, repeat: wasDone.current })
      // самый первый пройденный урок — потом (на пути, не в уроке) спросим «Как тебе первый урок?»
      if (!wasDone.current && progress.completed.length === 0) requestMicroPrompt('first_lesson')
      setResult({ xp, accuracy, seconds, gems: perfect ? 10 : 5 })
      return
    }
    advance()
  }, [status, progress.hearts, progress.completed.length, pos, queue.length, mistakes, exercises.length, attempts, completeLesson, id, advance, unitNum])

  const buyHint = useCallback(() => {
    if (!ex || hint || status !== 'idle') return
    if (!spendGems(HINT_COST)) {
      toast(t('x18c73qa', { HINT_COST: tokens(HINT_COST) }))
      return
    }
    track('hint_used', { lesson_id: id, type: ex.kind })
    track('tokens_spent', { reason: 'hint', amount: HINT_COST })
    setHint(hintFor(ex))
  }, [ex, hint, status, spendGems, toast, id])

  // Клавиатура: Enter — проверить/продолжить, цифры — выбрать вариант
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (quitOpen || empty || result || !ex) return
      if (e.key === 'Enter') {
        e.preventDefault()
        if (status === 'idle') check()
        else next()
        return
      }
      const n = Number(e.key)
      if (status === 'idle' && n >= 1 && n <= keyOptions(ex)) setAnswer(n - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [check, next, status, ex, quitOpen, empty, result])

  if (!found) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <Mascot mood="think" size={140} />
        <h1 className="text-[24px] font-black">{t('x0thqany')}</h1>
        <button className="btn" onClick={() => navigate('/learn')}>{t('x0povobi')}</button>
      </div>
    )
  }

  if (result)
    return (
      <LessonComplete
        result={result}
        lessonTitle={found.title}
        unitLabel={t('x11mxrex', { num: found.unit.num, title: found.unit.title })}
        onContinue={() => continueAfter(progress, id)}
      />
    )

  const pct = (solved / exercises.length) * 100
  const sheet =
    status === 'correct'
      ? { bg: 'bg-teal-light', text: 'text-teal-dark', btn: 'btn-teal' }
      : status === 'wrong'
        ? { bg: 'bg-coral-light', text: 'text-coral-dark', btn: 'btn-coral' }
        : null
  const canHint = progress.gems >= HINT_COST && !hint

  return (
    <div className="flex h-[100dvh] flex-col bg-white">
      <header className="mx-auto flex w-full max-w-[1040px] items-center gap-4 px-4 pt-5 md:gap-5 md:px-8 md:pt-10">
        <button onClick={() => setQuitOpen(true)} className="rounded-xl p-1 text-[#B3ADC8] transition-colors hover:text-muted" aria-label={t('x1fqusza')}>
          <Cross size={30} />
        </button>
        <div className="progress-track flex-1 !h-[18px]">
          <div className="progress-fill bg-brand" style={{ width: `${Math.max(pct, 3)}%` }} />
        </div>
        <div className="text-[19px]" key={progress.hearts} title={t('x1k9q8ch')}>
          <ChargeMeter value={progress.hearts} size={26} shake={status === 'wrong'} />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 justify-center overflow-y-auto px-4 md:px-8">
        <div key={`${pos}`} className="anim-fade-up w-full max-w-[620px] py-5 md:py-7">
          {ex && <ExerciseView ex={ex} answer={answer} setAnswer={setAnswer} status={status} hint={hint} />}
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
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-[22px] font-black leading-tight md:text-[24px]">{status === 'correct' ? praise : t('x1i1nft2')}</span>
                    {recharged && (
                      <span className="anim-pop inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[13px] font-black text-teal-dark" data-recharged>{tx('x1br5ro2', {}, [() => <Battery size={16} level={Math.min(5, progress.hearts)} />])}</span>
                    )}
                  </div>
                  {status === 'wrong' && (
                    <div className="mt-1 text-[16px] font-extrabold">{tx('x03h2ydh', { ex: correctText(ex) }, [(chunk) => <span className="font-bold [overflow-wrap:anywhere]">{chunk}</span>])}</div>
                  )}
                  <p className="mt-1 max-w-[640px] text-[15px] font-semibold leading-snug opacity-90">{ex.explain}</p>
                  {status === 'wrong' && progress.hearts > 0 && (
                    <p className="mt-1 text-[13px] font-extrabold opacity-80">{t('x017zrtc')}</p>
                  )}
                </div>
              </div>
              <button className={`btn ${sheet.btn} w-full shrink-0 md:w-[180px]`} onClick={next} autoFocus>
                {status === 'correct' ? t('x1kpmy5f') : t('x0kpnyn9')}
              </button>
            </>
          ) : (
            <div className="flex w-full items-center gap-3">
              <button className="btn btn-ghost hidden md:inline-flex md:w-[160px]" onClick={() => check(true)}>{t('x1qm67sx')}</button>
              <button
                className="btn btn-ghost shrink-0 !px-3 md:!px-4"
                onClick={buyHint}
                disabled={!canHint}
                data-hint-btn
                title={hint ? t('x1yxsp0d') : t('x1fqc262', { HINT_COST: tokens(HINT_COST) })}
                aria-label={t('x08bdlxg', { HINT_COST: tokens(HINT_COST) })}
              >
                <span aria-hidden>💡</span>
                <span className="hidden sm:inline">{t('x0nx08cc')}</span>
                <span className="inline-flex items-center gap-0.5 text-teal-dark">
                  <Token size={18} />
                  {HINT_COST}
                </span>
              </button>
              <span className="hidden flex-1 md:block" />
              <button className="btn min-w-0 flex-1 md:w-[180px] md:flex-none" disabled={!canCheck(ex, answer)} onClick={() => check()}>{t('x11ht3eb')}</button>
            </div>
          )}
        </div>
      </footer>

      {quitOpen && (
        <Modal label={t('x026dawp')}>
          <Mascot mood="think" size={120} className="mx-auto" />
          <h2 className="mt-3 text-[22px] font-black">{t('x0anbgvi')}</h2>
          <p className="mb-6 mt-1 text-[16px] font-semibold text-muted">{t('x1xlzamk')}</p>
          <button className="btn btn-block" onClick={() => setQuitOpen(false)}>{t('x1jeg8pe')}</button>
          <button
            className="mt-4 w-full py-2 text-[15px] font-extrabold uppercase tracking-wider text-coral-dark hover:opacity-80"
            onClick={() => {
              exitReason.current = 'quit'
              navigate('/learn')
            }}
          >{t('x0c80x6j')}</button>
        </Modal>
      )}

      {empty === 'menu' && (
        <Modal label={t('x1deozt6')}>
          <div className="relative mx-auto w-fit">
            <Mascot mood="think" size={112} />
            <span className="absolute -right-6 bottom-1 rounded-xl bg-white p-1 shadow">
              <Battery size={30} level={0} />
            </span>
          </div>
          <h2 className="mt-3 text-[22px] font-black">{t('x11e7xbg')}</h2>
          <p className="mb-5 mt-1 text-[15px] font-semibold leading-snug text-muted">{t('lesson.chargePause', { min: RECHARGE_MINUTES })}{chargeAt ? t('x0p88rx4', { chargeAt: waitText(chargeAt) }) : ''}.
          </p>
          <button className="btn btn-teal btn-block" onClick={() => setEmpty('review')} data-empty="review">{t('x0s2jy7a')}</button>
          <button
            className="btn btn-ghost btn-block mt-3"
            disabled={progress.gems < RECHARGE_COST}
            data-empty="buy"
            onClick={() => {
              if (!spendGems(RECHARGE_COST)) return
              track('tokens_spent', { reason: 'recharge', amount: RECHARGE_COST, where: 'charge_empty' })
              refillHearts()
              setEmpty(null)
              advance()
            }}
          >{tx('x0xp4yz5', { RECHARGE_COST }, [() => <Token size={20} />])}</button>
          <button
            className="mt-3 w-full py-2 text-[15px] font-extrabold uppercase tracking-wider text-muted hover:opacity-80"
            onClick={() => {
              exitReason.current = 'charge_empty'
              navigate('/learn')
            }}
          >{t('x0c80x6j')}</button>
        </Modal>
      )}

      {empty === 'review' && lastWrong && (
        <Modal label={t('x18w0nxa')}>
          <div className="text-left">
            <div className="mb-1 text-[12px] font-black uppercase tracking-wider text-brand">{t('x11ixt8m')}</div>
            <h2 className="text-[20px] font-black leading-tight">{lastWrong.title}</h2>
            <div className="mt-3 rounded-2xl border-2 border-teal bg-teal-light px-4 py-3">
              <div className="text-[12px] font-black uppercase tracking-wider text-teal-dark">{t('x0b5n5en')}</div>
              <div className="mt-0.5 text-[15px] font-extrabold text-ink [overflow-wrap:anywhere]">{correctText(lastWrong)}</div>
            </div>
            <div className="mt-3 rounded-2xl bg-snow px-4 py-3">
              <div className="text-[12px] font-black uppercase tracking-wider text-muted">{t('x095ysxh')}</div>
              <p className="mt-0.5 text-[15px] font-semibold leading-snug text-ink">{lastWrong.explain}</p>
            </div>
          </div>
          <button
            className="btn btn-teal btn-block mt-5"
            data-empty="done"
            onClick={() => {
              addCharge(1)
              setEmpty(null)
              advance()
              toast(t('x1wb6njl'))
            }}
          >{t('x122fqbj')}</button>
        </Modal>
      )}
    </div>
  )
}
