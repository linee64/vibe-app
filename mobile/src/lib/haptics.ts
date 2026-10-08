/** Вибрация на ответах. На вебе и без поддержки — тихо ничего не делаем. */
import { Platform } from 'react-native'

export async function buzz(kind: 'ok' | 'bad' | 'tap') {
  if (Platform.OS === 'web') return
  try {
    const H = await import('expo-haptics')
    if (kind === 'ok') await H.notificationAsync(H.NotificationFeedbackType.Success)
    else if (kind === 'bad') await H.notificationAsync(H.NotificationFeedbackType.Error)
    else await H.selectionAsync()
  } catch {
    /* в Expo Go на симуляторе вибрации может не быть */
  }
}
