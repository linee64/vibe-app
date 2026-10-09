import { Fragment } from 'react'
import { useStore } from '../store'
import { Shield } from '../components/Icons'
import { MascotHead } from '../components/Mascot'
import { DEMOTE, PROMOTE, leagueRows } from '../data/league'
import { t } from '../i18n/core'
import { tx } from '../i18n/rich'

const LEAGUES = [
  { get name() { return t('x0tp0xxq') }, color: '#E0A27A', dark: '#B97A52' },
  { get name() { return t('x0xl5x3l') }, color: '#C9C3DD', dark: '#A39DBA' },
  { get name() { return t('x0yyuo2p') }, color: '#FFC23D', dark: '#E5A100' },
  { get name() { return t('x0yt6bkd') }, color: '#7C4DFF', dark: '#5B2FD6' },
  { get name() { return t('x1jk7hdb') }, color: '#FF7A59', dark: '#E0573A' },
  { get name() { return t('x1w5caxt') }, color: '#13C2AE', dark: '#0E9C8C' },
]

export function Leaderboard() {
  const { session, progress } = useStore()
  const rows = leagueRows(session?.name ?? t('x0prirvu'), progress.todayXp)

  return (
    <div className="mx-auto max-w-[600px]">
      <div className="mb-4 flex items-end justify-center gap-1 min-[360px]:gap-2 sm:gap-3">
        {LEAGUES.map((l, i) => {
          const cur = i === 3
          const locked = i > 3
          return (
            <div key={l.name} className={`${locked ? 'opacity-35 grayscale' : ''} ${cur ? '' : 'pb-1'}`} title={l.name}>
              <Shield size={cur ? 68 : 44} color={l.color} dark={l.dark} />
            </div>
          )
        })}
      </div>
      <h1 className="text-center text-[28px] font-black">{t('x1p5r6fo')}</h1>
      <p className="mt-1 text-center text-[16px] font-semibold text-muted">{tx('x0poudtm', { PROMOTE })}</p>
      <p className="mt-1 text-center text-[15px] font-extrabold text-coral-dark">{t('x0ud60yf')}</p>
      <div className="mx-auto mt-4 w-fit rounded-full border-2 border-dashed border-brand-mid bg-brand-light/60 px-4 py-1.5 text-[13px] font-extrabold text-brand-dark">{t('x0rg2oi5')}</div>

      <ol className="mt-6 border-t-2 border-line pt-2">
        {rows.map((r, i) => {
          const rank = i + 1
          const me = !!r.me
          const medal = rank === 1 ? '#FFC23D' : rank === 2 ? '#C9C3DD' : rank === 3 ? '#E0A27A' : null
          return (
            <Fragment key={r.name}>
              {i === PROMOTE && (
                <li className="my-2 flex items-center gap-3 text-[13px] font-black uppercase tracking-wider text-teal-dark">{tx('x0urkcyd', {}, [() => <span className="h-[2px] flex-1 bg-teal-light" />, () => <span className="h-[2px] flex-1 bg-teal-light" />])}</li>
              )}
              {i === rows.length - DEMOTE && (
                <li className="my-2 flex items-center gap-3 text-[13px] font-black uppercase tracking-wider text-coral-dark">{tx('x0jrzzx3', {}, [() => <span className="h-[2px] flex-1 bg-coral-light" />, () => <span className="h-[2px] flex-1 bg-coral-light" />])}</li>
              )}
              <li className={`flex items-center gap-4 rounded-2xl px-3 py-2.5 ${me ? 'bg-brand-light' : 'hover:bg-snow'}`}>
                <span className="flex w-8 justify-center">
                  {medal ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-black text-white" style={{ background: medal }}>
                      {rank}
                    </span>
                  ) : (
                    <span className={`text-[17px] font-black ${rank <= PROMOTE ? 'text-teal-dark' : rank > rows.length - DEMOTE ? 'text-coral-dark' : 'text-muted'}`}>{rank}</span>
                  )}
                </span>
                {me ? (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-mid bg-white">
                    <MascotHead size={34} />
                  </span>
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full text-[18px] font-black text-white" style={{ background: r.color }}>
                    {r.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')}
                  </span>
                )}
                <span className={`flex-1 truncate text-[17px] font-extrabold ${me ? 'text-brand' : 'text-ink'}`}>
                  {r.name}
                  {me && <span className="ml-2 rounded-md bg-brand px-1.5 py-0.5 align-middle text-[11px] font-black uppercase text-white">{t('x07qyl3e')}</span>}
                </span>
                <span className="text-[16px] font-bold text-muted">{t('x1oa57ts', { xp: r.xp })}</span>
              </li>
            </Fragment>
          )
        })}
      </ol>
    </div>
  )
}
