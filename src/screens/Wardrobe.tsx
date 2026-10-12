import { useState, type CSSProperties } from 'react'
import { SKINS, buyBlocker, findSkin, lookOf, type SkinDef, type SkinLook, type SkinRarity, type SkinSlot } from '../data/skins'
import { tokens } from '../data/economy'
import { useStore } from '../store'
import { useSubscription } from '../lib/billing'
import { navigate } from '../router'
import { playSound } from '../lib/sound'
import { Mascot } from '../components/Mascot'
import { SlotGlyph } from '../components/BipiSkins'
import { Lock, Token } from '../components/Icons'
import { useToast } from '../components/Toast'
import { PaywallScreen } from '../components/Paywall'
import { t, type UIKey } from '../i18n/core'

type Tab = 'all' | SkinSlot
const TABS: Tab[] = ['all', 'head', 'face', 'body']

const RARITY: Record<SkinRarity, { bg: string; fg: string; ring: string }> = {
  common: { bg: '#EFE9FF', fg: '#5B2FD6', ring: '#C7B6FF' },
  rare: { bg: '#DCF8F3', fg: '#0E9C8C', ring: '#8FE3D8' },
  legendary: { bg: '#FFF4D6', fg: '#8A6A1E', ring: '#FFC23D' },
}

const skinName = (s: SkinDef) => t(`skins.${s.id}.name` as UIKey)

function Card({ skin, owned, equipped, selected, onClick }: { skin: SkinDef; owned: boolean; equipped: boolean; selected: boolean; onClick: () => void }) {
  const r = RARITY[skin.rarity]
  return (
    <button
      type="button"
      onClick={onClick}
      data-skin={skin.id}
      data-skin-state={equipped ? 'equipped' : owned ? 'owned' : 'shop'}
      aria-pressed={selected}
      className={`relative flex flex-col items-center rounded-[20px] border-2 bg-white px-2 pb-3 pt-2 text-center transition-transform hover:-translate-y-0.5 ${
        selected ? 'border-brand shadow-[0_4px_0_#5B2FD6]' : 'border-line shadow-[0_4px_0_#E7E3F2]'
      }`}
    >
      {skin.pro && <span className="absolute left-2 top-2 z-[1] rounded-md bg-coral px-1.5 py-[1px] text-[10px] font-black uppercase tracking-wider text-white">Pro</span>}
      {equipped && <span className="absolute right-2 top-2 z-[1] rounded-md bg-teal px-1.5 py-[1px] text-[10px] font-black uppercase tracking-wider text-white">{t('wardrobe.equipped')}</span>}
      <span className="flex h-[92px] w-full items-end justify-center overflow-hidden rounded-2xl" style={{ background: r.bg }}>
        <Mascot mood="happy" laptop={false} size={78} look={{ [skin.slot]: skin.id }} />
      </span>
      <span className="mt-2 line-clamp-2 min-h-[36px] text-[14px] font-black leading-tight">{skinName(skin)}</span>
      <span className="mt-1 text-[11px] font-black uppercase tracking-wider" style={{ color: r.fg }}>{t(`wardrobe.rarity.${skin.rarity}`)}</span>
      <span className="mt-1.5 flex items-center gap-1 text-[14px] font-black">
        {owned ? <span className="text-teal-dark">{t('wardrobe.owned')}</span> : <><Token size={16} /> {skin.price}</>}
      </span>
    </button>
  )
}

export function Wardrobe() {
  const { progress, buySkin, equipSkin, unequipSkin } = useStore()
  const { isPro } = useSubscription()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [paywall, setPaywall] = useState<SkinDef | null>(null)
  const [cheer, setCheer] = useState(0)
  // только что купленное: вместо «Снять» под курсором — «Надето ✓», чтобы двойной клик не снял вещь
  const [justBought, setJustBought] = useState<string | null>(null)

  const worn = lookOf(progress.skins)
  const owned = progress.skins?.owned ?? []
  const skin = selected ? findSkin(selected) : undefined
  // примерка: выбранная вещь поверх того, что уже надето
  const preview: SkinLook = skin ? { ...worn, [skin.slot]: skin.id } : worn
  const list = SKINS.filter((s) => tab === 'all' || s.slot === tab)
  const isOwned = !!skin && owned.includes(skin.id)
  const isWorn = !!skin && worn[skin.slot] === skin.id
  const blocker = skin ? buyBlocker(progress.skins, progress.gems, skin.id, isPro) : null
  const wornCount = Object.keys(worn).length

  const buy = () => {
    if (!skin) return
    if (blocker === 'pro') return setPaywall(skin)
    const res = buySkin(skin.id, isPro)
    if (!res.ok) return
    playSound('purchase')
    setJustBought(skin.id)
    setCheer((n) => n + 1)
    toast(t('wardrobe.bought', { name: skinName(skin) }))
  }

  if (paywall) return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <PaywallScreen title={skinName(paywall)} source="skin" onClose={() => setPaywall(null)} />
    </div>
  )

  return (
    <div className="mx-auto max-w-[600px]" data-wardrobe>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[28px] font-black leading-tight">{t('wardrobe.title')}</h1>
          <p className="mt-1 text-[15px] font-semibold leading-snug text-muted">{t('wardrobe.subtitle')}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-line bg-white px-3 py-1.5 text-[17px] font-black text-teal-dark" data-wardrobe-balance={progress.gems} title={tokens(progress.gems)}>
          <Token size={22} /> {progress.gems}
        </span>
      </div>

      {/* примерочная */}
      <section className="relative mb-6 overflow-hidden rounded-[26px] bg-brand-light/70 p-5 sm:flex sm:items-center sm:gap-6 sm:p-6" data-wardrobe-preview>
        <span className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-coral/15" />
        <span className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-teal/15" />
        <div className="relative mx-auto flex w-[180px] shrink-0 justify-center sm:mx-0">
          <span key={cheer} className={cheer ? 'anim-pop' : ''}>
            <Mascot mood="happy" laptop={false} size={170} look={preview} />
          </span>
        </div>
        <div className="relative mt-4 min-w-0 flex-1 text-center sm:mt-0 sm:text-left">
          {skin ? (
            <>
              <div className="text-[12px] font-black uppercase tracking-wider" style={{ color: RARITY[skin.rarity].fg }}>
                {isWorn ? t('wardrobe.equipped') : isOwned ? t('wardrobe.owned') : t('wardrobe.tryOn')} · {t(`wardrobe.rarity.${skin.rarity}`)}
              </div>
              <h2 className="mt-0.5 text-[22px] font-black leading-tight">{skinName(skin)}</h2>
              <p className="mt-1 text-[15px] font-semibold leading-snug text-muted">{t(`skins.${skin.id}.desc` as UIKey)}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {isWorn && justBought === skin.id ? (
                  <button className="btn btn-sm" style={{ '--c': '#13C2AE', '--e': '#0E9C8C' } as CSSProperties} disabled data-wardrobe-action="bought">✓ {t('wardrobe.equipped')}</button>
                ) : isWorn ? (
                  <button className="btn btn-ghost btn-sm" onClick={() => unequipSkin(skin.slot)} data-wardrobe-action="unequip">{t('wardrobe.unequip')}</button>
                ) : isOwned ? (
                  <button className="btn btn-sm" style={{ '--c': '#13C2AE', '--e': '#0E9C8C' } as CSSProperties} onClick={() => equipSkin(skin.id)} data-wardrobe-action="equip">{t('wardrobe.equip')}</button>
                ) : blocker === 'pro' ? (
                  <button className="btn btn-coral btn-sm" onClick={buy} data-wardrobe-action="pro">
                    <Lock size={16} /> {t('wardrobe.proOnly')}
                  </button>
                ) : blocker === 'balance' ? (
                  <>
                    <button className="btn btn-sm" disabled data-wardrobe-action="need">
                      <Token size={16} /> {t('wardrobe.need', { tokens: tokens(skin.price - progress.gems) })}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/quests')}>{t('wardrobe.toQuests')}</button>
                  </>
                ) : (
                  <button className="btn btn-sm btn-bouncy" onClick={buy} data-wardrobe-action="buy">
                    {t('wardrobe.buy')} · <Token size={16} /> {skin.price}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-[20px] font-black leading-tight">{wornCount ? t('wardrobe.lookTitle') : t('wardrobe.pick')}</h2>
              <p className="mt-1 text-[15px] font-semibold leading-snug text-muted">{t('wardrobe.earn')}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/quests')}>{t('wardrobe.toQuests')}</button>
                {wornCount > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={() => (['head', 'face', 'body'] as const).forEach((s) => unequipSkin(s))} data-wardrobe-action="unequip-all">{t('wardrobe.removeAll')}</button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {TABS.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`flex shrink-0 items-center gap-1.5 rounded-2xl border-2 px-3.5 py-2 text-[14px] font-extrabold transition-colors ${tab === k ? 'border-brand-mid bg-brand-light text-brand' : 'border-line bg-white text-muted hover:bg-snow'}`}
          >
            <SlotGlyph slot={k} size={20} /> {t(`wardrobe.slot.${k}`)}
          </button>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((s) => (
          <Card key={s.id} skin={s} owned={owned.includes(s.id)} equipped={worn[s.slot] === s.id} selected={selected === s.id} onClick={() => {
              setJustBought(null)
              setSelected((x) => (x === s.id ? null : s.id))
            }} />
        ))}
      </div>
    </div>
  )
}
