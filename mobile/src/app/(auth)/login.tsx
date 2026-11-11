import { useState, type ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as AppleAuthentication from 'expo-apple-authentication'
import Svg, { Path } from 'react-native-svg'
import { ChevronLeft } from 'lucide-react-native'
import { DEMO_MODE } from '../../lib/env'
import { useStore } from '../../store/Store'
import { Mascot } from '../../components/art'
import { Btn } from '../../components/ui'
import { C, font } from '../../theme'
import { track } from '../../lib/analytics'
import { t } from '@web/i18n/core'
import { resendSignupEmail, sendPasswordReset, signInWithApple, signInWithEmail, signInWithOAuth, signUpWithEmail, type AuthOutcome } from '../../lib/auth'

type Mode = 'login' | 'signup' | 'reset'

function GoogleMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <Path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.7 7.1l6.3 5.3C37.4 38.4 44 33 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </Svg>
  )
}

function AppleMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path fill="#fff" d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.4-.9-2.5-3.8zM14.7 6.6c.6-.8 1.1-1.9.9-3-1 .1-2.1.6-2.8 1.4-.6.7-1.2 1.8-.9 2.9 1.1.1 2.1-.5 2.8-1.3z" />
    </Svg>
  )
}

/** Вход и регистрация. Почта с сессией сразу пускает внутрь; Google и Apple — рядом. */
export default function LoginScreen() {
  const { login } = useStore()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ mode?: string }>()
  const initial: Mode = params.mode === 'signup' ? 'signup' : 'login'
  const [mode, setMode] = useState<Mode>(initial)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const valid = /^\S+@\S+\.\S+$/.test(email.trim())
  const appleFirst = Platform.OS === 'ios'

  const demoIn = (method: string) => {
    track('login_completed', { method })
    login(email.trim() || 'demo@vaibik.app')
  }

  const apply = (res: AuthOutcome, method: string) => {
    if (res.ok) {
      if (mode === 'signup' && method === 'password') track('signup_completed', { needs_confirm: false })
      else track('login_completed', { method })
      return
    }
    if (res.reason === 'cancel') {
      setNote({ text: t('auth.oauthCancel'), bad: false })
      return
    }
    if (res.reason === 'confirm') {
      if (method === 'password' && mode === 'signup') track('signup_completed', { needs_confirm: true })
      setPendingEmail(email.trim())
      setNote({ text: res.message ?? t('auth.pending'), bad: false })
      return
    }
    setNote({ text: res.message ?? t('auth.oauthFail'), bad: true })
  }

  const social = async (provider: 'google' | 'apple') => {
    setNote(null)
    setPendingEmail(null)
    if (DEMO_MODE) {
      demoIn('demo')
      return
    }
    setBusy(true)
    const res = provider === 'apple' ? await signInWithApple() : await signInWithOAuth('google')
    setBusy(false)
    apply(res, provider)
  }

  const submit = async () => {
    setNote(null)
    setPendingEmail(null)
    if (!valid) {
      setNote({ text: t('x14z1x43'), bad: true })
      return
    }
    if (DEMO_MODE) {
      demoIn('demo')
      return
    }
    if (mode !== 'reset' && password.length < 6) {
      setNote({ text: t('x14tcjmr'), bad: true })
      return
    }
    setBusy(true)
    if (mode === 'reset') {
      const res = await sendPasswordReset(email.trim())
      setBusy(false)
      setNote(res.ok ? { text: t('x00his2q'), bad: false } : { text: res.message ?? t('auth.oauthFail'), bad: true })
      return
    }
    const res = mode === 'signup' ? await signUpWithEmail(email.trim(), password, name) : await signInWithEmail(email.trim(), password)
    setBusy(false)
    apply(res, 'password')
  }

  const resend = async () => {
    if (!pendingEmail) return
    setBusy(true)
    const res = await resendSignupEmail(pendingEmail)
    setBusy(false)
    setNote(res.ok ? { text: t('login.resent'), bad: false } : { text: res.message ?? t('auth.oauthFail'), bad: true })
  }

  const [title, subtitle] = mode === 'signup' ? [t('login.title.3'), t('login.title.4')] : mode === 'reset' ? [t('login.title.5'), t('login.title.6')] : [t('login.title.1'), t('login.title.2')]
  const apple = (
    <SocialButton testID="auth-apple" label={t('auth.apple')} dark icon={<AppleMark />} disabled={busy} onPress={() => void social('apple')} nativeApple={Platform.OS === 'ios'} onNative={() => void social('apple')} />
  )
  const google = <SocialButton testID="auth-google" label={t('auth.google')} icon={<GoogleMark />} disabled={busy} onPress={() => void social('google')} />

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.snow }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView testID="login" contentContainerStyle={{ paddingBottom: insets.bottom + 28, paddingHorizontal: 24, paddingTop: insets.top + 12 }} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityRole="button" accessibilityLabel={t('auth.back')} onPress={() => router.back()} hitSlop={8} style={{ alignSelf: 'flex-start', padding: 4 }}>
          <ChevronLeft size={28} color={C.ink} strokeWidth={2.4} />
        </Pressable>
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Mascot mood="happy" size={96} />
        </View>
        <Text style={[font(900, 28), { marginTop: 12, lineHeight: 33, textAlign: 'center' }]}>{title}</Text>
        <Text style={[font(600, 16, C.muted), { marginTop: 4, marginBottom: 20, textAlign: 'center', lineHeight: 21 }]}>{subtitle}</Text>

        {DEMO_MODE ? (
          <View style={{ marginBottom: 16, borderRadius: 16, borderWidth: 2, borderColor: C.tealMid, backgroundColor: C.tealLight, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={[font(700, 14), { lineHeight: 19 }]}>{t('x1pk0fut')}</Text>
          </View>
        ) : null}
        {note ? (
          <View accessibilityRole={note.bad ? 'alert' : undefined} style={{ marginBottom: 16, borderRadius: 16, borderWidth: 2, borderColor: note.bad ? C.coralMid : C.tealMid, backgroundColor: note.bad ? C.coralLight : C.tealLight, paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
            <Text style={[font(700, 14, note.bad ? C.coralDark : C.ink), { lineHeight: 19 }]}>{note.text}</Text>
            {pendingEmail ? (
              <Pressable testID="resend-confirm" onPress={() => void resend()} disabled={busy} hitSlop={6}>
                <Text style={font(800, 14, C.brand)}>{t('login.resend')}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {mode !== 'reset' ? (
          <View style={{ gap: 10 }}>
            {appleFirst ? apple : google}
            {appleFirst ? google : apple}
            <Text style={[font(800, 13, C.muted), { textAlign: 'center', marginVertical: 4 }]}>{t('auth.orEmail')}</Text>
          </View>
        ) : null}

        <View style={{ gap: 16, marginTop: mode === 'reset' ? 0 : 8 }}>
          {mode === 'signup' ? <Field value={name} onChange={setName} placeholder={t('x0t92out')} label={t('x143058q')} testID="name" /> : null}
          <Field value={email} onChange={setEmail} placeholder="you@example.com" label="Email" testID="email" keyboard="email-address" />
          {mode !== 'reset' && !DEMO_MODE ? (
            <Field
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              label={t('x1l0wi4n')}
              testID="password"
              secure
              extra={mode === 'login' ? (
                <Pressable onPress={() => { setMode('reset'); setNote(null); setPendingEmail(null) }} hitSlop={6}>
                  <Text style={font(800, 13, C.brand)}>{t('x0w9rt0u')}</Text>
                </Pressable>
              ) : null}
            />
          ) : null}
        </View>

        <Btn testID="submit" label={busy ? t('auth.opening') : DEMO_MODE ? t('x02lme7p') : mode === 'signup' ? t('x1tq5jtz') : mode === 'reset' ? t('x1kq4vgj') : t('x1h4dl4y')} onPress={() => void submit()} disabled={busy} block style={{ marginTop: 20 }} />

        <View style={{ marginTop: 18, alignItems: 'center' }}>
          {mode === 'reset' ? (
            <Pressable onPress={() => { setMode('login'); setNote(null) }} hitSlop={6}>
              <Text style={font(800, 15, C.brand)}>{t('x0q2mvh7')}</Text>
            </Pressable>
          ) : (
            <Pressable
              testID="switch-mode"
              onPress={() => {
                const m = mode === 'signup' ? 'login' : 'signup'
                if (m === 'signup') track('signup_started', { entry: 'login' })
                setMode(m)
                setNote(null)
                setPendingEmail(null)
              }}
              hitSlop={6}
            >
              <Text style={font(800, 15, C.brand)}>{mode === 'signup' ? t('x03mo60q') : t('x0grikvd')}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function SocialButton({ testID, label, icon, dark, disabled, onPress, nativeApple, onNative }: { testID: string; label: string; icon: ReactNode; dark?: boolean; disabled?: boolean; onPress: () => void; nativeApple?: boolean; onNative?: () => void }) {
  const [width, setWidth] = useState(0)
  if (nativeApple && onNative) {
    return (
      <View testID={testID} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={16}
            style={{ width, height: 54 }}
            onPress={onNative}
          />
        ) : (
          <View style={{ height: 54 }} />
        )}
      </View>
    )
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={{ height: 54, borderRadius: 16, backgroundColor: dark ? '#000' : C.white, borderWidth: dark ? 0 : 2, borderColor: C.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: disabled ? 0.6 : 1 }}
    >
      {icon}
      <Text style={font(800, 16, dark ? C.white : C.ink)}>{label}</Text>
    </Pressable>
  )
}

function Field({ value, onChange, placeholder, label, testID, secure, keyboard, extra }: { value: string; onChange: (v: string) => void; placeholder: string; label: string; testID: string; secure?: boolean; keyboard?: 'email-address' | 'default'; extra?: ReactNode }) {
  const [focus, setFocus] = useState(false)
  return (
    <View>
      <View style={{ marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={font(800, 14)}>{label}</Text>
        {extra}
      </View>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#AAA4C0"
        secureTextEntry={secure}
        keyboardType={keyboard ?? 'default'}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={[font(600, 16), { height: 54, borderRadius: 16, borderWidth: 2, borderColor: focus ? C.brand : C.line, backgroundColor: focus ? C.white : C.white, paddingHorizontal: 18 }]}
      />
    </View>
  )
}
