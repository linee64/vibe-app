import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MAX_HEARTS, useStore } from '../store'
import { CHARGE_MAX, RECHARGE_COST, RECHARGE_MINUTES, SHOP, VP, days, tokens, waitText } from '../data/economy'
import { Battery, Rocket, Spark, Token } from './Icons'
import { MascotHead } from './Mascot'
import { useToast } from './Toast'

type Panel = 'streak' | 'tokens' | 'charge' | null

/** Счётчик заряда: батарейка + число делений */
export function ChargeMeter({ value, size = 24, shake = false }: { value: number; size?: number; shake?: boolean }) {
  const color = value >= 3 ? 'text-teal-dark' : value === 2 ? 'text-[#B86A00]' : 'text-coral-dark'
  return (
    <span className={`inline-flex items-center gap-1.5 font-black ${color} ${shake ? 'anim-shake' : ''}`} data-charge={value} aria-label={`Заряд Бипи: ${value} из ${CHARGE_MAX}`}>
      <Battery size={size} level={value} max={CHARGE_MAX} />
      {value}
    </span>
  )
}

function PanelCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="anim-fade-up absolute inset-x-0 top-full z-40 mt-2 rounded-[20px] border-2 border-line bg-white p-4 text-left shadow-[0_8px_0_rgba(43,33,80,0.06)]" role="dialog" aria-label={title}>
      <div className="mb-2 flex items-center gap-2 text-[17px] font-black text-ink">
        {icon}
        {title}
      </div>
      {children}
    </div>
  )
}

/** Верхняя панель экономики: деплой-серия, токены (с мини-магазином), заряд Бипи */
export function EconomyBar({ compact = false }: { compact?: boolean }) {
  const { progress, chargeAt, spendGems, refillHearts } = useStore()
  const toast = useToast()
  const [open, setOpen] = useState<Panel>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const toggle = (p: Panel) => setOpen((o) => (o === p ? null : p))
  const item = (on: boolean) => `flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[17px] font-extrabold transition-colors ${on ? 'bg-snow' : 'hover:bg-snow'}`
  const full = progress.hearts >= MAX_HEARTS

  return (
    <div ref={ref} className={`relative flex items-center justify-between ${compact ? 'gap-1' : 'gap-2'}`} data-economy>
      <button className={item(false)} title="Курс: вайб-кодинг" onClick={() => toast('Курс «Вайб-кодинг» — пока единственный 🙂')}>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-line bg-brand-light">
          <MascotHead size={24} />
        </span>
      </button>
      <button className={`${item(open === 'streak')} text-brand-dark`} title="Деплой-серия" aria-expanded={open === 'streak'} onClick={() => toggle('streak')} data-eco="streak">
        <Rocket size={26} /> {progress.streak}
      </button>
      <button className={`${item(open === 'tokens')} text-teal-dark`} title="Токены" aria-expanded={open === 'tokens'} onClick={() => toggle('tokens')} data-eco="tokens">
        <Token size={26} /> {progress.gems}
      </button>
      <button className={item(open === 'charge')} title="Заряд Бипи" aria-expanded={open === 'charge'} onClick={() => toggle('charge')} data-eco="charge">
        <ChargeMeter value={progress.hearts} size={22} />
      </button>

      {open === 'streak' && (
        <PanelCard title={`Деплой-серия: ${days(progress.streak)}`} icon={<Rocket size={24} />}>
          <p className="text-[14px] font-semibold leading-snug text-muted">Каждый день с уроком — новый «деплой» твоих навыков. Не прерывай серию, и ракета полетит дальше.</p>
          <div className="mt-3 flex gap-1.5" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className={`flex h-8 flex-1 items-center justify-center rounded-lg text-[12px] font-black ${i < Math.min(7, progress.streak) ? 'bg-brand text-white' : 'bg-line text-muted'}`}>
                v{i + 1}
              </span>
            ))}
          </div>
        </PanelCard>
      )}

      {open === 'tokens' && (
        <PanelCard title={`Токены: ${progress.gems}`} icon={<Token size={24} />}>
          <p className="mb-3 text-[13px] font-semibold leading-snug text-muted">Зарабатывай за уроки (+5, без ошибок +10) и трать на помощь Бипи.</p>
          <ul className="space-y-2" data-shop>
            {SHOP.map((s) => {
              const canBuy = s.id === 'recharge' && !full && progress.gems >= s.cost
              return (
                <li key={s.id} className="flex items-center gap-3 rounded-2xl border-2 border-line px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-black text-ink">{s.title}</div>
                    <div className="text-[12px] font-semibold leading-snug text-muted">{s.desc}</div>
                  </div>
                  {s.id === 'recharge' ? (
                    <button
                      className="flex shrink-0 items-center gap-1 rounded-xl bg-teal px-2.5 py-1.5 text-[13px] font-black text-white disabled:bg-line disabled:text-muted"
                      disabled={!canBuy}
                      onClick={() => {
                        if (spendGems(RECHARGE_COST)) {
                          refillHearts()
                          toast('Бипи заряжен на 100% ⚡')
                        }
                      }}
                    >
                      <Token size={16} /> {s.cost}
                    </button>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 rounded-xl bg-snow px-2.5 py-1.5 text-[13px] font-black text-muted">
                      {s.soon ? 'скоро' : <><Token size={16} /> {s.cost}</>}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </PanelCard>
      )}

      {open === 'charge' && (
        <PanelCard title={`Заряд Бипи: ${progress.hearts} из ${CHARGE_MAX}`} icon={<Battery size={22} level={progress.hearts} />}>
          <ul className="space-y-1.5 text-[14px] font-semibold leading-snug text-muted">
            <li>⚡ Ошибка в уроке тратит одно деление — это пауза, а не штраф.</li>
            <li>⏱ +1 деление каждые {RECHARGE_MINUTES} минут{chargeAt ? ` (следующее ${waitText(chargeAt)})` : ''}.</li>
            <li>🔁 +1 деление, когда исправляешь ошибку или разбираешь её с Бипи.</li>
            <li>
              <Token size={14} className="inline align-[-2px]" /> Полная подзарядка — {tokens(RECHARGE_COST)}.
            </li>
          </ul>
          {full && <p className="mt-2 text-[13px] font-extrabold text-teal-dark">Батарейка полная — вперёд учиться!</p>}
        </PanelCard>
      )}
    </div>
  )
}

/** Подпись очков: «120 ВП» с искрой */
export function VibePoints({ value, size = 18 }: { value: number | string; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Spark size={size} /> {value} {VP}
    </span>
  )
}
