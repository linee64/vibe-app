import { Linking } from 'react-native'
import { INVITE_URL } from '@web/lib/prefs'

/** Политика и условия — те же страницы, что у веба (vaibik.site/privacy, /terms) */
export function openLegal(page: 'privacy' | 'terms') {
  void Linking.openURL(`${INVITE_URL}/${page}`).catch(() => {})
}
