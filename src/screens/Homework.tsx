import { useCallback, useEffect, useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react'
import { UNITS, UNIT_COLORS } from '../data/course'
import { HOMEWORK_XP, findHomework, type BlockColor, type HomeworkDef, type PromptBlock } from '../data/homework'
import { isUnitLocked, tierOfUnit } from '../data/tiers'
import { cardSim, debugSim, deploySim, formSim, landingSim, type Sim, type Tone } from '../homework/sims'
import { CardPreview, DeployPreview, FormPreview, LandingPreview, TodoPreview, type PreviewProps } from '../homework/previews'
import { useStore } from '../store'
import { navigate } from '../router'
import { continueAfter } from '../flow'
import { Mascot, MascotHead } from '../components/Mascot'
import { Spark, Check, Cross, House, Target } from '../components/Icons'
import { highlight } from '../components/Code'
import { LockedScreen } from '../components/Locked'
import { Confetti } from './LessonComplete'
import { AI_ENABLED } from '../lib/config'
import { reviewPrompt, type ReviewOutcome } from '../lib/review'
import { buildReviewRequest, mergeAiIntoPrompt } from '../homework/ai'
import { recordHomeworkSubmission } from '../lib/progressSync'

interface Msg {
  id: number
  role: 'user' | 'ai' | 'bipi'
  text: string
  changes?: string[]
  code?: string[]
  tone?: Tone | 'intro'
  /** Советы ИИ-ментора (DeepSeek) */
  bullets?: string[]
  /** Улучшенный промпт от ИИ — можно вставить в поле ввода */
  improved?: string
}

const BLOCK_COLORS: Record<BlockColor, { main: string; light: string; dark: string }> = {
  brand: { main: '#7C4DFF', light: '#EFE9FF', dark: '#5B2FD6' },
  coral: { main: '#FF7A59', light: '#FFE9E2', dark: '#E0573A' },
  teal: { main: '#13C2AE', light: '#DCF8F3', dark: '#0E9C8C' },
  deep: { main: '#5B2FD6', light: '#E8E0FF', dark: '#3E1A9E' },
  amber: { main: '#FFA41B', light: '#FFF1D9', dark: '#D97F00' },
  grey: { main: '#A39DBA', light: '#F2F0F7', dark: '#8C86A3' },
}

const TONE_BG: Record<NonNullable<Msg['tone']>, string> = {
  good: 'bg-teal-light text-teal-dark',
  meh: 'bg-gold-light text-[#8a6a1e]',
  bad: 'bg-coral-light text-coral-dark',
  intro: 'bg-brand-light text-brand-dark',
}

const STEP_LABELS = ['Читаю промпт…', 'Думаю над задачей…', 'Пишу код…', 'Собираю превью…']
const THINK_MS = 1500

function Modal({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
      <div className="anim-pop w-full max-w-[420px] rounded-[24px] bg-white p-6 text-center">{children}</div>
    </div>
  )
}

function Chip({ block, active, onClick }: { block: PromptBlock; active: boolean; onClick: () => void }) {
  const c = BLOCK_COLORS[block.color]
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      title={block.text}
      className="rounded-xl border-2 px-2.5 py-1 text-[13px] font-extrabold transition-[transform,background-color] duration-100 active:translate-y-[2px]"
      style={active ? { background: c.main, borderColor: c.main, color: '#fff', boxShadow: `0 3px 0 ${c.dark}` } : { background: '#fff', borderColor: c.light === '#F2F0F7' ? '#E7E3F1' : c.light, color: c.dark, boxShadow: `0 3px 0 ${c.light}` }}
    >
      {active ? '✓ ' : '+ '}
      {block.label}
    </button>
  )
}

function Bubble({ m, onPreview, onUseImproved }: { m: Msg; onPreview: () => void; onUseImproved: (text: string) => void }) {
  if (m.role === 'user')
    return (
      <div className="anim-fade-up flex justify-end">
        <div className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-[14px] font-bold leading-snug text-white [overflow-wrap:anywhere]">{m.text}</div>
      </div>
    )
  if (m.role === 'bipi')
    return (
      <div className="anim-fade-up flex items-end gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-line bg-white">
          <MascotHead size={26} />
        </span>
        <div className={`max-w-[88%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[14px] font-bold leading-snug ${TONE_BG[m.tone ?? 'intro']}`}>
          <div className="mb-0.5 text-[11px] font-black uppercase tracking-wider opacity-70">Бипи</div>
          {m.text}
          {m.bullets && m.bullets.length > 0 && (
            <ul className="mt-1.5 space-y-1" data-ai-feedback>
              {m.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-1.5 font-semibold">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                  {b}
                </li>
              ))}
            </ul>
          )}
          {m.improved && (
            <button
              type="button"
              onClick={() => onUseImproved(m.improved!)}
              className="mt-2 rounded-lg bg-white/70 px-2 py-1 text-[12px] font-black uppercase tracking-wider text-brand hover:bg-white"
            >
              ✨ Вставить улучшенный промпт
            </button>
          )}
        </div>
      </div>
    )
  return (
    <div className="anim-fade-up flex items-start gap-2">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-coral text-[15px] text-white">✨</span>
      <div className="min-w-0 max-w-[88%] rounded-2xl rounded-tl-md border-2 border-line bg-white px-3.5 py-2.5">
        <div className="mb-0.5 text-[11px] font-black uppercase tracking-wider text-muted">ИИ</div>
        <p className="text-[14px] font-bold leading-snug text-ink">{m.text}</p>
        {m.code && (
          <div className="mt-2 overflow-x-auto rounded-xl bg-[#272239] py-1.5">
            {m.code.map((l, i) => (
              <div key={i} className="code-font whitespace-pre px-2.5 text-[11.5px] text-[#EDEAF6]" style={{ background: l.startsWith('+') ? '#13C2AE30' : l.startsWith('-') ? '#FF7A5930' : undefined }}>
                {highlight(l)}
              </div>
            ))}
          </div>
        )}
        {m.changes && m.changes.length > 0 && (
          <ul className="mt-2 space-y-1">
            {m.changes.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[13px] font-bold text-teal-dark">
                <Check size={14} className="mt-0.5 shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        )}
        <button onClick={onPreview} className="mt-2 text-[12px] font-black uppercase tracking-wider text-brand lg:hidden">
          Смотреть превью ↓
        </button>
      </div>
    </div>
  )
}

function Thinking({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-2" data-thinking>
      <span className="flex h-9 w-9 shrink-0 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-brand to-coral text-[15px] text-white">✨</span>
      <div className="rounded-2xl rounded-tl-md border-2 border-line bg-white px-3.5 py-2.5">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-brand" style={{ animation: `float 0.9s ${i * 0.15}s ease-in-out infinite` }} />
          ))}
          <span className="ml-1.5 text-[13px] font-extrabold text-muted">{label}</span>
        </div>
      </div>
    </div>
  )
}

interface RunnerProps<S, U> {
  def: HomeworkDef
  sim: Sim<S, U>
  Preview: ComponentType<PreviewProps<S, U>>
  onSubmit: (iterations: number, prompts: string[]) => void
}

function Runner<S, U>({ def, sim, Preview, onSubmit }: RunnerProps<S, U>) {
  const unit = UNITS.find((u) => u.id === def.unitId)!
  const c = UNIT_COLORS[unit.color]
  const [state, setState] = useState<S>(sim.init)
  const [ui, setUi] = useState<U>(sim.initUi)
  const [draft, setDraft] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ id: 0, role: 'bipi', text: def.intro, tone: 'intro' }])
  const [busy, setBusy] = useState(false)
  const [label, setLabel] = useState(STEP_LABELS[0])
  const [version, setVersion] = useState(0)
  const [hint, setHint] = useState(false)
  const [quit, setQuit] = useState(false)
  const stateRef = useRef(state)
  const uiRef = useRef(ui)
  stateRef.current = state
  uiRef.current = ui
  const timers = useRef<number[]>([])
  const chatRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const announced = useRef(false)
  const nextId = useRef(1)
  /** ИИ-проверка: 'on' — DeepSeek, 'off' — офлайн-симуляция (демо, лимит или ошибка) */
  const [aiMode, setAiMode] = useState<'on' | 'off'>(AI_ENABLED ? 'on' : 'off')
  const fallbackNoted = useRef(false)
  /** Номер текущего запроса: ответы от «старых» (после «Заново»/выхода) игнорируем */
  const runId = useRef(0)

  const checks = sim.check(state, ui)
  const doneCount = def.requirements.filter((r) => checks[r.id]).length
  const allDone = doneCount === def.requirements.length
  const sends = msgs.filter((m) => m.role === 'user').length
  const firstMissing = def.requirements.find((r) => !checks[r.id])

  useEffect(
    () => () => {
      runId.current++
      timers.current.forEach((t) => clearTimeout(t))
    },
    [],
  )
  useEffect(() => {
    const el = chatRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [msgs, busy])

  // Требование выполнено действием в превью (переключили на телефон, добавили задачу…) — Бипи радуется
  useEffect(() => {
    if (allDone && !announced.current && !busy) {
      announced.current = true
      setMsgs((m) => [...m, { id: nextId.current++, role: 'bipi', text: 'Все требования выполнены! 🎉 Жми «Сдать домашку».', tone: 'good' }])
    }
  }, [allDone, busy])

  const push = (...add: Omit<Msg, 'id'>[]) => setMsgs((m) => [...m, ...add.map((x) => ({ ...x, id: nextId.current++ }))])

  const finish = (prompt: string, outcome: ReviewOutcome | null) => {
    let text = prompt
    let review = null
    if (outcome?.ok) {
      review = outcome.review
      text = mergeAiIntoPrompt(sim, def, stateRef.current, prompt, review).text
    }
    const turn = sim.apply(stateRef.current, text)
    const ck = sim.check(turn.state, uiRef.current)
    const missing = def.requirements.find((r) => !ck[r.id])
    const done = !missing
    let bipi = turn.bipi
    const tip = missing ? (sim.hint?.(turn.state, uiRef.current, missing.id) ?? missing.hint) : ''
    if (!bipi && review) bipi = done ? 'Все требования выполнены! 🎉 Жми «Сдать домашку».' : `Промпт на ${review.score}/100. Вот что подскажу:`
    if (!bipi) bipi = done ? 'Все требования выполнены! 🎉 Жми «Сдать домашку».' : `${turn.tone === 'good' ? 'Отлично! Осталось ещё чуть-чуть. ' : turn.tone === 'meh' ? 'Уже лучше! ' : 'Хм, результат так себе. '}${tip}`
    if (done) announced.current = true
    setState(turn.state)
    setVersion((v) => v + 1)
    const add: Omit<Msg, 'id'>[] = [
      { role: 'ai', text: turn.reply, changes: turn.changes, code: turn.code },
      {
        role: 'bipi',
        text: bipi,
        tone: done ? 'good' : turn.tone,
        bullets: review?.feedback,
        improved: review && !done && review.improved_prompt && review.improved_prompt !== prompt ? review.improved_prompt : undefined,
      },
    ]
    // ИИ недоступен — один раз честно говорим, что проверяем офлайн
    if (outcome && !outcome.ok && outcome.reason !== 'disabled' && !fallbackNoted.current) {
      fallbackNoted.current = true
      add.push({
        role: 'bipi',
        tone: 'meh',
        text:
          outcome.reason === 'limit'
            ? `${outcome.message} Дальше проверяю офлайн — превью и чек-лист работают как обычно.`
            : 'ИИ-ментор сейчас недоступен — проверяю офлайн, всё работает как обычно 🙂',
      })
    }
    if (outcome && !outcome.ok && (outcome.reason === 'limit' || outcome.reason === 'disabled' || outcome.reason === 'auth')) setAiMode('off')
    push(...add)
    setBusy(false)
  }

  const send = useCallback(() => {
    const prompt = draft.trim()
    if (!prompt || busy) return
    const history = msgs.filter((m) => m.role === 'user').map((m) => m.text)
    push({ role: 'user', text: prompt })
    setDraft('')
    setBusy(true)
    setHint(false)
    const run = ++runId.current
    const labels = aiMode === 'on' ? [...STEP_LABELS.slice(0, 3), 'Бипи проверяет промпт…'] : STEP_LABELS
    labels.forEach((l, i) => timers.current.push(window.setTimeout(() => setLabel(l), (i * THINK_MS) / labels.length)))
    // ИИ-разбор идёт параллельно с «анимацией размышления»; без ИИ — ровно THINK_MS, как раньше
    const ai: Promise<ReviewOutcome | null> = aiMode === 'on' ? reviewPrompt(buildReviewRequest(def, prompt, history)) : Promise.resolve(null)
    const minWait = new Promise<void>((r) => timers.current.push(window.setTimeout(r, THINK_MS)))
    void Promise.all([ai, minWait]).then(([outcome]) => {
      if (run !== runId.current) return
      finish(prompt, outcome)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, busy, sim, def, msgs, aiMode])

  const toggleBlock = (b: PromptBlock) => {
    setDraft((d) => {
      if (d.includes(b.text)) return d.replace(b.text, '').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
      return d.trim() ? `${d.trimEnd()} ${b.text}` : b.text
    })
  }
  const insert = useCallback((text: string) => setDraft((d) => (d.trim() ? `${d.trimEnd()}\n${text}` : text)), [])
  const restart = () => {
    runId.current++
    timers.current.forEach((t) => clearTimeout(t))
    setBusy(false)
    setState(sim.init())
    setUi(sim.initUi())
    setDraft('')
    announced.current = false
    setMsgs([{ id: nextId.current++, role: 'bipi', text: 'Начнём с чистого листа! ' + def.intro, tone: 'intro' }])
    setVersion((v) => v + 1)
  }
  const scrollToPreview = () => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const groups: { name: string; blocks: PromptBlock[] }[] = []
  for (const b of def.blocks) {
    const g = groups.find((x) => x.name === b.group)
    if (g) g.blocks.push(b)
    else groups.push({ name: b.group, blocks: [b] })
  }

  const submitBtn = (cls = '') => (
    <button className={`btn btn-gold ${cls}`} onClick={() => onSubmit(sends, msgs.filter((m) => m.role === 'user').map((m) => m.text))}>
      Сдать домашку
    </button>
  )

  return (
    <div className="min-h-screen bg-white" data-homework={def.id} data-hw-busy={busy ? '1' : '0'}>
      <header className="sticky top-0 z-30 border-b-2 border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1480px] items-center gap-3 px-4 py-2.5 md:px-6">
          <button onClick={() => (sends ? setQuit(true) : navigate('/learn'))} className="rounded-xl p-1 text-[#B3ADC8] transition-colors hover:text-muted" aria-label="Закрыть домашку">
            <Cross size={28} />
          </button>
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white sm:flex" style={{ background: c.main, boxShadow: `0 3px 0 ${c.dark}` }}>
            <House size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-black uppercase tracking-wider text-muted sm:text-[12px]">
              Домашка · Раздел {unit.num} · {unit.title}
            </div>
            <div className="truncate text-[15px] font-black leading-tight sm:text-[17px]">{def.short}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2" aria-label={`Выполнено ${doneCount} из ${def.requirements.length}`}>
            <div className="progress-track hidden !h-[14px] w-[120px] sm:block">
              <div className="progress-fill bg-teal" style={{ width: `${Math.max((doneCount / def.requirements.length) * 100, 4)}%` }} />
            </div>
            <span className="text-[15px] font-black text-teal-dark">
              {doneCount}/{def.requirements.length}
            </span>
          </div>
          {allDone && submitBtn('btn-sm hidden md:inline-flex')}
        </div>
      </header>

      <div className="mx-auto grid max-w-[1480px] gap-4 px-4 py-4 md:px-6 md:py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:grid-cols-[290px_minmax(0,1fr)_minmax(0,1.12fr)] xl:gap-5">
        {/* ----- Задание, чек-лист, Бипи ----- */}
        <aside className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-1 xl:row-span-2">
          <section className="overflow-hidden rounded-[22px] border-2" style={{ borderColor: c.mid, boxShadow: `0 5px 0 ${c.mid}` }}>
            <div className="relative overflow-hidden px-4 pb-4 pt-3.5 text-white" style={{ background: c.main }}>
              <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/15" />
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-lg bg-white/25 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider">Домашка {def.num}</span>
                <span className="flex items-center gap-1 rounded-lg bg-white px-2 py-0.5 text-[12px] font-black" style={{ color: c.dark }}>
                  <Spark size={14} /> +{HOMEWORK_XP} ВП
                </span>
              </div>
              <h1 className="mt-2 text-[21px] font-black leading-tight">{def.title}</h1>
            </div>
            <p className="bg-white px-4 py-3.5 text-[14px] font-semibold leading-snug text-ink">{def.brief}</p>
          </section>

          <section className="card p-4" aria-label="Чек-лист требований">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[17px] font-black">Чек-лист</h2>
              <span className="text-[13px] font-extrabold text-muted">
                {doneCount} из {def.requirements.length}
              </span>
            </div>
            <ul className="space-y-2">
              {def.requirements.map((r) => {
                const ok = checks[r.id]
                return (
                  <li key={r.id} data-req={r.id} data-done={ok ? '1' : '0'} className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors duration-300 ${ok ? 'bg-teal-light' : ''}`}>
                    <span
                      key={ok ? 'y' : 'n'}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${ok ? 'anim-pop border-teal bg-teal text-white' : 'border-line bg-white'}`}
                    >
                      {ok && <Check size={14} />}
                    </span>
                    <span className={`text-[14px] font-bold leading-snug ${ok ? 'text-teal-dark' : 'text-ink'}`}>{r.label}</span>
                  </li>
                )
              })}
            </ul>
            {allDone && <div className="mt-3">{submitBtn('btn-block')}</div>}
          </section>

          <section className="card relative overflow-hidden bg-brand-light/40 p-4 pr-[92px]">
            <h3 className="text-[15px] font-black">Бипи подскажет</h3>
            <p className="mt-1 text-[13.5px] font-semibold leading-snug text-muted">
              {hint && firstMissing ? (sim.hint?.(state, ui, firstMissing.id) ?? firstMissing.hint) : allDone ? 'Ты справился! Можно ещё поиграть с промптами — или сдавай.' : 'Застрял? Нажми — подскажу, что добавить в промпт.'}
            </p>
            {!allDone && (
              <button className="mt-2 text-[13px] font-black uppercase tracking-wider text-brand hover:opacity-80" onClick={() => setHint((h) => !h)}>
                {hint ? 'Скрыть подсказку' : 'Подсказка'}
              </button>
            )}
            <Mascot size={86} mood={allDone ? 'happy' : 'think'} className="absolute -bottom-2 right-2" />
          </section>
        </aside>

        {/* ----- Рабочее место: чат и промпт ----- */}
        <section className="card flex min-w-0 flex-col overflow-hidden lg:col-start-1 lg:row-start-2 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:self-start" aria-label="Промпт для ИИ">
          <div className="flex items-center justify-between gap-2 border-b-2 border-line px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 whitespace-nowrap text-[16px] font-black">Чат с ИИ</span>
              <span className={`truncate rounded-full px-2 py-0.5 text-[11px] font-extrabold ${aiMode === 'on' ? 'bg-brand-light text-brand-dark' : 'bg-snow text-muted'}`} data-ai-mode={aiMode}>
                {aiMode === 'on' ? 'ИИ-ментор · онлайн' : 'симуляция · без интернета'}
              </span>
            </div>
            {sends > 0 && (
              <button onClick={restart} className="shrink-0 text-[12px] font-black uppercase tracking-wider text-muted hover:text-ink">
                ↺ Заново
              </button>
            )}
          </div>
          <div ref={chatRef} className="min-h-[170px] max-h-[380px] space-y-3 overflow-y-auto bg-snow/60 p-3.5 lg:max-h-[44vh]" data-chat>
            {msgs.map((m) => (
              <Bubble key={m.id} m={m} onPreview={scrollToPreview} onUseImproved={setDraft} />
            ))}
            {busy && <Thinking label={label} />}
          </div>
          <div className="border-t-2 border-line p-3.5">
            {sends > 0 && (
              <div className="mb-3">
                <div className="mb-1.5 text-[11px] font-black uppercase tracking-wider text-muted">Уточни</div>
                <div className="flex flex-wrap gap-1.5">
                  {def.followUps.map((f) => (
                    <button key={f} onClick={() => setDraft((d) => (d.trim() ? `${d.trimEnd()} ${f}.` : `${f}.`))} className="rounded-full border-2 border-line bg-white px-2.5 py-0.5 text-[12.5px] font-bold text-ink hover:bg-snow">
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-2 text-[11px] font-black uppercase tracking-wider text-muted">Собери из блоков</div>
            <div className="space-y-1.5" data-blocks>
              {groups.map((g) => (
                <div key={g.name} className="flex flex-wrap items-center gap-1.5">
                  <span className="w-[86px] shrink-0 text-[11.5px] font-extrabold" style={{ color: BLOCK_COLORS[g.blocks[0].color].dark }}>
                    {g.name}
                  </span>
                  {g.blocks.map((b) => (
                    <Chip key={b.label} block={b} active={draft.includes(b.text)} onClick={() => toggleBlock(b)} />
                  ))}
                </div>
              ))}
            </div>
            <label className="mb-1.5 mt-3 block text-[11px] font-black uppercase tracking-wider text-muted" htmlFor="hw-prompt">
              …или напиши сам
            </label>
            <textarea
              id="hw-prompt"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  send()
                }
              }}
              rows={4}
              placeholder={def.placeholder}
              className="input !h-auto min-h-[104px] resize-y !py-3 !text-[15px] leading-snug"
            />
            <div className="mt-2.5 flex items-center gap-2">
              <span className="hidden text-[12px] font-bold text-muted sm:inline">Ctrl + Enter</span>
              <button className="btn btn-ghost btn-sm ml-auto" disabled={!draft || busy} onClick={() => setDraft('')}>
                Очистить
              </button>
              <button className="btn btn-sm" disabled={!draft.trim() || busy} onClick={send}>
                {busy ? 'ИИ думает…' : 'Отправить ИИ'}
              </button>
            </div>
          </div>
        </section>

        {/* ----- Живое превью ----- */}
        <section ref={previewRef} className="min-w-0 scroll-mt-20 lg:col-start-2 lg:row-span-2 lg:row-start-1 xl:col-start-3" aria-label="Превью результата">
          <div className="lg:sticky lg:top-[78px]">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[17px] font-black">Превью</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider ${busy ? 'bg-gold-light text-[#8a6a1e]' : 'bg-teal-light text-teal-dark'}`}>{busy ? 'обновляется…' : 'вживую'}</span>
            </div>
            <div className={`transition-opacity duration-300 ${busy ? 'opacity-60' : ''}`}>
              <Preview state={state} ui={ui} setUi={setUi} insert={insert} version={version} />
            </div>
          </div>
        </section>
      </div>

      {allDone && (
        <div className="sticky bottom-0 z-20 border-t-2 border-line bg-white/95 p-3 backdrop-blur md:hidden">
          {submitBtn('btn-block')}
        </div>
      )}

      {quit && (
        <Modal>
          <Mascot mood="think" size={120} className="mx-auto" />
          <h2 className="mt-3 text-[22px] font-black">Уходишь с домашки?</h2>
          <p className="mb-6 mt-1 text-[16px] font-semibold text-muted">Диалог с ИИ не сохранится — придётся начать заново.</p>
          <button className="btn btn-block" onClick={() => setQuit(false)}>
            Продолжить
          </button>
          <button className="mt-4 w-full py-2 text-[15px] font-extrabold uppercase tracking-wider text-coral-dark hover:opacity-80" onClick={() => navigate('/learn')}>
            Выйти
          </button>
        </Modal>
      )}
    </div>
  )
}

function HomeworkDone({ def, iterations, again, onContinue }: { def: HomeworkDef; iterations: number; again: boolean; onContinue: () => void }) {
  const unit = UNITS.find((u) => u.id === def.unitId)!
  const c = UNIT_COLORS[unit.color]
  return (
    <div className="flex min-h-screen flex-col bg-white" data-homework-done={def.id}>
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        <Confetti />
        <div className="relative flex items-end">
          <Mascot mood="happy" size={170} className="anim-pop relative" />
          <div
            className="anim-pop relative -ml-6 mb-2 flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full border-[6px] border-white text-[44px]"
            style={{ background: c.main, boxShadow: `0 6px 0 ${c.dark}`, animationDelay: '.2s' }}
          >
            {def.badge.emoji}
          </div>
        </div>
        <div className="mt-4 text-[13px] font-extrabold uppercase tracking-wider text-muted">
          Раздел {unit.num} · {unit.title}
        </div>
        <h1 className="mt-1 text-[32px] font-black leading-tight text-brand md:text-[38px]">Домашка сдана!</h1>
        <p className="mt-1 max-w-[460px] text-[17px] font-semibold text-muted">
          <b className="text-ink">{def.title}</b> — готово. Новый значок: <b style={{ color: c.dark }}>«{def.badge.name}»</b>
        </p>
        <div className="mt-8 grid w-full max-w-[540px] grid-cols-3 gap-3 md:gap-4">
          {[
            { label: 'Вайб-поинты', value: `+${again ? 10 : HOMEWORK_XP}`, icon: <Spark size={26} />, color: '#FFB61D', edge: '#E5A100' },
            { label: 'Требования', value: `${def.requirements.length}/${def.requirements.length}`, icon: <Target size={24} />, color: '#13C2AE', edge: '#0E9C8C' },
            { label: 'Промптов', value: String(iterations), icon: <span className="text-[22px]">✨</span>, color: '#7C4DFF', edge: '#5B2FD6' },
          ].map((s) => (
            <div key={s.label} className="anim-pop rounded-[18px] border-2 p-[2px]" style={{ background: s.color, borderColor: s.color, boxShadow: `0 4px 0 ${s.edge}` } as CSSProperties}>
              <div className="px-2 pb-1.5 pt-1 text-center text-[11px] font-black uppercase tracking-wider text-white md:text-[13px]">{s.label}</div>
              <div className="flex items-center justify-center gap-1.5 rounded-[14px] bg-white py-4 text-[22px] font-black md:text-[24px]" style={{ color: s.color }}>
                {s.icon}
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="border-t-2 border-line">
        <div className="mx-auto flex max-w-[1040px] justify-end px-4 py-5 md:px-8 md:py-8">
          <button className="btn w-full md:w-[180px]" onClick={onContinue} autoFocus>
            Продолжить
          </button>
        </div>
      </footer>
    </div>
  )
}

const RUNNERS: Record<string, (def: HomeworkDef, onSubmit: (n: number, prompts: string[]) => void) => ReactNode> = {
  hw1: (def, onSubmit) => <Runner def={def} sim={cardSim} Preview={CardPreview} onSubmit={onSubmit} />,
  hw2: (def, onSubmit) => <Runner def={def} sim={landingSim} Preview={LandingPreview} onSubmit={onSubmit} />,
  hw3: (def, onSubmit) => <Runner def={def} sim={debugSim} Preview={TodoPreview} onSubmit={onSubmit} />,
  hw4: (def, onSubmit) => <Runner def={def} sim={formSim} Preview={FormPreview} onSubmit={onSubmit} />,
  hw5: (def, onSubmit) => <Runner def={def} sim={deploySim} Preview={DeployPreview} onSubmit={onSubmit} />,
}

export function HomeworkScreen({ id }: { id: string }) {
  const def = findHomework(id)
  const { session, progress, completeHomework } = useStore()
  const [done, setDone] = useState<{ iterations: number; again: boolean } | null>(null)

  if (!def || !RUNNERS[def.id])
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <Mascot mood="think" size={140} />
        <h1 className="text-[24px] font-black">Домашка не найдена</h1>
        <button className="btn" onClick={() => navigate('/learn')}>
          На главную
        </button>
      </div>
    )
  if (isUnitLocked(def.unitId, progress)) return <LockedScreen tier={tierOfUnit(def.unitId)} />
  if (done) return <HomeworkDone def={def} iterations={done.iterations} again={done.again} onContinue={() => continueAfter(progress, def.id)} />
  return RUNNERS[def.id](def, (iterations, prompts) => {
    const again = progress.homework.includes(def.id)
    // настоящий аккаунт: сохраняем сданную домашку (история промптов) — для аналитики и будущих проверок
    if (session?.real) void recordHomeworkSubmission(def.id, prompts, true)
    completeHomework(def.id, HOMEWORK_XP)
    setDone({ iterations, again })
    window.scrollTo(0, 0)
  })
}
