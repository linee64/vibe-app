/** Общие блоки профиля / «Ещё» / настроек — как SettingsControls, HelpLink и Row веба */
import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Volume2, VolumeX } from 'lucide-react-native'
import { GOAL_OPTIONS } from '@web/lib/prefs'
import { t, type UIKey } from '@web/i18n/core'
import { playSound, setSoundOn, useSoundOn } from '../lib/sound'
import { track } from '../lib/analytics'
import { setDailyGoal, useDailyGoal } from '../lib/prefs'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Card, Chevron, IconBox, Switch } from './ui'
import { C, font } from '../theme'

/** Звуки вкл/выкл (по умолчанию включены) */
export function SoundToggle({ where = 'profile', style }: { where?: string; style?: object }) {
  const on = useSoundOn()
  const toggle = () => {
    const next = !on
    setSoundOn(next)
    track('sound_toggled', { enabled: next, where })
    if (next) playSound('correct')
  }
  return (
    <Card testID="sound-setting" style={[{ marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 }, style]}>
      <IconBox bg={C.tealLight} size={56}>
        {on ? <Volume2 size={28} color={C.tealDark} strokeWidth={2.4} /> : <VolumeX size={28} color={C.muted} strokeWidth={2.4} />}
      </IconBox>
      <View style={{ flex: 1 }}>
        <Text style={[font(900, 18), { lineHeight: 22 }]}>{t('sound.label')}</Text>
        <Text style={[font(600, 14, C.muted), { lineHeight: 18 }]}>{t('sound.hint')}</Text>
      </View>
      <Switch testID="sound-toggle" on={on} onToggle={toggle} label={t('sound.label')} />
    </Card>
  )
}

/** Карточка «Язык» со списком языков */
export function LanguageCard({ returnTo, style }: { returnTo: string; style?: object }) {
  return (
    <Card style={[{ marginTop: 24, padding: 16 }, style]}>
      <Text style={[font(900, 18), { lineHeight: 22 }]}>{t('lang.label')}</Text>
      <Text style={[font(600, 14, C.muted), { lineHeight: 18, marginBottom: 12 }]}>{t('lang.hint')}</Text>
      <LanguageSwitcher returnTo={returnTo} />
    </Card>
  )
}

/** Дневная цель (10/20/30/50 XP) — карточка как GoalPicker в More.tsx веба */
export function GoalPicker({ onSaved }: { onSaved?: (g: number) => void }) {
  const goal = useDailyGoal()
  return (
    <Card style={{ marginTop: 24, padding: 16 }}>
      <Text style={[font(900, 18), { lineHeight: 22 }]}>{t('settings.goalLabel')}</Text>
      <Text style={[font(600, 14, C.muted), { lineHeight: 18, marginBottom: 12 }]}>{t('settings.goalHint')}</Text>
      <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {GOAL_OPTIONS.map((g) => {
          const on = g === goal
          return (
            <Pressable
              key={g}
              testID={`goal-${g}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => {
                setDailyGoal(g)
                track('setting_changed', { setting: 'daily_goal', value: g })
                onSaved?.(g)
              }}
              style={{ flexBasis: '47%', flexGrow: 1, alignItems: 'center', borderRadius: 16, borderWidth: 2, borderColor: on ? C.brand : C.line, backgroundColor: on ? C.brandLight : C.white, paddingHorizontal: 12, paddingVertical: 10 }}
            >
              <Text style={font(900, 15, on ? C.brand : C.ink)}>{t(`settings.goal.${g}` as UIKey)}</Text>
              <Text style={font(700, 13, C.muted)}>{g} XP</Text>
            </Pressable>
          )
        })}
      </View>
    </Card>
  )
}

/** Строка-ссылка: иконка в цветном квадрате, заголовок, описание, «›» */
export function LinkRow({ icon, bg, title, desc, onPress, tone = 'ink', testID, big }: { icon: ReactNode; bg: string; title: string; desc?: string; onPress: () => void; tone?: 'ink' | 'coral'; testID?: string; big?: boolean }) {
  return (
    <Card testID={testID} onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: big ? 16 : 12, padding: 16 }}>
      <IconBox bg={bg} size={big ? 56 : 48}>
        {icon}
      </IconBox>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[font(900, big ? 18 : 17, tone === 'coral' ? C.coralDark : C.ink), { lineHeight: big ? 22 : 21 }]}>{title}</Text>
        {desc ? <Text style={[font(600, big ? 14 : 13, C.muted), { lineHeight: big ? 18 : 17 }]}>{desc}</Text> : null}
      </View>
      <Chevron />
    </Card>
  )
}

/** «‹ Назад» + заголовок для экранов из «Ещё» */
export function BackHeader({ title, sub, onBack }: { title: string; sub?: string; onBack: () => void }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Pressable testID="back" accessibilityRole="button" onPress={onBack} hitSlop={8} style={{ marginBottom: 8, alignSelf: 'flex-start' }}>
        <Text style={[font(800, 14, C.brand), { textTransform: 'uppercase', letterSpacing: 0.7 }]}>‹ {t('more.back')}</Text>
      </Pressable>
      <Text style={[font(900, 28), { lineHeight: 33 }]}>{title}</Text>
      {sub ? <Text style={font(600, 15, C.muted)}>{sub}</Text> : null}
    </View>
  )
}
