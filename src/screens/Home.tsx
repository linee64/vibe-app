import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { UNITS, UNIT_COLORS, currentLessonId, type Lesson, type NodeKind, type Unit } from '../data/course'
import { LAST_LESSON_KEY, useStore } from '../store'
import { useToast } from '../components/Toast'
import { navigate } from '../router'
import { Book, Check, Chest, Dumbbell, Star, Trophy } from '../components/Icons'
import { Mascot } from '../components/Mascot'
import { BrowserArt, BugArt, DatabaseArt, RocketArt } from '../components/Illustrations'

/** done — пройден, current — следующий по порядку, upcoming — ещё впереди (но открыт: в MVP ничего не блокируем) */
type NodeState = 'done' | 'current' | 'upcoming'

/** «Змейка» пути: узлы плавно уходят вправо и обратно, как в Duolingo */
const OFFSETS = [0, 44, 72, 44, 0, -44, -72, -44]


const isReward = (kind: NodeKind) => kind === 'chest' || kind === 'trophy'

function KindIcon({ kind, size }: { kind: NodeKind; size: number }) {
  switch (kind) {
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

function UnitBanner({ unit, lessonNo, doneCount }: { unit: Unit; lessonNo: number | null; doneCount: number }) {
  const c = UNIT_COLORS[unit.color]
  const toast = useToast()
  return (
    // Обёртка с белым фоном закрывает узлы, которые прокручиваются над «прилипшим» баннером
    <div id={`unit-${unit.id}`} className="sticky top-[62px] z-20 bg-white md:top-0 md:-mt-5 md:pt-5">
      <div
        className="flex items-center justify-between gap-3 rounded-[20px] px-5 py-4 text-white"
        style={{ background: c.main, boxShadow: `0 5px 0 ${c.dark}` }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-extrabold uppercase tracking-wider text-white/80">
            <span>
              Раздел {unit.num}
              {lessonNo ? ` · Урок ${lessonNo}` : ` · ${doneCount}/${unit.lessons.length}`}
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
        <button
          onClick={() => toast(`Руководство «${unit.title}» скоро появится 📘`)}
          className="flex shrink-0 items-center gap-2 rounded-2xl border-2 border-white/40 px-3 py-2.5 text-[13px] font-extrabold uppercase tracking-wider transition-colors hover:bg-white/10 md:px-4"
          aria-label={`Руководство по разделу «${unit.title}»`}
        >
          <Book size={20} />
          <span className="hidden sm:inline">Руководство</span>
        </button>
      </div>
    </div>
  )
}

function PathNode({
  lesson,
  index,
  unit,
  state,
  offset,
  open,
  onToggle,
}: {
  lesson: Lesson
  index: number
  unit: Unit
  state: NodeState
  offset: number
  open: boolean
  onToggle: () => void
}) {
  const c = UNIT_COLORS[unit.color]
  const soft = state === 'upcoming'
  const golden = state === 'done' && isReward(lesson.kind)
  const bg = soft ? c.light : golden ? '#FFC23D' : c.main
  const edge = soft ? c.mid : golden ? '#E5A100' : c.dark
  const iconColor = soft ? c.mid : '#fff'
  const label = isReward(lesson.kind) ? 'Испытание раздела' : `Урок ${index + 1} из ${unit.lessons.length}`

  let pop: ReactNode = null
  if (open) {
    pop = (
      <div
        className="anim-pop absolute left-1/2 top-[calc(100%+18px)] z-[16] w-[280px] origin-top"
        style={{ transform: `translateX(calc(-50% - ${offset}px))` }}
      >
        <div
          className="absolute -top-2 h-5 w-5 rotate-45 rounded-[4px]"
          style={{ left: `calc(50% + ${offset}px - 10px)`, background: soft ? '#fff' : c.main, border: soft ? `2px solid ${c.mid}` : undefined, borderRight: 'none', borderBottom: 'none' }}
        />
        <div className={`relative rounded-[20px] p-4 ${soft ? 'border-2 bg-white text-ink' : 'text-white'}`} style={soft ? { borderColor: c.mid } : { background: c.main }}>
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
        </div>
      </div>
    )
  }

  return (
    <div
      data-lesson={lesson.id}
      className={`relative ${open ? 'z-[16]' : ''} ${index === 0 ? '' : state === 'current' ? 'mt-14' : 'mt-6'}`}
      style={{ transform: `translateX(${offset}px)` }}
    >
      {state === 'current' && (
        <div
          className="anim-bob pointer-events-none absolute -top-[54px] left-1/2 z-[5] whitespace-nowrap rounded-xl border-2 border-line bg-white px-3.5 py-2 text-[15px] font-black uppercase tracking-wider"
          style={{ color: c.main }}
        >
          Начать
          <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-line bg-white" />
        </div>
      )}
      <div className="relative">
        {state === 'current' && (
          <span className="pointer-events-none absolute -inset-[11px] rounded-full border-[7px]" style={{ borderColor: c.mid, animation: 'ring-pulse 2s ease-in-out infinite' }} />
        )}
        <button
          onClick={onToggle}
          aria-label={lesson.title}
          aria-expanded={open}
          className="relative flex h-[66px] w-[72px] items-center justify-center rounded-[50%] transition-[transform,box-shadow] duration-75 active:translate-y-[6px]"
          style={{ background: bg, boxShadow: `0 8px 0 ${edge}`, color: iconColor }}
          onMouseDown={(e) => (e.currentTarget.style.boxShadow = `0 2px 0 ${edge}`)}
          onMouseUp={(e) => (e.currentTarget.style.boxShadow = `0 8px 0 ${edge}`)}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 8px 0 ${edge}`)}
        >
          <span className={`absolute left-[14px] top-[8px] h-[10px] w-[22px] -rotate-12 rounded-full ${soft ? 'bg-white/60' : 'bg-white/25'}`} />
          {state === 'done' && !isReward(lesson.kind) ? <Check size={34} /> : <KindIcon kind={lesson.kind} size={32} />}
        </button>
      </div>
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

function UnitArt({ unit, dir }: { unit: Unit; dir: number }) {
  // Иллюстрация стоит с той стороны, куда «змейка» не уходит в начале раздела
  const side = dir === 1 ? 'left' : 'right'
  const art = ARTS[unit.id] ?? <Mascot size={150} className="w-[104px] sm:w-[150px]" />
  return (
    <div
      className="pointer-events-none absolute top-[130px]"
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

export function Home() {
  const { progress } = useStore()
  const toast = useToast()
  const [openId, setOpenId] = useState<string | null>(null)
  const current = currentLessonId(progress.completed)
  const totalLessons = UNITS.reduce((n, u) => n + u.lessons.length, 0)

  // Esc закрывает попап урока
  useEffect(() => {
    if (!openId) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenId(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId])

  // Вернулись из урока — прокручиваем путь к нему
  useEffect(() => {
    const last = sessionStorage.getItem(LAST_LESSON_KEY)
    if (!last) return
    sessionStorage.removeItem(LAST_LESSON_KEY)
    const el = document.querySelector(`[data-lesson="${last}"]`)
    el?.scrollIntoView({ block: 'center' })
  }, [])

  return (
    <div className="mx-auto max-w-[600px]">
      {openId && <div className="fixed inset-0 z-[15]" onClick={() => setOpenId(null)} />}
      {UNITS.map((unit, ui) => {
        const dir = ui % 2 === 0 ? 1 : -1
        const doneCount = unit.lessons.filter((l) => progress.completed.includes(l.id)).length
        const curIdx = unit.lessons.findIndex((l) => l.id === current)
        const next = UNITS[ui + 1]
        return (
          <section key={unit.id} className={ui > 0 ? 'mt-6' : ''}>
            <UnitBanner unit={unit} lessonNo={curIdx >= 0 ? curIdx + 1 : null} doneCount={doneCount} />
            <div className="relative flex flex-col items-center pb-16 pt-14">
              <UnitArt unit={unit} dir={dir} />
              {unit.lessons.map((lesson, i) => {
                const state: NodeState = progress.completed.includes(lesson.id) ? 'done' : lesson.id === current ? 'current' : 'upcoming'
                return (
                  <PathNode
                    key={lesson.id}
                    lesson={lesson}
                    index={i}
                    unit={unit}
                    state={state}
                    offset={OFFSETS[i % OFFSETS.length] * dir}
                    open={openId === lesson.id}
                    onToggle={() => setOpenId((o) => (o === lesson.id ? null : lesson.id))}
                  />
                )
              })}
            </div>
            {next && <Interlude next={next} dir={dir} />}
          </section>
        )
      })}
      <div className="flex flex-col items-center gap-3 pb-6 text-center">
        <div className="flex items-center gap-3 text-[13px] font-extrabold uppercase tracking-wider text-[#b5b0c8]">
          <span className="h-[2px] w-12 bg-line" /> Финиш <span className="h-[2px] w-12 bg-line" />
        </div>
        <Mascot mood={progress.completed.length >= totalLessons ? 'happy' : 'think'} size={96} />
        <h3 className="text-[20px] font-black">
          Пройдено {Math.min(progress.completed.length, totalLessons)} из {totalLessons} уроков
        </h3>
        <p className="max-w-[360px] text-[15px] font-semibold text-muted">Пройди все пять разделов — и твой первый проект будет в сети. Новые разделы уже готовятся!</p>
        <button className="btn btn-ghost btn-sm mt-1" onClick={() => toast('Напомним, когда появятся новые разделы 🔔')}>
          Напомнить о новых разделах
        </button>
      </div>
    </div>
  )
}
