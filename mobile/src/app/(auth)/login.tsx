import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getSupabase } from '../../lib/web-adapters/supabase'
import { DEMO_MODE } from '../../lib/env'
import { useStore } from '../../store/Store'
import { Mascot } from '../../components/Mascot'
import { Btn, Txt } from '../../components/ui'
import { C, font } from '../../theme'

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
      setNote({ text: 'Нужен email вида name@example.com', bad: true })
      return
    }
    if (DEMO_MODE) {
      login(email.trim())
      return
    }
    if (mode !== 'reset' && password.length < 6) {
      setNote({ text: 'Пароль — минимум 6 символов', bad: true })
      return
    }
    setBusy(true)
    const sb = await getSupabase()
    if (!sb) {
      setBusy(false)
      setNote({ text: 'Supabase не подключился. Проверь ключи.', bad: true })
      return
    }
    if (mode === 'reset') {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim())
      setBusy(false)
      setNote(error ? { text: error.message, bad: true } : { text: 'Письмо со ссылкой отправлено — проверь почту.', bad: false })
      return
    }
    const res = mode === 'signup' ? await sb.auth.signUp({ email: email.trim(), password, options: { data: { display_name: name.trim() } } }) : await sb.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (res.error) setNote({ text: res.error.message, bad: true })
    else if (mode === 'signup' && !res.data.session) setNote({ text: 'Аккаунт создан! Подтверди почту — и входи.', bad: false })
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.snow }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, paddingHorizontal: 22, gap: 14 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center' }}>
          <Mascot mood="happy" size={150} />
          <Txt w={900} size={34} center>
            Вайбик
          </Txt>
          <Txt w={700} size={15} color={C.muted} center>
            Учись вайб-кодить: промпты, правки, деплой
          </Txt>
        </View>

        {!DEMO_MODE ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {([['login', 'Вход'], ['signup', 'Регистрация']] as const).map(([m, l]) => (
              <Btn key={m} label={l} small tone={mode === m ? 'brand' : 'ghost'} style={{ flex: 1 }} onPress={() => { setMode(m); setNote(null) }} />
            ))}
          </View>
        ) : (
          <View style={{ borderRadius: 16, backgroundColor: C.brandLight, paddingHorizontal: 14, paddingVertical: 10 }}>
            <Txt w={800} size={13} color={C.brandDark} center>
              Демо-режим: прогресс хранится только на этом устройстве
            </Txt>
          </View>
        )}

        <View style={{ gap: 10 }}>
          {mode === 'signup' ? <Field value={name} onChange={setName} placeholder="Как тебя зовут?" label="Имя" testID="name" /> : null}
          <Field value={email} onChange={setEmail} placeholder="name@example.com" label="Email" testID="email" keyboard="email-address" />
          {mode !== 'reset' && !DEMO_MODE ? <Field value={password} onChange={setPassword} placeholder="Минимум 6 символов" label="Пароль" testID="password" secure /> : null}
        </View>

        {note ? (
          <Txt w={800} size={13} color={note.bad ? C.coralDark : C.tealDark} center>
            {note.text}
          </Txt>
        ) : null}

        <Btn testID="submit" label={busy ? 'Секунду…' : DEMO_MODE ? 'Войти в демо' : mode === 'signup' ? 'Создать аккаунт' : mode === 'reset' ? 'Прислать ссылку' : 'Войти'} onPress={() => void submit()} disabled={busy} block />

        {!DEMO_MODE ? (
          <Btn label={mode === 'reset' ? 'Назад ко входу' : 'Забыл пароль'} tone="ghost" small block onPress={() => { setMode(mode === 'reset' ? 'login' : 'reset'); setNote(null) }} />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Field({ value, onChange, placeholder, label, testID, secure, keyboard }: { value: string; onChange: (v: string) => void; placeholder: string; label: string; testID: string; secure?: boolean; keyboard?: 'email-address' | 'default' }) {
  return (
    <View>
      <Text style={[font(800, 12, C.muted), { marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.6 }]}>{label}</Text>
      <TextInput testID={testID} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.muted} secureTextEntry={secure} keyboardType={keyboard ?? 'default'} autoCapitalize="none" autoCorrect={false} style={[font(700, 16), { borderRadius: 14, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 12 }]} />
    </View>
  )
}
