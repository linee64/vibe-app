/** Помощь — как HelpScreen веба: FAQ-аккордеон и контакт поддержки */
import { useState } from 'react'
import { Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { t, type UIKey } from '@web/i18n/core'
import { SUPPORT_EMAIL, mailto } from '../../lib/prefs'
import { Mascot } from '../../components/art'
import { Btn, Card } from '../../components/ui'
import { BackHeader } from '../../components/Settings'
import { C, font } from '../../theme'

const FAQ = [1, 2, 3, 4, 5] as const

function Faq({ n, first }: { n: number; first: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <View testID={`faq-${n}`} style={{ paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: first ? 0 : 2, borderTopColor: C.line }}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Text style={[font(900, 16), { flex: 1, lineHeight: 21 }]}>{t(`help.q${n}` as UIKey)}</Text>
        <Text style={[font(900, 20, C.brand), { transform: [{ rotate: open ? '90deg' : '0deg' }] }]}>›</Text>
      </Pressable>
      {open ? <Text style={[font(600, 15, C.muted), { marginTop: 8, lineHeight: 20 }]}>{t(`help.a${n}` as UIKey)}</Text> : null}
    </View>
  )
}

export default function HelpScreen() {
  const router = useRouter()
  return (
    <ScrollView testID="help-screen" style={{ flex: 1, backgroundColor: C.white }} contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 40 }}>
      <BackHeader title={t('x0m2n6mj')} sub={t('help.subtitle')} onBack={() => router.navigate('/(tabs)/more')} />
      <Card style={{ overflow: 'hidden' }}>
        {FAQ.map((n, i) => (
          <Faq key={n} n={n} first={i === 0} />
        ))}
      </Card>
      <Card style={{ marginTop: 24, alignItems: 'center', gap: 8, padding: 20 }}>
        <Mascot mood="think" size={90} />
        <Text style={[font(900, 20), { textAlign: 'center' }]}>{t('help.contactTitle')}</Text>
        <Text style={[font(600, 15, C.muted), { textAlign: 'center' }]}>{t('help.contactBody')}</Text>
        <Btn label={t('help.contactCta')} onPress={() => void Linking.openURL(mailto()).catch(() => {})} style={{ marginTop: 8, alignSelf: 'center' }} />
        <Text style={font(700, 13, C.muted)}>{SUPPORT_EMAIL}</Text>
      </Card>
    </ScrollView>
  )
}
