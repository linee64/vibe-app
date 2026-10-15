import { Modal, Pressable, ScrollView, View } from 'react-native'
import Animated, { SlideInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { C } from '../theme'
import { t } from '@web/i18n/core'
import { Pop } from './motion'

/** Нижний лист (модалка) в мультяшном стиле */
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose?: () => void; children: React.ReactNode; label: string }) {
  const insets = useSafeAreaInsets()
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} accessibilityLabel={label}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(47,42,71,0.5)' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel={t('x09wpu9j')} />
        <Animated.View entering={SlideInDown.springify().damping(18)} style={{ backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%', paddingBottom: insets.bottom + 12 }}>
          <View style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 5, backgroundColor: C.line, marginTop: 10 }} />
          <ScrollView contentContainerStyle={{ padding: 22, gap: 12 }}>{children}</ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

/** Диалог как Modal в уроке веба: карточка снизу с отступом 16, скругление 24, по центру, «pop» */
export function Dialog({ open, children, label, testID }: { open: boolean; children: React.ReactNode; label: string; testID?: string }) {
  const insets = useSafeAreaInsets()
  return (
    <Modal visible={open} transparent animationType="fade" accessibilityLabel={label}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(47,42,71,0.5)', padding: 16, paddingBottom: insets.bottom + 16 }}>
        <Pop>
          <View testID={testID} style={{ borderRadius: 24, backgroundColor: C.white, maxHeight: '100%' }}>
            <ScrollView bounces={false} contentContainerStyle={{ padding: 24, alignItems: 'stretch' }}>{children}</ScrollView>
          </View>
        </Pop>
      </View>
    </Modal>
  )
}
