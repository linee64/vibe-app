/**
 * Первый экран: Бипи на сцене, а не форма. Кнопки ведут на вход, сам урок — после аккаунта.
 */
import type { ReactNode } from 'react'
import { Pressable, ScrollView, Text, View, type ViewStyle } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Battery, Clock, Mascot, Spark } from '../../components/art'
import { Float } from '../../components/motion'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { Btn } from '../../components/ui'
import { C, font } from '../../theme'
import { t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'
import { track } from '../../lib/analytics'

function Chip({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{ borderRadius: 14, backgroundColor: C.white, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 2, borderColor: C.line }, style]}>
      {children}
    </View>
  )
}

export default function WelcomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const open = (mode: 'signup' | 'login') => {
    if (mode === 'signup') track('signup_started', { entry: 'welcome' })
    router.push({ pathname: '/(auth)/login', params: { mode } })
  }
  return (
    <View testID="welcome" style={{ flex: 1, backgroundColor: C.snow }}>
      <LinearGradient colors={['#EFE9FF', '#F7F5FC', '#FFF4EF']} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 12, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'flex-end' }}>
            <LanguageSwitcher returnTo="/(auth)/welcome" />
          </View>
          <View style={{ height: 280, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
            <View pointerEvents="none" style={{ position: 'absolute', width: 228, height: 228, borderRadius: 114, backgroundColor: '#E4DCFF' }} />
            <View pointerEvents="none" style={{ position: 'absolute', width: 250, height: 250, borderRadius: 125, borderWidth: 3, borderStyle: 'dashed', borderColor: C.brandMid }} />
            <View accessibilityLabel={t('start.point.together')} style={{ position: 'absolute', left: 0, top: 28 }}>
              <Chip>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Spark size={18} />
                  <Text style={font(900, 13, C.goldInk)}>+ВП</Text>
                </View>
              </Chip>
            </View>
            <View accessibilityLabel={t('start.point.charge')} style={{ position: 'absolute', right: 0, top: 48 }}>
              <Chip>
                <Battery level={5} size={16} />
              </Chip>
            </View>
            <View accessibilityLabel={t('start.point.time')} style={{ position: 'absolute', right: 18, bottom: 18 }}>
              <Chip style={{ backgroundColor: C.coralLight, borderColor: C.coralMid }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Clock size={16} />
                  <Text style={font(900, 13, C.coralDark)}>5</Text>
                </View>
              </Chip>
            </View>
            <Float>
              <Mascot mood="happy" size={176} />
            </Float>
          </View>
          <Text style={[font(900, 34), { textAlign: 'center', lineHeight: 38 }]}>{tx('x1ctbm6o', {}, [(chunk) => <Text style={{ color: C.coral }}>{chunk}</Text>])}</Text>
          <Text style={[font(900, 28), { marginTop: 14, textAlign: 'center', lineHeight: 32 }]}>{t('start.title')}</Text>
          <Text style={[font(900, 28, C.coral), { textAlign: 'center', lineHeight: 32 }]}>{t('start.accent')}</Text>
          <Text style={[font(700, 16, C.muted), { marginTop: 10, marginBottom: 8, textAlign: 'center', lineHeight: 22 }]}>{t('start.body')}</Text>
        </ScrollView>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: insets.bottom + 16, gap: 12 }}>
          <Btn testID="start-cta" big block tone="coral" label={t('start.cta')} onPress={() => open('signup')} />
          <Pressable testID="start-login" accessibilityRole="button" onPress={() => open('login')} hitSlop={8} style={{ alignItems: 'center', paddingVertical: 6 }}>
            <Text style={font(800, 16, C.brand)}>{t('start.haveAccount')}</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  )
}
