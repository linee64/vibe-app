/** Лига — как src/screens/Leaderboard.tsx: ряд щитов, Аметистовая лига, зоны повышения/понижения, демо-участники */
import { Fragment } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { DEMOTE, PROMOTE, leagueRows } from '@web/data/league'
import { rawMessage, t, type UIKey } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'
import { useStore } from '../../store/Store'
import { MascotHead, Shield } from '../../components/art'
import { C, alpha, caps, font } from '../../theme'

const LEAGUES = [
  { name: () => t('x0tp0xxq'), color: '#E0A27A', dark: '#B97A52' },
  { name: () => t('x0xl5x3l'), color: '#C9C3DD', dark: '#A39DBA' },
  { name: () => t('x0yyuo2p'), color: '#FFC23D', dark: '#E5A100' },
  { name: () => t('x0yt6bkd'), color: '#7C4DFF', dark: '#5B2FD6' },
  { name: () => t('x1jk7hdb'), color: '#FF7A59', dark: '#E0573A' },
  { name: () => t('x1w5caxt'), color: '#13C2AE', dark: '#0E9C8C' },
]

function ZoneLine({ k, color, light }: { k: UIKey; color: string; light: string }) {
  const line = () => <View style={{ height: 2, flex: 1, backgroundColor: light }} />
  // «<0/>▲ Зона повышения<1/>»: линии — отдельными View, текст посередине
  const label = rawMessage(k).replace(/<\d+\/>/g, '')
  return (
    <View style={{ marginVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {line()}
      <Text style={[font(900, 13, color), caps(13)]}>{label.trim()}</Text>
      {line()}
    </View>
  )
}

export default function LeagueScreen() {
  const { session, progress } = useStore()
  const rows = leagueRows(session?.name ?? t('x0prirvu'), progress.todayXp)
  return (
    <ScrollView testID="league-screen" style={{ flex: 1, backgroundColor: C.white }} contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 40 }}>
      <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8 }}>
        {LEAGUES.map((l, i) => {
          const cur = i === 3
          const locked = i > 3
          return (
            <View key={i} accessibilityLabel={l.name()} style={{ opacity: locked ? 0.35 : 1, paddingBottom: cur ? 0 : 4 }}>
              <Shield size={cur ? 68 : 44} color={locked ? '#C9C3DD' : l.color} dark={locked ? '#A39DBA' : l.dark} />
            </View>
          )
        })}
      </View>
      <Text style={[font(900, 28), { textAlign: 'center' }]}>{t('x1p5r6fo')}</Text>
      <Text style={[font(600, 16, C.muted), { textAlign: 'center', marginTop: 4 }]}>{tx('x0poudtm', { PROMOTE })}</Text>
      <Text style={[font(800, 15, C.coralDark), { textAlign: 'center', marginTop: 4 }]}>{t('x0ud60yf')}</Text>
      <View style={{ marginTop: 16, alignSelf: 'center', borderRadius: 99, borderWidth: 2, borderStyle: 'dashed', borderColor: C.brandMid, backgroundColor: alpha(C.brandLight, 0.6), paddingHorizontal: 16, paddingVertical: 6 }}>
        <Text style={font(800, 13, C.brandDark)}>{t('x0rg2oi5')}</Text>
      </View>

      <View style={{ marginTop: 24, borderTopWidth: 2, borderTopColor: C.line, paddingTop: 8 }}>
        {rows.map((r, i) => {
          const rank = i + 1
          const me = !!r.me
          const medal = rank === 1 ? '#FFC23D' : rank === 2 ? '#C9C3DD' : rank === 3 ? '#E0A27A' : null
          return (
            <Fragment key={r.name}>
              {i === PROMOTE ? <ZoneLine k="x0urkcyd" color={C.tealDark} light={C.tealLight} /> : null}
              {i === rows.length - DEMOTE ? <ZoneLine k="x0jrzzx3" color={C.coralDark} light={C.coralLight} /> : null}
              <View testID={me ? 'league-me' : undefined} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: me ? C.brandLight : 'transparent' }}>
                <View style={{ width: 32, alignItems: 'center' }}>
                  {medal ? (
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: medal, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={font(900, 15, C.white)}>{rank}</Text>
                    </View>
                  ) : (
                    <Text style={font(900, 17, rank <= PROMOTE ? C.tealDark : rank > rows.length - DEMOTE ? C.coralDark : C.muted)}>{rank}</Text>
                  )}
                </View>
                {me ? (
                  <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: C.brandMid, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' }}>
                    <MascotHead size={34} />
                  </View>
                ) : (
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: r.color, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={font(900, 18, C.white)}>{r.name.split(' ').map((w) => w[0]).join('')}</Text>
                  </View>
                )}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <Text numberOfLines={1} style={[font(800, 17, me ? C.brand : C.ink), { flexShrink: 1 }]}>{r.name}</Text>
                  {me ? (
                    <View style={{ borderRadius: 6, backgroundColor: C.brand, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={[font(900, 11, C.white), caps(11)]}>{t('x07qyl3e')}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={font(700, 16, C.muted)}>{t('x1oa57ts', { xp: r.xp })}</Text>
              </View>
            </Fragment>
          )
        })}
      </View>
    </ScrollView>
  )
}
