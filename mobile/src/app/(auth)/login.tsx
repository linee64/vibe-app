import { useState, type ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getSupabase } from '../../lib/web-adapters/supabase'
import { DEMO_MODE } from '../../lib/env'
import { useStore } from '../../store/Store'
import { Mascot } from '../../components/art'
import { Float } from '../../components/motion'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { Btn } from '../../components/ui'
import { C, alpha, font } from '../../theme'
import { tx } from '@web/i18n/rich'
import { track } from '../../lib/analytics'
import { getLocale, t } from '@web/i18n/core'

type Mode = 'login' | 'signup' | 'reset'

/** Вход: демо-режим без бэкенда или настоящие аккаунты Supabase */
export default function LoginScreen() {
  const { login } = useStore()
  const insets = useSafeAreaInsets()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null)

  const valid = /^\S+@\S+\.\S+$/.test(email.trim())

  const submit = async () => {
    setNote(null)
    if (!valid) {
      setNote({ text: t('x14z1x43'), bad: true })
      return
    }
    if (DEMO_MODE) {
      track('login_completed', { method: 'demo' })
      login(email.trim())
      return
    }
    if (mode !== 'reset' && password.length < 6) {
      setNote({ text: t('x14tcjmr'), bad: true })
      return
    }
    setBusy(true)
    const sb = await getSupabase()
    if (!sb) {
      setBusy(false)
      setNote({ text: t('x0wdmzq7'), bad: true })
      return
    }
    if (mode === 'reset') {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim())
      setBusy(false)
      setNote(error ? { text: error.message, bad: true } : { text: t('x00his2q'), bad: false })
      return
    }
    const res = mode === 'signup' ? await sb.auth.signUp({ email: email.trim(), password, options: { data: { display_name: name.trim(), locale: getLocale() } } }) : await sb.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (!res.error) {
      if (mode === 'signup') track('signup_completed', { needs_confirm: !res.data.session })
      else track('login_completed', { method: 'password' })
    }
    if (res.error) setNote({ text: res.error.message, bad: true })
    else if (mode === 'signup' && !res.data.session) setNote({ text: t('x0k62urh'), bad: false })
  }

  const [title, subtitle] = mode === 'signup' ? [t('login.title.3'), t('login.title.4')] : mode === 'reset' ? [t('login.title.5'), t('login.title.6')] : [t('login.title.1'), t('login.title.2')]

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView testID="login" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        {/* как AuthLayout веба на телефоне: фиолетовая шапка с логотипом и Бипи */}
        <View style={{ overflow: 'hidden', alignItems: 'center', backgroundColor: C.brand, paddingHorizontal: 24, paddingTop: insets.top + 32, paddingBottom: 32 }}>
          <View pointerEvents="none" style={{ position: 'absolute', left: -96, top: -96, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <View pointerEvents="none" style={{ position: 'absolute', right: -80, bottom: -128, width: 384, height: 384, borderRadius: 192, backgroundColor: alpha(C.brandDark, 0.4) }} />
          <Text style={[font(900, 30, C.white), { marginBottom: 12, lineHeight: 32 }]}>{tx('x1ctbm6o', {}, [(chunk) => <Text style={{ color: C.coral }}>{chunk}</Text>])}</Text>
          <Float>
            <Mascot size={120} />
          </Float>
          <Text style={[font(900, 22, C.white), { marginTop: 16, maxWidth: 440, lineHeight: 27, textAlign: 'center' }]}>{t('x14h7w5u')}</Text>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 32 }}>
          <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
            <LanguageSwitcher returnTo="/(auth)/login" />
          </View>
          <Text style={[font(900, 28), { lineHeight: 33 }]}>{title}</Text>
          <Text style={[font(600, 16, C.muted), { marginTop: 4, marginBottom: 24 }]}>{subtitle}</Text>

          {DEMO_MODE ? (
            <View style={{ marginBottom: 20, borderRadius: 16, borderWidth: 2, borderColor: alpha(C.teal, 0.6), backgroundColor: alpha(C.tealLight, 0.6), paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text style={[font(700, 14), { lineHeight: 19 }]}>{t('x1pk0fut')}</Text>
            </View>
          ) : null}
          {note ? (
            <View accessibilityRole={note.bad ? 'alert' : undefined} style={{ marginBottom: 20, borderRadius: 16, borderWidth: 2, borderColor: alpha(note.bad ? C.coral : C.teal, 0.6), backgroundColor: alpha(note.bad ? C.coralLight : C.tealLight, 0.6), paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text style={[font(700, 14, note.bad ? C.coralDark : C.ink), { lineHeight: 19 }]}>{note.text}</Text>
            </View>
          ) : null}

          <View style={{ gap: 16 }}>
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
                  <Pressable onPress={() => { setMode('reset'); setNote(null) }} hitSlop={6}>
                    <Text style={font(800, 13, C.brand)}>{t('x0w9rt0u')}</Text>
                  </Pressable>
                ) : null}
              />
            ) : null}
          </View>

          <Btn testID="submit" label={busy ? t('x15d421k') : DEMO_MODE ? t('x02lme7p') : mode === 'signup' ? t('x1tq5jtz') : mode === 'reset' ? t('x1kq4vgj') : t('x1h4dl4y')} onPress={() => void submit()} disabled={busy} block style={{ marginTop: 24 }} />

          {!DEMO_MODE ? (
            <View style={{ marginTop: 20, alignItems: 'center', gap: 12 }}>
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
                  }}
                  hitSlop={6}
                >
                  <Text style={font(800, 15, C.brand)}>{mode === 'signup' ? t('x03mo60q') : t('x0grikvd')}</Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/** Поле как .input веба: 54 px, скругление 16, фон snow, фокус — фиолетовая рамка */
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
        style={[font(600, 16), { height: 54, borderRadius: 16, borderWidth: 2, borderColor: focus ? C.brand : C.line, backgroundColor: focus ? C.white : C.snow, paddingHorizontal: 18 }]}
      />
    </View>
  )
}
