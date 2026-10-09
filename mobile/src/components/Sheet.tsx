import { Modal, Pressable, ScrollView, View } from 'react-native'
import Animated, { SlideInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { C } from '../theme'
import { t } from '@web/i18n/core'

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
