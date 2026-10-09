import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DEMOTE, PROMOTE, leagueRows, myStanding } from '@web/data/league'
import { VP } from '@web/data/economy'
import { useStore } from '../../store/Store'
import { Txt } from '../../components/ui'
import { C, font } from '../../theme'
import { t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'

/** Лига — демо-таблица (те же вымышленные игроки, что в вебе) */
export default function LeagueScreen() {
  const { session, progress } = useStore()
  const insets = useSafeAreaInsets()
  const name = session?.name ?? t('x0prirvu')
  const rows = leagueRows(name, progress.todayXp)
  const { rank, toPromote } = myStanding(name, progress.todayXp)
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.snow }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 30, paddingHorizontal: 16, gap: 12 }}>
      <Txt w={900} size={26}>{t('x1xmzi0d')}</Txt>
      <View style={{ borderRadius: 18, backgroundColor: C.brand, padding: 14, borderBottomWidth: 5, borderBottomColor: C.brandDark }}>
        <Txt w={900} size={16} color={C.white}>{t('x0z0v1vg', { rank })}</Txt>
        <Txt w={700} size={13} color={C.brandLight}>{toPromote > 0 ? t('x0zhrkks', { toPromote, VP }) : t('x06g1dfi')}</Txt>
        <Txt w={700} size={12} color={C.brandMid}>{t('x0kksj4j')}</Txt>
      </View>
      <View style={{ borderRadius: 18, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, overflow: 'hidden' }}>
        {rows.map((r, i) => {
          const zone = i < PROMOTE ? 'up' : i >= rows.length - DEMOTE ? 'down' : 'mid'
          return (
            <View key={r.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: r.me ? C.brandLight : 'transparent', borderTopWidth: i === PROMOTE || i === rows.length - DEMOTE ? 2 : 0, borderTopColor: i === PROMOTE ? C.teal : C.coralLight }}>
              <Text style={[font(900, 15, zone === 'up' ? C.tealDark : zone === 'down' ? C.coralDark : C.muted), { width: 26 }]}>{i + 1}</Text>
              <View style={{ width: 32, height: 32, borderRadius: 32, backgroundColor: r.color, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={font(900, 14, C.white)}>{r.name[0]}</Text>
              </View>
              <Text style={[font(r.me ? 900 : 700, 15), { flex: 1 }]} numberOfLines={1}>{r.name}{r.me ? t('x0ilb3mx') : ''}</Text>
              <Text style={font(900, 14, C.brandDark)}>{r.xp}</Text>
            </View>
          )
        })}
      </View>
      <Txt w={700} size={12} color={C.muted}>{tx('x0qmcxyo', { PROMOTE, DEMOTE })}</Txt>
    </ScrollView>
  )
}
