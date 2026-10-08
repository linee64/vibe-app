import { Text, View } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import Svg, { Circle, Path } from 'react-native-svg'
import type { ExerciseKind, MiniUI, Outcome, UIBlock } from '@web/data/types'
import type { Answer, Hint, Status } from '@web/data/exerciseLogic'
import { KIND_META } from '@web/components/exercises/meta'
import { C, font } from '../../theme'
import { Mascot } from '../Mascot'
import { highlight, mono } from '../code'

export interface ViewProps<E> {
  ex: E
  answer: Answer
  setAnswer: (a: Answer) => void
  status: Status
  hint?: Hint | null
}

export function Head({ kind, title, prompt }: { kind: ExerciseKind | 'flag'; title: string; prompt?: string }) {
  const m = KIND_META[kind]
  return (
    <View style={{ marginBottom: 16 }}>
      <View testID={`kind-${kind}`} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: m.bg }}>
        <Text style={{ fontSize: 13 }}>{m.icon}</Text>
        <Text style={[font(900, 12, m.color), { textTransform: 'uppercase', letterSpacing: 0.8 }]}>{m.name}</Text>
      </View>
      <Text style={[font(900, 23), { marginTop: 8, lineHeight: 28 }]}>{title}</Text>
      {prompt ? <Speech text={prompt} /> : null}
    </View>
  )
}

export function Speech({ text }: { text: string }) {
  return (
    <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
      <Mascot size={52} />
      <View style={{ flex: 1, marginBottom: 10, borderRadius: 18, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 13, paddingVertical: 9 }}>
        <Text style={[font(700, 15), { lineHeight: 20 }]}>{text}</Text>
      </View>
    </View>
  )
}

export function HintNote({ hint }: { hint?: Hint | null }) {
  if (!hint) return null
  return (
    <Animated.View entering={FadeInUp} testID="hint-note" style={{ marginBottom: 10, flexDirection: 'row', gap: 8, alignItems: 'center', borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: C.brandMid, backgroundColor: C.brandLight, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text>💡</Text>
      <Text style={[font(800, 14, C.brandDark), { flex: 1 }]}>{hint.text}</Text>
    </Animated.View>
  )
}

export function Letter({ i, on, color = C.muted }: { i: number; on?: boolean; color?: string }) {
  return (
    <View style={{ width: 28, height: 28, borderRadius: 9, borderWidth: 2, borderColor: on ? color : C.line, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={font(900, 13, on ? color : C.muted)}>{String.fromCharCode(65 + i)}</Text>
    </View>
  )
}

export function AiAvatar({ size = 30 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: C.brandDark }}>
      <Text style={{ color: C.white, fontSize: size * 0.5 }}>✦</Text>
    </View>
  )
}

export function CodeBlock({ lines, file, small }: { lines: string[]; file?: string; small?: boolean }) {
  return (
    <View style={{ overflow: 'hidden', borderRadius: 12, backgroundColor: C.code }}>
      {file ? <Text style={[mono(10.5, 'rgba(255,255,255,0.6)'), { paddingHorizontal: 12, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }]}>{file}</Text> : null}
      <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
        {lines.map((l, i) => (
          <Text key={i} style={mono(small ? 10.5 : 12)}>
            {l ? highlight(l, `c${i}-`) : ' '}
          </Text>
        ))}
      </View>
    </View>
  )
}

export function AiBubble({ text, code, preview, small }: { text: string; code?: string[]; preview?: MiniUI; small?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
      <AiAvatar size={small ? 24 : 30} />
      <View style={{ flex: 1, borderRadius: 18, borderTopLeftRadius: 6, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: small ? 10 : 12, paddingVertical: small ? 8 : 10, gap: 8 }}>
        <Text style={[font(600, small ? 12 : 14), { lineHeight: small ? 17 : 19 }]}>{text}</Text>
        {code ? <CodeBlock lines={code} small={small} /> : null}
        {preview ? <MiniBrowser ui={preview} /> : null}
      </View>
    </View>
  )
}

export function MeBubble({ text, small }: { text: string; small?: boolean }) {
  return (
    <View style={{ alignItems: 'flex-end' }}>
      <View style={{ maxWidth: '92%', borderRadius: 18, borderBottomRightRadius: 6, backgroundColor: C.brand, paddingHorizontal: small ? 10 : 12, paddingVertical: small ? 8 : 10 }}>
        <Text style={[font(700, small ? 12 : 14, C.white), { lineHeight: small ? 17 : 19 }]}>{text}</Text>
      </View>
    </View>
  )
}

/* ------------------------------------------------------------------ Мини-превью страницы (MiniUI из контента) */

const THEMES = {
  plain: { bg: '#F4F3F7', ink: '#4A4658', muted: '#9C98A8', accent: '#9C98A8', accentInk: '#fff', card: '#E6E4EC' },
  brand: { bg: '#FFFFFF', ink: '#2F2A47', muted: '#8C86A3', accent: '#7C4DFF', accentInk: '#fff', card: '#EFE9FF' },
  warm: { bg: '#FFF7EE', ink: '#4A2E1F', muted: '#A07E66', accent: '#FF7A59', accentInk: '#fff', card: '#FFE6D2' },
  dark: { bg: '#221E33', ink: '#F1EEFA', muted: '#A39DBA', accent: '#13C2AE', accentInk: '#062A26', card: '#332D4A' },
} as const
type Th = (typeof THEMES)[keyof typeof THEMES]

const TONES: Record<string, { bg: string; ink: string }> = {
  coral: { bg: '#FF7A59', ink: '#fff' },
  teal: { bg: '#13C2AE', ink: '#fff' },
  brand: { bg: '#7C4DFF', ink: '#fff' },
  grey: { bg: '#C9C5D3', ink: '#fff' },
  violet: { bg: '#EFE9FF', ink: '#5B2FD6' },
  amber: { bg: '#FFF1D9', ink: '#B86A00' },
}

function Block({ b, th }: { b: UIBlock; th: Th }) {
  switch (b.t) {
    case 'nav':
      return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: th.card, paddingBottom: 5, gap: 6 }}>
          <Text numberOfLines={1} style={font(900, 10.5, th.ink)}>{b.logo ?? '◆'}</Text>
          <View style={{ flexDirection: 'row', gap: 7, flexShrink: 1, overflow: 'hidden' }}>
            {b.items.map((x) => (
              <Text key={x} style={font(700, 9.5, th.muted)}>{x}</Text>
            ))}
          </View>
        </View>
      )
    case 'h':
      return <Text style={[font(900, b.size === 'xl' ? 16 : b.size === 'md' ? 12 : 13.5, th.ink), { textAlign: b.align === 'center' ? 'center' : 'left' }]}>{b.text}</Text>
    case 'p':
      return <Text style={[font(600, 10.5, b.muted ? th.muted : th.ink), { lineHeight: 14, textAlign: b.align === 'center' ? 'center' : 'left' }]}>{b.text}</Text>
    case 'btn': {
      const tone = b.tone === 'ghost' ? null : b.tone ? TONES[b.tone] : { bg: th.accent, ink: th.accentInk }
      return (
        <View style={{ alignSelf: b.full ? 'stretch' : 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: tone?.bg ?? 'transparent', borderWidth: tone ? 0 : 1.5, borderColor: th.muted }}>
          <Text style={[font(800, 10, tone?.ink ?? th.ink), { textAlign: 'center' }]}>{b.text}</Text>
        </View>
      )
    }
    case 'img':
      return (
        <View style={{ height: b.h ?? 44, borderRadius: 8, backgroundColor: th.card, alignItems: 'center', justifyContent: 'center' }}>
          <Svg viewBox="0 0 40 24" width={44} height={26} opacity={0.5}>
            <Circle cx="11" cy="8" r="3.5" fill={th.muted} />
            <Path d="M2 22 L14 12 L21 18 L28 10 L38 22 Z" fill={th.muted} />
          </Svg>
          {b.label ? <Text style={[font(700, 8.5, th.muted), { position: 'absolute', right: 6, bottom: 2 }]}>{b.label}</Text> : null}
        </View>
      )
    case 'cards': {
      const cols = b.cols ?? 3
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {b.items.map((x, i) => (
            <View key={i} style={{ width: cols === 1 ? '100%' : cols === 2 ? '47%' : '30%', flexGrow: 1, borderRadius: 6, backgroundColor: th.card, padding: 6 }}>
              <Text style={font(700, 9.5, th.ink)}>{x}</Text>
            </View>
          ))}
        </View>
      )
    }
    case 'list':
      return (
        <View style={{ gap: 2 }}>
          {b.items.map((x, i) => (
            <Text key={i} style={font(600, 10.5, th.ink)}>
              <Text style={{ color: th.accent }}>• </Text>
              {x}
            </Text>
          ))}
        </View>
      )
    case 'input':
      return (
        <View>
          <Text style={font(700, 9, th.muted)}>{b.label}</Text>
          <View style={{ marginTop: 2, borderRadius: 6, borderWidth: 1, borderColor: b.error ? C.coral : th.card, paddingHorizontal: 6, paddingVertical: 4, backgroundColor: th.bg }}>
            <Text style={font(600, 10, b.value ? th.ink : th.muted)}>{b.value ?? ' '}</Text>
          </View>
          {b.error ? <Text style={[font(700, 9, C.coralDark), { marginTop: 2 }]}>{b.error}</Text> : null}
        </View>
      )
    case 'rows':
      return (
        <View style={{ gap: 2 }}>
          {b.items.map(([k, v], i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <Text numberOfLines={1} style={[font(600, 10.5, th.ink), { flexShrink: 1 }]}>{k}</Text>
              <Text style={font(900, 10.5, th.accent === '#9C98A8' ? th.ink : th.accent)}>{v}</Text>
            </View>
          ))}
        </View>
      )
    case 'note': {
      const t = TONES[b.tone]
      const soft = b.tone === 'violet' || b.tone === 'amber'
      return (
        <View style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: soft ? t.bg : t.bg + '22' }}>
          <Text style={font(800, 10, soft ? t.ink : b.tone === 'coral' ? C.coralDark : C.tealDark)}>{b.text}</Text>
        </View>
      )
    }
    case 'lorem':
      return (
        <View style={{ gap: 4 }}>
          {Array.from({ length: b.lines ?? 3 }, (_, i) => (
            <View key={i} style={{ height: 6, borderRadius: 6, backgroundColor: th.card, width: `${92 - ((i * 17) % 35)}%` }} />
          ))}
        </View>
      )
    case 'split':
      return (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={{ flex: 1, gap: 6 }}>{b.left.map((x, i) => <Block key={i} b={x} th={th} />)}</View>
          <View style={{ flex: 1, gap: 6 }}>{b.right.map((x, i) => <Block key={i} b={x} th={th} />)}</View>
        </View>
      )
  }
}

export function BrowserBar({ url, right }: { url: string; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderBottomWidth: 2, borderBottomColor: C.line, backgroundColor: C.snow, paddingHorizontal: 8, paddingVertical: 5 }}>
      <View style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: C.coral }} />
      <View style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: C.gold }} />
      <View style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: C.teal }} />
      <Text numberOfLines={1} style={[mono(9, C.muted), { marginLeft: 6, flex: 1, backgroundColor: C.white, borderRadius: 4, paddingHorizontal: 6 }]}>{url}</Text>
      {right}
    </View>
  )
}

export function MiniBrowser({ ui }: { ui: MiniUI }) {
  const th = THEMES[ui.theme ?? 'brand']
  return (
    <View style={{ overflow: 'hidden', borderRadius: 12, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, width: ui.mobile ? 150 : '100%', alignSelf: ui.mobile ? 'center' : 'stretch' }}>
      <BrowserBar url={ui.url ?? 'localhost:5173'} />
      <View style={{ padding: 10, gap: 6, backgroundColor: th.bg }}>
        {ui.blocks.map((b, i) => (
          <Block key={i} b={b} th={th} />
        ))}
      </View>
    </View>
  )
}

export function Terminal({ lines }: { lines: string[] }) {
  return (
    <View style={{ borderRadius: 12, backgroundColor: '#1B1828', paddingHorizontal: 12, paddingVertical: 8 }}>
      {lines.map((l, i) => {
        const c = /^(✓|ready|Ready|VITE|Local)/.test(l.trim()) ? '#6FE3D3' : /(error|Error|ERR|✗|failed|Failed)/.test(l) ? '#FF9C85' : '#D9D4EA'
        return (
          <Text key={i} style={mono(10.5, c)}>
            {l}
          </Text>
        )
      })}
    </View>
  )
}

export function OutcomeView({ o }: { o: Outcome }) {
  switch (o.type) {
    case 'ui':
      return <MiniBrowser ui={o.ui} />
    case 'chat':
      return <AiBubble text={o.text} code={o.code} small />
    case 'code':
      return <CodeBlock lines={o.lines} file={o.file} small />
    case 'terminal':
      return <Terminal lines={o.lines} />
  }
}

export function FrameCard({ children }: { children: React.ReactNode }) {
  return <View style={{ overflow: 'hidden', borderRadius: 20, borderWidth: 2, borderColor: C.line, borderBottomWidth: 5, backgroundColor: C.white }}>{children}</View>
}

/** Состояние варианта после проверки (аналог optState в вебе) */
export function optTone(i: number, answer: Answer, status: Status, correct: number): 'selected' | 'correct' | 'wrong' | 'dim' | undefined {
  if (status === 'idle') return answer === i ? 'selected' : undefined
  if (i === correct) return 'correct'
  if (answer === i) return 'wrong'
  return 'dim'
}

export const toneColor = (t?: string) => (t === 'selected' ? C.brandDark : t === 'correct' ? C.tealDark : t === 'wrong' ? C.coralDark : C.ink)
