import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { UNIT_COLORS, type NodeKind, type Unit } from '../data/course'
import { HOMEWORK_XP } from '../data/homework'
import { currentNodeId, isNodeDone, isNodeReachable, unitNodes, type PathItem } from '../data/path'
import {
  TIERS,
  isTierComplete,
  isTierOpenByProgress,
  isTierPassedByTest,
  isTierUnlocked,
  pendingTierUp,
  tierItems,
  unitsOf,
  type Tier,
} from '../data/tiers'
import { LAST_LESSON_KEY, useStore } from '../store'
import { useToast } from '../components/Toast'
import { navigate } from '../router'
import { FIRST_LESSON_ID, isNewLearner } from '../flow'
import { Book, Check, Chest, Dumbbell, House, Lock, Star, Trophy } from '../components/Icons'
import { Mascot } from '../components/Mascot'
import { EXPLORE_ANCHOR, ExploreMore } from '../components/ExploreMore'
import { TierBadge } from '../components/TierBadge'
import { AgentArt, AiChatArt, BrowserArt, BugArt, DatabaseArt, DesignArt, PhoneArt, RocketArt } from '../components/Illustrations'
import { t } from '../i18n/core'
import { tx } from '../i18n/rich'


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
            <span>{t('x1jr1m8h', { num: unit.num, label })}</span>
            {unit.pro && (
              <span className="rounded-md bg-white/25 px-1.5 py-[1px] text-[11px] font-black tracking-wider text-white" title={t('x0cqe408')}>
                Pro
              </span>
            )}
          </div>
          <h2 className="truncate text-[21px] font-black leading-tight md:text-[23px]">{unit.title}</h2>
          <p className="mt-0.5 line-clamp-2 text-[14px] font-bold leading-snug text-white/85">{unit.description}</p>
        </div>
        {locked ? (
          <span className="flex shrink-0 items-center gap-2 rounded-2xl border-2 border-white/40 px-3 py-2.5 text-[13px] font-extrabold uppercase tracking-wider" aria-label={t('x09hg17m')}>
            <Lock size={20} />
            <span className="hidden sm:inline">{t('x0vqp3cx')}</span>
          </span>
        ) : (
          <button
            onClick={() => toast(t('x0xn1iho', { title: unit.title }))}
            className="flex shrink-0 items-center gap-2 rounded-2xl border-2 border-white/40 px-3 py-2.5 text-[13px] font-extrabold uppercase tracking-wider transition-colors hover:bg-white/10 md:px-4"
            aria-label={t('x14u0jyk', { title: unit.title })}
          >
            <Book size={20} />
            <span className="hidden sm:inline">{t('x0i1dkz3')}</span>
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

function PathNode({
  item,
  first,
  unit,
  state,
  offset,
  open,
  onToggle,
}: {
  item: PathItem
  first: boolean
  unit: Unit
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
  const nodeRef = useRef<HTMLDivElement>(null)
  // узел открыли у края экрана (под липким баннером раздела или нижней панелью) — ставим его в центр, чтобы карточка была видна целиком
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => nodeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 40)
    return () => window.clearTimeout(id)
  }, [open])

  let pop: ReactNode = null
  if (open && hw && !locked) {
    pop = (
      <Popover offset={offset} solid={!soft} color={c.main} border={c.mid}>
        <div className={`text-[12px] font-black uppercase tracking-wider ${soft ? 'text-muted' : 'text-white/75'}`}>{t('x0klzw38')}</div>
        <div className="mt-0.5 text-[18px] font-black leading-tight">{hw.title}</div>
        <div className={`mb-4 mt-1 text-[15px] font-bold ${soft ? 'text-muted' : 'text-white/80'}`}>
          {state === 'done' ? t('x1abu6o4', { name: hw.badge.name, emoji: hw.badge.emoji }) : t('x1129dql', { length: hw.requirements.length })}
        </div>
        <button
          className={`btn btn-block ${soft ? '' : 'btn-white'}`}
          style={soft ? ({ '--c': c.main, '--e': c.dark } as CSSProperties) : { color: c.main }}
          onClick={() => navigate(`/homework/${hw.id}`)}
        >
          {state === 'done' ? t('x1al1xcn') : t('x0vp3igd', { HOMEWORK_XP })}
        </button>
      </Popover>
    )
  } else if (open && !locked && item.type === 'lesson') {
    const lesson = item.lesson
    const label = isReward(lesson.kind) ? t('x12zyds7') : t('x06td5dg', { v: item.index + 1, lessonCount })
    pop = (
      <Popover offset={offset} solid={!soft} color={c.main} border={c.mid}>
        <div className="text-[18px] font-black leading-tight">{lesson.title}</div>
        <div className={`mb-4 mt-1 text-[15px] font-bold ${soft ? 'text-muted' : 'text-white/80'}`}>
          {state === 'done' ? t('x1ohea2y') : t('x07lcnjn', { label, length: lesson.exercises.length })}
        </div>
        {soft ? (
          <button className="btn btn-block" style={{ '--c': c.main, '--e': c.dark } as CSSProperties} onClick={() => navigate(`/lesson/${lesson.id}`)}>{t('x1jn8q2x')}</button>
        ) : (
          <button className="btn btn-white btn-block" style={{ color: c.main }} onClick={() => navigate(`/lesson/${lesson.id}`)}>
            {state === 'done' ? t('x1j8rthb') : t('x1jn8q2x')}
          </button>
        )}
      </Popover>
    )
  }

  const title = hw ? t('x0a5c8tb', { short: hw.short }) : item.type === 'lesson' ? item.lesson.title : ''
  return (
    <div
      ref={nodeRef}
      data-lesson={item.id}
      data-node={hw ? 'homework' : 'lesson'}
      data-locked={locked ? '1' : undefined}
      data-state={state}
      className={`relative ${open ? 'z-[25]' : ''} ${first ? '' : state === 'current' ? 'mt-14' : hw ? 'mt-8' : 'mt-6'}`}
      style={{ transform: `translateX(${offset}px)` }}
    >
      {state === 'current' && (
        <div
          className="anim-bob pointer-events-none absolute -top-[54px] left-1/2 z-[5] whitespace-nowrap rounded-xl border-2 border-line bg-white px-3.5 py-2 text-[15px] font-black uppercase tracking-wider"
          style={{ color: c.main }}
        >
          {hw ? t('x1b55y4z') : t('x1y49sih')}
          <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-line bg-white" />
        </div>
      )}
      <div className="relative">
        {state === 'current' && (
          <span className={`pointer-events-none absolute -inset-[11px] border-[7px] ${hw ? 'rounded-[30px]' : 'rounded-full'}`} style={{ borderColor: c.mid, animation: 'ring-pulse 2s ease-in-out infinite' }} />
        )}
        <button
          onClick={onToggle}
          aria-label={locked ? t('x0liqy8t', { title }) : title}
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
          >{tx('x0rld579', { v: state === 'done' ? ' ✓' : '' })}</span>
        )}
      </div>
      {hw && <div className="h-6" />}
      {pop}
    </div>
  )
}

const ARTS: Record<string, ReactNode> = {
  u1: <Mascot size={150} className="anim-float w-[88px] min-[360px]:w-[104px] sm:w-[150px]" />,
  u2: <BrowserArt size={170} className="w-[88px] min-[360px]:w-[110px] sm:w-[170px]" />,
  u3: <BugArt size={170} className="w-[88px] min-[360px]:w-[110px] sm:w-[170px]" />,
  u4: <DatabaseArt size={170} className="w-[88px] min-[360px]:w-[110px] sm:w-[170px]" />,
  u5: <RocketArt size={170} className="anim-float w-[88px] min-[360px]:w-[110px] sm:w-[170px]" />,
  u6: <DesignArt size={170} className="w-[88px] min-[360px]:w-[110px] sm:w-[170px]" />,
  u7: <PhoneArt size={170} className="anim-float w-[88px] min-[360px]:w-[110px] sm:w-[170px]" />,
  u8: <AiChatArt size={170} className="w-[88px] min-[360px]:w-[110px] sm:w-[170px]" />,
  u9: <AgentArt size={170} className="w-[88px] min-[360px]:w-[110px] sm:w-[170px]" />,
}

function UnitArt({ unit, dir, locked }: { unit: Unit; dir: number; locked: boolean }) {
  // Иллюстрация стоит с той стороны, куда «змейка» не уходит в начале раздела
  const side = dir === 1 ? 'left' : 'right'
  const art = ARTS[unit.id] ?? <Mascot size={150} className="w-[88px] min-[360px]:w-[104px] sm:w-[150px]" />
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
      <div className="relative max-w-[230px] rounded-2xl border-2 border-line bg-white px-3.5 py-2.5 text-[14px] font-bold leading-snug text-ink">{tx('x1bo80fq', { title: next.title }, [(chunk) => <b style={{ color: c.dark }}>{chunk}</b>])}</div>
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
  const status = complete ? t('x1gyh9b2') : byTest ? t('x0uzej6s') : openFair ? t('x121hzbq') : open ? t('x08qbke9') : t('x0vqp3cx')
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
            <span>{t('x1vbkjkz', { num: tier.num })}</span>
            <span className={`rounded-full px-2 py-0.5 ${open ? 'bg-white' : 'bg-line'}`}>
              {!open && <Lock size={11} className="-mt-0.5 mr-1 inline" />}
              {status}
            </span>
          </div>
          <h2 className="text-[28px] font-black leading-tight md:text-[32px]">{tier.name}</h2>
          <p className="mt-0.5 text-[14px] font-bold leading-snug text-muted">{tx('x1knv19l', { v: units.map((u) => u.num).join('–'), v2: units.map((u) => u.title).join(' · ') })}</p>
        </div>
      </div>
      <div className="relative mt-4 rounded-2xl bg-white/80 px-4 py-3">
        <div className="text-[12px] font-black uppercase tracking-wider text-muted">{t('x01rxjb2')}</div>
        <div className="mt-0.5 text-[16px] font-extrabold leading-snug">{tier.outcome}</div>
      </div>
      {open ? (
        <div className="relative mt-4 flex items-center gap-3">
          <div className="progress-track !h-[14px] flex-1 !bg-white">
            <div className="progress-fill" style={{ width: `${Math.max((done / items.length) * 100, 4)}%`, background: c.main }} />
          </div>
          <span className="shrink-0 text-[13px] font-extrabold text-muted">{tx('x0btwvc6', { done, length: items.length }, [(chunk) => <b className="text-ink">{chunk}</b>])}</span>
        </div>
      ) : (
        <div className="relative mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 text-[14px] font-bold text-muted">{tx('path.tierBannerLocked', { name: prev?.name, prevDone, length: prevItems.length }, [(chunk) => <b className="text-ink">{chunk}</b>])}</div>
        </div>
      )}
    </section>
  )
}

/** Новичок: один большой понятный шаг вместо длинного пути */
function FirstLessonCta() {
  return (
    <div className="mb-5 flex flex-col items-center rounded-[24px] border-2 border-brand-mid bg-brand-light/60 px-5 pb-5 pt-4 text-center" data-first-cta>
      <Mascot mood="happy" size={96} />
      <div className="mt-1 text-[12px] font-black uppercase tracking-wider text-brand">{t('first.kicker')}</div>
      <h2 className="mt-0.5 text-[24px] font-black leading-tight">{t('first.title')}</h2>
      <p className="mt-1 max-w-[420px] text-[15px] font-semibold leading-snug text-muted">{t('first.body')}</p>
      <button className="btn btn-block mt-4 !min-h-[56px] !text-[17px]" onClick={() => navigate(`/lesson/${FIRST_LESSON_ID}`)} autoFocus data-first-start>
        {t('first.btn')}
      </button>
    </div>
  )
}

export function Home() {
  const { progress } = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const current = currentNodeId(progress)
  const toast = useToast()

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
    el?.scrollIntoView({ block: last.startsWith('tier-') || last === EXPLORE_ANCHOR ? 'start' : 'center' })
  }, [])

  let ui = 0
  return (
    <div className="mx-auto max-w-[600px]">
      {isNewLearner(progress) && <FirstLessonCta />}
      {openId && <div className="fixed inset-0 z-[15]" onClick={() => setOpenId(null)} />}
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
              const label = locked ? t('x1ys55r5') : cur ? (cur.type === 'homework' ? t('x1b55y4z') : t('x00adsxa', { v: cur.index + 1 })) : `${doneCount}/${nodes.length}`
              const next = units[k + 1]
              return (
                <section key={unit.id} className={k > 0 ? 'mt-6' : ''}>
                  <UnitBanner unit={unit} label={label} locked={locked} />
                  <div className="relative flex flex-col items-center pb-16 pt-14">
                    <UnitArt unit={unit} dir={dir} locked={locked} />
                    {nodes.map((item, i) => {
                      const state: NodeState = locked || !isNodeReachable(item.id, progress) ? 'locked' : isNodeDone(item, progress) ? 'done' : item.id === current ? 'current' : 'upcoming'
                      return (
                        <PathNode
                          key={item.id}
                          item={item}
                          first={i === 0}
                          unit={unit}
                          state={state}
                          offset={OFFSETS[i % OFFSETS.length] * dir}
                          open={openId === item.id}
                          onToggle={() => {
                            // закрытый уровень не открывается: только подсказка, что сначала нужен предыдущий
                            if (state === 'locked') {
                              setOpenId(null)
                              toast(t('path.locked'))
                              return
                            }
                            setOpenId((o) => (o === item.id ? null : item.id))
                          }}
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
      <ExploreMore />
    </div>
  )
}
