import { useEffect, useState, type ReactNode } from 'react'
import { navigate } from '../router'
import { useStore } from '../store'
import { useToast } from '../components/Toast'
import { Mascot, MascotHead } from '../components/Mascot'
import { Logo } from '../components/Layout'
import { Reveal } from '../components/Reveal'
import { BrowserArt, BugArt, DatabaseArt, RocketArt } from '../components/Illustrations'
import { Bolt, Check, Cross, Fire, Heart, Shield } from '../components/Icons'
import { DEMO_EXERCISE, UNITS, UNIT_COLORS } from '../data/course'
import { HOMEWORKS } from '../data/homework'
import { SOON_TOPICS, TIERS, unitsOf } from '../data/tiers'
import { TierBadge } from '../components/TierBadge'
import { FREE_FEATURES, PRICES, PRO_FEATURES, TRIAL_DAYS, annualPerMonth, annualSaveAmount, annualSavePct, usd } from '../data/pricing'

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

function useCta() {
  const { session } = useStore()
  return {
    loggedIn: !!session,
    start: () => navigate(session ? '/learn' : '/login'),
    login: () => navigate(session ? '/learn' : '/login'),
  }
}

/* ---------------------------------------------------------------- Header */
const NAV_LINKS = [
  { id: 'how', label: 'Как это работает' },
  { id: 'program', label: 'Программа' },
  { id: 'demo', label: 'Демо' },
  { id: 'pricing', label: 'Цены' },
  { id: 'faq', label: 'Вопросы' },
]

function Header() {
  const cta = useCta()
  return (
    <header className="sticky top-0 z-40 border-b-2 border-line/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1160px] items-center gap-6 px-5 md:h-[76px] md:px-8">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2" aria-label="Вайбик — наверх">
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
        <div className="ml-auto flex items-center gap-3">
          <button className="btn btn-ghost btn-sm" onClick={cta.login}>
            {cta.loggedIn ? 'В приложение' : 'Войти'}
          </button>
          <button className="btn btn-sm btn-bouncy hidden sm:inline-flex" onClick={cta.start}>
            Начать бесплатно
          </button>
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
          <div className="text-[11px] font-black uppercase tracking-wider text-brand">Твой промпт</div>
          <div className="text-[13px] font-bold leading-snug text-ink md:text-[15px]">Сделай лендинг для кофейни на React ☕</div>
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
            <div className="rounded bg-teal/25 px-1 text-[#9BE7DD]">✓ готово за 12 сек</div>
          </div>
        </div>
      </div>

      {/* xp chip */}
      <div className="anim-float-tilt absolute bottom-[10%] left-[2%] md:bottom-[12%] md:left-[2%]" style={{ ['--r' as string]: '-4deg', animationDelay: '-2.2s' }}>
        <div className="flex items-center gap-1.5 rounded-2xl bg-gold px-3.5 py-2 text-[16px] font-black text-[#5a3d00] shadow-[0_5px_0_#E5A100] md:text-[18px]">
          <Bolt size={22} /> +15 XP
        </div>
      </div>

      {/* streak chip */}
      <div className="anim-float-tilt absolute bottom-[4%] right-[6%] md:bottom-[8%] md:right-[4%]" style={{ ['--r' as string]: '4deg', animationDelay: '-0.7s' }}>
        <div className="flex items-center gap-1.5 rounded-2xl border-2 border-line bg-white px-3.5 py-2 text-[15px] font-black text-fire shadow-[0_5px_0_#E7E3F1] md:text-[16px]">
          <Fire size={22} /> Серия: 7 дней
        </div>
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
          <span className="anim-fade-up inline-flex items-center gap-2 rounded-full border-2 border-brand-mid bg-brand-light px-3.5 py-1.5 text-[13px] font-extrabold text-brand-dark">
            ✨ Вайб-кодинг для всех — без опыта в программировании
          </span>
          <h1 className="anim-fade-up mt-5 text-balance text-[38px] font-black leading-[1.08] tracking-tight text-ink md:text-[54px] lg:text-[56px]">
            Создавай приложения с&nbsp;ИИ <br className="hidden sm:block" />
            <span className="relative inline-block whitespace-nowrap text-brand">
              по&nbsp;5&nbsp;минут
              <Squiggle />
            </span>{' '}
            в&nbsp;день
          </h1>
          <p className="anim-fade-up mx-auto mt-6 max-w-[520px] text-[18px] font-semibold leading-relaxed text-muted lg:mx-0 md:text-[19px]">
            Короткие весёлые уроки: учишься ставить задачи Cursor, ChatGPT и Claude, собираешь лендинг и чинишь баги вместе с ИИ.
          </p>
          <div className="anim-fade-up mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <button className="btn btn-bouncy !min-h-[56px] !px-8 !text-[16px]" onClick={cta.start}>
              {cta.loggedIn ? 'Продолжить обучение' : 'Начать бесплатно'}
            </button>
            <button className="btn btn-ghost btn-bouncy !min-h-[56px] !px-7 !text-[16px]" onClick={cta.login}>
              У меня есть аккаунт
            </button>
          </div>
          <ul className="anim-fade-up mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[15px] font-bold text-muted lg:justify-start">
            {['Бесплатный старт', 'Уроки по 3–5 минут', 'На русском языке'].map((t) => (
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
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-brand px-3 py-2 text-[13px] font-bold text-white">Сделай форму входа с валидацией</div>
        <div className="flex items-end gap-2">
          <MascotHead size={30} />
          <div className="rounded-2xl rounded-bl-md border-2 border-line bg-white px-3 py-2 text-[13px] font-bold text-ink">Готово! Добавил ошибки под полями ✨</div>
        </div>
      </div>
    )
  if (n === 2)
    return (
      <div className="flex h-full flex-col justify-center gap-2 px-6">
        <div className="tile px-3 py-2 text-[13px] font-bold">«Сделай сайт»</div>
        <div className="tile is-correct flex items-center justify-between px-3 py-2 text-[13px] font-bold">
          «Лендинг кофейни на React…» <Check size={16} />
        </div>
        <div className="tile px-3 py-2 text-[13px] font-bold">«сайт быстро!!!»</div>
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
    { n: 1, color: UNIT_COLORS.brand, title: 'Учишься говорить с ИИ', text: 'Короткий урок объясняет, как сформулировать задачу так, чтобы ИИ понял с первого раза.' },
    { n: 2, color: UNIT_COLORS.coral, title: 'Тренируешься на задачах', text: 'Выбираешь лучший промпт, собираешь запрос из фрагментов и ищешь баги в коде от ИИ.' },
    { n: 3, color: UNIT_COLORS.teal, title: 'Собираешь свои проекты', text: 'Шаг за шагом доходишь до живого лендинга — и знаешь, как его отладить.' },
  ]
  return (
    <section id="how" className="scroll-mt-20 bg-snow py-16 md:py-24">
      <div className="mx-auto max-w-[1160px] px-5 md:px-8">
        <SectionHead eyebrow="Как это работает" title="Три шага до первого приложения" sub="Никакой теории на 40 страниц — только практика маленькими порциями." />
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
        <SectionHead eyebrow="Что ты изучишь" title="Пять разделов — от первого промпта до запуска" sub="Каждый раздел — 5 коротких уроков, домашка-мини-проект и итоговое испытание. Первый — бесплатно." color="text-coral" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {UNITS.map((u, i) => {
            const c = UNIT_COLORS[u.color]
            return (
              <Reveal key={u.id} delay={(i % 3) * 120}>
                <article className="flex h-full flex-col overflow-hidden rounded-[24px] border-2 bg-white" style={{ borderColor: c.mid, boxShadow: `0 6px 0 ${c.mid}` }}>
                  <div className="relative flex h-[180px] items-center justify-center" style={{ background: c.light }}>
                    <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-[12px] font-black uppercase tracking-wider text-white" style={{ background: c.main }}>
                      Раздел {u.num}
                    </span>
                    <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-[12px] font-black uppercase tracking-wider" style={{ color: c.dark }}>
                      {u.pro ? 'Pro' : 'Бесплатно'}
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
                      <span className="text-[14px] font-extrabold text-muted">{u.lessons.filter((l) => l.kind !== 'chest' && l.kind !== 'trophy').length} уроков + домашка + тест</span>
                      <button onClick={cta.start} className="text-[14px] font-black uppercase tracking-wider hover:opacity-80" style={{ color: c.dark }}>
                        Начать →
                      </button>
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
          <div className="text-[13px] font-black uppercase tracking-[.14em] text-white/70">Домашка</div>
          <h3 className="mt-1 text-[24px] font-black leading-tight">Мини-проект после каждого раздела</h3>
          <p className="mt-2 text-[15px] font-semibold leading-relaxed text-white/85">
            Пишешь промпт — ИИ собирает результат, а живое превью показывает, что вышло. Чек-лист отмечает требования, Бипи подсказывает, чего не хватает.
          </p>
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
          <div className="text-[13px] font-black uppercase tracking-[.14em] text-teal-dark">Три тира</div>
          <h3 className="mt-1 text-[24px] font-black leading-tight">Новичок → Средний → Продвинутый</h3>
          <p className="mt-2 text-[15px] font-semibold text-muted">Уже что-то умеешь? Пройди тест на уровень и начни с нужного тира.</p>
          <div className="mt-4 space-y-3">
            {TIERS.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <TierBadge tier={t} size={44} />
                <div className="min-w-0">
                  <div className="text-[16px] font-black leading-tight">
                    {t.name} <span className="text-[13px] font-extrabold text-muted">· разделы {unitsOf(t).map((u) => u.num).join('–')}</span>
                  </div>
                  <div className="text-[14px] font-semibold leading-snug text-muted">{t.outcome}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] font-extrabold text-brand">Скоро: {SOON_TOPICS.join(' · ')}</p>
        </div>
      </Reveal>
    </div>
  )
}

/* ---------------------------------------------------------------- Demo */
function Demo() {
  const ex = DEMO_EXERCISE
  const cta = useCta()
  const [answer, setAnswer] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const check = () => answer !== null && setStatus(answer === ex.correct ? 'correct' : 'wrong')
  const reset = () => {
    setAnswer(null)
    setStatus('idle')
  }
  const cls = (i: number) => {
    if (status === 'idle') return answer === i ? 'is-selected' : ''
    if (i === ex.correct) return 'is-correct'
    if (answer === i) return 'is-wrong'
    return 'opacity-60'
  }
  return (
    <section id="demo" className="relative scroll-mt-20 overflow-hidden bg-brand py-16 text-white md:py-24">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full bg-brand-dark/40" />
      <div className="relative mx-auto grid max-w-[1160px] items-center gap-10 px-5 md:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <Reveal className="text-center lg:text-left">
          <div className="text-[14px] font-black uppercase tracking-[.14em] text-white/70">Попробуй прямо сейчас</div>
          <h2 className="mt-2 text-balance text-[30px] font-black leading-tight tracking-tight md:text-[42px]">Мини-урок за&nbsp;20&nbsp;секунд</h2>
          <p className="mx-auto mt-3 max-w-[460px] text-[17px] font-semibold leading-relaxed text-white/80 lg:mx-0 md:text-[18px]">
            Так выглядит задание в Вайбике. Выбери вариант и нажми «Проверить» — Бипи сразу объяснит, почему так.
          </p>
          <div className="mt-6 hidden justify-center lg:flex lg:justify-start">
            <Mascot size={150} mood={status === 'correct' ? 'happy' : status === 'wrong' ? 'think' : 'default'} className="anim-float" />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mx-auto w-full max-w-[540px] overflow-hidden rounded-[28px] bg-white text-ink shadow-[0_10px_0_rgba(47,42,71,.25)]">
            <div className="flex items-center gap-3 px-5 pt-5">
              <Cross size={22} className="text-[#B3ADC8]" />
              <div className="progress-track flex-1 !h-[14px]">
                <div className="progress-fill bg-brand" style={{ width: status === 'correct' ? '100%' : '35%' }} />
              </div>
              <span className="flex items-center gap-1 text-[16px] font-black text-heart">
                <Heart size={22} /> {status === 'wrong' ? 4 : 5}
              </span>
            </div>
            <div className="px-5 pb-5 pt-5">
              <h3 className="text-[22px] font-black">{ex.title}</h3>
              <p className="mt-1 text-[15px] font-semibold text-muted">{ex.prompt}</p>
              <div className="mt-4 grid gap-2.5">
                {ex.options.map((o, i) => (
                  <button
                    key={i}
                    disabled={status !== 'idle'}
                    onClick={() => setAnswer(i)}
                    className={`tile px-4 py-3 text-[14px] font-bold leading-snug md:text-[15px] ${cls(i)}`}
                  >
                    «{o}»
                  </button>
                ))}
              </div>
            </div>
            <div
              className={`border-t-2 px-5 py-4 transition-colors ${
                status === 'correct' ? 'border-transparent bg-teal-light' : status === 'wrong' ? 'border-transparent bg-coral-light' : 'border-line'
              }`}
            >
              {status === 'idle' ? (
                <button className="btn btn-block" disabled={answer === null} onClick={check}>
                  Проверить
                </button>
              ) : (
                <div className="anim-fade-up">
                  <div className={`text-[19px] font-black ${status === 'correct' ? 'text-teal-dark' : 'text-coral-dark'}`}>
                    {status === 'correct' ? 'В точку! +15 XP' : 'Не совсем — смотри почему'}
                  </div>
                  <p className={`mt-1 text-[14px] font-semibold leading-snug ${status === 'correct' ? 'text-teal-dark' : 'text-coral-dark'}`}>{ex.explain}</p>
                  <div className="mt-3 flex gap-3">
                    <button className="btn btn-ghost btn-sm flex-1" onClick={reset}>
                      Ещё раз
                    </button>
                    <button className={`btn btn-sm flex-1 ${status === 'correct' ? 'btn-teal' : 'btn-coral'}`} onClick={cta.start}>
                      Хочу ещё
                    </button>
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
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const leagues = [
    ['#E0A27A', '#B97A52'],
    ['#C9C3DD', '#A39DBA'],
    ['#FFC23D', '#E5A100'],
    ['#7C4DFF', '#5B2FD6'],
    ['#FF7A59', '#E0573A'],
  ]
  const items: { title: string; text: string; bg: string; visual: ReactNode }[] = [
    {
      title: 'Серия дней',
      text: 'Занимайся каждый день и держи огонёк. Маленькая привычка — большой результат.',
      bg: '#FFF1DE',
      visual: (
        <div className="flex gap-1.5">
          {days.map((d, i) => (
            <div key={d} className="flex flex-col items-center gap-1">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${i < 5 ? 'bg-white' : 'border-2 border-dashed border-[#F5C68A]'}`}>
                {i < 5 && <Fire size={22} />}
              </span>
              <span className="text-[11px] font-extrabold text-[#C7883A]">{d}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'XP и уровни',
      text: 'За каждый урок — опыт и кристаллы. Видно, как растёт навык.',
      bg: '#FFF4D6',
      visual: (
        <div className="w-full max-w-[260px]">
          <div className="mb-1.5 flex items-center justify-between text-[13px] font-black text-[#8a6a1e]">
            <span className="flex items-center gap-1"><Bolt size={18} /> Уровень 3</span>
            <span>120 / 200 XP</span>
          </div>
          <div className="progress-track !h-[18px] !bg-white">
            <div className="progress-fill bg-gold" style={{ width: '60%' }} />
          </div>
        </div>
      ),
    },
    {
      title: 'Лиги',
      text: 'Соревнуйся неделю с другими учениками и поднимайся из Бронзы в Бирюзу.',
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
      title: 'ИИ-проверка кода',
      text: 'Учись замечать типичные ошибки ИИ: Бипи подсветит баг и объяснит, как его исправить.',
      bg: '#DCF8F3',
      visual: (
        <div className="code-font w-full max-w-[270px] overflow-hidden rounded-xl bg-[#272239] py-2 text-[12px] text-[#EDEAF6]">
          <div className="px-3 py-0.5 opacity-60">users.map(u =&gt; {'{'}</div>
          <div className="border-l-4 border-teal bg-teal/30 px-2.5 py-0.5">&nbsp;&nbsp;u.name &nbsp;<span className="text-[#9BE7DD]">// нет return</span></div>
          <div className="px-3 py-0.5 opacity-60">{'}'})</div>
        </div>
      ),
    },
  ]
  return (
    <section id="features" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-[1160px] px-5 md:px-8">
        <SectionHead eyebrow="Почему затягивает" title="Учёба, которая ощущается как игра" sub="Всё, за что любят игровые приложения для обучения, — но про создание софта с ИИ." color="text-teal-dark" />
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
      <div role="tablist" aria-label="Период оплаты" className="flex rounded-full border-2 border-line bg-white p-1.5 shadow-[0_4px_0_#E7E3F1]">
        {item('monthly', 'Помесячно')}
        {item(
          'annual',
          <>
            На год
            <span className={`rounded-full px-2 py-0.5 text-[12px] font-black ${period === 'annual' ? 'bg-gold text-[#5a3d00]' : 'bg-teal-light text-teal-dark'}`}>
              −{annualSavePct}%
            </span>
          </>,
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
  const startTrial = () => (cta.loggedIn ? toast('Оплата Pro подключится совсем скоро — пробный период начнётся отсюда 🔔') : cta.start())

  return (
    <section id="pricing" className="scroll-mt-20 bg-snow py-16 md:py-24">
      <div className="mx-auto max-w-[1160px] px-5 md:px-8">
        <SectionHead
          eyebrow="Тарифы"
          title="Начни бесплатно, расти с Pro"
          sub={`Базовый раздел — бесплатно навсегда. Pro открывает всё остальное, и первые ${TRIAL_DAYS} дня — за $0.`}
        />
        <BillingToggle period={period} onChange={setPeriod} />

        <div className="mx-auto grid max-w-[900px] items-stretch gap-6 md:grid-cols-2 md:gap-7">
          {/* Free */}
          <Reveal className="order-2 min-w-0 md:order-1">
            <div className="card flex h-full flex-col p-6 md:mt-5 md:p-7" style={{ boxShadow: '0 6px 0 #E7E3F1' }}>
              <div className="text-[15px] font-black uppercase tracking-wider text-muted">Free</div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-[40px] font-black leading-none md:text-[44px]">$0</span>
                <span className="text-[16px] font-bold text-muted">навсегда</span>
              </div>
              <p className="mt-2 text-[15px] font-semibold text-muted">Карта не нужна. Учись в своём темпе.</p>
              <ul className="mb-7 mt-6 space-y-3">
                {FREE_FEATURES.map((f) => (
                  <Feature key={f}>{f}</Feature>
                ))}
              </ul>
              <button className="btn btn-ghost btn-block btn-bouncy mt-auto" onClick={cta.start}>
                Начать бесплатно
              </button>
            </div>
          </Reveal>

          {/* Pro — рекомендованный */}
          <Reveal delay={120} className="order-1 min-w-0 md:order-2">
            <div className="relative h-full pt-5">
              <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-coral px-4 py-1.5 text-[13px] font-black uppercase tracking-wider text-white shadow-[0_3px_0_#E0573A]">
                {annual ? '⭐ Популярный выбор' : '⭐ Рекомендуем'}
              </div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[22px] bg-brand p-6 pt-8 text-white shadow-[0_6px_0_#5B2FD6] ring-4 md:p-7 md:pt-8 ring-brand-mid/60">
                <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5" />

                <div className="relative flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[15px] font-black uppercase tracking-wider text-white/85">Pro · {annual ? 'на год' : 'помесячно'}</div>
                  <span className="rounded-full bg-gold px-3 py-1 text-[13px] font-black text-[#5a3d00] shadow-[0_3px_0_#E5A100]">🎁 {TRIAL_DAYS} дня бесплатно</span>
                </div>

                <div className="relative mt-3 min-h-[92px]">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-[40px] font-black leading-none md:text-[44px]">{usd(annual ? annualPerMonth : PRICES.monthly)}</span>
                    <span className="text-[16px] font-bold text-white/75">/ мес</span>
                    {annual && <s className="text-[17px] font-bold text-white/55">{usd(PRICES.monthly)}</s>}
                  </div>
                  {annual ? (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[15px] font-bold text-white/85">
                      <span>{usd(PRICES.annual)} раз в год</span>
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[13px] font-black">экономия {usd(annualSaveAmount)}</span>
                    </div>
                  ) : (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[15px] font-bold text-white/85">
                      <span>Оплата каждый месяц</span>
                      <button
                        onClick={() => setPeriod('annual')}
                        className="rounded-full bg-white/20 px-2.5 py-0.5 text-[13px] font-black transition-colors hover:bg-white/30"
                      >
                        На год выгоднее на {annualSavePct}% →
                      </button>
                    </div>
                  )}
                </div>

                <ul className="relative mb-7 mt-4 space-y-3">
                  {PRO_FEATURES.map((f) => (
                    <Feature key={f} light>
                      {f}
                    </Feature>
                  ))}
                </ul>

                <button className="btn btn-white btn-block btn-bouncy relative mt-auto whitespace-normal px-4 py-3 text-center leading-tight md:px-6" onClick={startTrial}>
                  Попробовать {TRIAL_DAYS} дня бесплатно
                </button>
                <p className="relative mt-3 text-center text-[14px] font-semibold leading-snug text-white/80">
                  Сегодня $0. Через {TRIAL_DAYS} дня — {usd(annual ? PRICES.annual : PRICES.monthly)} {annual ? 'за год' : 'в месяц'}, если не&nbsp;отменишь.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={160} className="mx-auto mt-10 flex max-w-[900px] flex-col items-center gap-3 md:flex-row md:justify-center md:gap-4">
          {[
            ['✋', 'Отмена в любой момент, спишем только после пробного периода'],
            ['🔔', 'Напомним за день до списания'],
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
    q: 'Что такое вайб-кодинг?',
    a: 'Это способ создавать программы, описывая задачу обычным языком: код пишет ИИ-ассистент, а ты ставишь задачу, проверяешь результат и направляешь его. Термин в 2025 году ввёл Андрей Карпати.',
  },
  {
    q: 'Нужно ли уметь программировать?',
    a: 'Нет. Курс рассчитан на новичков: мы начинаем с того, как ясно сформулировать задачу, и постепенно учимся читать код настолько, чтобы замечать ошибки ИИ.',
  },
  {
    q: 'Какие инструменты понадобятся?',
    a: 'Для уроков — только браузер. В заданиях мы разбираем приёмы для Cursor, ChatGPT и Claude; для практики пригодится бесплатный аккаунт в любом из них.',
  },
  {
    q: 'Сколько времени занимает урок?',
    a: 'Обычно 3–5 минут. Можно пройти один урок за утренним кофе и не терять серию.',
  },
  {
    q: 'Это бесплатно?',
    a: `Да, раздел «Первый промпт», серия, XP и лиги бесплатны навсегда. Pro открывает все разделы, безлимитные сердечки и ИИ-разбор кода: ${usd(PRICES.monthly)} в месяц или ${usd(PRICES.annual)} в год (≈ ${usd(annualPerMonth)} в месяц).`,
  },
  {
    q: 'Как работает пробный период?',
    a: `Нажми «Попробовать ${TRIAL_DAYS} дня бесплатно» и выбери тариф — помесячный или годовой. Все возможности Pro сразу открываются, а сегодня с тебя $0. За день до конца пробного периода пришлём напоминание.`,
  },
  {
    q: 'Как отменить подписку?',
    a: 'В любой момент в профиле: «Подписка» → «Отменить». Если отменишь во время пробного периода, мы ничего не спишем. Если после — Pro будет работать до конца уже оплаченного месяца или года.',
  },
  {
    q: 'Что будет после пробного периода?',
    a: `Если не отменишь, на ${TRIAL_DAYS + 1}-й день спишем стоимость выбранного тарифа: ${usd(PRICES.monthly)} за месяц или ${usd(PRICES.annual)} за год. Дальше подписка продлевается автоматически, пока ты её не отменишь. А если решишь не продолжать, вернёшься на бесплатный тариф — прогресс и серия сохранятся.`,
  },
  {
    q: 'Вайбик связан с Cursor, OpenAI или Anthropic?',
    a: 'Нет. Вайбик — независимый учебный проект; названия инструментов упоминаются только как примеры того, с чем ты будешь работать.',
  },
]

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-[780px] px-5 md:px-8">
        <SectionHead eyebrow="Вопросы и ответы" title="Частые вопросы" color="text-coral" />
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
              <h2 className="text-[30px] font-black leading-tight tracking-tight md:text-[42px]">
                Первое приложение
                <br className="hidden md:block" /> ближе, чем кажется
              </h2>
              <p className="mt-3 max-w-[480px] text-[17px] font-semibold text-white/85 md:text-[18px]">Пять минут сегодня — и ты уже знаешь, как написать хороший промпт.</p>
              <button className="btn btn-white btn-bouncy mt-7 !min-h-[56px] !px-8 !text-[16px]" style={{ color: '#E0573A' }} onClick={cta.start}>
                {cta.loggedIn ? 'Продолжить обучение' : 'Начать бесплатно'}
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
  const soon = (t: string) => () => toast(`«${t}» — скоро 🙂`)
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1160px] gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8 md:py-14">
        <div>
          <div className="flex items-center gap-2">
            <MascotHead size={36} />
            <span className="text-[28px] font-black lowercase leading-none">
              вайбик<span className="text-coral">.</span>
            </span>
          </div>
          <p className="mt-3 max-w-[320px] text-[15px] font-semibold leading-relaxed text-white/60">
            Учись создавать приложения с ИИ — по 5 минут в день. Короткие уроки, весёлая практика и Бипи рядом.
          </p>
        </div>
        <div>
          <h4 className="text-[13px] font-black uppercase tracking-wider text-white/45">Продукт</h4>
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
          <h4 className="text-[13px] font-black uppercase tracking-wider text-white/45">О проекте</h4>
          <ul className="mt-3 space-y-2 text-[15px] font-bold">
            {['О нас', 'Контакты', 'Политика конфиденциальности'].map((t) => (
              <li key={t}>
                <button onClick={soon(t)} className="text-left text-white/80 hover:text-white">
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-2 px-5 py-5 text-[13px] font-semibold text-white/45 md:flex-row md:justify-between md:px-8">
          <span>© 2026 Вайбик · прототип</span>
          <span>Оплата ещё не подключена; данные и прогресс в приложении — демонстрационные</span>
        </div>
      </div>
    </footer>
  )
}

export function Landing({ section }: { section?: string }) {
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
