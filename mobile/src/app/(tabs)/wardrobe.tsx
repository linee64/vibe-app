/** Гардероб Бипи — как src/screens/Wardrobe.tsx: примерочная, вкладки слотов, карточки вещей, покупка за токены, Pro-вещи → пейвол */
import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SKINS, buyBlocker, findSkin, lookOf, type SkinDef, type SkinLook, type SkinRarity, type SkinSlot } from '@web/data/skins'
import { tokens } from '@web/data/economy'
import { t, type UIKey } from '@web/i18n/core'
import { useStore } from '../../store/Store'
import { useIsPro } from '../../lib/billing'
import { playSound } from '../../lib/sound'
import { Check, Lock, Mascot, SlotGlyph, Token } from '../../components/art'
import { Btn } from '../../components/ui'
import { Pop } from '../../components/motion'
import { useToast } from '../../components/Toast'
import { C, alpha, caps, font } from '../../theme'

type Tab = 'all' | SkinSlot
const TABS: Tab[] = ['all', 'head', 'face', 'body']
const RARITY: Record<SkinRarity, { bg: string; fg: string; ring: string }> = {
  common: { bg: '#EFE9FF', fg: '#5B2FD6', ring: '#C7B6FF' },
  rare: { bg: '#DCF8F3', fg: '#0E9C8C', ring: '#8FE3D8' },
  legendary: { bg: '#FFF4D6', fg: '#8A6A1E', ring: '#FFC23D' },
}
const skinName = (s: SkinDef) => t(`skins.${s.id}.name` as UIKey)
const TEAL = { c: C.teal, e: C.tealDark }

function SkinCard({ skin, owned, equipped, selected, onPress }: { skin: SkinDef; owned: boolean; equipped: boolean; selected: boolean; onPress: () => void }) {
  const r = RARITY[skin.rarity]
  return (
    <Pressable
      testID={`skin-${skin.id}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{ flexBasis: '47%', flexGrow: 1, maxWidth: '50%', alignItems: 'center', borderRadius: 20, borderWidth: 2, borderColor: selected ? C.brand : C.line, borderBottomWidth: 6, borderBottomColor: selected ? C.brandDark : '#E7E3F2', backgroundColor: C.white, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 12 }}
    >
      {skin.pro ? (
        <View style={{ position: 'absolute', left: 8, top: 8, zIndex: 1, borderRadius: 6, backgroundColor: C.coral, paddingHorizontal: 6, paddingVertical: 1 }}>
          <Text style={[font(900, 10, C.white), caps(10)]}>Pro</Text>
        </View>
      ) : null}
      {equipped ? (
        <View style={{ position: 'absolute', right: 8, top: 8, zIndex: 1, borderRadius: 6, backgroundColor: C.teal, paddingHorizontal: 6, paddingVertical: 1 }}>
          <Text style={[font(900, 10, C.white), caps(10)]}>{t('wardrobe.equipped')}</Text>
        </View>
      ) : null}
      <View style={{ height: 92, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', borderRadius: 16, backgroundColor: r.bg }}>
        <Mascot mood="happy" laptop={false} size={78} look={{ [skin.slot]: skin.id }} />
      </View>
      <Text numberOfLines={2} style={[font(900, 14), { marginTop: 8, minHeight: 36, lineHeight: 18, textAlign: 'center' }]}>{skinName(skin)}</Text>
      <Text style={[font(900, 11, r.fg), caps(11), { marginTop: 4 }]}>{t(`wardrobe.rarity.${skin.rarity}`)}</Text>
      <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {owned ? (
          <Text style={font(900, 14, C.tealDark)}>{t('wardrobe.owned')}</Text>
        ) : (
          <>
            <Token size={16} />
            <Text style={font(900, 14)}>{skin.price}</Text>
          </>
        )}
      </View>
    </Pressable>
  )
}

export default function WardrobeScreen() {
  const router = useRouter()
  const toast = useToast()
  const isPro = useIsPro()
  const { progress, buySkin, equipSkin, unequipSkin } = useStore()
  const [tab, setTab] = useState<Tab>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [cheer, setCheer] = useState(0)
  const [justBought, setJustBought] = useState<string | null>(null)

  const worn = lookOf(progress.skins)
  const owned = progress.skins?.owned ?? []
  const skin = selected ? findSkin(selected) : undefined
  const preview: SkinLook = skin ? { ...worn, [skin.slot]: skin.id } : worn
  const list = SKINS.filter((s) => tab === 'all' || s.slot === tab)
  const isOwned = !!skin && owned.includes(skin.id)
  const isWorn = !!skin && worn[skin.slot] === skin.id
  const blocker = skin ? buyBlocker(progress.skins, progress.gems, skin.id, isPro) : null
  const wornCount = Object.keys(worn).length

  const buy = () => {
    if (!skin) return
    if (blocker === 'pro') return router.push({ pathname: '/paywall', params: { title: skinName(skin), source: 'skin' } })
    const res = buySkin(skin.id, isPro)
    if (!res.ok) return
    playSound('purchase')
    setJustBought(skin.id)
    setCheer((n) => n + 1)
    toast(t('wardrobe.bought', { name: skinName(skin) }))
  }

  const mascot = <Mascot mood="happy" laptop={false} size={170} look={preview} />
  return (
    <ScrollView testID="wardrobe-screen" style={{ flex: 1, backgroundColor: C.white }} contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 40 }}>
      <View style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={[font(900, 28), { lineHeight: 33 }]}>{t('wardrobe.title')}</Text>
          <Text style={[font(600, 15, C.muted), { marginTop: 4, lineHeight: 20 }]}>{t('wardrobe.subtitle')}</Text>
        </View>
        <View accessibilityLabel={tokens(progress.gems)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Token size={22} />
          <Text style={font(900, 17, C.tealDark)}>{progress.gems}</Text>
        </View>
      </View>

      <View testID="wardrobe-preview" style={{ marginBottom: 24, overflow: 'hidden', borderRadius: 26, backgroundColor: alpha(C.brandLight, 0.7), padding: 20 }}>
        <View pointerEvents="none" style={{ position: 'absolute', right: -40, top: -48, width: 160, height: 160, borderRadius: 80, backgroundColor: alpha(C.coral, 0.15) }} />
        <View pointerEvents="none" style={{ position: 'absolute', left: -40, bottom: -64, width: 144, height: 144, borderRadius: 72, backgroundColor: alpha(C.teal, 0.15) }} />
        <View style={{ alignItems: 'center' }}>{cheer ? <Pop key={cheer}>{mascot}</Pop> : mascot}</View>
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          {skin ? (
            <>
              <Text style={[font(900, 12, RARITY[skin.rarity].fg), caps(12), { textAlign: 'center' }]}>
                {isWorn ? t('wardrobe.equipped') : isOwned ? t('wardrobe.owned') : t('wardrobe.tryOn')} · {t(`wardrobe.rarity.${skin.rarity}`)}
              </Text>
              <Text style={[font(900, 22), { marginTop: 2, lineHeight: 27, textAlign: 'center' }]}>{skinName(skin)}</Text>
              <Text style={[font(600, 15, C.muted), { marginTop: 4, lineHeight: 20, textAlign: 'center' }]}>{t(`skins.${skin.id}.desc` as UIKey)}</Text>
              <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                {isWorn && justBought === skin.id ? (
                  <Btn small colors={TEAL} disabled icon={<Check size={16} color={C.disabledText} />} label={t('wardrobe.equipped')} />
                ) : isWorn ? (
                  <Btn testID="wardrobe-unequip" small tone="ghost" label={t('wardrobe.unequip')} onPress={() => unequipSkin(skin.slot)} />
                ) : isOwned ? (
                  <Btn testID="wardrobe-equip" small colors={TEAL} label={t('wardrobe.equip')} onPress={() => equipSkin(skin.id)} />
                ) : blocker === 'pro' ? (
                  <Btn testID="wardrobe-pro" small tone="coral" icon={<Lock size={16} color={C.white} />} label={t('wardrobe.proOnly')} onPress={buy} />
                ) : blocker === 'balance' ? (
                  <>
                    <Btn small disabled icon={<Token size={16} />} label={t('wardrobe.need', { tokens: tokens(skin.price - progress.gems) })} />
                    <Btn small tone="ghost" label={t('wardrobe.toQuests')} onPress={() => router.navigate('/(tabs)/quests')} />
                  </>
                ) : (
                  <Btn testID="wardrobe-buy" small label={`${t('wardrobe.buy')} ·`} onPress={buy} after={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Token size={16} /><Text style={font(800, 13, C.white)}>{skin.price}</Text></View>} />
                )}
              </View>
            </>
          ) : (
            <>
              <Text style={[font(900, 20), { lineHeight: 24, textAlign: 'center' }]}>{wornCount ? t('wardrobe.lookTitle') : t('wardrobe.pick')}</Text>
              <Text style={[font(600, 15, C.muted), { marginTop: 4, lineHeight: 20, textAlign: 'center' }]}>{t('wardrobe.earn')}</Text>
              <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                <Btn small tone="ghost" label={t('wardrobe.toQuests')} onPress={() => router.navigate('/(tabs)/quests')} />
                {wornCount > 0 ? <Btn small tone="ghost" label={t('wardrobe.removeAll')} onPress={() => (['head', 'face', 'body'] as const).forEach((s) => unequipSkin(s))} /> : null}
              </View>
            </>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16, flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
        {TABS.map((k) => {
          const on = tab === k
          return (
            <Pressable key={k} testID={`wardrobe-tab-${k}`} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => setTab(k)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 16, borderWidth: 2, borderColor: on ? C.brandMid : C.line, backgroundColor: on ? C.brandLight : C.white, paddingHorizontal: 14, paddingVertical: 8 }}>
              <SlotGlyph slot={k} size={20} />
              <Text style={font(800, 14, on ? C.brand : C.muted)}>{t(`wardrobe.slot.${k}`)}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {list.map((s) => (
          <SkinCard
            key={s.id}
            skin={s}
            owned={owned.includes(s.id)}
            equipped={worn[s.slot] === s.id}
            selected={selected === s.id}
            onPress={() => {
              setJustBought(null)
              setSelected((x) => (x === s.id ? null : s.id))
            }}
          />
        ))}
      </View>
    </ScrollView>
  )
}
