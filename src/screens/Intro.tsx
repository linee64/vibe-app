import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Mascot } from '../components/Mascot'
import { AiAvatar } from '../components/exercises/shared'
import { Check, Cross } from '../components/Icons'
import { playSound } from '../lib/sound'
import { track } from '../lib/analytics'
import { t, type UIKey } from '../i18n/core'

export type IntroEntry = 'first_lesson' | 'profile'

const SLIDES = ['ai', 'prompt', 'vibe', 'build', 'how', 'warmup'] as const
type Slide = (typeof SLIDES)[number]

/** Варианты разминки: правильный — второй (порядок фиксированный, чтобы скриншоты и тесты были стабильны) */
const WARMUP = ['intro.warmup.a', 'intro.warmup.b', 'intro.warmup.c'] as const
const WARMUP_CORRECT = 1

/**
 * «Как это работает» — короткий тур для новичков перед первым уроком (и из профиля):
 * что такое ИИ и промпт, что такое вайб-кодинг, что соберём и как устроены уроки + разминка на 1 вопрос.
 * Листается свайпом, стрелками и кнопками; «Пропустить» — в любой момент.
 */
export function IntroScreen({ entry, onDone }: { entry: IntroEntry; onDone: () => void }) {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const slide: Slide = SLIDES[i]
  const last = i === SLIDES.length - 1

  useEffect(() => {
    track('onboarding_started', { entry })
  }, [entry])

  const go = (d: number) => setI((v) => Math.max(0, Math.min(SLIDES.length - 1, v + d)))
  const skip = () => {
    track('onboarding_skipped', { entry, step: i + 1 })
    onDone()
  }
  const finish = () => {
    track('onboarding_completed', { entry, warmup_correct: pick === WARMUP_CORRECT })
    onDone()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !last) go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [last])

  const answer = (k: number) => {
    if (pick !== null) return
    setPick(k)
    playSound(k === WARMUP_CORRECT ? 'correct' : 'wrong')
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-white" data-intro data-intro-step={slide}>
      <header className="mx-auto flex w-full max-w-[720px] items-center gap-4 px-4 pt-5 md:px-8 md:pt-8">
        <button onClick={skip} className="rounded-xl p-1 text-[#B3ADC8] transition-colors hover:text-muted" aria-label={t('intro.skip')}>
          <Cross size={28} />
        </button>
        <div className="flex flex-1 gap-1.5" role="tablist" aria-label={t('intro.progress', { n: i + 1, total: SLIDES.length })}>
          {SLIDES.map((s, k) => (
            <button
              key={s}
              role="tab"
              aria-selected={k === i}
              aria-label={t('intro.goTo', { n: k + 1 })}
              onClick={() => setI(k)}
              className={`h-[10px] flex-1 rounded-full transition-colors ${k <= i ? 'bg-brand' : 'bg-line'}`}
            />
          ))}
        </div>
        <button onClick={skip} className="shrink-0 text-[14px] font-extrabold uppercase tracking-wider text-muted hover:text-brand" data-intro-skip>
          {t('intro.skip')}
        </button>
      </header>

      <main
        className="flex min-h-0 flex-1 justify-center overflow-y-auto px-4 md:px-8"
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          const s = touch.current
          touch.current = null
          if (!s) return
          const dx = e.changedTouches[0].clientX - s.x
          const dy = e.changedTouches[0].clientY - s.y
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
        }}
      >
        <div key={slide} className="anim-fade-up w-full max-w-[560px] py-6 md:py-10">
          {slide === 'ai' && (
            <Card mascot="happy" kicker={t('intro.kicker', { n: 1, total: SLIDES.length })} title={t('intro.ai.title')} body={t('intro.ai.body')}>
              <div className="space-y-2.5 rounded-[20px] bg-snow p-4">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand px-3 py-2.5 text-[15px] font-bold leading-snug text-white">{t('intro.ai.me')}</div>
                </div>
                <div className="flex items-start gap-2">
                  <AiAvatar />
                  <div className="min-w-0 rounded-2xl rounded-tl-md border-2 border-line bg-white px-3 py-2.5 text-[15px] font-semibold leading-snug text-ink">{t('intro.ai.bot')}</div>
                </div>
              </div>
            </Card>
          )}
          {slide === 'prompt' && (
            <Card kicker={t('intro.kicker', { n: 2, total: SLIDES.length })} title={t('intro.prompt.title')} body={t('intro.prompt.body')}>
              <div className="space-y-3">
                <Example tone="coral" label={t('intro.prompt.weakLabel')} text={t('intro.prompt.weak')} note={t('intro.prompt.weakNote')} />
                <Example tone="teal" label={t('intro.prompt.goodLabel')} text={t('intro.prompt.good')} note={t('intro.prompt.goodNote')} />
              </div>
            </Card>
          )}
          {slide === 'vibe' && (
            <Card kicker={t('intro.kicker', { n: 3, total: SLIDES.length })} title={t('intro.vibe.title')} body={t('intro.vibe.body')}>
              <ol className="grid grid-cols-2 gap-2.5">
                {(['intro.vibe.s1', 'intro.vibe.s2', 'intro.vibe.s3', 'intro.vibe.s4'] as UIKey[]).map((k, n) => (
                  <li key={k} className="flex items-center gap-2.5 rounded-2xl border-2 border-brand-mid bg-brand-light/60 px-3 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[15px] font-black text-white">{n + 1}</span>
                    <span className="min-w-0 text-[14px] font-extrabold leading-tight text-ink">{t(k)}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-center text-[13px] font-extrabold text-brand">{t('intro.vibe.loop')}</p>
            </Card>
          )}
          {slide === 'build' && (
            <Card kicker={t('intro.kicker', { n: 4, total: SLIDES.length })} title={t('intro.build.title')} body={t('intro.build.body')}>
              <ul className="grid gap-2 sm:grid-cols-2">
                {(['intro.build.l1', 'intro.build.l2', 'intro.build.l3', 'intro.build.l4', 'intro.build.l5', 'intro.build.l6'] as UIKey[]).map((k, n) => (
                  <li key={k} className="flex items-center gap-2.5 rounded-2xl border-2 border-line bg-white px-3 py-2.5 text-[14px] font-extrabold leading-tight text-ink">
                    <span className="text-[22px]" aria-hidden>
                      {['🌐', '🐞', '🗄️', '🚀', '📱', '🤖'][n]}
                    </span>
                    {t(k)}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {slide === 'how' && (
            <Card kicker={t('intro.kicker', { n: 5, total: SLIDES.length })} title={t('intro.how.title')} body={t('intro.how.body')}>
              <ul className="space-y-2">
                {(
                  [
                    ['📚', 'intro.how.lessons'],
                    ['✨', 'intro.how.vp'],
                    ['🔋', 'intro.how.charge'],
                    ['🪙', 'intro.how.tokens'],
                    ['🚀', 'intro.how.streak'],
                    ['🎯', 'intro.how.quests'],
                  ] as [string, UIKey][]
                ).map(([e, k]) => (
                  <li key={k} className="flex items-start gap-3 rounded-2xl bg-snow px-3 py-2.5">
                    <span className="text-[22px] leading-none" aria-hidden>
                      {e}
                    </span>
                    <span className="min-w-0 text-[14px] font-semibold leading-snug text-ink">{t(k)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-2xl border-2 border-dashed border-brand-mid px-3 py-2.5 text-[13px] font-bold leading-snug text-brand-dark">
                📖 {t('intro.how.gloss')}
              </p>
            </Card>
          )}
          {slide === 'warmup' && (
            <Card mascot={pick === null ? 'think' : pick === WARMUP_CORRECT ? 'happy' : 'think'} kicker={t('intro.warmup.kicker')} title={t('intro.warmup.title')} body={t('intro.warmup.body')}>
              <div className="grid gap-2.5" data-intro-warmup>
                {WARMUP.map((k, n) => {
                  const state = pick === null ? '' : n === WARMUP_CORRECT ? 'border-teal bg-teal-light text-teal-dark' : n === pick ? 'border-coral bg-coral-light text-coral-dark' : 'opacity-50'
                  return (
                    <button
                      key={k}
                      disabled={pick !== null}
                      onClick={() => answer(n)}
                      data-option={n}
                      className={`tile flex items-center gap-3 px-3.5 py-3 text-left text-[15px] font-bold leading-snug ${state}`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-current text-[13px] font-black">
                        {pick !== null && n === WARMUP_CORRECT ? <Check size={16} /> : String.fromCharCode(65 + n)}
                      </span>
                      {t(k)}
                    </button>
                  )
                })}
              </div>
              {pick !== null && (
                <p className={`anim-fade-up mt-3 rounded-2xl px-4 py-3 text-[15px] font-bold leading-snug ${pick === WARMUP_CORRECT ? 'bg-teal-light text-teal-dark' : 'bg-coral-light text-coral-dark'}`} data-intro-feedback>
                  {pick === WARMUP_CORRECT ? t('intro.warmup.right') : t('intro.warmup.wrong')}
                </p>
              )}
            </Card>
          )}
        </div>
      </main>

      <footer className="shrink-0 border-t-2 border-line">
        <div className="mx-auto flex max-w-[720px] items-center gap-3 px-4 py-4 md:px-8 md:py-6">
          {i > 0 ? (
            <button className="btn btn-ghost shrink-0 md:w-[160px]" onClick={() => go(-1)}>
              {t('intro.back')}
            </button>
          ) : (
            <span className="hidden flex-1 md:block" />
          )}
          <span className="hidden flex-1 md:block" />
          {last ? (
            <button className="btn min-w-0 flex-1 md:w-[240px] md:flex-none" onClick={finish} disabled={pick === null} data-intro-finish>
              {entry === 'first_lesson' ? t('intro.start') : t('intro.done')}
            </button>
          ) : (
            <button className="btn min-w-0 flex-1 md:w-[200px] md:flex-none" onClick={() => go(1)} data-intro-next autoFocus>
              {t('intro.next')}
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

function Card({ mascot = 'default', kicker, title, body, children }: { mascot?: 'default' | 'happy' | 'think'; kicker: string; title: string; body: string; children: ReactNode }) {
  return (
    <section>
      <div className="flex items-end gap-3">
        <Mascot mood={mascot} size={84} className="shrink-0" />
        <div className="min-w-0 pb-1">
          <div className="text-[12px] font-black uppercase tracking-wider text-brand">{kicker}</div>
          <h1 className="text-[24px] font-black leading-tight md:text-[28px]">{title}</h1>
        </div>
      </div>
      <p className="mb-4 mt-3 text-[16px] font-semibold leading-snug text-ink md:text-[17px]">{body}</p>
      {children}
    </section>
  )
}

function Example({ tone, label, text, note }: { tone: 'coral' | 'teal'; label: string; text: string; note: string }) {
  const c = tone === 'coral' ? { b: 'border-coral', bg: 'bg-coral-light/60', k: 'text-coral-dark' } : { b: 'border-teal', bg: 'bg-teal-light/60', k: 'text-teal-dark' }
  return (
    <div className={`rounded-[18px] border-2 ${c.b} ${c.bg} px-4 py-3`}>
      <div className={`text-[12px] font-black uppercase tracking-wider ${c.k}`}>{label}</div>
      <div className="mt-1 text-[16px] font-extrabold leading-snug text-ink">{text}</div>
      <div className={`mt-1 text-[13px] font-bold leading-snug ${c.k}`}>{note}</div>
    </div>
  )
}
