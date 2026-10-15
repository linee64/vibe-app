/** Словарик — как src/components/Glossary.tsx: список терминов, лист из урока, кнопка в шапке урока */
import { useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GLOSS_IDS } from '@web/data/glossary'
import { glossDef, glossTerm } from '@web/components/glossText'
import { t } from '@web/i18n/core'
import { track } from '../lib/analytics'
import { Book, Cross } from './art'
import { Pop } from './motion'
import { C, alpha, font } from '../theme'

export function GlossaryList() {
  return (
    <View testID="glossary">
      {GLOSS_IDS.map((id, i) => (
        <View key={id} style={{ paddingHorizontal: 4, paddingVertical: 12, borderTopWidth: i ? 2 : 0, borderTopColor: C.line }}>
          <Text style={font(900, 16, C.brandDark)}>{glossTerm(id)}</Text>
          <Text style={[font(600, 14), { marginTop: 2, lineHeight: 19 }]}>{glossDef(id)}</Text>
        </View>
      ))}
    </View>
  )
}

export function GlossarySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets()
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: alpha(C.ink, 0.5), padding: 12, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 12 }}>
        <Pop>
          <Pressable testID="glossary-sheet" onPress={() => {}} style={{ maxHeight: '100%', borderRadius: 24, backgroundColor: C.white }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 2, borderBottomColor: C.line, paddingHorizontal: 20, paddingVertical: 16 }}>
              <Book size={26} color={C.brand} />
              <View style={{ flex: 1 }}>
                <Text style={[font(900, 20), { lineHeight: 24 }]}>{t('gloss.title')}</Text>
                <Text style={font(600, 13, C.muted)}>{t('gloss.subtitle')}</Text>
              </View>
              <Pressable accessibilityLabel={t('gloss.close')} onPress={onClose} hitSlop={8}>
                <Cross size={26} color={C.muted} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 560 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
              <GlossaryList />
            </ScrollView>
          </Pressable>
        </Pop>
      </Pressable>
    </Modal>
  )
}

export function GlossaryButton({ where }: { where: 'lesson_list' | 'intro' }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Pressable
        testID="glossary-open"
        accessibilityRole="button"
        accessibilityLabel={t('gloss.title')}
        hitSlop={6}
        onPress={() => {
          track('glossary_opened', { where })
          setOpen(true)
        }}
        style={{ padding: 4 }}
      >
        <Book size={26} color={C.faint} />
      </Pressable>
      <GlossarySheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
