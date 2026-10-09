import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Mascot } from './Mascot'
import { captureException } from '../lib/sentry'
import { track } from '../lib/analytics'
import { SENTRY_ENABLED } from '../lib/config'
import { cleanRoute } from '../lib/analyticsCore'
import { t } from '../i18n/core'

const route = () => cleanRoute(window.location.hash.replace(/^#/, '') || '/')

/** Дружелюбный экран «что-то сломалось»: Бипи извиняется, кнопка «Перезагрузить» */
export function ErrorFallback({ onReload }: { onReload?: () => void }) {
  const reload = onReload ?? (() => window.location.reload())
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 py-10 text-center" role="alert" data-error-fallback>
      <div className="relative">
        <div className="absolute left-1/2 top-[56%] h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral-light" />
        <Mascot mood="think" size={190} className="anim-float relative" />
        <span className="absolute -right-3 top-6 rotate-12 rounded-2xl bg-white px-3 py-1.5 text-[15px] font-black text-coral-dark shadow-[0_4px_0_rgba(47,42,71,.12)]">{t('x1fph1nu')}</span>
      </div>
      <div className="mt-5 text-[13px] font-extrabold uppercase tracking-wider text-coral-dark">{t('x0tb0msb')}</div>
      <h1 className="mt-1 max-w-[460px] text-[28px] font-black leading-tight text-ink md:text-[32px]">{t('x0tjodam')}</h1>
      <p className="mt-2 max-w-[420px] text-[16px] font-semibold leading-snug text-muted">{t('x1la14v9')}{SENTRY_ENABLED ? t('x08xu5et') : ''}{' '}{t('x1onemw7')}</p>
      <div className="mt-7 flex w-full max-w-[340px] flex-col gap-3">
        <button className="btn btn-block btn-bouncy" onClick={reload}>{t('x0acu7ly')}</button>
        <button
          className="btn btn-ghost btn-block"
          onClick={() => {
            window.location.hash = '/learn'
            reload()
          }}
        >{t('x0povobi')}</button>
      </div>
    </div>
  )
}

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureException(error, { boundary: 'app', route: route(), react_stack: (info.componentStack ?? '').split('\n').filter(Boolean)[0]?.trim() })
    track('error_screen_shown', { route: route() })
  }

  render() {
    if (this.state.failed) return <ErrorFallback />
    return this.props.children
  }
}

/** Для проверки отчётов: #/debug/crash (в dev или при localStorage vaibik.debug=1) */
export function CrashTest(): ReactNode {
  throw new Error(t('x1xg3zny'))
}
