/**
 * Настоящий вход через Supabase Auth (email + пароль). Все ошибки — человеческим русским языком.
 * Используется только когда SUPABASE_ENABLED; в демо-режиме Login работает как раньше.
 */
import { getSupabase } from './supabase'

export type AuthResult = { ok: true; message?: string; needsConfirm?: boolean } | { ok: false; error: string }

const appUrl = () => `${window.location.origin}${window.location.pathname}`

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
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) return 'Неверная почта или пароль. Проверь раскладку и попробуй ещё раз.'
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed'))
    return 'Почта ещё не подтверждена. Открой письмо от Вайбика и нажми ссылку (загляни в «Спам»).'
  if (code === 'user_already_exists' || code === 'email_exists' || msg.includes('already registered')) return 'Такая почта уже зарегистрирована — просто войди.'
  if (code === 'weak_password' || msg.includes('password should')) return 'Пароль слабоват: минимум 6 символов, лучше с цифрами и буквами.'
  if (code === 'same_password') return 'Новый пароль совпадает со старым — придумай другой.'
  if (code === 'email_address_invalid' || code === 'validation_failed' || msg.includes('invalid format')) return 'Похоже, в адресе почты опечатка.'
  if (code === 'signup_disabled') return 'Регистрация временно закрыта.'
  if (code === 'email_address_not_authorized' || msg.includes('not authorized')) return 'Не получилось отправить письмо на этот адрес. Попробуй чуть позже.'
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || err.status === 429)
    return 'Слишком много попыток. Подожди минутку и попробуй снова.'
  if (code === 'otp_expired' || code === 'flow_state_expired' || code === 'flow_state_not_found') return 'Ссылка из письма устарела. Запроси новую.'
  if (code === 'session_not_found' || code === 'refresh_token_not_found') return 'Сессия истекла — войди ещё раз.'
  if (err.name === 'AuthRetryableFetchError' || msg.includes('failed to fetch') || msg.includes('network')) return 'Нет связи с сервером. Проверь интернет.'
  return 'Что-то пошло не так. Попробуй ещё раз через минуту.'
}

async function client() {
  const sb = await getSupabase()
  if (!sb) throw { message: 'network' }
  return sb
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const { error } = await (await client()).auth.signInWithPassword({ email, password })
    return error ? { ok: false, error: authErrorRu(error) } : { ok: true }
  } catch (e) {
    return { ok: false, error: authErrorRu(e) }
  }
}

export async function signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
  try {
    const { data, error } = await (await client()).auth.signUp({
      email,
      password,
      options: { emailRedirectTo: appUrl(), data: displayName ? { display_name: displayName.slice(0, 80) } : undefined },
    })
    if (error) return { ok: false, error: authErrorRu(error) }
    // Включено подтверждение почты и адрес уже занят — Supabase возвращает «пустого» пользователя без identities
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0)
      return { ok: false, error: 'Такая почта уже зарегистрирована — просто войди.' }
    if (data.session) return { ok: true }
    return { ok: true, needsConfirm: true, message: 'Готово! Мы отправили письмо — нажми ссылку в нём, и ты внутри.' }
  } catch (e) {
    return { ok: false, error: authErrorRu(e) }
  }
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  try {
    const { error } = await (await client()).auth.resetPasswordForEmail(email, { redirectTo: `${appUrl()}?reset=1` })
    if (error) return { ok: false, error: authErrorRu(error) }
    return { ok: true, message: 'Если такая почта есть, письмо со ссылкой уже летит. Проверь «Входящие» и «Спам».' }
  } catch (e) {
    return { ok: false, error: authErrorRu(e) }
  }
}

export async function updatePassword(password: string): Promise<AuthResult> {
  try {
    const { error } = await (await client()).auth.updateUser({ password })
    return error ? { ok: false, error: authErrorRu(error) } : { ok: true, message: 'Пароль обновлён!' }
  } catch (e) {
    return { ok: false, error: authErrorRu(e) }
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
