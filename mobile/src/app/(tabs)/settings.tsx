/** Настройки — как SettingsScreen веба: язык, звук, дневная цель, аккаунт и удаление. Напоминания — только в вебе (нужны пуш-уведомления) */
import { Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { t } from '@web/i18n/core'
import { mailto } from '../../lib/prefs'
import { useStore } from '../../store/Store'
import { useToast } from '../../components/Toast'
import { Card } from '../../components/ui'
import { BackHeader, GoalPicker, LanguageCard, SoundToggle } from '../../components/Settings'
import { C, font } from '../../theme'

export default function SettingsScreen() {
  const router = useRouter()
  const toast = useToast()
  const { session } = useStore()
  const email = session?.email ?? ''
  return (
    <ScrollView testID="settings-screen" style={{ flex: 1, backgroundColor: C.white }} contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 40 }}>
      <BackHeader title={t('x01xs7fy')} onBack={() => router.navigate('/(tabs)/more')} />
      <LanguageCard returnTo="/(tabs)/settings" style={{ marginTop: 0 }} />
      <SoundToggle where="settings" />
      <GoalPicker onSaved={(g) => toast(t('settings.goalSaved', { xp: g }))} />
      <Card style={{ marginTop: 24, padding: 16 }}>
        <Text style={[font(900, 18), { lineHeight: 22 }]}>{t('settings.account')}</Text>
        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 16, backgroundColor: C.snow, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={font(800, 14, C.muted)}>{t('settings.email')}</Text>
          <Text numberOfLines={1} style={[font(900, 15), { flexShrink: 1 }]}>{email || '—'}</Text>
        </View>
        <Pressable
          testID="delete-account"
          accessibilityRole="link"
          onPress={() => void Linking.openURL(mailto(t('settings.deleteSubject'), t('settings.deleteBody', { email }))).catch(() => {})}
          style={({ pressed }) => ({ marginTop: 16, borderRadius: 16, borderWidth: 2, borderColor: C.coralLight, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: pressed ? C.coralLight : 'transparent' })}
        >
          <Text style={font(900, 16, C.coralDark)}>{t('settings.deleteLabel')}</Text>
          <Text style={[font(600, 13, C.muted), { lineHeight: 17 }]}>{t('settings.deleteHint')}</Text>
        </Pressable>
      </Card>
    </ScrollView>
  )
}
