/**
 * Настоящий вход через Supabase Auth (email + пароль). Все ошибки — человеческим русским языком.
 * Используется только когда SUPABASE_ENABLED; в демо-режиме Login работает как раньше.
 */
import { getSupabase } from './supabase'
import { getLocale, t } from '../i18n/core'

export type AuthResult = { ok: true; message?: string; needsConfirm?: boolean } | { ok: false; error: string; unconfirmed?: boolean }

const appUrl = () => `${window.location.origin}${window.location.pathname}`

/**
 * user_metadata для Supabase Auth: язык интерфейса уходит в `locale`, по нему письма
 * (supabase/templates/*.html, {{ .Data.locale }}) выбирают язык. Пустое имя не отправляем.
 */
export function authMetadata(displayName?: string): { locale: string; display_name?: string } {
  const name = displayName?.trim().slice(0, 80)
  return name ? { display_name: name, locale: getLocale() } : { locale: getLocale() }
}

interface ErrLike {
  code?: string
  status?: number
  message?: string
  name?: string
}

export function authErrorRu(e: unknown): string {
  const err = (e ?? {}) as ErrLike
  const code = err.code ?? ''
  const msg = (err.message ?? '').toLowerCase()
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) return t('x04octll')
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed'))
    return t('x0smebup')
  if (code === 'user_already_exists' || code === 'email_exists' || msg.includes('already registered')) return t('x05lb746')
  if (code === 'weak_password' || msg.includes('password should')) return t('x1ykuytx')
  if (code === 'same_password') return t('x1qspzlk')
  if (code === 'email_address_invalid' || code === 'validation_failed' || msg.includes('invalid format')) return t('x1vdcjtz')
  if (code === 'signup_disabled') return t('x1rzt46d')
  if (code === 'email_address_not_authorized' || msg.includes('not authorized')) return t('x1hlkefg')
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || err.status === 429)
    return t('x09mrckz')
  if (code === 'otp_expired' || code === 'flow_state_expired' || code === 'flow_state_not_found') return t('x1okq02b')
  if (code === 'session_not_found' || code === 'refresh_token_not_found') return t('x16eqm96')
  if (err.name === 'AuthRetryableFetchError' || msg.includes('failed to fetch') || msg.includes('network')) return t('x1ocrfdi')
  return t('x0b918ad')
}

async function client() {
  const sb = await getSupabase()
  if (!sb) throw { message: 'network' }
  return sb
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const { error } = await (await client()).auth.signInWithPassword({ email, password })
    if (!error) return { ok: true }
    const unconfirmed = (error as ErrLike).code === 'email_not_confirmed' || /email not confirmed/i.test(error.message ?? '')
    return unconfirmed ? { ok: false, error: authErrorRu(error), unconfirmed: true } : { ok: false, error: authErrorRu(error) }
  } catch (e) {
    return { ok: false, error: authErrorRu(e) }
  }
}

export async function signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
  try {
    const { data, error } = await (await client()).auth.signUp({
      email,
      password,
      options: { emailRedirectTo: appUrl(), data: authMetadata(displayName) },
    })
    if (error) return { ok: false, error: authErrorRu(error) }
    // Включено подтверждение почты и адрес уже занят — Supabase возвращает «пустого» пользователя без identities
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0)
      return { ok: false, error: t('x05lb746') }
    if (data.session) return { ok: true }
    return { ok: true, needsConfirm: true, message: t('x1u8ebih') }
  } catch (e) {
    return { ok: false, error: authErrorRu(e) }
  }
}

/** Повторно отправить письмо подтверждения регистрации */
export async function resendSignup(email: string): Promise<AuthResult> {
  try {
    const { error } = await (await client()).auth.resend({ type: 'signup', email, options: { emailRedirectTo: appUrl() } })
    return error ? { ok: false, error: authErrorRu(error) } : { ok: true, message: t('login.resent') }
  } catch (e) {
    return { ok: false, error: authErrorRu(e) }
  }
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  try {
    const { error } = await (await client()).auth.resetPasswordForEmail(email, { redirectTo: `${appUrl()}?reset=1` })
    if (error) return { ok: false, error: authErrorRu(error) }
    return { ok: true, message: t('x12x5pdf') }
  } catch (e) {
    return { ok: false, error: authErrorRu(e) }
  }
}

export async function updatePassword(password: string): Promise<AuthResult> {
  try {
    const { error } = await (await client()).auth.updateUser({ password })
    return error ? { ok: false, error: authErrorRu(error) } : { ok: true, message: t('x09kijz5') }
  } catch (e) {
    return { ok: false, error: authErrorRu(e) }
  }
}

/** Смена почты: письмо «подтвердите новый адрес» придёт на языке интерфейса */
export async function changeEmail(newEmail: string): Promise<AuthResult> {
  try {
    const { error } = await (await client()).auth.updateUser(
      { email: newEmail, data: { locale: getLocale() } },
      { emailRedirectTo: appUrl() },
    )
    return error ? { ok: false, error: authErrorRu(error) } : { ok: true }
  } catch (e) {
    return { ok: false, error: authErrorRu(e) }
  }
}

/**
 * Держит user_metadata.locale в актуальном состоянии (для писем сброса пароля и т.п., которые
 * Supabase шлёт без нашего участия). Пишет только если язык отличается. Ошибки молча игнорируем.
 */
export async function syncAuthLocale(): Promise<void> {
  try {
    const sb = await getSupabase()
    if (!sb) return
    const { data } = await sb.auth.getSession()
    const user = data.session?.user
    const locale = getLocale()
    if (!user || user.user_metadata?.locale === locale) return
    await sb.auth.updateUser({ data: { locale } })
  } catch {
    // не критично: письмо просто придёт на прежнем языке
  }
}

/**
 * Разбор адреса после перехода по ссылке из письма: ?reset=1 (сброс пароля) и ошибки Supabase
 * (?error_code=otp_expired или #error=…). Чистит адресную строку. Вызывать один раз при старте.
 */
export function consumeAuthRedirect(): { reset: boolean; error: string | null } {
  const url = new URL(window.location.href)
  const reset = url.searchParams.get('reset') === '1'
  const hash = new URLSearchParams(url.hash.replace(/^#\/?/, ''))
  const errCode = url.searchParams.get('error_code') ?? hash.get('error_code')
  const err = url.searchParams.get('error') ?? hash.get('error')
  const error = errCode || err ? authErrorRu({ code: errCode ?? err ?? '' }) : null
  let changed = false
  for (const k of ['reset', 'error', 'error_code', 'error_description']) {
    if (url.searchParams.has(k)) {
      url.searchParams.delete(k)
      changed = true
    }
  }
  if (hash.has('error') || hash.has('error_code')) {
    url.hash = '#/login'
    changed = true
  }
  if (changed) window.history.replaceState(null, '', url.toString())
  if (reset && !error) sessionStorage.setItem('vaibik.recovery', '1')
  return { reset, error }
}
