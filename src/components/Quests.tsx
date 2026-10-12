import { useState, type CSSProperties } from 'react'
import { useStore } from '../store'
import { localDay, type QuestView } from '../data/quests'
import { questDesc, questTitle, resetText, useQuestBoard } from './questText'
import { tokens } from '../data/economy'
import { navigate } from '../router'
import { playSound } from '../lib/sound'
import { useToast } from './Toast'
import { Check, Token } from './Icons'
import { Mascot } from './Mascot'
import { t } from '../i18n/core'

export function QuestRow({ q, compact = false }: { q: QuestView; compact?: boolean }) {
  const { claimQuest } = useStore()
  const toast = useToast()
  const [pop, setPop] = useState(false)
  const pct = (q.value / q.goal) * 100
  const claim = () => {
    const reward = claimQuest(q.id)
    if (!reward) return
    playSound('levelup')
    setPop(true)
    toast(t('quests.claimToast', { tokens: tokens(reward), title: questTitle(q) }))
  }
  const state = q.claimed ? 'claimed' : q.done ? 'ready' : 'progress'
  const button =
    state === 'ready' ? (
      <button
        className={`btn btn-teal btn-sm shrink-0 !px-3 ${compact ? '!min-h-[36px]' : 'w-full sm:w-auto'}`}
        onClick={claim}
        data-quest-claim={q.id}
        aria-label={t('quests.claimAria', { title: questTitle(q), tokens: tokens(q.reward) })}
      >
        {t('quests.claim')}
        {!compact && (
          <span className="ml-1 inline-flex items-center gap-0.5">
            <Token size={15} />
            {q.reward}
          </span>
        )}
      </button>
    ) : state === 'claimed' ? (
      <span className={`flex shrink-0 items-center gap-1 rounded-xl bg-snow px-2.5 py-1.5 text-[12px] font-black uppercase tracking-wider text-muted ${pop ? 'anim-pop' : ''}`}>
        <Check size={14} />
        {!compact && t('quests.claimed')}
      </span>
    ) : null
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2.5 ${compact ? 'flex-nowrap' : 'rounded-[20px] border-2 p-3.5 sm:flex-nowrap sm:p-4'} ${!compact ? (state === 'ready' ? 'border-teal bg-teal-light/50' : 'border-line bg-white') : ''}`}
      data-quest={q.id}
      data-quest-state={state}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-2xl ${compact ? 'h-11 w-11 text-[24px]' : 'h-14 w-14 text-[28px]'} ${q.claimed ? 'bg-snow grayscale' : 'bg-brand-light'}`}
        aria-hidden
      >
        {q.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className={`min-w-0 font-black leading-tight text-ink ${compact ? 'text-[15px]' : 'text-[17px]'}`}>{questTitle(q)}</div>
          {!compact && state !== 'ready' && (
            <span className="mt-0.5 flex shrink-0 items-center gap-0.5 text-[13px] font-black text-teal-dark" aria-label={t('quests.reward', { tokens: tokens(q.reward) })}>
              <Token size={16} />
              {q.reward}
            </span>
          )}
        </div>
        <div className={`font-semibold leading-snug text-muted ${compact ? 'text-[13px]' : 'text-[14px]'}`}>{questDesc(q)}</div>
        <div className="mt-2 flex items-center gap-2">
          <div className={`progress-track flex-1 ${compact ? '!h-[14px]' : '!h-[16px]'}`}>
            <div className={`progress-fill ${q.done ? 'bg-teal' : 'bg-brand'}`} style={{ width: `${Math.max(pct, q.value ? 6 : 0)}%` }} />
          </div>
          <span className="w-[46px] shrink-0 text-right text-[12px] font-extrabold text-muted">
            {q.value}/{q.goal}
          </span>
        </div>
      </div>
      {button}
    </div>
  )
}

/** Карточка в правой колонке: задания дня с кнопкой «Забрать» */
export function DailyQuests() {
  const { daily } = useQuestBoard()
  return (
    <section className="card p-5" data-quests-card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[19px] font-extrabold">{t('x00e91ep')}</h3>
        <button onClick={() => navigate('/quests')} className="text-[13px] font-extrabold uppercase tracking-wider text-brand hover:opacity-80">{t('x0xg36bv')}</button>
      </div>
      <div className="space-y-4">
        {daily.map((q) => (
          <QuestRow key={q.id} q={q} compact />
        ))}
      </div>
    </section>
  )
}

/** Экран «Задания»: дневные и недельные задания Бипи */
export function QuestsScreen() {
  const { daily, weekly, now } = useQuestBoard()
  const allClaimed = daily.every((q) => q.claimed)
  const earned = daily.filter((q) => q.claimed).reduce((n, q) => n + q.reward, 0)
  return (
    <div className="mx-auto max-w-[600px]" data-quests-screen data-day={localDay(now)}>
      <div className="relative mb-6 flex items-center gap-4 overflow-hidden rounded-[24px] bg-brand p-5 text-white shadow-[0_5px_0_#5B2FD6] sm:gap-5 sm:px-6">
        <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <Mascot mood={allClaimed ? 'happy' : 'default'} size={92} className="relative shrink-0" />
        <div className="relative min-w-0">
          <h1 className="text-[26px] font-black leading-tight">{t('x1rejxdo')}</h1>
          <p className="mt-1 text-[15px] font-semibold leading-snug text-white/85">{t('quests.subtitle')}</p>
          {earned > 0 && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[13px] font-black" data-quests-earned>
              <Token size={15} /> {t('quests.earned', { tokens: tokens(earned) })}
            </span>
          )}
        </div>
      </div>

      <QuestGroup title={t('x00e91ep')} reset={resetText(now, 'day')} quests={daily} />
      {allClaimed && (
        <div className="anim-fade-up -mt-2 mb-6 flex items-center gap-3 rounded-2xl border-2 border-dashed border-teal bg-teal-light/40 px-4 py-3 text-[14px] font-extrabold text-teal-dark" data-quests-all-done>
          <span aria-hidden>🎉</span> {t('quests.allDone')}
        </div>
      )}
      <QuestGroup title={t('quests.weekly')} reset={resetText(now, 'week')} quests={weekly} />

      <div className="mb-6 flex flex-col items-center gap-3 rounded-[20px] bg-snow px-5 py-5 text-center sm:flex-row sm:text-left">
        <p className="min-w-0 flex-1 text-[14px] font-semibold leading-snug text-muted">{t('quests.how')}</p>
        <button className="btn btn-sm shrink-0" style={{ '--c': '#7C4DFF', '--e': '#5B2FD6' } as CSSProperties} onClick={() => navigate('/learn')}>
          {t('quests.toPath')}
        </button>
      </div>

      <button type="button" onClick={() => navigate('/wardrobe')} className="mb-6 flex w-full items-center gap-4 rounded-[20px] border-2 border-brand-mid bg-brand-light/60 px-4 py-3 text-left transition-transform hover:-translate-y-0.5" data-quests-wardrobe>
        <Mascot mood="happy" laptop={false} size={56} className="shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-black leading-tight">{t('wardrobe.title')}</span>
          <span className="block text-[14px] font-semibold leading-snug text-muted">{t('wardrobe.questsTeaser')}</span>
        </span>
        <span className="shrink-0 text-[13px] font-extrabold uppercase tracking-wider text-brand">{t('wardrobe.open')}</span>
      </button>
    </div>
  )
}

function QuestGroup({ title, reset, quests }: { title: string; reset: string; quests: QuestView[] }) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-1">
        <h2 className="text-[20px] font-black">{title}</h2>
        <span className="text-[13px] font-extrabold text-muted">{t('quests.resetIn', { time: reset })}</span>
      </div>
      <div className="space-y-3">
        {quests.map((q) => (
          <QuestRow key={q.id} q={q} />
        ))}
      </div>
    </section>
  )
}
