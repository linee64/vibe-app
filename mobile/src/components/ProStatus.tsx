/**
 * Вайбик Pro для тех, кто уже купил — как src/components/ProStatus.tsx веба: компактный статус «Вайбик Pro активен»
 * вместо карточки тарифа и блок «Подписка» в настройках (управление / отмена там, где оформлена подписка).
 */
import { useState } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { managePlan, type AppPlatform, type ProStatus } from '@web/data/proStatus'
import { proPlanName, proStateLine, proSummary, proViaName } from '@web/data/proText'
import { t } from '@web/i18n/core'
import { manageSubscriptions, useProInfo } from '../lib/billing'
import { track } from '../lib/analytics'
import { useToast } from './Toast'
import { Check } from './art'
import { Blob, Btn, Card, IconBox } from './ui'
import { C, font } from '../theme'

const PLATFORM: AppPlatform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web'

/** Компактный статус (профиль, «Ещё», пейвол) — никаких кнопок покупки */
export function ProActiveCard({ pro, style, action }: { pro: ProStatus; style?: object; action?: { label: string; onPress: () => void } }) {
  const summary = proSummary(pro)
  return (
    <View testID="plan-pro" style={[{ marginTop: 32, borderRadius: 20, backgroundColor: C.brandDark, paddingBottom: 5 }, style]}>
      <View style={{ borderRadius: 20, backgroundColor: C.brand, padding: 16, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Blob size={128} />
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: C.goldDark }}>
          <Check size={22} color={C.goldInk} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[font(900, 18, C.white), { lineHeight: 22 }]}>{t('pro.activeTitle')}</Text>
          {summary ? <Text testID="pro-summary" style={[font(600, 14, 'rgba(255,255,255,0.85)'), { marginTop: 2, lineHeight: 18 }]}>{summary}</Text> : null}
        </View>
        {action ? <Btn testID="pro-details" tone="white" small label={action.label} onPress={action.onPress} style={{ alignSelf: 'center' }} /> : null}
      </View>
    </View>
  )
}

/** «Подписка» в настройках: тариф, статус (активна / отменена, до …), где оплачено, «Управлять» / «Отменить» */
export function SubscriptionSettings() {
  const pro = useProInfo()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  if (!pro.pro) return null
  const plan = managePlan(pro, PLATFORM)

  const manage = async (intent: 'manage' | 'cancel') => {
    if (busy) return
    track('subscription_manage_opened', { intent, source: pro.source ?? 'none' })
    if (plan.action === 'demo') return toast(t('pro.hint.demo'))
    setBusy(true)
    await manageSubscriptions().finally(() => setBusy(false))
  }

  const rows: [string, string, string][] = [
    [t('pro.planLabel'), proPlanName(pro) || '—', 'plan'],
    [t('pro.statusLabel'), proStateLine(pro), 'status'],
    [t('pro.viaLabel'), proViaName(pro.source), 'via'],
  ]
  return (
    <Card testID="settings-subscription" style={{ marginTop: 24, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBox bg={C.brandLight} size={44}>
          <Text style={{ fontSize: 22 }}>✨</Text>
        </IconBox>
        <View style={{ flex: 1 }}>
          <Text style={[font(900, 18), { lineHeight: 22 }]}>{t('pro.section')}</Text>
          <Text style={[font(700, 14, C.brand), { lineHeight: 18 }]}>{t('pro.activeTitle')}</Text>
        </View>
      </View>
      <View style={{ marginTop: 12, gap: 8 }}>
        {rows.map(([label, value, key]) => (
          <View key={key} testID={`sub-row-${key}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 16, backgroundColor: C.snow, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={font(800, 14, C.muted)}>{label}</Text>
            <Text style={[font(900, 15, key === 'status' && pro.state === 'cancelled' ? C.coralDark : C.ink), { flexShrink: 1, textAlign: 'right' }]}>{value}</Text>
          </View>
        ))}
      </View>
      {plan.action ? (
        <View>
          <Btn testID="sub-manage" block label={busy ? t('x0vfsu1y') : t('pro.manage')} disabled={busy} onPress={() => void manage('manage')} style={{ marginTop: 16 }} />
          {pro.state !== 'cancelled' ? (
            <Pressable
              testID="sub-cancel"
              accessibilityRole="button"
              disabled={busy}
              onPress={() => void manage('cancel')}
              style={({ pressed }) => ({ marginTop: 12, alignItems: 'center', borderRadius: 16, borderWidth: 2, borderColor: C.coralLight, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: pressed ? C.coralLight : 'transparent' })}
            >
              <Text style={font(900, 15, C.coralDark)}>{t('pro.cancel')}</Text>
            </Pressable>
          ) : null}
          <Text style={[font(600, 13, C.muted), { marginTop: 12, lineHeight: 17 }]}>{t(`pro.hint.${plan.action}`)}</Text>
        </View>
      ) : plan.elsewhere ? (
        <View testID={`sub-elsewhere-${plan.elsewhere}`} style={{ marginTop: 16, borderRadius: 16, backgroundColor: C.goldLight, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={[font(700, 14, '#8a6a1e'), { lineHeight: 19 }]}>{t(`pro.elsewhere.${plan.elsewhere}`)}</Text>
        </View>
      ) : null}
    </Card>
  )
}
