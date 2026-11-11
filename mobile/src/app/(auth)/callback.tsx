/** Возврат из Google / письма: vaibik://callback → сессия, и корневой Gate уводит внутрь. */
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { Mascot } from '../../components/art'
import { Btn } from '../../components/ui'
import { C, font } from '../../theme'
import { t } from '@web/i18n/core'
import { completeAuthFromUrl } from '../../lib/auth'
import { parseAuthCallback } from '../../lib/authCallback'

export default function AuthCallback() {
  const url = Linking.useURL()
  const router = useRouter()
  const [fail, setFail] = useState<string | null>(null)
  useEffect(() => {
    if (!url || !parseAuthCallback(url)) return
    let alive = true
    void completeAuthFromUrl(url).then((res) => {
      if (!alive) return
      if (!res.ok) setFail(res.message ?? t('auth.callbackFail'))
    })
    return () => {
      alive = false
    }
  }, [url])
  return (
    <View testID="auth-callback" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, backgroundColor: C.snow }}>
      <Mascot mood={fail ? 'think' : 'happy'} size={140} />
      <Text style={[font(800, 18), { textAlign: 'center', lineHeight: 24 }]}>{fail ?? t('auth.callbackWait')}</Text>
      {fail ? <Btn label={t('auth.back')} onPress={() => router.replace('/(auth)/welcome')} /> : null}
    </View>
  )
}
