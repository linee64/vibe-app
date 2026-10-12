import { t } from '../i18n/core'
import { playSound, setSoundOn, useSoundOn } from '../lib/sound'
import { track } from '../lib/analytics'

/** Переключатель в стиле Вайбика (role="switch") */
export function Switch({ on, onToggle, labelledBy, data }: { on: boolean; onToggle: () => void; labelledBy: string; data?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-labelledby={labelledBy}
      onClick={onToggle}
      data-switch={data}
      className={`relative flex h-[34px] w-[64px] shrink-0 items-center rounded-full border-2 transition-colors duration-150 ${on ? 'border-teal-dark bg-teal' : 'border-line bg-line'}`}
    >
      <span className={`absolute text-[10px] font-black uppercase tracking-wider ${on ? 'left-2 text-white' : 'right-2 text-muted'}`}>{on ? t('sound.on') : t('sound.off')}</span>
      <span className={`absolute top-[2px] h-[26px] w-[26px] rounded-full bg-white shadow-[0_2px_0_rgba(47,42,71,.18)] transition-[left] duration-150 ${on ? 'left-[32px]' : 'left-[2px]'}`} />
    </button>
  )
}

/** Звуки вкл/выкл: хранится на устройстве, по умолчанию включены */
export function SoundToggle({ where = 'profile' }: { where?: string }) {
  const on = useSoundOn()
  const toggle = () => {
    const next = !on
    setSoundOn(next)
    track('sound_toggled', { enabled: next, where })
    if (next) playSound('correct')
  }
  return (
    <section className="card mt-6 flex items-center gap-4 p-4" aria-labelledby="profile-sound" data-sound-setting={on ? 'on' : 'off'}>
      <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-2xl bg-teal-light text-[28px]" aria-hidden>
        {on ? '🔊' : '🔇'}
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="profile-sound" className="text-[18px] font-black leading-tight">{t('sound.label')}</h2>
        <p className="text-[14px] font-semibold leading-snug text-muted">{t('sound.hint')}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby="profile-sound"
        onClick={toggle}
        data-sound-toggle
        className={`relative flex h-[34px] w-[64px] shrink-0 items-center rounded-full border-2 transition-colors duration-150 ${on ? 'border-teal-dark bg-teal' : 'border-line bg-line'}`}
      >
        <span className={`absolute text-[10px] font-black uppercase tracking-wider ${on ? 'left-2 text-white' : 'right-2 text-muted'}`}>{on ? t('sound.on') : t('sound.off')}</span>
        <span className={`absolute top-[2px] h-[26px] w-[26px] rounded-full bg-white shadow-[0_2px_0_rgba(47,42,71,.18)] transition-[left] duration-150 ${on ? 'left-[32px]' : 'left-[2px]'}`} />
      </button>
    </section>
  )
}
