import { useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Svg, { Ellipse, Path } from 'react-native-svg'
import { BUG_CODE, BUG_ERROR, FIX_CODE, type CardState, type DebugState, type DebugUi, type DeployState, type DeployUi, type FormState, type FormUi, type LandingState, type LandingUi, type PaletteKey } from '@web/homework/sims'
import { useStore } from '../../store/Store'
import { highlight, mono } from '../code'
import { BrowserBar } from '../exercises/shared'
import { C, font } from '../../theme'
import { t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'

const QUALITY = () => [t('m.preview.quality.1'), t('m.preview.quality.2'), t('m.preview.quality.3'), t('m.preview.quality.4'), t('m.preview.quality.5'), t('m.preview.quality.6')]
const MENU = (): [string, string][] => [[t('m.preview.menu.1'), t('m.preview.menuPrice.1')], [t('m.preview.menu.2'), t('m.preview.menuPrice.2')], [t('m.preview.menu.3'), t('m.preview.menuPrice.3')], [t('m.preview.menu.4'), t('m.preview.menuPrice.4')]]

interface Pal { bg: string; hero: string; accent: string; dark: string; text: string; soft: string }
const PALETTES: Record<PaletteKey, Pal> = {
  none: { bg: '#F6F6F8', hero: '#E9E9EE', accent: '#A3A3B2', dark: '#6E6E80', text: '#55556A', soft: '#FFFFFF' },
  coffee: { bg: '#FFF8F0', hero: '#F3DFC9', accent: '#8B5A3C', dark: '#5C3A24', text: '#4A3326', soft: '#FFFFFF' },
  violet: { bg: '#F7F4FF', hero: '#EFE9FF', accent: '#7C4DFF', dark: '#5B2FD6', text: '#2F2A47', soft: '#FFFFFF' },
  coral: { bg: '#FFF7F4', hero: '#FFE9E2', accent: '#FF7A59', dark: '#E0573A', text: '#3A2A2A', soft: '#FFFFFF' },
  teal: { bg: '#F2FCFA', hero: '#DCF8F3', accent: '#13C2AE', dark: '#0E9C8C', text: '#21333A', soft: '#FFFFFF' },
  amber: { bg: '#FFFAF0', hero: '#FFF1D9', accent: '#FFA41B', dark: '#D97F00', text: '#3D2E12', soft: '#FFFFFF' },
}

function Cup({ size = 70, color = '#8B5A3C', dark = '#5C3A24' }: { size?: number; color?: string; dark?: string }) {
  return (
    <Svg viewBox="0 0 160 160" width={size} height={size}>
      <Ellipse cx="80" cy="150" rx="46" ry="6" fill={dark} opacity={0.15} />
      <Path d="M38 58 H112 V104 a28 28 0 0 1-28 28 H66 a28 28 0 0 1-28-28 Z" fill={color} />
      <Path d="M112 70 H124 a16 16 0 0 1 0 32 H112" stroke={dark} strokeWidth={8} fill="none" />
      <Ellipse cx="75" cy="58" rx="37" ry="10" fill={dark} />
      <Ellipse cx="75" cy="56" rx="30" ry="7" fill="#F3DFC9" />
    </Svg>
  )
}

function Frame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <View style={{ alignSelf: 'stretch', maxWidth: '100%', overflow: 'hidden', borderRadius: 18, borderWidth: 2, borderColor: C.line, backgroundColor: C.white }}>
      <BrowserBar url={url} />
      {children}
    </View>
  )
}

function Empty({ text }: { text: string }) {
  return <Text style={[font(700, 14, C.muted), { textAlign: 'center', padding: 28 }]}>{text}</Text>
}

/* ------------------------------------------------------------------ 1. Карточка товара */

export function CardPreview({ state: s }: { state: CardState }) {
  const score = [s.role, s.goal, s.context, s.limits, s.format].filter(Boolean).length
  const wordsN = s.limits ? (s.format ? 54 : 46) : 340
  const intro = !s.role ? (s.context ? t('x1wteu36') : t('x0kdn1dy')) : s.context ? (s.friendly ? t('preview.card.introFriendly') : t('preview.card.introFormal')) : t('x0rhs48l')
  const bullets = s.context ? [t('x07jtkk9'), t('x1jt4vnf'), t('x07s0h87')] : [t('x10d55m5'), t('x179xy6d'), t('x114f7mk')]
  const cta = s.context ? (s.friendly ? t('x1lxv5n9') : t('x0dsakga')) : t('x0s1pywm')
  const title = s.format ? (s.context ? t('x11pp66v') : t('x0wz1wgz')) : null
  const bar = score === 5 ? C.teal : score >= 3 ? C.gold : C.coral
  return (
    <View style={{ gap: 10 }}>
      <Frame url="market.example/teplyi-dom/termo">
        <View style={{ padding: 12, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ borderRadius: 8, backgroundColor: C.coral, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={font(900, 11, C.white)}>{t('x0log3a0')}</Text>
            </View>
            <View style={{ flex: 1, height: 26, borderRadius: 8, backgroundColor: C.snow }} />
          </View>
          <View style={{ alignItems: 'center', borderRadius: 16, backgroundColor: C.brandLight, paddingVertical: 10 }}>
            <Cup size={100} />
          </View>
          {!s.asked ? (
            <View style={{ gap: 6 }}>
              {[0.8, 1, 0.9, 0.6].map((w, i) => (
                <View key={i} style={{ height: i === 0 ? 18 : 11, width: `${w * 100}%`, borderRadius: 6, backgroundColor: i === 0 ? C.line : C.snow }} />
              ))}
              <Text style={font(700, 12.5, C.muted)}>{t('x1trmmw4')}</Text>
            </View>
          ) : !s.goal ? (
            <View style={{ borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: C.line, padding: 12 }}>
              <Text style={font(700, 13.5, C.muted)}>{t('x1gkwbut')}</Text>
            </View>
          ) : (
            <View style={{ gap: 6 }}>
              <Text style={font(900, title ? 17 : 15, title ? C.ink : C.muted)}>{title ?? t('x1ifcvmc')}</Text>
              <Text style={font(800, 12, C.goldDark)}>★★★★★ <Text style={font(800, 12, C.muted)}>{t('x0loduu3')}</Text></Text>
              {s.format ? (
                <View style={{ gap: 4 }}>
                  <Text style={font(600, 13.5)}>{intro}</Text>
                  {bullets.map((b) => (
                    <Text key={b} style={font(700, 13.5)}>{'• '}{b}</Text>
                  ))}
                  <Text style={font(800, 13.5, C.brandDark)}>{cta}</Text>
                </View>
              ) : (
                <Text style={font(600, 13.5)}>{intro} {bullets.join('. ')}. {cta}</Text>
              )}
              {!s.limits ? <Text numberOfLines={3} style={font(600, 12, C.muted)}>{t('x1z0a03a')}</Text> : null}
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={font(900, 18)}>1 290 ₽</Text>
            <View style={{ borderRadius: 12, backgroundColor: C.brand, paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 3, borderBottomColor: C.brandDark }}>
              <Text style={font(900, 12, C.white)}>{t('x1wg0rhy')}</Text>
            </View>
          </View>
        </View>
      </Frame>
      <View style={{ alignSelf: 'stretch', maxWidth: '100%', borderRadius: 16, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, padding: 12, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[font(800, 13, C.muted), { textTransform: 'uppercase' }]}>{t('x18lpc17')}</Text>
          <Text style={font(900, 14, score === 5 ? C.tealDark : score >= 3 ? C.goldDark : C.coralDark)}>{QUALITY()[score]} · {score}/5</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={{ flex: 1, height: 10, borderRadius: 10, backgroundColor: i < score ? bar : C.line }} />
          ))}
        </View>
        {s.asked && s.goal ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[[s.limits, t('x19fg7qy', { wordsN })], [s.format, s.format ? t('x01dktza') : t('x17vsf2w')], [s.context, s.context ? t('x1uj7jzl') : t('x0cup0mk')], [s.role, s.role ? t('x1snq3dx') : t('x08b0wsu')]].map(([ok, label]) => (
              <View key={String(label)} style={{ borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: ok ? C.tealLight : C.coralLight }}>
                <Text style={font(800, 11.5, ok ? C.tealDark : C.coralDark)}>{label as string}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  )
}

/* ------------------------------------------------------------------ 2. Лендинг */

function LandingPage({ s }: { s: LandingState }) {
  const p = PALETTES[s.palette]
  const btn = PALETTES[s.ctaColor ?? (s.palette === 'none' ? 'none' : s.palette)]
  const name = s.name ?? (s.coffee ? t('x02qydcd') : t('x1kdqii8'))
  return (
    <View style={{ backgroundColor: p.bg, paddingBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: p.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: C.white }}>{s.coffee ? '☕' : '◆'}</Text>
          </View>
          <Text style={font(900, 16, p.dark)}>{name}</Text>
        </View>
        {s.adaptive && (s.nav || s.menu) ? <Text style={font(900, 18, p.dark)}>☰</Text> : null}
      </View>
      <View style={{ marginHorizontal: 12, borderRadius: 22, backgroundColor: p.hero, padding: 16, alignItems: 'center', gap: 6 }}>
        {s.coffee ? <Text style={[font(900, 11, p.accent), { letterSpacing: 1.4 }]}>{t('x0blozvz')}</Text> : null}
        <Text style={[font(900, 28, p.dark), { textAlign: 'center' }]}>{name}</Text>
        <Text style={[font(700, 14, p.text), { textAlign: 'center', opacity: 0.8 }]}>{s.slogan ?? (s.coffee ? t('x18l7aww') : t('x1cyi9lt'))}</Text>
        {s.cta ? (
          <View style={{ marginTop: 6, borderRadius: 14, backgroundColor: btn.accent, paddingHorizontal: 18, paddingVertical: 9, borderBottomWidth: 4, borderBottomColor: btn.dark }}>
            <Text style={font(900, 13, C.white)}>{s.ctaText.toUpperCase()}</Text>
          </View>
        ) : null}
        <Cup size={90} color={p.accent} dark={p.dark} />
        {!s.adaptive ? <Text style={font(900, 12, C.coralDark)}>{t('x0pr5hmp')}</Text> : null}
      </View>
      {s.menu ? (
        <View style={{ padding: 14 }}>
          <Text style={[font(900, 20, p.dark), { marginBottom: 8 }]}>{t('x03ufco1')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MENU().map(([n, price], i) => (
              <View key={n} style={{ width: '47%', flexGrow: 1, borderRadius: 14, backgroundColor: p.soft, padding: 10, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: p.hero }}>
                <Cup size={30} color={p.accent} dark={p.dark} />
                <Text style={font(900, 13, p.text)}>{s.coffee ? n : t('x0bh8bpx', { v: i + 1 })}</Text>
                <Text style={font(800, 13, p.accent)}>{s.coffee ? price : '100 ₽'}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      {s.about ? (
        <View style={{ paddingHorizontal: 14, paddingBottom: 8 }}>
          <Text style={font(900, 18, p.dark)}>{t('x1xu950d')}</Text>
          <Text style={font(600, 13, p.text)}>{t('x065fzxq')}</Text>
        </View>
      ) : null}
      {s.reviews ? (
        <View style={{ paddingHorizontal: 14, paddingBottom: 8, gap: 6 }}>
          <Text style={font(900, 18, p.dark)}>{t('x0554ciw')}</Text>
          {([[t('x0rgbakp'), t('x1cvhc39')], [t('x0w5dgwi'), t('x0m1oojj')], [t('x17pka0r'), t('x0jj609v')]] as const).map(([n, q]) => (
            <View key={n} style={{ borderRadius: 14, backgroundColor: p.soft, padding: 10 }}>
              <Text style={font(900, 12, '#FFB61D')}>★★★★★</Text>
              <Text style={font(700, 13, p.text)}>«{q}»</Text>
              <Text style={font(800, 12, p.text)}>— {n}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {s.contacts ? (
        <View style={{ marginHorizontal: 12, borderRadius: 18, backgroundColor: p.hero, padding: 14 }}>
          <Text style={font(900, 16, p.dark)}>{t('x1rfwz02')}</Text>
          <Text style={font(700, 13, p.text)}>{t('x1tw6u31')}</Text>
        </View>
      ) : null}
      <Text style={[font(700, 12, p.text), { paddingHorizontal: 14, paddingTop: 8, opacity: 0.6 }]}>© 2026 {name}</Text>
    </View>
  )
}

export function LandingPreview({ state: s, ui, setUi }: { state: LandingState; ui: LandingUi; setUi: (u: LandingUi | ((p: LandingUi) => LandingUi)) => void }) {
  const url = s.name ? `${s.name.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-')}.local` : 'localhost:5173'
  const toggle = (
    <View style={{ flexDirection: 'row', borderRadius: 10, borderWidth: 2, borderColor: C.line, overflow: 'hidden' }}>
      {(['desktop', 'phone'] as const).map((d) => (
        <Pressable key={d} testID={`device-${d}`} accessibilityState={{ selected: ui.device === d }} onPress={() => setUi((u) => ({ ...u, device: d, viewedMobile: u.viewedMobile || d === 'phone' }))} style={{ paddingHorizontal: 8, paddingVertical: 3, backgroundColor: ui.device === d ? C.brand : C.white }}>
          <Text style={font(800, 11, ui.device === d ? C.white : C.muted)}>{d === 'desktop' ? '🖥' : '📱'}</Text>
        </Pressable>
      ))}
    </View>
  )
  if (!s.built) return <Frame url={url}>{toggle}<Empty text={t('x00lfllo')} /></Frame>
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[font(800, 12, C.muted), { textTransform: 'uppercase' }]}>{t('x15n7wuu')}{' '}{ui.device === 'phone' ? t('x15hbmt9') : t('x056s4ux')}</Text>
        {toggle}
      </View>
      <Frame url={url}>
        <LandingPage s={s} />
      </Frame>
      {ui.device === 'phone' && s.adaptive ? <Text style={[font(800, 13, C.tealDark), { textAlign: 'center' }]}>{t('x0vtg924')}</Text> : null}
    </View>
  )
}

/* ------------------------------------------------------------------ 3. Список дел */

function CodeBox({ title, lines, start, mark, action }: { title: string; lines: string[]; start: number; mark?: number; action?: React.ReactNode }) {
  return (
    <View style={{ overflow: 'hidden', borderRadius: 16, backgroundColor: C.code }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.codeBar, paddingHorizontal: 12, paddingVertical: 7 }}>
        <Text style={mono(11, 'rgba(255,255,255,0.7)')}>{title}</Text>
        <View style={{ marginLeft: 'auto' }}>{action}</View>
      </View>
      <View style={{ paddingVertical: 6 }}>
        {lines.map((l, i) => {
          const add = l.startsWith('+')
          const del = l.startsWith('-')
          return (
            <View key={i} style={{ flexDirection: 'row', borderLeftWidth: 4, borderLeftColor: i === mark ? C.coral : add ? C.teal : del ? C.coral : 'transparent', backgroundColor: i === mark ? 'rgba(255,122,89,0.25)' : add ? 'rgba(19,194,174,0.19)' : del ? 'rgba(255,122,89,0.19)' : 'transparent', paddingHorizontal: 8 }}>
              <Text style={[mono(11, 'rgba(255,255,255,0.3)'), { width: 24, textAlign: 'right', marginRight: 8 }]}>{start + i}</Text>
              <Text style={[mono(11.5), { flex: 1 }]}>{highlight(l, `k${i}-`)}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

export function TodoPreview({ state: s, ui, setUi, insert }: { state: DebugState; ui: DebugUi; setUi: (u: DebugUi | ((p: DebugUi) => DebugUi)) => void; insert: (text: string) => void }) {
  const [text, setText] = useState('')
  const [note, setNote] = useState<string | null>(null)
  const [open, setOpen] = useState(true)
  const tasks = [t('x11j4ynb'), t('x1w35vuw'), ...ui.added]
  const add = () => {
    if (!s.fixed) {
      setUi((u) => ({ ...u, failedClicks: u.failedClicks + 1 }))
      setNote(null)
      return
    }
    if (!text.trim()) {
      setNote(t('x1nj6q60'))
      return
    }
    setUi((u) => ({ ...u, added: [...u.added, text.trim()], verified: true }))
    setText('')
    setNote(t('x183bcyg'))
  }
  return (
    <View style={{ gap: 10 }}>
      <Frame url={t('x0su2q67')}>
        <View style={{ padding: 14, gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={font(900, 17)}>{t('x09c3foy')}</Text>
            <View style={{ borderRadius: 99, paddingHorizontal: 9, paddingVertical: 2, backgroundColor: s.fixed ? C.tealLight : C.coralLight }}>
              <Text style={font(900, 11, s.fixed ? C.tealDark : C.coralDark)}>{s.fixed ? t('x0qrhagb') : t('x1bvlxfm')}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput testID="task-input" value={text} onChangeText={setText} onSubmitEditing={add} placeholder={t('x036reyf')} placeholderTextColor={C.muted} accessibilityLabel={t('x02zu33f')} style={[font(700, 14), { flex: 1, borderRadius: 12, borderWidth: 2, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 8 }]} />
            <Pressable testID="add-task" onPress={add} style={{ borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: s.restyled && !s.fixed ? C.brand : C.teal, borderBottomWidth: 3, borderBottomColor: s.restyled && !s.fixed ? C.brandDark : C.tealDark }}>
              <Text style={font(900, 13, C.white)}>{tx('x0aljqus', { v: s.restyled && !s.fixed ? '✨ ' : '' })}</Text>
            </Pressable>
          </View>
          {note ? <Text style={font(800, 13, C.tealDark)}>{note}</Text> : null}
          {tasks.map((t, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 2, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 7 }}>
              <View style={{ width: 18, height: 18, borderRadius: 5, borderWidth: 2, borderColor: i === 0 ? C.teal : C.line, backgroundColor: i === 0 ? C.teal : 'transparent' }} />
              <Text style={[font(700, 14), i === 0 && { color: C.muted, textDecorationLine: 'line-through' }]}>{t}</Text>
            </View>
          ))}
        </View>
      </Frame>
      <View style={{ borderRadius: 16, backgroundColor: '#1b1726', overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={font(800, 12, 'rgba(255,255,255,0.6)')}>{t('x1xoeutg')}</Text>
          {!s.fixed ? <View style={{ borderRadius: 99, backgroundColor: C.coral, paddingHorizontal: 6 }}><Text style={font(900, 11, C.white)}>{1 + ui.failedClicks}</Text></View> : null}
          {!s.fixed ? <Pressable testID="copy-error" onPress={() => insert(BUG_ERROR)} style={{ marginLeft: 'auto', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 9, paddingVertical: 4 }}><Text style={font(800, 12, C.white)}>{t('x1rxyg3l')}</Text></Pressable> : null}
        </View>
        <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          {s.fixed ? <Text style={mono(12, '#6FE3D3')}>{t('x1ajrisk', { length: tasks.length })}</Text> : (
            <View>
              <Text style={mono(12, '#FF9C85')}>✕ TypeError: Cannot read properties of undefined (reading `push`)</Text>
              <Text style={mono(11, 'rgba(255,156,133,0.7)')}>    at addTask (App.jsx:14:16)</Text>
            </View>
          )}
        </View>
      </View>
      <Pressable onPress={() => setOpen((o) => !o)}><Text style={font(800, 13, C.muted)}>{tx('x1fh8mcj', { v: open ? '▾' : '▸' })}</Text></Pressable>
      {open ? (
        s.fixed ? <CodeBox title={t('x13ounq1')} lines={FIX_CODE} start={13} /> : (
          <CodeBox title="App.jsx" lines={BUG_CODE} start={11} mark={3} action={<Pressable testID="copy-code" onPress={() => insert(BUG_CODE.join('\n'))} style={{ borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 9, paddingVertical: 4 }}><Text style={font(800, 12, C.white)}>{t('x0vzto2h')}</Text></Pressable>} />
        )
      ) : null}
    </View>
  )
}

/* ------------------------------------------------------------------ 4. Форма */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function FormPreview({ state: s, ui, setUi }: { state: FormState; ui: FormUi; setUi: (u: FormUi | ((p: FormUi) => FormUi)) => void }) {
  const [vals, setVals] = useState({ name: '', email: '', message: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [note, setNote] = useState<{ text: string; ok: boolean } | null>(null)
  const anyField = s.name || s.email || s.message
  const fields: { k: 'name' | 'email' | 'message'; label: string; ph: string; on: boolean }[] = [
    { k: 'name', label: t('x143058q'), ph: t('x0t92out'), on: s.name },
    { k: 'email', label: 'Email', ph: 'you@example.com', on: s.email },
    { k: 'message', label: anyField ? t('x0hpflgb') : t('x0extke5'), ph: t('x0mxfyil'), on: s.message || !anyField },
  ]
  const submit = () => {
    const e: Record<string, string> = {}
    if (s.validation) {
      for (const f of fields) if (f.on && !vals[f.k].trim()) e[f.k] = t('x1yidf3v')
      if (s.email && vals.email.trim() && !EMAIL_RE.test(vals.email.trim())) e.email = t('x1oktxfd')
    }
    setErrs(e)
    if (Object.keys(e).length) { setNote(null); return }
    if (!s.table) { setNote({ text: t('x0o8vhll'), ok: false }); return }
    const row = { id: ui.rows.length + 1, name: s.name ? vals.name.trim() || '—' : '—', email: s.email ? vals.email.trim() || '—' : '—', message: vals.message.trim() || '—', bad: !EMAIL_RE.test(vals.email.trim()) || !vals.message.trim() }
    setUi((u) => ({ rows: [...u.rows, row], saved: true }))
    setVals({ name: '', email: '', message: '' })
    setNote({ text: s.thanks ? t('x1vn8pqv') : t('x1xzzaiq'), ok: true })
  }
  if (!s.form) return <Frame url="zerno.local/feedback"><Empty text={t('x1muaj3g')} /></Frame>
  return (
    <View style={{ gap: 10 }}>
      <Frame url="zerno.local/feedback">
        <View style={{ padding: 14, gap: 8 }}>
          <Text style={font(900, 16)}>{t('x1vsvra6')}</Text>
          <Text style={font(600, 13, C.muted)}>{t('x0chjnj9')}</Text>
          {fields.filter((f) => f.on).map((f) => (
            <View key={f.k}>
              <Text style={[font(800, 12, C.muted), { textTransform: 'uppercase' }]}>{f.label}{s.validation ? <Text style={{ color: C.coral }}> *</Text> : null}</Text>
              <TextInput testID={`form-${f.k}`} value={vals[f.k]} onChangeText={(v) => setVals((p) => ({ ...p, [f.k]: v }))} placeholder={f.ph} placeholderTextColor={C.muted} accessibilityLabel={f.label} multiline={f.k === 'message'} style={[font(700, 14), { borderRadius: 12, borderWidth: 2, borderColor: errs[f.k] ? C.coral : C.line, paddingHorizontal: 12, paddingVertical: 8, minHeight: f.k === 'message' ? 60 : undefined }]} />
              {errs[f.k] ? <Text style={font(800, 12, C.coralDark)}>{errs[f.k]}</Text> : null}
            </View>
          ))}
          <Pressable testID="submit-form" onPress={submit} style={{ borderRadius: 14, backgroundColor: C.brand, paddingVertical: 11, borderBottomWidth: 4, borderBottomColor: C.brandDark }}>
            <Text style={[font(900, 14, C.white), { textAlign: 'center' }]}>{t('x0ekdgze')}</Text>
          </Pressable>
          {note ? <Text style={font(800, 13, note.ok ? C.tealDark : C.coralDark)}>{note.text}</Text> : null}
        </View>
      </Frame>
      <View style={{ borderRadius: 16, borderWidth: 2, paddingHorizontal: 12, paddingVertical: 10, borderColor: s.keyLeaked ? C.coral : s.keySafe ? '#8be3d7' : C.line, backgroundColor: s.keyLeaked ? C.coralLight : s.keySafe ? C.tealLight : 'transparent', borderStyle: s.keyLeaked || s.keySafe ? 'solid' : 'dashed' }}>
        <Text style={font(900, 13, s.keyLeaked ? C.coralDark : s.keySafe ? C.tealDark : C.muted)}>🔒 {s.keyLeaked ? t('x11urnpq') : s.keySafe ? t('x165w5a1') : t('x1m1ruop')}</Text>
        {s.keyLeaked || s.keySafe ? <Text style={[mono(11, C.ink), { marginTop: 4 }]}>{s.keyLeaked ? "supabase.js: createClient(url, 'sk_live_…')" : 'supabase.js: createClient(url, import.meta.env.VITE_SUPABASE_KEY)'}</Text> : null}
      </View>
      <View style={{ overflow: 'hidden', borderRadius: 16, borderWidth: 2, borderColor: C.line }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 2, borderBottomColor: C.line, backgroundColor: C.snow, paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={font(900, 13)}>{s.table ? t('x1x9ab04') : t('x1u8jym5')}</Text>
          {s.table ? <Text style={[font(700, 12, C.muted), { marginLeft: 'auto' }]}>{t('x1ibajk4', { length: ui.rows.length })}</Text> : null}
        </View>
        {s.table ? (
          <ScrollView horizontal>
            <View style={{ minWidth: 340 }}>
              <View style={{ flexDirection: 'row' }}>
                {['id', 'name', 'email', 'message'].map((h) => <Text key={h} style={[mono(11, C.muted), { flex: 1, paddingHorizontal: 8, paddingVertical: 5, borderBottomWidth: 2, borderBottomColor: C.line }]}>{h}</Text>)}
              </View>
              {ui.rows.length === 0 ? <Text style={[font(700, 13, C.muted), { textAlign: 'center', padding: 12 }]}>{t('x1s4c65n')}</Text> : null}
              {ui.rows.map((r) => (
                <View key={r.id} style={{ flexDirection: 'row', backgroundColor: r.bad && !s.validation ? C.coralLight : 'transparent' }}>
                  {[String(r.id), r.name, r.email, r.message + (r.bad && !s.validation ? ' ⚠' : '')].map((c, i) => <Text key={i} numberOfLines={1} style={[font(700, 12), { flex: 1, paddingHorizontal: 8, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.line }]}>{c}</Text>)}
                </View>
              ))}
            </View>
          </ScrollView>
        ) : <Text style={[font(700, 13, C.muted), { textAlign: 'center', padding: 14 }]}>{t('x1r5rgi2')}</Text>}
      </View>
    </View>
  )
}

/* ------------------------------------------------------------------ 5. Деплой */

const STEPS: { key: 'commit' | 'push' | 'deploy' | 'domain' | 'analytics'; label: string }[] = [
  { key: 'commit', get label() { return t('x1f52pub') } },
  { key: 'push', label: 'GitHub' },
  { key: 'deploy', label: 'Vercel' },
  { key: 'domain', get label() { return t('x0zlixar') } },
  { key: 'analytics', get label() { return t('x1s2h2mh') } },
]

export function DeployPreview({ state: s, ui, setUi }: { state: DeployState; ui: DeployUi; setUi: (u: DeployUi | ((p: DeployUi) => DeployUi)) => void }) {
  const { progress, setPortfolioUrl } = useStore()
  const [draft, setDraft] = useState(progress.portfolioUrl)
  const [err, setErr] = useState('')
  const done = { commit: !!s.commit && !s.commitVague, push: s.pushed, deploy: s.deployed, domain: !!s.domain, analytics: s.analytics }
  const url = s.domain ? `https://${s.domain}` : `https://${s.repo}.vercel.app`
  const save = () => {
    const v = draft.trim()
    if (v && !/^https?:\/\/[^\s.]+\.[^\s]{2,}/i.test(v)) { setErr(t('x0fabp1p')); return }
    setErr('')
    setPortfolioUrl(v)
  }
  return (
    <View style={{ gap: 10 }}>
      <View style={{ borderRadius: 16, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, padding: 12, flexDirection: 'row' }}>
        {STEPS.map((st, i) => (
          <View key={st.key} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View style={{ width: 30, height: 30, borderRadius: 30, backgroundColor: done[st.key] ? C.teal : C.line, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: done[st.key] ? C.tealDark : '#D6D1E4' }}>
              <Text style={font(900, 12, done[st.key] ? C.white : C.muted)}>{done[st.key] ? '✓' : i + 1}</Text>
            </View>
            <Text style={[font(800, 10, C.muted), { textAlign: 'center' }]}>{st.label}</Text>
          </View>
        ))}
      </View>
      <View style={{ borderRadius: 16, backgroundColor: '#1b1726', overflow: 'hidden' }}>
        <Text style={[font(800, 12, 'rgba(255,255,255,0.6)'), { paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }]}>{t('x0zmlrq3')}</Text>
        <View style={{ paddingHorizontal: 12, paddingVertical: 8, minHeight: 46 }}>
          {s.log.length === 0 ? <Text style={mono(12, 'rgba(255,255,255,0.4)')}>{t('x0o9bi0v')}</Text> : s.log.map((l, i) => {
            const c = /error/i.test(l) ? '#FF9C85' : l.startsWith('✓') ? '#6FE3D3' : l.startsWith('$') || l.startsWith('▲') || l.startsWith('+') ? '#FFFFFF' : '#B9B3CF'
            return <Text key={i} style={mono(12, c)}>{l}</Text>
          })}
        </View>
      </View>
      {s.deployed ? (
        <View style={{ borderRadius: 18, borderWidth: 2, borderColor: '#8be3d7', borderBottomWidth: 5, backgroundColor: C.white, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.tealLight, paddingHorizontal: 12, paddingVertical: 7 }}>
            <View style={{ width: 9, height: 9, borderRadius: 9, backgroundColor: C.teal }} />
            <Text style={font(900, 12, C.tealDark)}>{t('x1nicow7')}</Text>
            <Text numberOfLines={1} style={[mono(11, C.tealDark), { marginLeft: 'auto', flexShrink: 1 }]}>🔒 {url.replace('https://', '')}</Text>
          </View>
          <View style={{ padding: 12, gap: 8 }}>
            <View style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: C.line }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3DFC9', padding: 10 }}>
                <View>
                  <Text style={font(900, 14, '#5C3A24')}>{t('x0kbjd6z')}</Text>
                  <Text style={font(700, 11, 'rgba(74,51,38,0.7)')}>{t('x0fstw4l')}</Text>
                </View>
                <View style={{ borderRadius: 8, backgroundColor: C.coral, paddingHorizontal: 8, paddingVertical: 3 }}><Text style={font(900, 10, C.white)}>{t('x13b2jxr')}</Text></View>
              </View>
              <View style={{ flexDirection: 'row', gap: 4, backgroundColor: '#FFF8F0', padding: 6 }}>
                {MENU().map(([n]) => <View key={n} style={{ flex: 1, borderRadius: 6, backgroundColor: C.white, paddingVertical: 4 }}><Text style={[font(800, 9, '#5C3A24'), { textAlign: 'center' }]}>{n}</Text></View>)}
              </View>
            </View>
            <Pressable testID="open-site" onPress={() => setUi((u) => ({ ...u, opened: true }))} style={{ borderRadius: 12, backgroundColor: C.teal, paddingVertical: 9, borderBottomWidth: 3, borderBottomColor: C.tealDark }}>
              <Text style={[font(900, 13, C.white), { textAlign: 'center' }]}>{t('x1guc8l0')}</Text>
            </Pressable>
            {ui.opened ? <Text style={font(800, 13, C.tealDark)}>{t('x11svcvf')}</Text> : null}
          </View>
          {s.analytics ? (
            <View style={{ borderTopWidth: 2, borderTopColor: C.line, padding: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={font(800, 12, C.muted)}>{t('x117it1r')}</Text>
                <Text style={font(800, 12)}>128 👀</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 42, marginTop: 6 }}>
                {[18, 26, 14, 34, 40, 30, 52].map((h, i) => <View key={i} style={{ flex: 1, height: `${(h / 52) * 100}%`, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: i === 6 ? C.amber : '#FFD58C' }} />)}
              </View>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={{ borderRadius: 18, borderWidth: 2, borderStyle: 'dashed', borderColor: C.line, padding: 18 }}>
          <Text style={[font(700, 13.5, C.muted), { textAlign: 'center' }]}>{t('x19w7320')}</Text>
        </View>
      )}
      <View style={{ borderRadius: 16, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, padding: 12, gap: 6 }}>
        <Text style={font(900, 13)}>{tx('x1iz9r6d', {}, [(chunk) => <Text style={font(700, 13, C.muted)}>{chunk}</Text>])}</Text>
        <Text style={font(600, 12, C.muted)}>{t('x1rcqkp9')}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput testID="portfolio-url" value={draft} onChangeText={setDraft} placeholder="https://my-app.vercel.app" placeholderTextColor={C.muted} accessibilityLabel={t('x1jekfdh')} autoCapitalize="none" style={[font(700, 13), { flex: 1, borderRadius: 12, borderWidth: 2, borderColor: C.line, paddingHorizontal: 10, paddingVertical: 7 }]} />
          <Pressable testID="save-portfolio" onPress={save} style={{ borderRadius: 12, borderWidth: 2, borderColor: C.line, paddingHorizontal: 12, justifyContent: 'center' }}>
            <Text style={font(900, 13)}>{t('x04njbq2')}</Text>
          </Pressable>
        </View>
        {err ? <Text style={font(800, 12, C.coralDark)}>{err}</Text> : null}
        {!err && progress.portfolioUrl ? <Text style={font(800, 12, C.tealDark)}>{tx('x12p6v7p', { portfolioUrl: progress.portfolioUrl })}</Text> : null}
      </View>
    </View>
  )
}
