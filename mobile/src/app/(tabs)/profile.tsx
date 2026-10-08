import { useState } from 'react'
import { ScrollView, Switch, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { UNITS } from '@web/data/course'
import { HOMEWORKS } from '@web/data/homework'
import { VP, days } from '@web/data/economy'
import { PRO_FEATURES, TRIAL_DAYS, usd, PRICES } from '@web/data/pricing'
import { DEMO_MODE, SUPABASE_ENABLED } from '../../lib/env'
import { useStore } from '../../store/Store'
import { Mascot } from '../../components/Mascot'
import { Btn, Txt } from '../../components/ui'
import { Sheet } from '../../components/Sheet'
import { C, font } from '../../theme'

export default function ProfileScreen() {
  const { session, progress, logout, setUnlockAll, resetProgress } = useStore()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [confirm, setConfirm] = useState(false)
  const total = UNITS.reduce((n, u) => n + u.lessons.length, 0)
  const badges = HOMEWORKS.filter((h) => progress.homework.includes(h.id))

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.snow }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 30, paddingHorizontal: 16, gap: 12 }}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Mascot size={130} />
        <Txt w={900} size={24}>{session?.name ?? 'Гость'}</Txt>
        <Txt w={700} size={13} color={C.muted}>{session?.email}</Txt>
        <Txt w={700} size={12} color={C.muted}>{DEMO_MODE ? 'Демо-аккаунт' : 'Аккаунт Supabase'}</Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Stat value={`${progress.xp}`} label={VP} />
        <Stat value={`${progress.completed.length}/${total}`} label="уроков" />
        <Stat value={days(progress.streak)} label="серия" />
      </View>

      <View style={{ borderRadius: 18, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, padding: 14, gap: 6 }}>
        <Txt w={900} size={15}>Значки домашек</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {HOMEWORKS.map((h) => {
            const on = badges.some((b) => b.id === h.id)
            return (
              <View key={h.id} style={{ borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: on ? C.goldLight : C.snow, opacity: on ? 1 : 0.6 }}>
                <Text style={font(800, 13)}>{h.badge.emoji} {on ? h.badge.name : '???'}</Text>
              </View>
            )
          })}
        </View>
      </View>

      {progress.portfolioUrl ? (
        <View style={{ borderRadius: 18, backgroundColor: C.tealLight, padding: 14 }}>
          <Txt w={900} size={14} color={C.tealDark}>Портфолио</Txt>
          <Txt w={700} size={13}>{progress.portfolioUrl}</Txt>
        </View>
      ) : null}

      <View style={{ borderRadius: 18, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, padding: 14, gap: 8 }}>
        <Txt w={900} size={15}>Pro</Txt>
        <Txt w={700} size={13} color={C.muted}>{usd(PRICES.monthly)}/мес или {usd(PRICES.annual)}/год · {TRIAL_DAYS} дня бесплатно</Txt>
        {PRO_FEATURES.slice(0, 3).map((f) => (
          <Txt key={f} w={700} size={13}>• {f}</Txt>
        ))}
        <Btn testID="open-paywall" label="Открыть Pro" tone="gold" block onPress={() => router.push('/paywall')} />
      </View>

      <View style={{ borderRadius: 18, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, padding: 14, gap: 10 }}>
        <Txt w={900} size={15}>Настройки</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Txt w={800} size={14}>Разблокировать всё</Txt>
            <Txt w={600} size={12} color={C.muted}>Демо-переключатель тиров</Txt>
          </View>
          <Switch testID="unlock-all" value={progress.unlockAll} onValueChange={setUnlockAll} trackColor={{ true: C.brand, false: C.line }} />
        </View>
        <Btn label="Тест на уровень" tone="ghost" block onPress={() => router.push('/placement')} />
        <Btn label="Магазин токенов" tone="ghost" block onPress={() => router.push('/shop')} />
        <Btn testID="reset" label="Сбросить прогресс" tone="ghost" block onPress={() => setConfirm(true)} />
        <Btn testID="logout" label="Выйти" tone="coral" block onPress={logout} />
        <Txt w={600} size={11} color={C.muted}>
          {SUPABASE_ENABLED ? 'Прогресс синхронизируется с аккаунтом.' : 'Бэкенд не подключён — всё хранится на устройстве.'} Версия 1.0.0
        </Txt>
      </View>

      <Sheet open={confirm} onClose={() => setConfirm(false)} label="Сбросить прогресс">
        <Txt w={900} size={20} center>Сбросить прогресс?</Txt>
        <Txt w={600} size={14} color={C.muted} center>Уроки, токены и серия обнулятся. Это действие синхронизируется с аккаунтом.</Txt>
        <Btn label="Да, сбросить" tone="coral" block onPress={() => { resetProgress(); setConfirm(false) }} />
        <Btn label="Отмена" tone="ghost" block onPress={() => setConfirm(false)} />
      </Sheet>
    </ScrollView>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, borderRadius: 16, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, paddingVertical: 10, alignItems: 'center' }}>
      <Text style={font(900, 16)}>{value}</Text>
      <Text style={font(700, 11, C.muted)}>{label}</Text>
    </View>
  )
}
