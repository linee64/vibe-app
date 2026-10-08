import { useState, type FormEvent, type ReactNode } from 'react'
import { useStore } from '../store'
import { useToast } from '../components/Toast'
import { Mascot } from '../components/Mascot'
import { Logo } from '../components/Layout'
import { navigate } from '../router'
import { DEMO_MODE } from '../lib/config'
import * as auth from '../lib/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MIN_PASSWORD = 6

const BUBBLES = [
  { text: '✨ Сделай лендинг для кофейни', cls: 'left-[7%] top-[7%] -rotate-3' },
  { text: '🐞 Почему здесь NaN?', cls: 'right-[7%] top-[17%] rotate-3' },
  { text: '</> React + Tailwind', cls: 'right-[9%] bottom-[7%] -rotate-2' },
]

/** Общая раскладка экранов входа: иллюстрация слева, форма справа */
function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      {/* Illustration side */}
      <div className="relative flex shrink-0 items-center justify-center overflow-hidden bg-brand px-6 pb-8 pt-8 lg:w-[52%] lg:py-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-brand-dark/40" />
        <div className="absolute left-[12%] top-[30%] hidden h-12 w-12 rounded-full bg-coral/90 lg:block" />
        <div className="absolute bottom-[10%] left-[10%] hidden h-10 w-10 rotate-12 rounded-xl bg-teal lg:block" />
        {BUBBLES.map((b) => (
          <div
            key={b.text}
            className={`absolute hidden rounded-2xl bg-white px-4 py-2.5 text-[15px] font-extrabold text-ink shadow-[0_5px_0_rgba(47,42,71,.18)] lg:block ${b.cls}`}
          >
            {b.text}
          </div>
        ))}
        <div className="relative z-10 flex flex-col items-center text-center">
          <span className="mb-3 text-[30px] font-black lowercase leading-none text-white lg:hidden">вайбик<span className="text-coral">.</span></span>
          <Mascot size={250} className="anim-float hidden drop-shadow-[0_12px_0_rgba(47,42,71,.12)] lg:block" />
          <Mascot size={120} className="anim-float lg:hidden" />
          <h2 className="mt-4 max-w-[440px] text-[22px] font-black leading-tight text-white lg:mt-8 lg:text-[34px]">
            Создавай приложения с&nbsp;ИИ — по&nbsp;5&nbsp;минут в&nbsp;день
          </h2>
          <p className="mt-2 hidden max-w-[400px] text-[17px] font-semibold text-white/80 lg:block">
            Промпты, лендинги и отладка в Cursor, ChatGPT и Claude — короткими весёлыми уроками.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">{children}</div>
    </div>
  )
}

type Mode = 'signin' | 'signup' | 'forgot'

const TITLES: Record<Mode, [string, string]> = {
  signin: ['С возвращением!', 'Войди, чтобы продолжить деплой-серию 🚀'],
  signup: ['Создай аккаунт', 'Прогресс сохранится на всех устройствах ☁️'],
  forgot: ['Забыл пароль?', 'Пришлём ссылку, чтобы задать новый 🔑'],
}

function Notice({ tone, children }: { tone: 'info' | 'error'; children: ReactNode }) {
  const cls =
    tone === 'error'
      ? 'border-coral/60 bg-coral-light/60 text-coral-dark'
      : 'border-teal/60 bg-teal-light/60 text-ink'
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-2xl border-2 px-4 py-3 text-[14px] font-bold leading-snug ${cls}`}>
      {children}
    </div>
  )
}

export function Login({ initialError }: { initialError?: string | null } = {}) {
  const { login } = useStore()
  const toast = useToast()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [shake, setShake] = useState(0)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ tone: 'info' | 'error'; text: string } | null>(initialError ? { tone: 'error', text: initialError } : null)

  const switchMode = (m: Mode) => {
    setMode(m)
    setErrors({})
    setNotice(null)
    setPassword('')
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const next: typeof errors = {}
    if (!email.trim()) next.email = 'Введи email'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Похоже, в email опечатка'
    if (mode !== 'forgot') {
      if (!password) next.password = 'Введи пароль'
      else if (!DEMO_MODE && mode === 'signup' && password.length < MIN_PASSWORD) next.password = `Минимум ${MIN_PASSWORD} символов`
    }
    setErrors(next)
    if (Object.keys(next).length) {
      setShake((s) => s + 1)
      return
    }
    const mail = email.trim().toLowerCase()
    if (DEMO_MODE) {
      login(mail)
      navigate('/learn')
      return
    }
    setBusy(true)
    setNotice(null)
    const res =
      mode === 'signin' ? await auth.signIn(mail, password) : mode === 'signup' ? await auth.signUp(mail, password) : await auth.sendPasswordReset(mail)
    setBusy(false)
    if (!res.ok) {
      setNotice({ tone: 'error', text: res.error })
      setShake((s) => s + 1)
      return
    }
    if (res.message) setNotice({ tone: 'info', text: res.message })
    if (mode === 'signup' && res.needsConfirm) setPassword('')
    // успешный вход: сессия придёт из Supabase, App сам переведёт на /learn
  }

  const [title, subtitle] = TITLES[mode]
  const submitLabel = busy ? 'Секунду…' : mode === 'signin' ? 'Войти' : mode === 'signup' ? 'Создать аккаунт' : 'Прислать ссылку'

  return (
    <AuthLayout>
        <form onSubmit={submit} noValidate className="w-full max-w-[400px]" aria-busy={busy}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-6 inline-flex items-center gap-1.5 rounded-xl px-2 py-1 -ml-2 text-[14px] font-extrabold text-muted transition-colors hover:bg-snow hover:text-ink"
          >
            ← На главную
          </button>
          <br />
          <Logo className="mb-8 hidden !text-[40px] lg:inline-block" />
          <h1 className="text-[28px] font-black leading-tight">{title}</h1>
          <p className="mb-6 mt-1 text-[16px] font-semibold text-muted">{subtitle}</p>

          {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

          <div key={shake} className={shake ? 'anim-shake' : ''}>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-[14px] font-extrabold text-ink">Email</span>
              <input
                className={`input ${errors.email ? 'has-error' : ''}`}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((x) => ({ ...x, email: undefined }))
                }}
              />
              {errors.email && <span className="mt-1.5 block text-[14px] font-bold text-coral-dark">{errors.email}</span>}
            </label>
            {mode !== 'forgot' && (
              // не <label>: внутри кнопка «Забыли пароль?» — иначе label «приклеится» к ней, а не к полю
              <div className="mb-6 block">
                <span className="mb-1.5 flex items-center justify-between text-[14px] font-extrabold text-ink">
                  <label htmlFor="login-password">Пароль</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => (DEMO_MODE ? toast('Это тестовый вход — подойдёт любой пароль 😉') : switchMode('forgot'))}
                      className="text-[13px] font-extrabold text-brand hover:opacity-80"
                    >
                      Забыли пароль?
                    </button>
                  )}
                </span>
                <input
                  id="login-password"
                  className={`input ${errors.password ? 'has-error' : ''}`}
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((x) => ({ ...x, password: undefined }))
                  }}
                />
                {errors.password && <span className="mt-1.5 block text-[14px] font-bold text-coral-dark">{errors.password}</span>}
              </div>
            )}
            {mode === 'forgot' && <div className="mb-2" />}
          </div>

          <button type="submit" disabled={busy} className="btn btn-block !min-h-[54px] !text-[16px]">
            {submitLabel}
          </button>

          <p className="mt-6 text-center text-[15px] font-bold text-muted">
            {mode === 'signin' ? (
              <>
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => (DEMO_MODE ? toast('Регистрация скоро появится! Пока войди с любым email 🙂') : switchMode('signup'))}
                  className="font-extrabold text-brand hover:underline"
                >
                  Создать аккаунт
                </button>
              </>
            ) : (
              <>
                {mode === 'signup' ? 'Уже есть аккаунт?' : 'Вспомнил пароль?'}{' '}
                <button type="button" onClick={() => switchMode('signin')} className="font-extrabold text-brand hover:underline">
                  Войти
                </button>
              </>
            )}
          </p>

          {DEMO_MODE && (
            <div className="mt-8 flex items-start gap-3 rounded-2xl border-2 border-dashed border-brand-mid bg-brand-light/60 px-4 py-3 text-[14px] font-semibold leading-snug text-brand-dark">
              <span className="text-[18px] leading-none">🧪</span>
              <span>
                <b>Тестовый вход.</b> Подойдёт любой корректный email и непустой пароль — данные хранятся только в этом браузере.
              </span>
            </div>
          )}
        </form>
    </AuthLayout>
  )
}

/** Новый пароль после перехода по ссылке из письма «Сброс пароля» */
export function ResetPassword({ onDone }: { onDone: () => void }) {
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(0)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (password.length < MIN_PASSWORD) {
      setError(`Минимум ${MIN_PASSWORD} символов`)
      setShake((s) => s + 1)
      return
    }
    setBusy(true)
    const res = await auth.updatePassword(password)
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      setShake((s) => s + 1)
      return
    }
    toast('Пароль обновлён — продолжаем учиться! 🎉')
    onDone()
  }

  return (
    <AuthLayout>
      <form onSubmit={submit} noValidate className="w-full max-w-[400px]" aria-busy={busy}>
        <Logo className="mb-8 hidden !text-[40px] lg:inline-block" />
        <h1 className="text-[28px] font-black leading-tight">Новый пароль</h1>
        <p className="mb-6 mt-1 text-[16px] font-semibold text-muted">Придумай пароль понадёжнее — и сразу в урок 🚀</p>
        <div key={shake} className={shake ? 'anim-shake' : ''}>
          <label className="mb-6 block">
            <span className="mb-1.5 block text-[14px] font-extrabold text-ink">Пароль</span>
            <input
              className={`input ${error ? 'has-error' : ''}`}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
            />
            {error && <span className="mt-1.5 block text-[14px] font-bold text-coral-dark">{error}</span>}
          </label>
        </div>
        <button type="submit" disabled={busy} className="btn btn-block !min-h-[54px] !text-[16px]">
          {busy ? 'Секунду…' : 'Сохранить пароль'}
        </button>
        <button type="button" onClick={onDone} className="mt-4 w-full text-center text-[15px] font-extrabold text-muted hover:text-ink">
          Пропустить
        </button>
      </form>
    </AuthLayout>
  )
}
