/**
 * Переключатель языка (без флагов — язык ≠ страна).
 *  • compact — нативный <select> для шапки лендинга и экрана входа;
 *  • list — кнопки для профиля.
 */
import { useState } from 'react'
import { LOCALE_META, SWITCHER_ORDER, t, type Locale } from '../i18n/core'
import { changeLocale } from '../i18n/runtime'
import { useLocale } from '../i18n/react'

function Globe({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19M12 2.5c2.8 3 2.8 16 0 19M12 2.5c-2.8 3-2.8 16 0 19" />
    </svg>
  )
}

export function LanguageSwitcher({ variant = 'compact', className = '' }: { variant?: 'compact' | 'list'; className?: string }) {
  const locale = useLocale()
  const [busy, setBusy] = useState(false)
  const pick = (l: Locale) => {
    if (l === locale || busy) return
    setBusy(true)
    void changeLocale(l).finally(() => setBusy(false))
  }

  if (variant === 'list')
    return (
      <div className={`flex flex-wrap gap-2 ${className}`} role="radiogroup" aria-label={t('lang.label')} data-testid="lang-switcher">
        {SWITCHER_ORDER.map((l) => (
          <button
            key={l}
            role="radio"
            aria-checked={l === locale}
            lang={LOCALE_META[l].tag}
            onClick={() => pick(l)}
            disabled={busy}
            className={`rounded-xl border-2 px-3.5 py-2 text-[15px] font-extrabold transition-colors ${l === locale ? 'border-brand bg-brand-light text-brand-dark' : 'border-line bg-white text-ink hover:bg-snow'}`}
          >
            {LOCALE_META[l].native}
          </button>
        ))}
      </div>
    )

  return (
    <label className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-2 py-1.5 text-[14px] font-extrabold text-muted hover:bg-snow hover:text-ink ${className}`}>
      <Globe />
      {/* на узких экранах — код языка, на широких — самоназвание; сам <select> прозрачный поверх */}
      <span aria-hidden className="uppercase min-[420px]:hidden">{locale}</span>
      <span aria-hidden lang={LOCALE_META[locale].tag} className="max-[419px]:hidden">
        {LOCALE_META[locale].native}
      </span>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="opacity-60">
        <path d="M1.5 3.5 5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
      <select
        value={locale}
        onChange={(e) => pick(e.target.value as Locale)}
        disabled={busy}
        aria-label={t('lang.label')}
        data-testid="lang-select"
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      >
        {SWITCHER_ORDER.map((l) => (
          <option key={l} value={l} lang={LOCALE_META[l].tag}>
            {LOCALE_META[l].native}
          </option>
        ))}
      </select>
    </label>
  )
}
