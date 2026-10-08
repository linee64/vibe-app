import { useState, type FormEvent } from 'react'
import { useStore } from '../store'
import { useToast } from '../components/Toast'
import { Mascot } from '../components/Mascot'
import { Logo } from '../components/Layout'
import { navigate } from '../router'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const BUBBLES = [
  { text: '✨ Сделай лендинг для кофейни', cls: 'left-[7%] top-[7%] -rotate-3' },
  { text: '🐞 Почему здесь NaN?', cls: 'right-[7%] top-[17%] rotate-3' },
  { text: '</> React + Tailwind', cls: 'right-[9%] bottom-[7%] -rotate-2' },
]

export function Login() {
  const { login } = useStore()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [shake, setShake] = useState(0)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!email.trim()) next.email = 'Введи email'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Похоже, в email опечатка'
    if (!password) next.password = 'Введи пароль'
    setErrors(next)
    if (Object.keys(next).length) {
      setShake((s) => s + 1)
      return
    }
    login(email.trim().toLowerCase())
    navigate('/learn')
  }

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
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <form onSubmit={submit} noValidate className="w-full max-w-[400px]">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-6 inline-flex items-center gap-1.5 rounded-xl px-2 py-1 -ml-2 text-[14px] font-extrabold text-muted transition-colors hover:bg-snow hover:text-ink"
          >
            ← На главную
          </button>
          <br />
          <Logo className="mb-8 hidden !text-[40px] lg:inline-block" />
          <h1 className="text-[28px] font-black leading-tight">С возвращением!</h1>
          <p className="mb-6 mt-1 text-[16px] font-semibold text-muted">Войди, чтобы продолжить серию 🔥</p>

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
            <label className="mb-6 block">
              <span className="mb-1.5 flex items-center justify-between text-[14px] font-extrabold text-ink">
                Пароль
                <button type="button" onClick={() => toast('Это тестовый вход — подойдёт любой пароль 😉')} className="text-[13px] font-extrabold text-brand hover:opacity-80">
                  Забыли пароль?
                </button>
              </span>
              <input
                className={`input ${errors.password ? 'has-error' : ''}`}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((x) => ({ ...x, password: undefined }))
                }}
              />
              {errors.password && <span className="mt-1.5 block text-[14px] font-bold text-coral-dark">{errors.password}</span>}
            </label>
          </div>

          <button type="submit" className="btn btn-block !min-h-[54px] !text-[16px]">
            Войти
          </button>

          <p className="mt-6 text-center text-[15px] font-bold text-muted">
            Нет аккаунта?{' '}
            <button type="button" onClick={() => toast('Регистрация скоро появится! Пока войди с любым email 🙂')} className="font-extrabold text-brand hover:underline">
              Создать аккаунт
            </button>
          </p>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border-2 border-dashed border-brand-mid bg-brand-light/60 px-4 py-3 text-[14px] font-semibold leading-snug text-brand-dark">
            <span className="text-[18px] leading-none">🧪</span>
            <span>
              <b>Тестовый вход.</b> Подойдёт любой корректный email и непустой пароль — данные хранятся только в этом браузере.
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
