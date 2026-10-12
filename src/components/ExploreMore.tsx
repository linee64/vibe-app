import { useState, type ReactNode } from 'react'
import { ALL_LESSONS, UNITS } from '../data/course'
import { homeworkForUnit } from '../data/homework'
import { questBoard } from '../data/quests'
import { isUnitLocked } from '../data/tiers'
import { isNodeReachable } from '../data/path'
import { useStore } from '../store'
import { navigate } from '../router'
import { track } from '../lib/analytics'
import { useFeedback } from './FeedbackProvider'
import { Dumbbell, FeedbackBubble, Rocket, Target } from './Icons'
import { Mascot } from './Mascot'
import { t } from '../i18n/core'

/** id блока: сюда прокручивает праздник последнего тира (TierUp → LAST_LESSON_KEY) */
export const EXPLORE_ANCHOR = 'path-explore'

function Action({ icon, color, light, title, desc, onClick, name }: { icon: ReactNode; color: string; light: string; title: string; desc: string; onClick: () => void; name: string }) {
  return (
    <button
      type="button"
      data-explore-action={name}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[20px] border-2 border-line bg-white p-3.5 text-left shadow-[0_4px_0_#E7E3F2] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: light, color }}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-[16px] font-black leading-tight">{title}</span>
        <span className="mt-0.5 line-clamp-2 block text-[14px] font-semibold leading-snug text-muted">{desc}</span>
      </span>
    </button>
  )
}

/**
 * Конец пути без «финиша»: курс открытый — новые разделы добавляются регулярно.
 * Вместо итогов «N из M» — полезные действия: повторить урок, задания дня, домашки, предложить тему.
 */
export function ExploreMore() {
  const { progress } = useStore()
  const feedback = useFeedback()
  // какой пройденный урок предложить повторить — меняется день ото дня
  const [seed] = useState(() => new Date().getDate())

  const done = ALL_LESSONS.filter((l) => progress.completed.includes(l.id))
  const review = done.length ? done[seed % done.length] : ALL_LESSONS[0]

  const homeworks = UNITS.map((u) => homeworkForUnit(u.id)).filter((h) => !!h)
  const nextHw = homeworks.find((h) => !progress.homework.includes(h.id) && !isUnitLocked(h.unitId, progress) && isNodeReachable(h.id, progress))
  const againHw = homeworks.find((h) => progress.homework.includes(h.id))
  const hw = nextHw ?? againHw

  const daily = questBoard(progress.quests).daily
  const dailyDone = daily.filter((q) => q.done).length

  const act = (name: string, fn: () => void) => () => {
    track('explore_action', { action: name })
    fn()
  }

  return (
    <section id={EXPLORE_ANCHOR} data-explore className="mx-auto w-full max-w-[560px] scroll-mt-[110px] pb-8 md:scroll-mt-6">
      <div className="mb-4 flex items-center justify-center gap-3 text-[13px] font-extrabold uppercase tracking-wider text-brand">
        <span className="h-[2px] w-10 bg-brand-mid" />
        {t('explore.kicker')}
        <span className="h-[2px] w-10 bg-brand-mid" />
      </div>
      <div className="relative overflow-hidden rounded-[26px] bg-brand-light/60 p-5 sm:p-6">
        <span className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-coral/15" />
        <span className="pointer-events-none absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-teal/15" />
        <div className="relative flex items-center gap-4">
          <Mascot mood="happy" size={88} className="shrink-0" />
          <div className="min-w-0">
            <h3 className="text-[21px] font-black leading-tight">{t('explore.title')}</h3>
            <p className="mt-1 text-[15px] font-semibold leading-snug text-muted">{t('explore.body')}</p>
          </div>
        </div>
        <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
          <Action
            name="practice"
            icon={<Dumbbell size={26} />}
            color="#7C4DFF"
            light="#EFE9FF"
            title={t(done.length ? 'explore.practice.title' : 'explore.practice.start')}
            desc={t('explore.practice.desc', { title: review.title })}
            onClick={act('practice', () => navigate(`/lesson/${review.id}`))}
          />
          <Action
            name="quests"
            icon={<Target size={26} />}
            color="#FF7A59"
            light="#FFE9E2"
            title={t('explore.quests.title')}
            desc={t('explore.quests.desc', { done: dailyDone, total: daily.length })}
            onClick={act('quests', () => navigate('/quests'))}
          />
          {hw && (
            <Action
              name="homework"
              icon={<Rocket size={26} />}
              color="#0E9C8C"
              light="#DCF8F3"
              title={t('explore.hw.title')}
              desc={nextHw ? t('explore.hw.next', { title: hw.title }) : t('explore.hw.again')}
              onClick={act('homework', () => navigate(`/homework/${hw.id}`))}
            />
          )}
          <Action
            name="suggest"
            icon={<FeedbackBubble size={26} />}
            color="#5B2FD6"
            light="#F3EFFF"
            title={t('explore.suggest.title')}
            desc={t('explore.suggest.desc')}
            onClick={act('suggest', () => feedback.open({ entry: 'explore', category: 'idea' }))}
          />
        </div>
      </div>
    </section>
  )
}
