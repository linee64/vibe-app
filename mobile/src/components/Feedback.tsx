/**
 * «Отзыв» в мобильном приложении: лица Бипи вместо звёзд, чипы тем, текст, почта для гостей,
 * переключатель «приложим технические детали». Плюс микро-опросы (первый урок, пейвол, домашка).
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Pressable, Switch, Text, TextInput, View } from 'react-native'
import { usePathname } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg'
import {
  FEEDBACK_MAX_MESSAGE,
  canSubmitFeedback,
  isValidEmail,
  type FeedbackCategory,
  type MicroPromptKind,
} from '@web/data/feedback'
import { useStore } from '../store/Store'
import { collectContext, flushFeedbackOutbox, onMicroChange, submitFeedback, takeMicroPrompt } from '../lib/feedback'
import { track } from '../lib/analytics'
import { Sheet } from './Sheet'
import { FeedbackCtx, useFeedback } from './feedbackContext'
import { Mascot, MascotHead } from './Mascot'
import { Btn, Txt } from './ui'
import { C, font } from '../theme'
import { feedbackCategoryLabel, manualCategories, paywallReasons, ratingLabel } from '@web/i18n/labels'
import { t } from '@web/i18n/core'

const INK = '#2F2A47'
const FACE_SCREEN = ['#FFE9E2', '#FFF1E6', '#FFF4D6', '#DCF8F3', '#EFE9FF']
const FACE_CHEEK = ['#FF9C85', '#FF9C85', '#FFB98A', '#7FDCCF', '#C7B6FF']

/** Голова Бипи с настроением 1–5 (та же, что в вебе) */
export function BipiFace({ rating, size = 40 }: { rating: number; size?: number }) {
  const i = Math.min(5, Math.max(1, rating)) - 1
  const sad = rating <= 2
  return (
    <Svg viewBox="0 0 64 64" width={size} height={size}>
      {sad ? <Path d="M32 13 Q30 8 24 7" stroke={C.brandDark} strokeWidth={3.4} strokeLinecap="round" fill="none" /> : <Path d="M32 13V6" stroke={C.brandDark} strokeWidth={3.4} strokeLinecap="round" />}
      <Circle cx={sad ? 23 : 32} cy={sad ? 7.5 : 6} r={4.2} fill={rating >= 4 ? C.coral : rating === 3 ? C.gold : '#C9C3DD'} />
      <Rect x={4} y={26} width={7} height={16} rx={3.5} fill={C.teal} />
      <Rect x={53} y={26} width={7} height={16} rx={3.5} fill={C.teal} />
      <Rect x={8} y={17} width={48} height={41} rx={17} fill={C.brandDark} />
      <Rect x={8} y={14} width={48} height={41} rx={17} fill={C.brand} />
      <Rect x={14} y={20} width={36} height={29} rx={12} fill={FACE_SCREEN[i]} />
      {rating === 1 ? (
        <G stroke={INK} strokeWidth={2.2} strokeLinecap="round">
          <Path d="M20.5 26.5 L28 28.5" />
          <Path d="M43.5 26.5 L36 28.5" />
        </G>
      ) : null}
      {rating >= 5 ? (
        <G stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none">
          <Path d="M21 34 Q25 28.5 29 34" />
          <Path d="M35 34 Q39 28.5 43 34" />
        </G>
      ) : (
        <G>
          <Ellipse cx={25} cy={33} rx={3.4} ry={sad ? 3.2 : 4.2} fill={INK} />
          <Ellipse cx={39} cy={33} rx={3.4} ry={sad ? 3.2 : 4.2} fill={INK} />
          <Circle cx={26.2} cy={31.6} r={1.2} fill="#fff" />
          <Circle cx={40.2} cy={31.6} r={1.2} fill="#fff" />
        </G>
      )}
      {rating >= 3 ? <Ellipse cx={19.5} cy={40} rx={2.8} ry={1.7} fill={FACE_CHEEK[i]} /> : null}
      {rating >= 3 ? <Ellipse cx={44.5} cy={40} rx={2.8} ry={1.7} fill={FACE_CHEEK[i]} /> : null}
      {rating === 1 ? <Path d="M26 44 Q32 38.5 38 44" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" /> : null}
      {rating === 2 ? <Path d="M27 43 Q32 40.5 37 43" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" /> : null}
      {rating === 3 ? <Path d="M27 41.5 H37" stroke={INK} strokeWidth={2.6} strokeLinecap="round" /> : null}
      {rating === 4 ? <Path d="M26.5 39.5 Q32 44.5 37.5 39.5" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" /> : null}
      {rating === 5 ? (
        <G>
          <Path d="M25.5 38.5 H38.5 Q38 46 32 46 Q26 46 25.5 38.5 Z" fill={INK} />
          <Ellipse cx={32} cy={43.6} rx={3.4} ry={1.7} fill={C.coral} />
        </G>
      ) : null}
      {rating === 1 ? <Path d="M45 36 q1.6 2.6 0 4 q-1.6 -1.4 0 -4z" fill="#2EB6F5" /> : null}
    </Svg>
  )
}

export function RatingFaces({ value, onChange, size = 40 }: { value: number | null; onChange: (r: number) => void; size?: number }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="radiogroup">
        {[1, 2, 3, 4, 5].map((r) => {
          const on = value === r
          return (
            <Pressable
              key={r}
              testID={`rating-${r}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t('x00saag5', { r, r2: ratingLabel(r) })}
              onPress={() => onChange(r)}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: on ? C.brandMid : C.line, backgroundColor: on ? C.brandLight : C.white, opacity: value !== null && !on ? 0.55 : 1, transform: [{ scale: on ? 1.05 : 1 }] }}
            >
              <BipiFace rating={r} size={size} />
            </Pressable>
          )
        })}
      </View>
      <Text style={[font(800, 13, C.brand), { textAlign: 'center', marginTop: 4, minHeight: 18 }]}>{value ? ratingLabel(value) : ''}</Text>
    </View>
  )
}

function Chips({ items, value, onChange }: { items: { id: FeedbackCategory; label: string; emoji?: string }[]; value: FeedbackCategory | null; onChange: (c: FeedbackCategory | null) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {items.map((c) => {
        const on = value === c.id
        return (
          <Pressable key={c.id} testID={`chip-${c.id}`} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => onChange(on ? null : c.id)} style={{ borderRadius: 99, borderWidth: 2, borderBottomWidth: 4, borderColor: on ? C.brand : C.line, borderBottomColor: on ? C.brandDark : C.line, backgroundColor: on ? C.brand : C.white, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={font(800, 14, on ? C.white : C.ink)}>
              {c.emoji ? `${c.emoji} ` : ''}
              {c.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const input = { borderRadius: 16, borderWidth: 2, borderColor: C.line, backgroundColor: C.snow, paddingHorizontal: 14, paddingVertical: 10, ...font(700, 15) } as const

function Thanks({ onClose, compact }: { onClose?: () => void; compact?: boolean }) {
  return (
    <View testID="feedback-thanks" style={{ alignItems: 'center', gap: 6 }}>
      <Mascot mood="happy" size={compact ? 80 : 120} />
      <Txt w={900} size={compact ? 18 : 22} center>{t('x00nmb14')}</Txt>
      <Txt w={600} size={14} color={C.muted} center>{t('x1pfyx8d')}</Txt>
      {onClose ? <Btn label={t('x1e0jmys')} block onPress={onClose} style={{ alignSelf: 'stretch', marginTop: 8 }} /> : null}
    </View>
  )
}

/** Лист «Отзыв» (форма монтируется заново при каждом открытии — состояние сбрасывается само) */
export function FeedbackSheet({ open, onClose, route }: { open: boolean; onClose: () => void; route: string }) {
  return (
    <Sheet open={open} onClose={onClose} label={t('x078t777')}>
      {open ? <FeedbackForm onClose={onClose} route={route} /> : null}
    </Sheet>
  )
}

function FeedbackForm({ onClose, route }: { onClose: () => void; route: string }) {
  const { session } = useStore()
  const [rating, setRating] = useState<number | null>(null)
  const [category, setCategory] = useState<FeedbackCategory | null>(null)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [withContext, setWithContext] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const askEmail = !session?.real
  const context = useMemo(() => collectContext(route), [route])

  const emailBad = email.trim() !== '' && !isValidEmail(email.trim())
  const ready = canSubmitFeedback({ rating, category, message, email: askEmail ? email : undefined }) && !busy && !emailBad

  const send = async () => {
    if (!ready) return
    setBusy(true)
    setError(null)
    const res = await submitFeedback({ rating, category, message, email: askEmail ? email.trim() || undefined : undefined, source: 'manual', context: withContext ? context : {} })
    setBusy(false)
    if (res.ok) setDone(true)
    else setError(res.message)
  }

  return (
    <>
      {done ? (
        <Thanks onClose={onClose} />
      ) : (
        <View testID="feedback-sheet" style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: C.brandLight, alignItems: 'center', justifyContent: 'center' }}>
              <MascotHead size={38} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt w={900} size={20}>{t('x17htg15')}</Txt>
              <Txt w={600} size={13} color={C.muted}>{t('x1r3mbi8')}</Txt>
            </View>
          </View>
          <RatingFaces value={rating} onChange={setRating} />
          <Txt w={900} size={12} color={C.muted}>{t('x05izj5d')}</Txt>
          <Chips items={manualCategories()} value={category} onChange={setCategory} />
          <View>
            <TextInput
              testID="feedback-text"
              value={message}
              onChangeText={setMessage}
              maxLength={FEEDBACK_MAX_MESSAGE}
              multiline
              placeholder={t('x1rcq5p5')}
              placeholderTextColor="#AAA4C0"
              style={[input, { minHeight: 96, textAlignVertical: 'top', paddingBottom: 22 }]}
              accessibilityLabel={t('x1oz6pfb')}
            />
            <Text style={[font(700, 11, message.length > FEEDBACK_MAX_MESSAGE - 100 ? C.coralDark : '#B3ADC8'), { position: 'absolute', right: 12, bottom: 6 }]}>
              {message.length}/{FEEDBACK_MAX_MESSAGE}
            </Text>
          </View>
          {askEmail ? (
            <View>
              <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder={t('x1s6yp2m')} placeholderTextColor="#AAA4C0" style={[input, emailBad && { borderColor: C.coral }]} accessibilityLabel={t('x1lo1qnc')} />
              {emailBad ? <Txt w={700} size={12} color={C.coralDark}>{t('x12isppe')}</Txt> : null}
            </View>
          ) : null}
          <View style={{ borderRadius: 16, backgroundColor: C.snow, padding: 12, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Switch testID="feedback-context" value={withContext} onValueChange={setWithContext} trackColor={{ true: C.teal, false: C.line }} thumbColor={C.white} />
              <Txt w={700} size={14} style={{ flex: 1 }}>{t('x0awe2t4')}</Txt>
              <Pressable onPress={() => setShowDetails((v) => !v)} hitSlop={8}>
                <Text style={font(800, 13, C.brand)}>{showDetails ? t('x0oeirp5') : t('x0kmtlhe')}</Text>
              </Pressable>
            </View>
            {showDetails ? (
              <Txt w={600} size={12} color={C.muted}>{t('x046lzup')}{' '}{context.route}
                {context.lesson_id ? t('x0oiwtg9', { lesson_id: context.lesson_id }) : ''}{' '}{t('x0dh7tc1')}{' '}{context.app_version} · {context.platform} · {context.viewport}{t('x0fo7t4f')}</Txt>
            ) : null}
          </View>
          {error ? <Txt w={700} size={13} color={C.coralDark}>{error}</Txt> : null}
          <Btn testID="feedback-send" label={busy ? t('x0xqc2da') : t('x0x5ywt2')} block disabled={!ready} onPress={() => void send()} />
        </View>
      )}
    </>
  )
}

const MICRO_COPY: Record<MicroPromptKind, { title: string; sub: string }> = {
  first_lesson: { get title() { return t('x1mjvjpo') }, get sub() { return t('x0boknei') } },
  homework: { get title() { return t('x18i9gb7') }, get sub() { return t('x1e8mfhz') } },
  paywall_exit: { get title() { return t('x1pdlh9q') }, get sub() { return t('x0lxb58t') } },
}

/** Карточка микро-опроса над нижним меню: не модалка, закрывается крестиком */
export function MicroPromptCard({ kind, route, onClose }: { kind: MicroPromptKind; route: string; onClose: () => void }) {
  const [rating, setRating] = useState<number | null>(null)
  const [category, setCategory] = useState<FeedbackCategory | null>(null)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const copy = MICRO_COPY[kind]
  const picked = kind === 'paywall_exit' ? category !== null : rating !== null

  useEffect(() => {
    if (!done) return
    const t = setTimeout(onClose, 2600)
    return () => clearTimeout(t)
  }, [done, onClose])

  const send = async () => {
    if (!picked || busy) return
    setBusy(true)
    await submitFeedback({ rating, category, message, source: kind, context: collectContext(route) })
    setBusy(false)
    setDone(true)
  }

  return (
    <Animated.View entering={FadeInDown.springify().damping(18)} testID={`micro-${kind}`} style={{ position: 'absolute', left: 12, right: 12, bottom: 12, borderRadius: 22, borderWidth: 2, borderColor: C.line, borderBottomWidth: 6, backgroundColor: C.white, padding: 14, gap: 10 }}>
      <Pressable accessibilityLabel={t('x1y40goj')} onPress={() => { if (!done) track('micro_prompt_dismissed', { source: kind }); onClose() }} hitSlop={10} style={{ position: 'absolute', right: 12, top: 10, zIndex: 2 }}>
        <Text style={font(900, 18, '#B3ADC8')}>✕</Text>
      </Pressable>
      {done ? (
        <Thanks compact />
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 24 }}>
            <MascotHead size={36} />
            <View style={{ flex: 1 }}>
              <Txt w={900} size={17}>{copy.title}</Txt>
              <Txt w={600} size={12} color={C.muted}>{copy.sub}</Txt>
            </View>
          </View>
          {kind === 'paywall_exit' ? <Chips items={paywallReasons()} value={category} onChange={setCategory} /> : <RatingFaces value={rating} onChange={setRating} size={34} />}
          {picked ? (
            <>
              <TextInput value={message} onChangeText={setMessage} maxLength={FEEDBACK_MAX_MESSAGE} multiline placeholder={kind === 'paywall_exit' && category ? t('x0d5b84l', { category: feedbackCategoryLabel(category) }) : t('x09b04yc')} placeholderTextColor="#AAA4C0" style={[input, { minHeight: 56, textAlignVertical: 'top', fontSize: 14 }]} />
              <Btn testID="micro-send" label={busy ? t('x0xqc2da') : t('x0x5ywt2')} small block disabled={busy} onPress={() => void send()} />
            </>
          ) : null}
        </>
      )}
    </Animated.View>
  )
}

/** Неприметная кнопка «Отзыв» для шапки */
export function FeedbackButton({ entry }: { entry: string }) {
  const fb = useFeedback()
  return (
    <Pressable testID="feedback-header" accessibilityRole="button" accessibilityLabel={t('x1kira6i')} onPress={() => fb.open(entry)} hitSlop={6} style={{ width: 34, height: 34, borderRadius: 12, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' }}>
      <Svg viewBox="0 0 24 24" width={18} height={18} fill="none">
        <Path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke={C.brand} strokeWidth={2.2} strokeLinejoin="round" />
        <Circle cx={8.5} cy={11} r={1.3} fill={C.brand} />
        <Circle cx={12} cy={11} r={1.3} fill={C.brand} />
        <Circle cx={15.5} cy={11} r={1.3} fill={C.brand} />
      </Svg>
    </Pressable>
  )
}

// ---------------------------------------------------------------- провайдер


/** Экраны, где микро-опросы не показываем (урок, домашка, тест, пейвол, вход) */
const BUSY_ROUTE = /^\/(lesson|homework|placement|paywall|login|shop|tier-up|lesson-complete)/

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [micro, setMicro] = useState<MicroPromptKind | null>(null)
  const microRef = useRef<MicroPromptKind | null>(null)
  const route = pathname || '/'

  const openSheet = useCallback((entry = 'unknown') => {
    track('feedback_opened', { entry })
    setOpen(true)
  }, [])

  useEffect(() => {
    void flushFeedbackOutbox()
  }, [])

  useEffect(() => {
    const check = async () => {
      if (microRef.current || BUSY_ROUTE.test(route)) return
      const k = await takeMicroPrompt()
      if (k) {
        microRef.current = k
        setMicro(k)
      }
    }
    const t = setTimeout(() => void check(), 700)
    const off = onMicroChange(() => void check())
    return () => {
      clearTimeout(t)
      off()
    }
  }, [route])

  const value = useMemo(() => ({ open: openSheet }), [openSheet])
  return (
    <FeedbackCtx.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        {micro && !BUSY_ROUTE.test(route) ? (
          <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: route.startsWith('/learn') || route === '/' || route.startsWith('/profile') || route.startsWith('/league') ? 76 : 16, top: 0 }}>
            <MicroPromptCard
              kind={micro}
              route={route}
              onClose={() => {
                microRef.current = null
                setMicro(null)
              }}
            />
          </View>
        ) : null}
      </View>
      <FeedbackSheet open={open} onClose={() => setOpen(false)} route={route} />
    </FeedbackCtx.Provider>
  )
}
