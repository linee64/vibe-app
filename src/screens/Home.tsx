import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { UNITS, UNIT_COLORS, type NodeKind, type Unit } from '../data/course'
import { HOMEWORK_XP } from '../data/homework'
import { currentNodeId, isNodeDone, unitNodes, type PathItem } from '../data/path'
import {
  SOON_TOPICS,
  TIERS,
  isTierComplete,
  isTierOpenByProgress,
  isTierPassedByTest,
  isTierUnlocked,
  pendingTierUp,
  tierItems,
  tierNodeProgress,
  unitsOf,
  type Tier,
} from '../data/tiers'
import { LAST_LESSON_KEY, useStore } from '../store'
import { useToast } from '../components/Toast'
import { navigate } from '../router'
import { Book, Check, Chest, Dumbbell, House, Lock, Star, Trophy } from '../components/Icons'
import { Mascot } from '../components/Mascot'
import { TierBadge } from '../components/TierBadge'
import { BrowserArt, BugArt, DatabaseArt, RocketArt } from '../components/Illustrations'

/**
 * done — пройден, current — следующий по порядку, upcoming — впереди (открыт),
 * locked — тир закрыт: узел серый с замком, по нажатию — подсказка, как открыть.
 */
type NodeState = 'done' | 'current' | 'upcoming' | 'locked'

/** «Змейка» пути: узлы плавно уходят вправо и обратно, как в Duolingo */
const OFFSETS = [0, 44, 72, 44, 0, -44, -72, -44]

const isReward = (kind: NodeKind) => kind === 'chest' || kind === 'trophy'
const LOCK = { bg: '#ECE9F4', edge: '#D6D1E4', icon: '#B5B0C8' }

function KindIcon({ kind, size }: { kind: NodeKind | 'homework'; size: number }) {
  switch (kind) {
    case 'homework':
      return <House size={size} />
    case 'book':
      return <Book size={size} />
    case 'dumbbell':
      return <Dumbbell size={size} />
    case 'chest':
      return <Chest size={size} />
    case 'trophy':
      return <Trophy size={size} />
    default:
      return <Star size={size} />
  }
}

function UnitBanner({ unit, label, locked }: { unit: Unit; label: string; locked: boolean }) {
  const c = UNIT_COLORS[unit.color]
  const toast = useToast()
  return (
    // Обёртка с белым фоном закрывает узлы, которые прокручиваются над «прилипшим» баннером
    <div id={`unit-${unit.id}`} className="sticky top-[62px] z-20 bg-white md:top-0 md:-mt-5 md:pt-5">
      <div
        className="flex items-center justify-between gap-3 rounded-[20px] px-5 py-4 text-white"
        style={{ background: locked ? '#B9B3CC' : c.main, boxShadow: `0 5px 0 ${locked ? '#A39DBA' : c.dark}` }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-extrabold uppercase tracking-wider text-white/80">
            <span>
              Раздел {unit.num} · {label}
            </span>
            {unit.pro && (
              <span className="rounded-md bg-white/25 px-1.5 py-[1px] text-[11px] font-black tracking-wider text-white" title="Раздел из тарифа Pro — в демо открыт бесплатно">
                Pro
              </span>
            )}
          </div>
          <h2 className="truncate text-[21px] font-black leading-tight md:text-[23px]">{unit.title}</h2>
          <p className="mt-0.5 line-clamp-2 text-[14px] font-bold leading-snug text-white/85">{unit.description}</p>
        </div>
        {locked ? (
          <span className="flex shrink-0 items-center gap-2 rounded-2xl border-2 border-white/40 px-3 py-2.5 text-[13px] font-extrabold uppercase tracking-wider" aria-label="Раздел закрыт">
            <Lock size={20} />
            <span className="hidden sm:inline">Закрыт</span>
          </span>
        ) : (
          <button
            onClick={() => toast(`Руководство «${unit.title}» скоро появится 📘`)}
            className="flex shrink-0 items-center gap-2 rounded-2xl border-2 border-white/40 px-3 py-2.5 text-[13px] font-extrabold uppercase tracking-wider transition-colors hover:bg-white/10 md:px-4"
            aria-label={`Руководство по разделу «${unit.title}»`}
          >
            <Book size={20} />
            <span className="hidden sm:inline">Руководство</span>
          </button>
        )}
      </div>
    </div>
  )
}

/** Попап узла: стрелочка + карточка, сдвинутая так, чтобы оставаться по центру колонки */
function Popover({ offset, solid, color, border, children }: { offset: number; solid: boolean; color: string; border: string; children: ReactNode }) {
  return (
    // позиционирование и анимация на разных элементах: у .anim-pop fill-mode both, и его transform перекрыл бы translateX
    <div className="absolute left-1/2 top-[calc(100%+18px)] z-[16] w-[280px] max-w-[calc(100vw-24px)]" style={{ transform: `translateX(calc(-50% - ${offset}px))` }}>
      <div className="anim-pop relative origin-top">
      <div
        className="absolute -top-2 h-5 w-5 rotate-45 rounded-[4px]"
        style={{ left: `calc(50% + ${offset}px - 10px)`, background: solid ? color : '#fff', border: solid ? undefined : `2px solid ${border}`, borderRight: 'none', borderBottom: 'none' }}
      />
      <div className={`relative rounded-[20px] p-4 ${solid ? 'text-white' : 'border-2 bg-white text-ink'}`} style={solid ? { background: color } : { borderColor: border }}>
        {children}
      </div>
      </div>
    </div>
  )
}

function LockedPop({ tier }: { tier: Tier }) {
  const { progress } = useStore()
  const prev = TIERS[TIERS.findIndex((t) => t.id === tier.id) - 1]
  const items = tierItems(prev, progress)
  const done = items.filter((i) => i.done).length
  const nodes = tierNodeProgress(prev, progress)
  return (
    <>
      <div className="flex items-center gap-2 text-[18px] font-black leading-tight">
        <Lock size={20} className="shrink-0 text-muted" /> Заверши тир {prev.name}, чтобы открыть
      </div>
      <div className="mb-1.5 mt-3 flex items-center justify-between text-[13px] font-extrabold text-muted">
        <span>Итоговые тесты и домашки</span>
        <span className="text-ink">
          {done}/{items.length}
        </span>
      </div>
      <div className="progress-track !h-[12px]">
        <div className="progress-fill bg-brand" style={{ width: `${Math.max((done / items.length) * 100, 4)}%` }} />
      </div>
      <div className="mt-1.5 text-[12px] font-bold text-muted">
        Всего узлов тира: {nodes.done}/{nodes.total}
      </div>
      <button className="btn btn-block mt-4" onClick={() => navigate(`/placement/${tier.id}`)}>
        Тест на уровень
      </button>
    </>
  )
}

function PathNode({
  item,
  first,
  unit,
  tier,
  state,
  offset,
  open,
  onToggle,
}: {
  item: PathItem
  first: boolean
  unit: Unit
  tier: Tier
  state: NodeState
  offset: number
  open: boolean
  onToggle: () => void
}) {
  const c = UNIT_COLORS[unit.color]
  const hw = item.type === 'homework' ? item.hw : null
  const kind: NodeKind | 'homework' = hw ? 'homework' : item.type === 'lesson' ? item.lesson.kind : 'star'
  const locked = state === 'locked'
  const soft = state === 'upcoming'
  const golden = state === 'done' && (hw || (kind !== 'homework' && isReward(kind)))
  const bg = locked ? LOCK.bg : soft ? c.light : golden ? '#FFC23D' : c.main
  const edge = locked ? LOCK.edge : soft ? c.mid : golden ? '#E5A100' : c.dark
  const iconColor = locked ? LOCK.icon : soft ? c.mid : '#fff'
  const lessonCount = unit.lessons.length

  let pop: ReactNode = null
  if (open && locked) {
    pop = (
      <Popover offset={offset} solid={false} color="#fff" border={LOCK.edge}>
        <LockedPop tier={tier} />
      </Popover>
    )
  } else if (open && hw) {
    pop = (
      <Popover offset={offset} solid={!soft} color={c.main} border={c.mid}>
        <div className={`text-[12px] font-black uppercase tracking-wider ${soft ? 'text-muted' : 'text-white/75'}`}>Домашка · мини-проект</div>
        <div className="mt-0.5 text-[18px] font-black leading-tight">{hw.title}</div>
        <div className={`mb-4 mt-1 text-[15px] font-bold ${soft ? 'text-muted' : 'text-white/80'}`}>
          {state === 'done' ? `Сдано! Значок «${hw.badge.name}» ${hw.badge.emoji}` : `Промпт → ИИ → живое превью · ${hw.requirements.length} требований`}
        </div>
        <button
          className={`btn btn-block ${soft ? '' : 'btn-white'}`}
          style={soft ? ({ '--c': c.main, '--e': c.dark } as CSSProperties) : { color: c.main }}
          onClick={() => navigate(`/homework/${hw.id}`)}
        >
          {state === 'done' ? 'Открыть снова +10 XP' : `Открыть +${HOMEWORK_XP} XP`}
        </button>
      </Popover>
    )
  } else if (open && item.type === 'lesson') {
    const lesson = item.lesson
    const label = isReward(lesson.kind) ? 'Итоговый тест раздела' : `Урок ${item.index + 1} из ${lessonCount}`
    pop = (
      <Popover offset={offset} solid={!soft} color={c.main} border={c.mid}>
        <div className="text-[18px] font-black leading-tight">{lesson.title}</div>
        <div className={`mb-4 mt-1 text-[15px] font-bold ${soft ? 'text-muted' : 'text-white/80'}`}>
          {state === 'done' ? 'Пройдено! Можно повторить' : `${label} · ${lesson.exercises.length} заданий`}
        </div>
        {soft ? (
          <button className="btn btn-block" style={{ '--c': c.main, '--e': c.dark } as CSSProperties} onClick={() => navigate(`/lesson/${lesson.id}`)}>
            Начать +15 XP
          </button>
        ) : (
          <button className="btn btn-white btn-block" style={{ color: c.main }} onClick={() => navigate(`/lesson/${lesson.id}`)}>
            {state === 'done' ? 'Повторить +5 XP' : 'Начать +15 XP'}
          </button>
        )}
      </Popover>
    )
  }

  const title = hw ? `Домашка: ${hw.short}` : item.type === 'lesson' ? item.lesson.title : ''
  return (
    <div
      data-lesson={item.id}
      data-node={hw ? 'homework' : 'lesson'}
      data-locked={locked ? '1' : undefined}
      className={`relative ${open ? 'z-[16]' : ''} ${first ? '' : state === 'current' ? 'mt-14' : hw ? 'mt-8' : 'mt-6'}`}
      style={{ transform: `translateX(${offset}px)` }}
    >
      {state === 'current' && (
        <div
          className="anim-bob pointer-events-none absolute -top-[54px] left-1/2 z-[5] whitespace-nowrap rounded-xl border-2 border-line bg-white px-3.5 py-2 text-[15px] font-black uppercase tracking-wider"
          style={{ color: c.main }}
        >
          {hw ? 'Домашка' : 'Начать'}
          <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-line bg-white" />
        </div>
      )}
      <div className="relative">
        {state === 'current' && (
          <span className={`pointer-events-none absolute -inset-[11px] border-[7px] ${hw ? 'rounded-[30px]' : 'rounded-full'}`} style={{ borderColor: c.mid, animation: 'ring-pulse 2s ease-in-out infinite' }} />
        )}
        <button
          onClick={onToggle}
          aria-label={locked ? `${title} — закрыто` : title}
          aria-expanded={open}
          className={`relative flex items-center justify-center transition-[transform,box-shadow] duration-75 active:translate-y-[6px] ${hw ? 'h-[72px] w-[84px] rounded-[24px]' : 'h-[66px] w-[72px] rounded-[50%]'}`}
          style={{ background: bg, boxShadow: `0 8px 0 ${edge}`, color: iconColor }}
          onMouseDown={(e) => (e.currentTarget.style.boxShadow = `0 2px 0 ${edge}`)}
          onMouseUp={(e) => (e.currentTarget.style.boxShadow = `0 8px 0 ${edge}`)}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 8px 0 ${edge}`)}
        >
          <span className={`absolute left-[14px] top-[8px] h-[10px] w-[22px] -rotate-12 rounded-full ${soft || locked ? 'bg-white/60' : 'bg-white/25'}`} />
          {locked ? <Lock size={28} /> : state === 'done' && kind !== 'homework' && !isReward(kind) ? <Check size={34} /> : <KindIcon kind={kind} size={hw ? 38 : 32} />}
        </button>
        {hw && (
          <span
            className="pointer-events-none absolute -bottom-[30px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider"
            style={locked ? { background: '#F2F0F7', color: LOCK.icon } : { background: c.light, color: c.dark }}
          >
            Домашка{state === 'done' ? ' ✓' : ''}
          </span>
        )}
      </div>
      {hw && <div className="h-6" />}
      {pop}
    </div>
  )
}

const ARTS: Record<string, ReactNode> = {
  u1: <Mascot size={150} className="anim-float w-[104px] sm:w-[150px]" />,
  u2: <BrowserArt size={170} className="w-[110px] sm:w-[170px]" />,
  u3: <BugArt size={170} className="w-[110px] sm:w-[170px]" />,
  u4: <DatabaseArt size={170} className="w-[110px] sm:w-[170px]" />,
  u5: <RocketArt size={170} className="anim-float w-[110px] sm:w-[170px]" />,
}

function UnitArt({ unit, dir, locked }: { unit: Unit; dir: number; locked: boolean }) {
  // Иллюстрация стоит с той стороны, куда «змейка» не уходит в начале раздела
  const side = dir === 1 ? 'left' : 'right'
  const art = ARTS[unit.id] ?? <Mascot size={150} className="w-[104px] sm:w-[150px]" />
  return (
    <div
      className={`pointer-events-none absolute top-[130px] ${locked ? 'opacity-40 grayscale' : ''}`}
      style={side === 'left' ? { right: 'calc(50% + 66px)' } : { left: 'calc(50% + 66px)' }}
    >
      {art}
    </div>
  )
}

/** Бипи между разделами: подбадривает и показывает, что дальше */
function Interlude({ next, dir }: { next: Unit; dir: number }) {
  const c = UNIT_COLORS[next.color]
  return (
    <div className={`-mt-8 mb-10 flex items-center gap-3 ${dir === 1 ? 'justify-end pr-2 sm:pr-10' : 'justify-start pl-2 sm:pl-10'}`}>
      {dir === -1 && <Mascot mood="happy" size={70} className="shrink-0" />}
      <div className="relative max-w-[230px] rounded-2xl border-2 border-line bg-white px-3.5 py-2.5 text-[14px] font-bold leading-snug text-ink">
        Дальше: <b style={{ color: c.dark }}>{next.title}</b>
      </div>
      {dir === 1 && <Mascot mood="happy" size={70} className="shrink-0" />}
    </div>
  )
}

/** Большой баннер тира перед группой разделов */
function TierBanner({ tier }: { tier: Tier }) {
  const { progress } = useStore()
  const c = UNIT_COLORS[tier.color]
  const open = isTierUnlocked(tier, progress)
  const openFair = isTierOpenByProgress(tier, progress)
  const complete = isTierComplete(tier, progress)
  const byTest = isTierPassedByTest(tier, progress)
  const items = tierItems(tier, progress)
  const done = items.filter((i) => i.done).length
  const prev = TIERS[TIERS.findIndex((t) => t.id === tier.id) - 1]
  const prevItems = prev ? tierItems(prev, progress) : []
  const prevDone = prevItems.filter((i) => i.done).length
  const units = unitsOf(tier)
  const status = complete ? 'Пройден ✓' : byTest ? 'Засчитан тестом ✓' : openFair ? 'Открыт' : open ? 'Открыт в демо' : 'Закрыт'
  return (
    <section
      id={`tier-${tier.id}`}
      data-tier={tier.id}
      data-tier-locked={open ? '0' : '1'}
      className="relative mb-6 scroll-mt-24 overflow-hidden rounded-[26px] border-2 p-5 sm:p-6"
      style={{ borderColor: open ? c.mid : '#E7E3F1', background: open ? c.light : '#F7F5FC', boxShadow: `0 6px 0 ${open ? c.mid : '#E7E3F1'}` }}
    >
      <span className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/50" />
      <div className="relative flex items-start gap-4">
        <TierBadge tier={tier} size={76} locked={!open} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-black uppercase tracking-wider" style={{ color: open ? c.dark : '#8C86A3' }}>
            <span>Тир {tier.num}</span>
            <span className={`rounded-full px-2 py-0.5 ${open ? 'bg-white' : 'bg-line'}`}>
              {!open && <Lock size={11} className="-mt-0.5 mr-1 inline" />}
              {status}
            </span>
          </div>
          <h2 className="text-[28px] font-black leading-tight md:text-[32px]">{tier.name}</h2>
          <p className="mt-0.5 text-[14px] font-bold leading-snug text-muted">
            Разделы {units.map((u) => u.num).join('–')}: {units.map((u) => u.title).join(' · ')}
          </p>
        </div>
      </div>
      <div className="relative mt-4 rounded-2xl bg-white/80 px-4 py-3">
        <div className="text-[12px] font-black uppercase tracking-wider text-muted">После тира ты сможешь</div>
        <div className="mt-0.5 text-[16px] font-extrabold leading-snug">{tier.outcome}</div>
      </div>
      {open ? (
        <div className="relative mt-4 flex items-center gap-3">
          <div className="progress-track !h-[14px] flex-1 !bg-white">
            <div className="progress-fill" style={{ width: `${Math.max((done / items.length) * 100, 4)}%`, background: c.main }} />
          </div>
          <span className="shrink-0 text-[13px] font-extrabold text-muted">
            Тесты и домашки: <b className="text-ink">{done}/{items.length}</b>
          </span>
        </div>
      ) : (
        <div className="relative mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 text-[14px] font-bold text-muted">
            Заверши тир {prev?.name}: <b className="text-ink">{prevDone}/{prevItems.length}</b> — итоговые тесты и домашки. Уже умеешь? Пройди тест.
          </div>
          <button className="btn btn-sm shrink-0" style={{ '--c': c.main, '--e': c.dark } as CSSProperties} onClick={() => navigate(`/placement/${tier.id}`)}>
            Тест на уровень
          </button>
        </div>
      )}
    </section>
  )
}

/** Тизер будущих разделов после последнего тира */
function SoonCard() {
  const toast = useToast()
  return (
    <section id="tier-soon" className="relative mb-10 overflow-hidden rounded-[26px] border-2 border-dashed border-brand-mid bg-snow p-5 sm:p-6" data-soon>
      <div className="flex items-center gap-4">
        <Mascot mood="think" size={84} className="shrink-0" />
        <div className="min-w-0">
          <div className="text-[12px] font-black uppercase tracking-wider text-brand">Скоро</div>
          <h3 className="text-[22px] font-black leading-tight">Новые разделы уже в работе</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {SOON_TOPICS.map((t, i) => (
              <span key={t} className="rounded-full px-3 py-1 text-[14px] font-extrabold text-white" style={{ background: i === 0 ? '#7C4DFF' : '#FF7A59' }}>
                {i === 0 ? '🤖 ' : '💳 '}
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <button className="btn btn-ghost btn-sm mt-4 w-full sm:w-auto" onClick={() => toast('Напомним, когда появятся новые разделы 🔔')}>
        Напомнить о новых разделах
      </button>
    </section>
  )
}

/** Первый вход: предложение пройти «Тест на уровень» (необязательно, можно пропустить) */
function FirstRun() {
  const { setPlacementSeen } = useStore()
  const mid = TIERS[1]
  return (
    <section className="anim-fade-up relative mb-6 overflow-hidden rounded-[24px] bg-brand p-5 text-white shadow-[0_5px_0_#5B2FD6]" data-first-run>
      <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="relative flex items-center gap-4">
        <Mascot size={70} mood="happy" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[19px] font-black leading-tight">Уже пробовал вайб-кодинг?</h3>
          <p className="mt-1 text-[14px] font-semibold leading-snug text-white/85">Пройди тест из 8 вопросов — и начни сразу с тира «{mid.name}». Это по желанию.</p>
        </div>
      </div>
      <div className="relative mt-4 flex gap-2">
        <button className="btn btn-sm flex-1 border-2 border-white/40" style={{ '--c': 'transparent', '--e': 'transparent' } as CSSProperties} onClick={setPlacementSeen}>
          Пропустить
        </button>
        <button
          className="btn btn-white btn-sm flex-1"
          onClick={() => {
            setPlacementSeen()
            navigate(`/placement/${mid.id}`)
          }}
        >
          Пройти тест
        </button>
      </div>
    </section>
  )
}

export function Home() {
  const { progress } = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const current = currentNodeId(progress)
  const totalLessons = UNITS.reduce((n, u) => n + u.lessons.length, 0)
  const doneLessons = UNITS.reduce((n, u) => n + u.lessons.filter((l) => progress.completed.includes(l.id)).length, 0)
  const showFirstRun = !progress.placementSeen && !progress.unlockAll && !isTierOpenByProgress(TIERS[1], progress)

  // Esc закрывает попап урока
  useEffect(() => {
    if (!openId) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenId(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId])

  // Тир пройден, а праздника ещё не было (например, вернулись по ссылке) — показываем экран «Новый тир!»
  useEffect(() => {
    const t = pendingTierUp(progress)
    if (t) navigate(`/tier-up/${t.id}`)
  }, [progress])

  // Вернулись из урока/домашки/теста — прокручиваем путь к узлу или баннеру тира
  useEffect(() => {
    const last = sessionStorage.getItem(LAST_LESSON_KEY)
    if (!last) return
    sessionStorage.removeItem(LAST_LESSON_KEY)
    const el = document.querySelector(`[data-lesson="${last}"]`) ?? document.getElementById(last)
    el?.scrollIntoView({ block: last.startsWith('tier-') ? 'start' : 'center' })
  }, [])

  let ui = 0
  return (
    <div className="mx-auto max-w-[600px]">
      {openId && <div className="fixed inset-0 z-[15]" onClick={() => setOpenId(null)} />}
      {showFirstRun && <FirstRun />}
      {TIERS.map((tier, ti) => {
        const locked = !isTierUnlocked(tier, progress)
        const units = unitsOf(tier)
        return (
          <div key={tier.id} className={ti > 0 ? 'mt-4' : ''}>
            <TierBanner tier={tier} />
            {units.map((unit, k) => {
              const dir = ui++ % 2 === 0 ? 1 : -1
              const nodes = unitNodes(unit)
              const doneCount = nodes.filter((n) => isNodeDone(n, progress)).length
              const cur = nodes.find((n) => n.id === current)
              const label = locked ? 'закрыт' : cur ? (cur.type === 'homework' ? 'Домашка' : `Урок ${cur.index + 1}`) : `${doneCount}/${nodes.length}`
              const next = units[k + 1]
              return (
                <section key={unit.id} className={k > 0 ? 'mt-6' : ''}>
                  <UnitBanner unit={unit} label={label} locked={locked} />
                  <div className="relative flex flex-col items-center pb-16 pt-14">
                    <UnitArt unit={unit} dir={dir} locked={locked} />
                    {nodes.map((item, i) => {
                      const state: NodeState = locked ? 'locked' : isNodeDone(item, progress) ? 'done' : item.id === current ? 'current' : 'upcoming'
                      return (
                        <PathNode
                          key={item.id}
                          item={item}
                          first={i === 0}
                          unit={unit}
                          tier={tier}
                          state={state}
                          offset={OFFSETS[i % OFFSETS.length] * dir}
                          open={openId === item.id}
                          onToggle={() => setOpenId((o) => (o === item.id ? null : item.id))}
                        />
                      )
                    })}
                  </div>
                  {next && <Interlude next={next} dir={dir} />}
                </section>
              )
            })}
          </div>
        )
      })}
      <SoonCard />
      <div className="flex flex-col items-center gap-3 pb-6 text-center">
        <div className="flex items-center gap-3 text-[13px] font-extrabold uppercase tracking-wider text-[#b5b0c8]">
          <span className="h-[2px] w-12 bg-line" /> Финиш <span className="h-[2px] w-12 bg-line" />
        </div>
        <Mascot mood={doneLessons >= totalLessons ? 'happy' : 'think'} size={96} />
        <h3 className="text-[20px] font-black">
          Пройдено {doneLessons} из {totalLessons} уроков · домашек {progress.homework.length} из {UNITS.length}
        </h3>
        <p className="max-w-[360px] text-[15px] font-semibold text-muted">Пройди все три тира — и твой первый проект будет в сети.</p>
      </div>
    </div>
  )
}
