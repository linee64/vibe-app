/** Словарик целиком (из профиля) — как GlossaryScreen веба */
import { ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { t } from '@web/i18n/core'
import { Mascot } from '../../components/art'
import { GlossaryList } from '../../components/Glossary'
import { Btn, Card } from '../../components/ui'
import { C, font } from '../../theme'

export default function GlossaryScreen() {
  const router = useRouter()
  return (
    <ScrollView testID="glossary-screen" style={{ flex: 1, backgroundColor: C.white }} contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 40 }}>
      <View style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 24, backgroundColor: C.brandLight, padding: 20 }}>
        <Mascot mood="happy" size={84} />
        <View style={{ flex: 1 }}>
          <Text style={[font(900, 26), { lineHeight: 31 }]}>{t('gloss.title')}</Text>
          <Text style={[font(600, 15, C.muted), { marginTop: 4, lineHeight: 20 }]}>{t('gloss.subtitle')}</Text>
        </View>
      </View>
      <Card style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <GlossaryList />
      </Card>
      <View style={{ marginTop: 20, gap: 12 }}>
        <Btn tone="ghost" block label={t('gloss.back')} onPress={() => router.navigate('/(tabs)/profile')} />
        <Btn block label={t('intro.profileTitle')} onPress={() => router.push('/intro')} />
      </View>
    </ScrollView>
  )
}
