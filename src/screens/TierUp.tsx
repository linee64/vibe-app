import { useEffect } from 'react'
import { useStore, LAST_LESSON_KEY } from '../store'
import { navigate } from '../router'
import { SOON_TOPICS, findTier, isTierPassed, nextTier } from '../data/tiers'
import { UNIT_COLORS } from '../data/types'
import { Mascot } from '../components/Mascot'
import { TierBadge } from '../components/TierBadge'
import { Check } from '../components/Icons'
import { Confetti } from './LessonComplete'
import { track } from '../lib/analytics'
import { t } from '../i18n/core'
import { tx } from '../i18n/rich'

/** Праздничный экран «Тир пройден!» — показывается один раз на тир */
export function TierUpScreen({ id }: { id: string }) {
  const tier = findTier(id)
  const { progress, markTierCelebrated } = useStore()
  const passed = tier ? isTierPassed(tier, progress) : false

  useEffect(() => {
    if (!tier || !passed) navigate('/learn')
    else {
      // экран показывается один раз на тир — это и есть момент «тир пройден, следующий открыт»
      if (!progress.tiersCelebrated.includes(tier.id)) track('tier_unlocked', { tier: nextTier(tier)?.id ?? 'soon', via: 'progress', completed_tier: tier.id })
      markTierCelebrated(tier.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, passed, markTierCelebrated])

  if (!tier || !passed) return null
  const next = nextTier(tier)
  const c = UNIT_COLORS[tier.color]
  const go = () => {
    sessionStorage.setItem(LAST_LESSON_KEY, next ? `tier-${next.id}` : 'tier-soon')
    navigate('/learn')
  }
  return (
    <div className="flex min-h-screen flex-col bg-white" data-tier-up={tier.id}>
      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10 text-center">
        <div className="pointer-events-none absolute left-1/2 top-[18%] h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-60" style={{ background: `radial-gradient(circle, ${c.light} 0%, transparent 70%)` }} />
        <Confetti />
        <div className="relative flex items-end justify-center">
          <Mascot mood="happy" size={150} className="anim-pop relative z-[1] -mr-4" />
          <span className="anim-pop relative" style={{ animationDelay: '.15s' }}>
            <TierBadge tier={tier} size={140} />
          </span>
        </div>
        <div className="relative mt-3 text-[13px] font-extrabold uppercase tracking-[.14em]" style={{ color: c.dark }}>{t('x0s3p0cq')}</div>
        <h1 className="relative mt-1 text-[32px] font-black leading-tight md:text-[40px]">{t('x0lgquqh', { name: tier.name })}</h1>
        <p className="relative mt-1 max-w-[480px] text-[17px] font-semibold text-muted">{tx('x1p2axug', { v: tier.outcome.charAt(0).toLowerCase() + tier.outcome.slice(1) })}</p>
        <div className="relative mt-5 flex flex-wrap justify-center gap-2">
          {tier.skills.map((s) => (
            <span key={s} className="flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[14px] font-extrabold" style={{ borderColor: c.mid, color: c.dark, background: '#fff' }}>
              <Check size={14} /> {s}
            </span>
          ))}
        </div>
        {next ? (
          <div className="relative mt-8 flex w-full max-w-[460px] items-center gap-4 rounded-[22px] border-2 p-4 text-left" style={{ borderColor: UNIT_COLORS[next.color].mid, background: UNIT_COLORS[next.color].light }}>
            <TierBadge tier={next} size={60} />
            <div className="min-w-0">
              <div className="text-[12px] font-black uppercase tracking-wider" style={{ color: UNIT_COLORS[next.color].dark }}>{t('x0jxb9v2', { num: next.num })}</div>
              <div className="text-[20px] font-black leading-tight">{next.name}</div>
              <div className="text-[14px] font-semibold text-muted">{next.outcome}</div>
            </div>
          </div>
        ) : (
          <div className="relative mt-8 w-full max-w-[460px] rounded-[22px] border-2 border-dashed border-brand-mid bg-brand-light/50 p-4">
            <div className="text-[18px] font-black">{t('x0byhvbd')}</div>
            <div className="mt-1 text-[14px] font-semibold text-muted">{tx('x1nsz9rw', { v: SOON_TOPICS.join(', ') })}</div>
          </div>
        )}
      </main>
      <footer className="border-t-2 border-line">
        <div className="mx-auto flex max-w-[1040px] justify-end px-4 py-5 md:px-8 md:py-8">
          <button className="btn w-full md:w-[200px]" onClick={go} autoFocus>
            {next ? t('x0vf0bc5') : t('x0odeypg')}
          </button>
        </div>
      </footer>
    </div>
  )
}
