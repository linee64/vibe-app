import { View } from 'react-native'
import { Mascot } from './Mascot'
import { Btn, Txt } from './ui'
import { C } from '../theme'
import { SENTRY_ENABLED } from '../lib/env'
import { t } from '@web/i18n/core'

/** Дружелюбный экран ошибки: Бипи извиняется, кнопка «Перезагрузить» */
export function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <View testID="error-fallback" style={{ flex: 1, backgroundColor: C.snow, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 }}>
      <Mascot mood="think" size={150} />
      <Txt w={900} size={13} color={C.coral}>{t('x1dajp0q')}</Txt>
      <Txt w={900} size={24} center>{t('x0tjodam')}</Txt>
      <Txt w={600} size={15} color={C.muted} center style={{ maxWidth: 320 }}>{t('x1la14v9')}{SENTRY_ENABLED ? t('x08xu5et') : ''}{' '}{t('x06a5yg6')}</Txt>
      <Btn label={t('x0acu7ly')} onPress={onRetry} style={{ marginTop: 8, minWidth: 220 }} />
    </View>
  )
}
