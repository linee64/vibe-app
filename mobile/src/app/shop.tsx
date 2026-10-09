import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CHARGE_MAX, SHOP, tokens } from '@web/data/economy'
import { useStore } from '../store/Store'
import { Battery, Token, Txt } from '../components/ui'
import { useToast } from '../components/Toast'
import { buzz } from '../lib/haptics'
import { track } from '../lib/analytics'
import { C, font } from '../theme'
import { t } from '@web/i18n/core'

/** Магазин токенов: подсказка (в уроке), полная подзарядка, скин «скоро» */
export default function ShopScreen() {
  const { progress, refillHearts, spendGems } = useStore()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const [bought, setBought] = useState<string | null>(null)

  const buy = (id: string, cost: number) => {
    if (id === 'hint') {
      toast(t('x145cr2j'))
      return
    }
    if (id === 'skin') return
    if (progress.hearts >= CHARGE_MAX) {
      toast(t('x075xsjd'))
      return
    }
    if (!spendGems(cost)) {
      toast(t('x0wxtdt2', { cost: tokens(cost) }))
      return
    }
    void buzz('ok')
    track('tokens_spent', { reason: 'recharge', amount: cost, where: 'shop' })
    refillHearts()
    setBought(id)
    toast(t('x12a0jyi'))
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.snow }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable accessibilityLabel={t('x199quko')} onPress={() => router.back()} hitSlop={8}>
          <Text style={font(900, 24, C.muted)}>✕</Text>
        </Pressable>
        <Txt w={900} size={24} style={{ flex: 1 }}>{t('x1f2lm2g')}</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 99, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Token size={16} />
          <Text style={font(900, 15)} testID="shop-balance">{progress.gems}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Battery level={progress.hearts} />
        <Txt w={700} size={13} color={C.muted}>{t('x04mldcx')}</Txt>
      </View>
      {SHOP.map((item) => (
        <View key={item.id} style={{ borderRadius: 18, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, borderBottomWidth: 5, padding: 14, gap: 6, opacity: item.soon ? 0.6 : 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Txt w={900} size={16} style={{ flex: 1 }}>{item.title}</Txt>
            {item.soon ? (
              <View style={{ borderRadius: 99, backgroundColor: C.snow, paddingHorizontal: 8, paddingVertical: 2 }}><Text style={font(900, 11, C.muted)}>{t('x10qfrxi')}</Text></View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Token size={15} />
                <Text style={font(900, 15, C.tealDark)}>{item.cost}</Text>
              </View>
            )}
          </View>
          <Txt w={600} size={13} color={C.muted}>{item.desc}</Txt>
          {!item.soon ? (
            <Pressable testID={`buy-${item.id}`} onPress={() => buy(item.id, item.cost)} style={{ alignSelf: 'flex-start', borderRadius: 12, backgroundColor: bought === item.id ? C.teal : C.brand, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 3, borderBottomColor: bought === item.id ? C.tealDark : C.brandDark }}>
              <Text style={font(900, 14, C.white)}>{bought === item.id ? t('x1nagtd9') : item.id === 'hint' ? t('x1hfl3er') : t('x0ohe02j')}</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </ScrollView>
  )
}
