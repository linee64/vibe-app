import { useEffect, useState, type ReactNode } from 'react'
import { navigate } from '../router'
import { useStore } from '../store'
import { useToast } from '../components/Toast'
import { Mascot, MascotHead } from '../components/Mascot'
import { Logo } from '../components/Layout'
import { Reveal } from '../components/Reveal'
import { BrowserArt, BugArt, DatabaseArt, RocketArt } from '../components/Illustrations'
import { Battery, Check, Cross, Rocket, Shield, Spark, Token } from '../components/Icons'
import { ChargeMeter } from '../components/Economy'
import { UpgradeView, VibeMeter } from '../components/exercises/Upgrade'
import { isCorrect, upgradeScore, type Answer, type Status } from '../data/exerciseLogic'
import { DEMO_EXERCISE, UNITS, UNIT_COLORS } from '../data/course'
import { HOMEWORKS } from '../data/homework'
import { SOON_TOPICS, TIERS, unitsOf } from '../data/tiers'
import { TierBadge } from '../components/TierBadge'
import { FREE_FEATURES, PRICES, PRO_FEATURES, TRIAL_DAYS, annualPerMonth, annualSaveAmount, annualSavePct, usd } from '../data/pricing'
import { BILLING_ENABLED, DEMO_MODE } from '../lib/config'
import { startCheckout } from '../lib/billing'
import { track } from '../lib/analytics'
import { useFeedback } from '../components/FeedbackProvider'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { t } from '../i18n/core'
import { tx } from '../i18n/rich'

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

function useCta() {
  const { session } = useStore()
  return {
    loggedIn: !!session,
    start: () => {
      if (!session) track('signup_started', { entry: 'landing' })
      navigate(session ? '/learn' : '/login')
    },
    login: () => navigate(session ? '/learn' : '/login'),
  }
}

/* ---------------------------------------------------------------- Header */
const NAV_LINKS = [
  { id: 'how', get label() { return t('x1ysoidq') } },
  { id: 'program', get label() { return t('x0tuoh9b') } },
  { id: 'demo', get label() { return t('x0e072uk') } },
  { id: 'pricing', get label() { return t('x0lzyvgw') } },
  { id: 'faq', get label() { return t('x0glhd48') } },
]

function Header() {
  const cta = useCta()
  return (
    <header className="sticky top-0 z-40 border-b-2 border-line/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1160px] items-center gap-6 px-5 md:h-[76px] md:px-8">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2" aria-label={t('x1vhg9wa')}>
          <MascotHead size={36} />
          <Logo className="!text-[28px]" />
        </button>
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <button key={l.id} onClick={() => scrollTo(l.id)} className="rounded-xl px-3 py-2 text-[15px] font-bold text-muted transition-colors hover:bg-snow hover:text-ink">
              {l.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher className="max-[359px]:px-1 max-[359px]:[&>span]:hidden max-[359px]:[&>svg:last-of-type]:hidden" />
          <button className="btn btn-ghost btn-sm" onClick={cta.login}>
            {cta.loggedIn ? (
              <>
                <span className="max-[359px]:hidden">{t('x1fj84dw')}</span>
                <span className="min-[360px]:hidden">{t('x192hq8j')}</span>
              </>
            ) : (
              t('x1h4dl4y')
            )}
          </button>
          <button className="btn btn-sm btn-bouncy hidden sm:inline-flex" onClick={cta.start}>{t('x0vybasn')}</button>
        </div>
      </div>
    </header>
  )
}

/* ---------------------------------------------------------------- Hero */
function Squiggle() {
  return (
    <svg className="absolute -bottom-3 left-0 w-full" height="14" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden>
      <path d="M2 9 Q 20 2 38 9 T 75 9 T 112 9 T 150 9 T 187 9 T 225 9 T 262 9 T 298 9" stroke="#FF7A59" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function HeroArt() {
  return (
    <div className="relative mx-auto h-[360px] w-full max-w-[520px] md:h-[500px]">
      <div className="absolute left-1/2 top-1/2 h-[290px] w-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-light md:h-[430px] md:w-[430px]" />
      <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-dashed border-brand-mid md:h-[330px] md:w-[330px]" />
      <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2">
        <Mascot size={300} className="anim-float hidden drop-shadow-[0_14px_0_rgba(91,47,214,.10)] md:block" />
        <Mascot size={190} className="anim-float md:hidden" />
      </div>

      {/* prompt bubble */}
      <div className="anim-float-tilt absolute left-0 top-[4%] max-w-[230px] md:left-[-4%] md:top-[8%]" style={{ ['--r' as string]: '-3deg' }}>
        <div className="rounded-2xl rounded-bl-md border-2 border-line bg-white px-3.5 py-2.5 shadow-[0_5px_0_#E7E3F1] md:px-4 md:py-3">
          <div className="text-[11px] font-black uppercase tracking-wider text-brand">{t('x085vdng')}</div>
          <div className="text-[13px] font-bold leading-snug text-ink md:text-[15px]">{t('x1ozbmme')}</div>
        </div>
      </div>

      {/* code card */}
      <div className="anim-float-tilt absolute right-0 top-[30%] hidden sm:block md:right-[-6%] md:top-[26%]" style={{ ['--r' as string]: '3deg', animationDelay: '-1.4s' }}>
        <div className="w-[150px] overflow-hidden rounded-2xl bg-[#272239] shadow-[0_5px_0_#1a1628] md:w-[190px]">
          <div className="flex gap-1.5 bg-[#1f1b30] px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-coral" />
            <span className="h-2.5 w-2.5 rounded-full bg-gold" />
            <span className="h-2.5 w-2.5 rounded-full bg-teal" />
          </div>
          <div className="code-font space-y-1 px-3 py-2.5 text-[11px] leading-snug md:text-[12px]">
            <div><span className="text-[#C9A8FF]">export</span> <span className="text-[#6FE3D3]">&lt;Hero</span><span className="text-[#6FE3D3]">/&gt;</span></div>
            <div><span className="text-[#C9A8FF]">const</span> <span className="text-[#EDEAF6]">menu</span> <span className="text-[#EDEAF6]">=</span> <span className="text-[#FFD27A]">'☕'</span></div>
            <div className="rounded bg-teal/25 px-1 text-[#9BE7DD]">{t('x1v9cr41')}</div>
          </div>
        </div>
      </div>

      {/* vibe points chip */}
      <div className="anim-float-tilt absolute bottom-[10%] left-[2%] md:bottom-[12%] md:left-[2%]" style={{ ['--r' as string]: '-4deg', animationDelay: '-2.2s' }}>
        <div className="flex items-center gap-1.5 rounded-2xl bg-gold px-3.5 py-2 text-[16px] font-black text-[#5a3d00] shadow-[0_5px_0_#E5A100] md:text-[18px]">{tx('x0xufeqy', {}, [() => <Spark size={22} />])}</div>
      </div>

      {/* deploy streak chip */}
      <div className="anim-float-tilt absolute bottom-[4%] right-[6%] md:bottom-[8%] md:right-[4%]" style={{ ['--r' as string]: '4deg', animationDelay: '-0.7s' }}>
        <div className="flex items-center gap-1.5 rounded-2xl border-2 border-line bg-white px-3.5 py-2 text-[15px] font-black text-brand-dark shadow-[0_5px_0_#E7E3F1] md:text-[16px]">{tx('x0lggylp', {}, [() => <Rocket size={22} />])}</div>
      </div>
    </div>
  )
}

function Hero() {
  const cta = useCta()
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-coral-light" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-teal-light" />
      <div className="relative mx-auto grid max-w-[1160px] items-center gap-4 px-5 pb-12 pt-8 md:px-8 md:pb-16 md:pt-10 lg:min-h-[calc(100vh-76px)] lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:py-6">
        <div className="text-center lg:text-left">
          <span className="anim-fade-up inline-flex items-center gap-2 rounded-full border-2 border-brand-mid bg-brand-light px-3.5 py-1.5 text-[13px] font-extrabold text-brand-dark">{t('x11ztz6x')}</span>
          <h1 className="anim-fade-up mt-5 text-balance text-[38px] font-black leading-[1.08] tracking-tight text-ink md:text-[54px] lg:text-[56px]">{tx('landing.hero', {}, [() => <br className="hidden sm:block" />, (chunk) => <span className="relative inline-block whitespace-nowrap text-brand">{chunk}<Squiggle /></span>])}</h1>
          <p className="anim-fade-up mx-auto mt-6 max-w-[520px] text-[18px] font-semibold leading-relaxed text-muted lg:mx-0 md:text-[19px]">{t('x0uw287d')}</p>
          <div className="anim-fade-up mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <button className="btn btn-bouncy !min-h-[56px] !px-8 !text-[16px]" onClick={cta.start}>
              {cta.loggedIn ? t('x1fb86c3') : t('x0vybasn')}
            </button>
            <button className="btn btn-ghost btn-bouncy !min-h-[56px] !px-7 !text-[16px]" onClick={cta.login}>{t('x1nli0rp')}</button>
          </div>
          <ul className="anim-fade-up mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[15px] font-bold text-muted lg:justify-start">
            {[t('x1s2xgwm'), t('x1h7yqe0'), t('x1pl27qj')].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal text-white">
                  <Check size={13} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <HeroArt />
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Section heading */
function SectionHead({ eyebrow, title, sub, color = 'text-brand' }: { eyebrow: string; title: ReactNode; sub?: string; color?: string }) {
  return (
    <Reveal className="mx-auto mb-10 max-w-[760px] text-center md:mb-14">
      <div className={`text-[14px] font-black uppercase tracking-[.14em] ${color}`}>{eyebrow}</div>
      <h2 className="mt-2 text-balance text-[30px] font-black leading-tight tracking-tight md:text-[42px]">{title}</h2>
      {sub && <p className="mt-3 text-balance text-[17px] font-semibold leading-relaxed text-muted md:text-[18px]">{sub}</p>}
    </Reveal>
  )
}

/* ---------------------------------------------------------------- How it works */
function StepVisual({ n }: { n: number }) {
  if (n === 1)
    return (
      <div className="flex h-full flex-col justify-center gap-2 px-4">
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-brand px-3 py-2 text-[13px] font-bold text-white">{t('x1q69qqv')}</div>
        <div className="flex items-end gap-2">
          <MascotHead size={30} />
          <div className="rounded-2xl rounded-bl-md border-2 border-line bg-white px-3 py-2 text-[13px] font-bold text-ink">{t('x0uthfkq')}</div>
        </div>
      </div>
    )
  if (n === 2)
    return (
      <div className="flex h-full items-center justify-center gap-3 px-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="rounded-xl border-2 border-line bg-white px-2.5 py-1.5 text-[12px] font-bold text-ink">{tx('x0uen7b4', {}, [(chunk) => <span className="rounded bg-brand-light px-1 text-brand-dark">{chunk}</span>])}</div>
          <div className="flex flex-wrap gap-1.5">
            <span className="tile is-selected px-2 py-1 text-[11px] font-black">{t('x0m6q0wg')}</span>
            <span className="tile is-selected px-2 py-1 text-[11px] font-black">{t('x1akleaw')}</span>
            <span className="tile px-2 py-1 text-[11px] font-black">{t('x1q39lve')}</span>
          </div>
        </div>
        <div className="shrink-0">
          <VibeMeter value={64} target={80} size={110} />
        </div>
      </div>
    )
  return (
    <div className="flex h-full items-center justify-center">
      <BrowserArt size={150} />
    </div>
  )
}

function HowItWorks() {
  const steps = [
    { n: 1, color: UNIT_COLORS.brand, title: t('x03skw89'), text: t('x1xejk0j') },
    { n: 2, color: UNIT_COLORS.coral, title: t('x0rdgnm1'), text: t('x1mcbz64') },
    { n: 3, color: UNIT_COLORS.teal, title: t('x0gc5n5o'), text: t('x125lxkh') },
  ]
  return (
    <section id="how" className="scroll-mt-20 bg-snow py-16 md:py-24">
      <div className="mx-auto max-w-[1160px] px-5 md:px-8">
        <SectionHead eyebrow={t('x1ysoidq')} title={t('x104oyps')} sub={t('x011xi7y')} />
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="card h-full overflow-hidden" style={{ boxShadow: '0 5px 0 #E7E3F1' }}>
                <div className="h-[150px] border-b-2 border-line" style={{ background: s.color.light }}>
                  <StepVisual n={s.n} />
                </div>
                <div className="p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full text-[18px] font-black text-white" style={{ background: s.color.main, boxShadow: `0 3px 0 ${s.color.dark}` }}>
                    {s.n}
                  </span>
                  <h3 className="mt-4 text-[21px] font-black leading-tight">{s.title}</h3>
                  <p className="mt-2 text-[16px] font-semibold leading-relaxed text-muted">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Program */
function Program() {
  const cta = useCta()
  const arts = [
    <Mascot key="m" size={130} className="anim-float" />,
    <BrowserArt key="b" size={170} />,
    <BugArt key="g" size={170} />,
    <DatabaseArt key="d" size={170} />,
    <RocketArt key="r" size={170} className="anim-float" />,
  ]
  return (
    <section id="program" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-[1160px] px-5 md:px-8">
        <SectionHead eyebrow={t('x1jhmyjk')} title={t('x1xecshz')} sub={t('x1c4ottx')} color="text-coral" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {UNITS.map((u, i) => {
            const c = UNIT_COLORS[u.color]
            return (
              <Reveal key={u.id} delay={(i % 3) * 120}>
                <article className="flex h-full flex-col overflow-hidden rounded-[24px] border-2 bg-white" style={{ borderColor: c.mid, boxShadow: `0 6px 0 ${c.mid}` }}>
                  <div className="relative flex h-[180px] items-center justify-center" style={{ background: c.light }}>
                    <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-[12px] font-black uppercase tracking-wider text-white" style={{ background: c.main }}>{t('x0f7kbjo', { num: u.num })}</span>
                    <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-[12px] font-black uppercase tracking-wider" style={{ color: c.dark }}>
                      {u.pro ? 'Pro' : t('x1q38il1')}
                    </span>
                    {arts[i]}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-[23px] font-black leading-tight">{u.title}</h3>
                    <p className="mt-1 text-[15px] font-semibold text-muted">{u.subtitle}</p>
                    <ul className="mt-4 space-y-2.5">
                      {u.lessons.map((l) => (
                        <li key={l.id} className="flex items-center gap-2.5 text-[15px] font-bold text-ink">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white" style={{ background: c.main }}>
                            <Check size={14} />
                          </span>
                          {l.title}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-center justify-between pt-6">
                      <span className="text-[14px] font-extrabold text-muted">{tx('x0cq3tru', { length: u.lessons.filter((l) => l.kind !== 'chest' && l.kind !== 'trophy').length })}</span>
                      <button onClick={cta.start} className="text-[14px] font-black uppercase tracking-wider hover:opacity-80" style={{ color: c.dark }}>{t('x06vpcsr')}</button>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
        <TiersAndHomework />
      </div>
    </section>
  )
}

/** Компактный блок: домашки-мини-проекты и три тира */
function TiersAndHomework() {
  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
      <Reveal>
        <div className="flex h-full flex-col rounded-[24px] bg-brand p-6 text-white shadow-[0_6px_0_#5B2FD6]">
          <div className="text-[13px] font-black uppercase tracking-[.14em] text-white/70">{t('x1b55y4z')}</div>
          <h3 className="mt-1 text-[24px] font-black leading-tight">{t('x1at9zjv')}</h3>
          <p className="mt-2 text-[15px] font-semibold leading-relaxed text-white/85">{t('x03l49c0')}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {HOMEWORKS.map((h) => (
              <li key={h.id} className="flex items-center gap-2 rounded-xl bg-white/12 px-3 py-2 text-[14px] font-extrabold" style={{ background: 'rgba(255,255,255,.12)' }}>
                <span className="text-[18px]">{h.badge.emoji}</span>
                {h.short}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
      <Reveal delay={120}>
        <div className="card flex h-full flex-col p-6" style={{ boxShadow: '0 6px 0 #E7E3F1' }}>
          <div className="text-[13px] font-black uppercase tracking-[.14em] text-teal-dark">{t('x09nvgth')}</div>
          <h3 className="mt-1 text-[24px] font-black leading-tight">{t('x169hfq6')}</h3>
          <p className="mt-2 text-[15px] font-semibold text-muted">{t('x17leg3f')}</p>
          <div className="mt-4 space-y-3">
            {TIERS.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <TierBadge tier={t} size={44} />
                <div className="min-w-0">
                  <div className="text-[16px] font-black leading-tight">
                    {t.name} <span className="text-[13px] font-extrabold text-muted">{tx('x0whu6yq', { v: unitsOf(t).map((u) => u.num).join('–') })}</span>
                  </div>
                  <div className="text-[14px] font-semibold leading-snug text-muted">{t.outcome}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] font-extrabold text-brand">{tx('x1nsz9rw', { v: SOON_TOPICS.join(' · ') })}</p>
        </div>
      </Reveal>
    </div>
  )
}

/* ---------------------------------------------------------------- Demo */
function Demo() {
  const ex = DEMO_EXERCISE
  const cta = useCta()
  const [answer, setAnswer] = useState<Answer>(null)
  const [status, setStatus] = useState<Status>('idle')
  const picked = Array.isArray(answer) ? answer : []
  const score = upgradeScore(ex, picked)
  const check = () => picked.length > 0 && setStatus(isCorrect(ex, answer) ? 'correct' : 'wrong')
  const reset = () => {
    setAnswer(null)
    setStatus('idle')
  }
  return (
    <section id="demo" className="relative scroll-mt-20 overflow-hidden bg-brand py-16 text-white md:py-24">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full bg-brand-dark/40" />
      <div className="relative mx-auto grid max-w-[1160px] items-center gap-10 px-5 md:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <Reveal className="text-center lg:text-left">
          <div className="text-[14px] font-black uppercase tracking-[.14em] text-white/70">{t('x01n68k9')}</div>
          <h2 className="mt-2 text-balance text-[30px] font-black leading-tight tracking-tight md:text-[42px]">{t('x0dmf93p')}</h2>
          <p className="mx-auto mt-3 max-w-[460px] text-[17px] font-semibold leading-relaxed text-white/80 lg:mx-0 md:text-[18px]">{t('x1xc2vqr')}</p>
          <ul className="mx-auto mt-5 flex max-w-[460px] flex-wrap justify-center gap-2 lg:mx-0 lg:justify-start">
            {[t('x1215h8d'), t('x044tiqa'), t('x0pp41s2'), t('x04w5rjd')].map((t) => (
              <li key={t} className="rounded-full bg-white/15 px-3 py-1 text-[13px] font-extrabold text-white">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-6 hidden justify-center lg:flex lg:justify-start">
            <Mascot size={140} mood={status === 'correct' ? 'happy' : status === 'wrong' ? 'think' : 'default'} className="anim-float" />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mx-auto w-full max-w-[540px] overflow-hidden rounded-[28px] bg-white text-ink shadow-[0_10px_0_rgba(47,42,71,.25)]" data-demo>
            <div className="flex items-center gap-3 px-5 pt-5">
              <Cross size={22} className="text-[#B3ADC8]" />
              <div className="progress-track flex-1 !h-[14px]">
                <div className="progress-fill bg-brand" style={{ width: status === 'correct' ? '100%' : `${Math.max(12, Math.min(90, score))}%` }} />
              </div>
              <span className="text-[16px]">
                <ChargeMeter value={status === 'wrong' ? 4 : 5} size={20} />
              </span>
            </div>
            <div className="px-5 pb-5 pt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-light px-3 py-1 text-[12px] font-black uppercase tracking-wider text-coral-dark">{t('x0p1zksc')}</span>
              <h3 className="mt-2 text-[21px] font-black leading-tight">{ex.title}</h3>
              <p className="mb-3 mt-1 text-[15px] font-semibold text-muted">{ex.prompt}</p>
              <UpgradeView ex={ex} answer={answer} setAnswer={setAnswer} status={status} compact />
            </div>
            <div
              className={`border-t-2 px-5 py-4 transition-colors ${
                status === 'correct' ? 'border-transparent bg-teal-light' : status === 'wrong' ? 'border-transparent bg-coral-light' : 'border-line'
              }`}
            >
              {status === 'idle' ? (
                <button className="btn btn-block" disabled={picked.length === 0} onClick={check}>{t('x11ht3eb')}</button>
              ) : (
                <div className="anim-fade-up">
                  <div className={`text-[19px] font-black ${status === 'correct' ? 'text-teal-dark' : 'text-coral-dark'}`}>
                    {status === 'correct' ? t('x1fe5r2f') : t('x1gv2hfz')}
                  </div>
                  <p className={`mt-1 text-[14px] font-semibold leading-snug ${status === 'correct' ? 'text-teal-dark' : 'text-coral-dark'}`}>{ex.explain}</p>
                  <div className="mt-3 flex gap-3">
                    <button className="btn btn-ghost btn-sm flex-1" onClick={reset}>{t('x05yatrr')}</button>
                    <button className={`btn btn-sm flex-1 ${status === 'correct' ? 'btn-teal' : 'btn-coral'}`} onClick={cta.start}>{t('x13ovj8d')}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Features */
function Features() {
  const days = [t('x02znn55'), t('x0wnnrf9'), t('x0r5mt38'), t('x05htt58'), t('x0roo9vo'), t('x14r3c2v'), t('x0vtoycc')]
  const leagues = [
    ['#E0A27A', '#B97A52'],
    ['#C9C3DD', '#A39DBA'],
    ['#FFC23D', '#E5A100'],
    ['#7C4DFF', '#5B2FD6'],
    ['#FF7A59', '#E0573A'],
  ]
  const items: { title: string; text: string; bg: string; visual: ReactNode }[] = [
    {
      title: t('x1hz6q6f'),
      text: t('x1ab4ckk'),
      bg: '#EFE9FF',
      visual: (
        <div className="flex gap-1.5">
          {days.map((d, i) => (
            <div key={d} className="flex flex-col items-center gap-1">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${i < 5 ? 'bg-white' : 'border-2 border-dashed border-brand-mid'}`}>
                {i < 5 && <Rocket size={22} />}
              </span>
              <span className="text-[11px] font-extrabold text-brand-dark">{d}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: t('x0wq6gxq'),
      text: t('x1ttau55'),
      bg: '#DCF8F3',
      visual: (
        <div className="flex w-full max-w-[280px] items-center justify-between gap-3">
          <div className="flex flex-col items-center gap-1 text-[13px] font-black text-teal-dark">
            <Battery size={34} level={4} />
            4 / 5
          </div>
          <div className="flex flex-col items-center gap-1 text-[13px] font-black text-teal-dark">
            <Token size={34} />
            +10
          </div>
          <div className="flex flex-col items-center gap-1 text-[13px] font-black text-brand-dark">{tx('x1ivryya', {}, [() => <Spark size={34} />])}</div>
        </div>
      ),
    },
    {
      title: t('x1vf2ogl'),
      text: t('x1mm6aqy'),
      bg: '#EFE9FF',
      visual: (
        <div className="flex items-end gap-1.5">
          {leagues.map(([c, d], i) => (
            <Shield key={c} size={i === 3 ? 52 : 36} color={c} dark={d} />
          ))}
        </div>
      ),
    },
    {
      title: t('x15jef5s'),
      text: t('x1ogo9uq'),
      bg: '#DCF8F3',
      visual: (
        <div className="code-font w-full max-w-[270px] overflow-hidden rounded-xl bg-[#272239] py-2 text-[12px] text-[#EDEAF6]">
          <div className="px-3 py-0.5 opacity-60">users.map(u =&gt; {'{'}</div>
          <div className="border-l-4 border-teal bg-teal/30 px-2.5 py-0.5">&nbsp;&nbsp;u.name &nbsp;<span className="text-[#9BE7DD]">{t('x04e1ljv')}</span></div>
          <div className="px-3 py-0.5 opacity-60">{'}'})</div>
        </div>
      ),
    },
  ]
  return (
    <section id="features" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-[1160px] px-5 md:px-8">
        <SectionHead eyebrow={t('x0b61e1p')} title={t('x0klbtb5')} sub={t('x0elywco')} color="text-teal-dark" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {items.map((f, i) => (
            <Reveal key={f.title} delay={(i % 2) * 120}>
              <div className="card flex h-full flex-col gap-5 p-5 md:p-6" style={{ boxShadow: '0 5px 0 #E7E3F1' }}>
                <div className="flex h-[130px] items-center justify-center rounded-2xl px-4" style={{ background: f.bg }}>
                  {f.visual}
                </div>
                <div>
                  <h3 className="text-[21px] font-black">{f.title}</h3>
                  <p className="mt-1.5 text-[15px] font-semibold leading-relaxed text-muted">{f.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Pricing */
type Period = 'monthly' | 'annual'

function BillingToggle({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  const item = (p: Period, label: ReactNode) => {
    const active = period === p
    return (
      <button
        role="tab"
        aria-selected={active}
        onClick={() => onChange(p)}
        className={`flex min-h-[44px] items-center gap-2 rounded-full px-4 text-[15px] font-extrabold transition-all md:px-5 md:text-[16px] ${
          active ? 'bg-brand text-white shadow-[0_3px_0_#5B2FD6]' : 'text-muted hover:text-ink'
        }`}
      >
        {label}
      </button>
    )
  }
  return (
    <Reveal className="mb-10 flex justify-center md:mb-12">
      <div role="tablist" aria-label={t('x0gnrqsa')} className="flex rounded-full border-2 border-line bg-white p-1.5 shadow-[0_4px_0_#E7E3F1]">
        {item('monthly', t('x0rspd33'))}
        {item(
          'annual',
          <>{tx('x08wwnho', { annualSavePct }, [(c) => <span className={`rounded-full px-2 py-0.5 text-[12px] font-black ${period === 'annual' ? 'bg-gold text-[#5a3d00]' : 'bg-teal-light text-teal-dark'}`}>{c}</span>])}</>,
        )}
      </div>
    </Reveal>
  )
}

function Feature({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-[16px] font-bold">
      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${light ? 'bg-white/20' : 'bg-teal-light text-teal-dark'}`}>
        <Check size={15} />
      </span>
      {children}
    </li>
  )
}

function Pricing() {
  const cta = useCta()
  const toast = useToast()
  const [period, setPeriod] = useState<Period>('annual')
  const annual = period === 'annual'
  const startTrial = () => {
    if (!cta.loggedIn) return cta.start()
    if (!BILLING_ENABLED) return toast(t('x0j0ubwf'))
    void startCheckout(annual ? 'annual' : 'monthly', 'pricing').then((err) => err && toast(err))
  }

  return (
    <section id="pricing" className="scroll-mt-20 bg-snow py-16 md:py-24">
      <div className="mx-auto max-w-[1160px] px-5 md:px-8">
        <SectionHead
          eyebrow={t('x1658fq6')}
          title={t('x1p0hjhn')}
          sub={t('x0xrxg7y', { TRIAL_DAYS })}
        />
        <BillingToggle period={period} onChange={setPeriod} />

        <div className="mx-auto grid max-w-[900px] items-stretch gap-6 md:grid-cols-2 md:gap-7">
          {/* Free */}
          <Reveal className="order-2 min-w-0 md:order-1">
            <div className="card flex h-full flex-col p-6 md:mt-5 md:p-7" style={{ boxShadow: '0 6px 0 #E7E3F1' }}>
              <div className="text-[15px] font-black uppercase tracking-wider text-muted">Free</div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-[40px] font-black leading-none md:text-[44px]">$0</span>
                <span className="text-[16px] font-bold text-muted">{t('x0vg6ty5')}</span>
              </div>
              <p className="mt-2 text-[15px] font-semibold text-muted">{t('x1sqr19s')}</p>
              <ul className="mb-7 mt-6 space-y-3">
                {FREE_FEATURES().map((f) => (
                  <Feature key={f}>{f}</Feature>
                ))}
              </ul>
              <button className="btn btn-ghost btn-block btn-bouncy mt-auto" onClick={cta.start}>{t('x0vybasn')}</button>
            </div>
          </Reveal>

          {/* Pro — рекомендованный */}
          <Reveal delay={120} className="order-1 min-w-0 md:order-2">
            <div className="relative h-full pt-5">
              <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-coral px-4 py-1.5 text-[13px] font-black uppercase tracking-wider text-white shadow-[0_3px_0_#E0573A]">
                {annual ? t('x0s9x1z7') : t('x18bxzdc')}
              </div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[22px] bg-brand p-6 pt-8 text-white shadow-[0_6px_0_#5B2FD6] ring-4 md:p-7 md:pt-8 ring-brand-mid/60">
                <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5" />

                <div className="relative flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[15px] font-black uppercase tracking-wider text-white/85">Pro · {annual ? t('x0y80z8r') : t('x0bptiqn')}</div>
                  <span className="rounded-full bg-gold px-3 py-1 text-[13px] font-black text-[#5a3d00] shadow-[0_3px_0_#E5A100]">{tx('x1i0nujw', { TRIAL_DAYS })}</span>
                </div>

                <div className="relative mt-3 min-h-[92px]">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-[40px] font-black leading-none md:text-[44px]">{usd(annual ? annualPerMonth : PRICES.monthly)}</span>
                    <span className="text-[16px] font-bold text-white/75">{t('x1ch23vw')}</span>
                    {annual && <s className="text-[17px] font-bold text-white/55">{usd(PRICES.monthly)}</s>}
                  </div>
                  {annual ? (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[15px] font-bold text-white/85">
                      <span>{tx('x1qse250', { annual: usd(PRICES.annual) })}</span>
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[13px] font-black">{tx('x00lwz5a', { annualSaveAmount: usd(annualSaveAmount) })}</span>
                    </div>
                  ) : (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[15px] font-bold text-white/85">
                      <span>{t('x1do1isq')}</span>
                      <button
                        onClick={() => setPeriod('annual')}
                        className="rounded-full bg-white/20 px-2.5 py-0.5 text-[13px] font-black transition-colors hover:bg-white/30"
                      >{tx('x0ybj5in', { annualSavePct })}</button>
                    </div>
                  )}
                </div>

                <ul className="relative mb-7 mt-4 space-y-3">
                  {PRO_FEATURES().map((f) => (
                    <Feature key={f} light>
                      {f}
                    </Feature>
                  ))}
                </ul>

                <button className="btn btn-white btn-block btn-bouncy relative mt-auto whitespace-normal px-4 py-3 text-center leading-tight md:px-6" onClick={startTrial}>{tx('x1bsn2w4', { TRIAL_DAYS })}</button>
                <p className="relative mt-3 text-center text-[14px] font-semibold leading-snug text-white/80">{t(annual ? 'pricing.afterTrialYear' : 'pricing.afterTrialMonth', { days: TRIAL_DAYS, price: usd(annual ? PRICES.annual : PRICES.monthly) })}</p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={160} className="mx-auto mt-10 flex max-w-[900px] flex-col items-center gap-3 md:flex-row md:justify-center md:gap-4">
          {[
            ['✋', t('x05gubbo')],
            ['🔔', t('x04n2926')],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-2 rounded-full border-2 border-line bg-white px-4 py-2 text-center text-[14px] font-bold text-ink md:text-[15px]">
              <span aria-hidden>{icon}</span>
              {text}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- FAQ */
const FAQ = [
  {
    get q() { return t('x0c29tvt') },
    get a() { return t('x1tjyo41') },
  },
  {
    get q() { return t('x0rmvpcw') },
    get a() { return t('x002lyl2') },
  },
  {
    get q() { return t('x0om2uyf') },
    get a() { return t('x1jwno2a') },
  },
  {
    get q() { return t('x1na4jk9') },
    get a() { return t('x04eerdh') },
  },
  {
    get q() { return t('x17e3sgr') },
    get a() { return t('x1s4ih8x', { monthly: usd(PRICES.monthly), annual: usd(PRICES.annual), annualPerMonth: usd(annualPerMonth) }) },
  },
  {
    get q() { return t('x1apy0ox') },
    get a() { return t('x0ckp6i2', { TRIAL_DAYS }) },
  },
  {
    get q() { return t('x12dr2gc') },
    get a() { return t('x13prq26') },
  },
  {
    get q() { return t('x000wiau') },
    get a() { return t('x0zzkpqj', { v: TRIAL_DAYS + 1, monthly: usd(PRICES.monthly), annual: usd(PRICES.annual) }) },
  },
  {
    get q() { return t('x1gmjot0') },
    get a() { return t('x1ry7k44') },
  },
]

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-[780px] px-5 md:px-8">
        <SectionHead eyebrow={t('x1dr0jh2')} title={t('x1xq1hc6')} color="text-coral" />
        <div className="space-y-3">
          {FAQ.map((f, i) => {
            const isOpen = open === i
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div className={`card overflow-hidden transition-colors ${isOpen ? '!border-brand-mid' : ''}`} style={{ boxShadow: `0 4px 0 ${isOpen ? '#C7B6FF' : '#E7E3F1'}` }}>
                  <button
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6 md:py-5"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-[17px] font-extrabold md:text-[18px]">{f.q}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[20px] font-black transition-transform duration-300 ${isOpen ? 'rotate-45 bg-brand text-white' : 'bg-brand-light text-brand'}`}
                    >
                      +
                    </span>
                  </button>
                  <div className={`accordion-body ${isOpen ? 'is-open' : ''}`}>
                    <div>
                      <p className="px-5 pb-5 text-[16px] font-semibold leading-relaxed text-muted md:px-6">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Final CTA + footer */
function FinalCta() {
  const cta = useCta()
  return (
    <section className="px-5 pb-16 md:px-8 md:pb-24">
      <Reveal>
        <div className="relative mx-auto max-w-[1160px] overflow-hidden rounded-[32px] bg-coral px-6 py-12 text-center text-white shadow-[0_8px_0_#E0573A] md:px-12 md:py-14 md:text-left">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-40 h-60 w-60 rounded-full bg-[#E0573A]/40" />
          <div className="relative flex flex-col-reverse items-center gap-6 md:flex-row md:justify-between md:gap-8">
            <div>
              <h2 className="text-[30px] font-black leading-tight tracking-tight md:text-[42px]">{tx('x0qc3vq4', {}, [() => <br className="hidden md:block" />])}</h2>
              <p className="mt-3 max-w-[480px] text-[17px] font-semibold text-white/85 md:text-[18px]">{t('x0h6hg13')}</p>
              <button className="btn btn-white btn-bouncy mt-7 !min-h-[56px] !px-8 !text-[16px] max-[359px]:!px-5" style={{ color: '#E0573A' }} onClick={cta.start}>
                {cta.loggedIn ? t('x1fb86c3') : t('x0vybasn')}
              </button>
            </div>
            <Mascot mood="happy" size={210} className="anim-float hidden shrink-0 md:block" />
            <Mascot mood="happy" size={150} className="anim-float shrink-0 md:hidden" />
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Footer() {
  const toast = useToast()
  const feedback = useFeedback()
  const soon = (what: string) => () => toast(t('x1y4ob1e', { what }))
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1160px] gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8 md:py-14">
        <div>
          <div className="flex items-center gap-2">
            <MascotHead size={36} />
            <span className="text-[28px] font-black lowercase leading-none">{tx('x1ctbm6o', {}, [(chunk) => <span className="text-coral">{chunk}</span>])}</span>
          </div>
          <p className="mt-3 max-w-[320px] text-[15px] font-semibold leading-relaxed text-white/60">{t('x0ops9qp')}</p>
        </div>
        <div>
          <h4 className="text-[13px] font-black uppercase tracking-wider text-white/45">{t('x08gh72x')}</h4>
          <ul className="mt-3 space-y-2 text-[15px] font-bold">
            {NAV_LINKS.slice(0, 4).map((l) => (
              <li key={l.id}>
                <button onClick={() => scrollTo(l.id)} className="text-white/80 hover:text-white">
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[13px] font-black uppercase tracking-wider text-white/45">{t('x0nlt9wc')}</h4>
          <ul className="mt-3 space-y-2 text-[15px] font-bold">
            {[t('x1xu950d'), t('x1kivthv'), t('x1y9umvl')].map((t) => (
              <li key={t}>
                <button onClick={soon(t)} className="text-left text-white/80 hover:text-white">
                  {t}
                </button>
              </li>
            ))}
              <li>
                <button onClick={() => feedback.open({ entry: 'landing' })} className="text-left text-white/80 hover:text-white" data-feedback-open="landing">{t('x1kira6i')}</button>
              </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-2 px-5 py-5 text-[13px] font-semibold text-white/45 md:flex-row md:justify-between md:px-8">
          {/* «прототип / демо-данные» — только в чистом демо-режиме (без Supabase) */}
          <span data-footer-copyright>{DEMO_MODE ? t('x1a0mhst') : t('landing.copyright')}</span>
          {DEMO_MODE ? <span data-demo-note>{t('x1ljbhl2')}</span> : null}
        </div>
      </div>
    </footer>
  )
}

export function Landing({ section }: { section?: string }) {
  useEffect(() => {
    track('landing_viewed', { section: section ?? 'top' })
    if (section === 'pricing') track('paywall_viewed', { source: 'pricing' })
  }, [section])
  useEffect(() => {
    if (!section) return
    const t = window.setTimeout(() => document.getElementById(section)?.scrollIntoView({ block: 'start' }), 60)
    return () => window.clearTimeout(t)
  }, [section])
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Program />
        <Demo />
        <Features />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
