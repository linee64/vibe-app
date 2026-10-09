import { useCallback, useEffect, useMemo, useState } from 'react'
import { navigate } from '../router'
import { LAST_LESSON_KEY, useStore } from '../store'
import { PLACEMENT_PASS, TIERS, findTier, placementQuestions, tiersBefore } from '../data/tiers'
import { canCheck, correctText, isCorrect, keyOptions, type Answer, type Status } from '../data/exerciseLogic'
import { ExerciseView } from '../components/Exercises'
import { Mascot } from '../components/Mascot'
import { TierBadge } from '../components/TierBadge'
import { Check, Cross } from '../components/Icons'
import { track } from '../lib/analytics'
import { Confetti } from './LessonComplete'
import { t } from '../i18n/core'
import { tx } from '../i18n/rich'

type Phase = 'intro' | 'quiz' | 'result'

/** «Тест на уровень»: 8 вопросов из уроков предыдущих тиров; 6+ верных — тир открывается сразу */
export function PlacementScreen({ target }: { target: string }) {
  const tier = findTier(target)
  const { passTiersByTest, setPlacementSeen } = useStore()
  const questions = useMemo(() => (tier ? placementQuestions(tier.id) : []), [tier])
  const [phase, setPhase] = useState<Phase>('intro')
  const [pos, setPos] = useState(0)
  const [answer, setAnswer] = useState<Answer>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [score, setScore] = useState(0)
  const skipped = tier ? tiersBefore(tier.id).map((id) => findTier(id)!) : []
  const passed = score >= PLACEMENT_PASS
  const ex = questions[pos]

  const check = useCallback(
    (skip = false) => {
      if (!ex || status !== 'idle' || (!skip && !canCheck(ex, answer))) return
      const ok = !skip && isCorrect(ex, answer)
      if (ok) setScore((s) => s + 1)
      setStatus(ok ? 'correct' : 'wrong')
    },
    [ex, status, answer],
  )

  const next = useCallback(() => {
    if (pos + 1 >= questions.length) {
      setPhase('result')
      setPlacementSeen()
      const ok = score >= PLACEMENT_PASS
      track('placement_completed', { target: tier?.id, score, total: questions.length, passed: ok })
      if (ok && tier) {
        passTiersByTest(tiersBefore(tier.id))
        track('tier_unlocked', { tier: tier.id, via: 'placement' })
      }
      return
    }
    setPos((p) => p + 1)
    setAnswer(null)
    setStatus('idle')
  }, [pos, questions.length, score, tier, passTiersByTest, setPlacementSeen])

  useEffect(() => {
    if (phase !== 'quiz') return
    const onKey = (e: KeyboardEvent) => {
      if (!ex) return
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
  }, [phase, ex, status, check, next])

  const restart = () => {
    if (tier) track('placement_started', { target: tier.id, retry: true })
    setPos(0)
    setScore(0)
    setAnswer(null)
    setStatus('idle')
    setPhase('quiz')
  }
  const toPath = () => {
    if (tier && passed) sessionStorage.setItem(LAST_LESSON_KEY, `tier-${tier.id}`)
    navigate('/learn')
  }

  if (!tier || !questions.length)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <Mascot mood="think" size={140} />
        <h1 className="text-[24px] font-black">{t('x1e66agn')}</h1>
        <button className="btn" onClick={() => navigate('/learn')}>{t('x0povobi')}</button>
      </div>
    )

  if (phase === 'intro')
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 py-10 text-center" data-placement="intro">
        <div className="relative">
          <Mascot size={150} className="anim-float" />
          <span className="absolute -right-6 bottom-0">
            <TierBadge tier={tier} size={64} />
          </span>
        </div>
        <div className="text-[13px] font-extrabold uppercase tracking-wider text-muted">{t('x0tw0ozv')}</div>
        <h1 className="max-w-[520px] text-[28px] font-black leading-tight md:text-[34px]">{t('x06dbmxr', { name: tier.name })}</h1>
        <p className="max-w-[460px] text-[16px] font-semibold text-muted">
          {t(skipped.length > 1 ? 'placement.introMany' : 'placement.introOne', { count: questions.length, tiers: skipped.map((s) => t('common.quote', { s: s.name })).join(t('x1ts2ohr')), pass: PLACEMENT_PASS, name: tier.name })}</p>
        <div className="mt-2 flex w-full max-w-[360px] flex-col gap-3">
          <button
            className="btn btn-block"
            onClick={() => {
              track('placement_started', { target: tier.id })
              setPhase('quiz')
            }}
          >{t('x0u5ylwp')}</button>
          <button
            className="btn btn-ghost btn-block"
            onClick={() => {
              setPlacementSeen()
              navigate('/learn')
            }}
          >{t('x1khd85k')}</button>
        </div>
      </div>
    )

  if (phase === 'result') {
    const unlocked = TIERS.find((t) => t.id === tier.id)!
    return (
      <div className="flex min-h-screen flex-col bg-white" data-placement="result" data-passed={passed ? '1' : '0'}>
        <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
          {passed && <Confetti />}
          <div className="relative">
            <Mascot mood={passed ? 'happy' : 'think'} size={170} className="anim-pop" />
            {passed && (
              <span className="anim-pop absolute -right-8 bottom-2" style={{ animationDelay: '.2s' }}>
                <TierBadge tier={unlocked} size={84} />
              </span>
            )}
          </div>
          <div className="mt-4 text-[13px] font-extrabold uppercase tracking-wider text-muted">{t('x0tcw5ft', { score, length: questions.length })}</div>
          <h1 className="mt-1 text-[30px] font-black leading-tight text-brand md:text-[36px]">{passed ? t('x1looyjc', { name: unlocked.name }) : t('x0tou6bo')}</h1>
          <p className="mt-1 max-w-[460px] text-[17px] font-semibold text-muted">
            {passed
              ? t('placement.passedTiers', { tiers: skipped.map((tier) => t('common.quote', { s: tier.name })).join(t('x1ts2ohr')) })
              : t('x1q4ce5a', { PLACEMENT_PASS, length: questions.length, name: skipped[0].name })}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-1.5">
            {questions.map((_, i) => (
              <span key={i} className={`h-3 w-7 rounded-full ${i < score ? 'bg-teal' : 'bg-line'}`} />
            ))}
          </div>
        </main>
        <footer className="border-t-2 border-line">
          <div className="mx-auto flex max-w-[1040px] flex-col-reverse gap-3 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
            {!passed ? (
              <button className="btn btn-ghost w-full md:w-[220px]" onClick={restart}>{t('x173j3r6')}</button>
            ) : (
              <span />
            )}
            <button className="btn w-full md:w-[220px]" onClick={toPath} autoFocus>
              {passed ? t('x0ztonvh', { name: unlocked.name }) : t('x0odeypg')}
            </button>
          </div>
        </footer>
      </div>
    )
  }

  const sheet = status === 'correct' ? { bg: 'bg-teal-light', text: 'text-teal-dark', btn: 'btn-teal' } : status === 'wrong' ? { bg: 'bg-coral-light', text: 'text-coral-dark', btn: 'btn-coral' } : null
  return (
    <div className="flex h-[100dvh] flex-col bg-white" data-placement="quiz">
      <header className="mx-auto flex w-full max-w-[1040px] items-center gap-4 px-4 pt-5 md:gap-5 md:px-8 md:pt-10">
        <button onClick={() => navigate('/learn')} className="rounded-xl p-1 text-[#B3ADC8] transition-colors hover:text-muted" aria-label={t('x07zg883')}>
          <Cross size={30} />
        </button>
        <div className="progress-track flex-1 !h-[18px]">
          <div className="progress-fill bg-brand" style={{ width: `${Math.max(((pos + (status === 'idle' ? 0 : 1)) / questions.length) * 100, 3)}%` }} />
        </div>
        <span className="shrink-0 rounded-xl bg-brand-light px-2.5 py-1 text-[13px] font-black text-brand-dark">{tx('x1h9qcv3', { v: pos + 1, length: questions.length })}</span>
      </header>
      <main className="flex min-h-0 flex-1 justify-center overflow-y-auto px-4 md:px-8">
        <div key={pos} className="anim-fade-up w-full max-w-[620px] py-5 md:py-7">
          <ExerciseView ex={ex} answer={answer} setAnswer={setAnswer} status={status} />
        </div>
      </main>
      <footer className={`shrink-0 border-t-2 ${sheet ? `anim-sheet border-transparent ${sheet.bg}` : 'border-line bg-white'}`}>
        <div className={`mx-auto flex max-w-[1040px] flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8 ${sheet ? 'md:py-6' : 'md:py-8'}`}>
          {sheet ? (
            <>
              <div className={`flex min-w-0 items-start gap-4 ${sheet.text}`}>
                <span className="hidden h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-white sm:flex">{status === 'correct' ? <Check size={36} /> : <Cross size={34} />}</span>
                <div className="min-w-0">
                  <div className="text-[22px] font-black leading-tight md:text-[24px]">{status === 'correct' ? t('x1o7ltri') : t('x1i1nft2')}</div>
                  {status === 'wrong' && (
                    <div className="mt-1 text-[16px] font-extrabold">{tx('x03h2ydh', { ex: correctText(ex) }, [(chunk) => <span className="font-bold [overflow-wrap:anywhere]">{chunk}</span>])}</div>
                  )}
                  <p className="mt-1 max-w-[640px] text-[15px] font-semibold leading-snug opacity-90">{ex.explain}</p>
                </div>
              </div>
              <button className={`btn ${sheet.btn} w-full shrink-0 md:w-[180px]`} onClick={next} autoFocus>
                {status === 'correct' ? t('x1kpmy5f') : t('x0kpnyn9')}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost hidden md:inline-flex md:w-[160px]" onClick={() => check(true)}>{t('x1x6qy5j')}</button>
              <button className="btn w-full md:w-[180px]" disabled={!canCheck(ex, answer)} onClick={() => check()}>{t('x11ht3eb')}</button>
            </>
          )}
        </div>
      </footer>
    </div>
  )
}
