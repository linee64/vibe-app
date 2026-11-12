/**
 * Вход: почта без круга «письмо → браузер → заново логин», Google (OAuth + возврат в приложение)
 * и Apple (нативный Sign in with Apple на iOS — требование App Store 4.8 рядом с Google).
 * Ключи провайдеров живут в кабинете Supabase, не в приложении.
 */
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import { authErrorRu } from '@web/lib/auth'
import { getLocale, t } from '@web/i18n/core'
import { parseAuthCallback } from './authCallback'
import { getSupabase } from './web-adapters/supabase'

WebBrowser.maybeCompleteAuthSession()

/** Куда Supabase возвращает сессию. В сборке App Store это vaibik://callback. */
export const authRedirectUri = () => Linking.createURL('callback')

export type AuthOutcome = { ok: true } | { ok: false; reason: 'cancel' | 'confirm' | 'fail'; message?: string }

const inflight = new Map<string, Promise<AuthOutcome>>()

function failMessage(e: unknown): string {
  return authErrorRu(e)
}

/** Код или токены из deep link → сессия. Повтор того же кода не обмениваем второй раз. */
export async function completeAuthFromUrl(url: string): Promise<AuthOutcome> {
  const parsed = parseAuthCallback(url)
  if (!parsed) return { ok: false, reason: 'fail' }
  if (parsed.error) return { ok: false, reason: 'fail', message: authErrorRu({ code: parsed.error, message: parsed.error }) }
  const key = parsed.code ?? parsed.accessToken ?? ''
  const existing = inflight.get(key)
  if (existing) return existing
  const job = (async (): Promise<AuthOutcome> => {
    const sb = await getSupabase()
    if (!sb) return { ok: false, reason: 'fail', message: t('auth.oauthFail') }
    if (parsed.code) {
      const { error } = await sb.auth.exchangeCodeForSession(parsed.code)
      return error ? { ok: false, reason: 'fail', message: failMessage(error) } : { ok: true }
    }
    if (parsed.accessToken && parsed.refreshToken) {
      const { error } = await sb.auth.setSession({ access_token: parsed.accessToken, refresh_token: parsed.refreshToken })
      return error ? { ok: false, reason: 'fail', message: failMessage(error) } : { ok: true }
    }
    return { ok: false, reason: 'fail', message: t('auth.oauthFail') }
  })()
  inflight.set(key, job)
  return job
}

export async function signInWithOAuth(provider: 'google' | 'apple'): Promise<AuthOutcome> {
  const sb = await getSupabase()
  if (!sb) return { ok: false, reason: 'fail', message: t('auth.oauthFail') }
  const redirectTo = authRedirectUri()
  const { data, error } = await sb.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      ...(provider === 'google' ? { queryParams: { prompt: 'select_account' } } : {}),
    },
  })
  if (error || !data.url) return { ok: false, reason: 'fail', message: error ? failMessage(error) : t('auth.oauthFail') }
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
  if (result.type === 'cancel' || result.type === 'dismiss') return { ok: false, reason: 'cancel' }
  if (result.type !== 'success') return { ok: false, reason: 'fail', message: t('auth.oauthFail') }
  return completeAuthFromUrl(result.url)
}

async function saveAppleName(sb: NonNullable<Awaited<ReturnType<typeof getSupabase>>>, credential: AppleAuthentication.AppleAuthenticationCredential) {
  const name = [credential.fullName?.givenName, credential.fullName?.middleName, credential.fullName?.familyName].filter(Boolean).join(' ').trim()
  if (!name) return
  await sb.auth.updateUser({ data: { display_name: name.slice(0, 80), full_name: name, locale: getLocale() } }).catch(() => {})
}

/** Нативный Sign in with Apple. На Android и в вебе — тот же провайдер через браузер. */
export async function signInWithApple(): Promise<AuthOutcome> {
  if (Platform.OS === 'ios' && (await AppleAuthentication.isAvailableAsync())) {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      })
      if (!credential.identityToken) return { ok: false, reason: 'fail', message: t('auth.oauthFail') }
      const sb = await getSupabase()
      if (!sb) return { ok: false, reason: 'fail', message: t('auth.oauthFail') }
      const { error } = await sb.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken })
      if (error) return { ok: false, reason: 'fail', message: failMessage(error) }
      await saveAppleName(sb, credential)
      return { ok: true }
    } catch (e) {
      const code = (e as { code?: string }).code
      if (code === 'ERR_REQUEST_CANCELED') return { ok: false, reason: 'cancel' }
      return { ok: false, reason: 'fail', message: t('auth.oauthFail') }
    }
  }
  return signInWithOAuth('apple')
}

const unconfirmed = (e: { code?: string; message?: string } | null) => !!e && (e.code === 'email_not_confirmed' || /email not confirmed/i.test(e.message ?? ''))

/**
 * Регистрация почтой. Сессия сразу — человек уже внутри.
 * «confirm» только если в Supabase всё ещё включено Confirm email: ссылка из письма
 * открывает приложение (emailRedirectTo), второй логин не нужен.
 */
export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<AuthOutcome> {
  const sb = await getSupabase()
  if (!sb) return { ok: false, reason: 'fail', message: t('x0wdmzq7') }
  const name = displayName.trim().slice(0, 80)
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: authRedirectUri(), data: name ? { display_name: name, locale: getLocale() } : { locale: getLocale() } },
  })
  if (error) return { ok: false, reason: 'fail', message: failMessage(error) }
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) return { ok: false, reason: 'fail', message: t('x05lb746') }
  if (data.session) return { ok: true }
  const again = await sb.auth.signInWithPassword({ email, password })
  if (again.data.session) return { ok: true }
  if (unconfirmed(again.error)) return { ok: false, reason: 'confirm' }
  return { ok: false, reason: 'fail', message: again.error ? failMessage(again.error) : t('auth.oauthFail') }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthOutcome> {
  const sb = await getSupabase()
  if (!sb) return { ok: false, reason: 'fail', message: t('x0wdmzq7') }
  const { error } = await sb.auth.signInWithPassword({ email, password })
  if (!error) return { ok: true }
  if (unconfirmed(error)) return { ok: false, reason: 'confirm', message: failMessage(error) }
  return { ok: false, reason: 'fail', message: failMessage(error) }
}

export async function sendPasswordReset(email: string): Promise<AuthOutcome> {
  const sb = await getSupabase()
  if (!sb) return { ok: false, reason: 'fail', message: t('x0wdmzq7') }
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: authRedirectUri() })
  return error ? { ok: false, reason: 'fail', message: failMessage(error) } : { ok: true }
}

export async function resendSignupEmail(email: string): Promise<AuthOutcome> {
  const sb = await getSupabase()
  if (!sb) return { ok: false, reason: 'fail', message: t('x0wdmzq7') }
  const { error } = await sb.auth.resend({ type: 'signup', email, options: { emailRedirectTo: authRedirectUri() } })
  return error ? { ok: false, reason: 'fail', message: failMessage(error) } : { ok: true }
}
