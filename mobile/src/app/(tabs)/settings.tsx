/** Настройки — как SettingsScreen веба: язык, звук, дневная цель, аккаунт и удаление. Напоминания — только в вебе (нужны пуш-уведомления) */
import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { t } from '@web/i18n/core'
import { getSupabase } from '../../lib/web-adapters/supabase'
import { track } from '../../lib/analytics'
import { useStore } from '../../store/Store'
import { useToast } from '../../components/Toast'
import { Card } from '../../components/ui'
import { BackHeader, GoalPicker, LanguageCard, SoundToggle } from '../../components/Settings'
import { SubscriptionSettings } from '../../components/ProStatus'
import { C, font } from '../../theme'

export default function SettingsScreen() {
  const router = useRouter()
  const toast = useToast()
  const { session, logout } = useStore()
  const email = session?.email ?? ''
  const [deleting, setDeleting] = useState(false)

  /** Удаление аккаунта прямо в приложении (Guideline 5.1.1(v)): RPC delete_my_account → выход */
  const deleteAccount = async () => {
    setDeleting(true)
    try {
      if (session?.real) {
        const sb = await getSupabase()
        const { error } = sb ? await sb.rpc('delete_my_account') : { error: new Error('no client') }
        if (error) throw error
      }
      track('account_deleted')
      toast(t('account.deleted'))
      logout()
    } catch {
      toast(t('account.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }
  const confirmDelete = () =>
    Alert.alert(t('account.deleteConfirmTitle'), t('account.deleteConfirmBody'), [
      { text: t('account.deleteCancel'), style: 'cancel' },
      { text: t('account.deleteConfirm'), style: 'destructive', onPress: () => void deleteAccount() },
    ])
  return (
    <ScrollView testID="settings-screen" style={{ flex: 1, backgroundColor: C.white }} contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 40 }}>
      <BackHeader title={t('x01xs7fy')} onBack={() => router.navigate('/(tabs)/more')} />
      <LanguageCard returnTo="/(tabs)/settings" style={{ marginTop: 0 }} />
      <SoundToggle where="settings" />
      <GoalPicker onSaved={(g) => toast(t('settings.goalSaved', { xp: g }))} />
      <SubscriptionSettings />
      <Card style={{ marginTop: 24, padding: 16 }}>
        <Text style={[font(900, 18), { lineHeight: 22 }]}>{t('settings.account')}</Text>
        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 16, backgroundColor: C.snow, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={font(800, 14, C.muted)}>{t('settings.email')}</Text>
          <Text numberOfLines={1} style={[font(900, 15), { flexShrink: 1 }]}>{email || '—'}</Text>
        </View>
        <Pressable
          testID="delete-account"
          accessibilityRole="button"
          disabled={deleting}
          onPress={confirmDelete}
          style={({ pressed }) => ({ marginTop: 16, borderRadius: 16, borderWidth: 2, borderColor: C.coralLight, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: pressed ? C.coralLight : 'transparent' })}
        >
          <Text style={font(900, 16, C.coralDark)}>{deleting ? t('account.deleteBusy') : t('settings.deleteLabel')}</Text>
          <Text style={[font(600, 13, C.muted), { lineHeight: 17 }]}>{t('account.deleteHint')}</Text>
        </Pressable>
      </Card>
    </ScrollView>
  )
}
