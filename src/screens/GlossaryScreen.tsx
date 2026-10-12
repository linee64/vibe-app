import { GlossaryList } from '../components/Glossary'
import { Mascot } from '../components/Mascot'
import { navigate } from '../router'
import { t } from '../i18n/core'

/** Словарик целиком (из профиля) */
export function GlossaryScreen() {
  return (
    <div className="mx-auto max-w-[600px]" data-glossary-screen>
      <div className="mb-5 flex items-center gap-4 rounded-[24px] bg-brand-light px-5 py-5">
        <Mascot mood="happy" size={84} className="shrink-0" />
        <div className="min-w-0">
          <h1 className="text-[26px] font-black leading-tight">{t('gloss.title')}</h1>
          <p className="mt-1 text-[15px] font-semibold leading-snug text-muted">{t('gloss.subtitle')}</p>
        </div>
      </div>
      <div className="card px-4 py-1">
        <GlossaryList />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button className="btn btn-ghost" onClick={() => navigate('/profile')}>{t('gloss.back')}</button>
        <button className="btn" onClick={() => navigate('/intro')}>{t('intro.profileTitle')}</button>
      </div>
    </div>
  )
}
