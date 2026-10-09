import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { LOCALE_META, SWITCHER_ORDER, t } from '@web/i18n/core'
import { useLocale } from '@web/i18n/react'
import { switchLocale } from '../lib/locale'
import { C, font } from '../theme'

/** Порядок как в вебе; без флагов */

export function LanguageSwitcher({ returnTo = '/(tabs)/profile' }: { returnTo?: string }) {
  const locale = useLocale()
  const [busy, setBusy] = useState(false)
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={t('lang.label')} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} testID="lang-switcher">
      {SWITCHER_ORDER.map((l) => {
        const on = l === locale
        return (
          <Pressable
            key={l}
            testID={`lang-${l}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: on, disabled: busy }}
            disabled={busy}
            onPress={() => {
              if (on) return
              setBusy(true)
              void switchLocale(l, returnTo).finally(() => setBusy(false))
            }}
            style={{ borderRadius: 12, borderWidth: 2, borderColor: on ? C.brand : C.line, backgroundColor: on ? C.brandLight : C.white, paddingHorizontal: 12, paddingVertical: 7 }}
          >
            <Text style={font(800, 14, on ? C.brandDark : C.ink)}>{LOCALE_META[l].native}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}
