/**
 * Нативные превью домашек 6–9 (спек-симулятор @web/homework/spec). Подписи — из HomeworkDef.texts.preview.
 */
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { findHomework } from '@web/data/homework'
import { SPECS, specActionReady, type SpecFlag, type SpecState, type SpecUi } from '@web/homework/spec'
import { mono } from '../code'
import { BrowserBar } from '../exercises/shared'
import { C, font } from '../../theme'
import { t } from '@web/i18n/core'

type SetUi = (u: SpecUi | ((p: SpecUi) => SpecUi)) => void
interface Props { id: 'hw6' | 'hw7' | 'hw8' | 'hw9'; state: SpecState; ui: SpecUi; setUi: SetUi }

const texts = (id: string) => {
  const p = findHomework(id)?.texts?.preview ?? {}
  return (k: string) => p[k] ?? k
}

function Note({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: ok ? C.tealLight : C.coralLight }}>
      <Text style={font(900, 12.5, ok ? C.tealDark : C.coralDark)}>{ok ? '✓' : '✕'}</Text>
      <Text style={[font(800, 12.5, ok ? C.tealDark : C.coralDark), { flex: 1 }]}>{text}</Text>
    </View>
  )
}

function ActionBtn({ id, flag, state, ui, setUi, label, locked, done }: { id: Props['id']; flag: SpecFlag; state: SpecState; ui: SpecUi; setUi: SetUi; label: string; locked: string; done: string }) {
  const ready = specActionReady(SPECS[id], state, flag)
  if (ui[flag] && ready) return <Text testID="spec-done" style={[font(900, 13.5, C.tealDark), { textAlign: 'center' }]}>{done}</Text>
  return (
    <Pressable
      testID={`spec-action-${flag}`}
      disabled={!ready}
      onPress={() => setUi((u) => ({ ...u, [flag]: true }))}
      style={{ borderRadius: 12, backgroundColor: ready ? C.teal : C.line, paddingVertical: 10, borderBottomWidth: 3, borderBottomColor: ready ? C.tealDark : '#D6D1E4' }}
    >
      <Text style={[font(900, 13.5, ready ? C.white : C.muted), { textAlign: 'center' }]}>{ready ? label : `🔒 ${locked}`}</Text>
    </Pressable>
  )
}

function Empty({ text }: { text: string }) {
  return <Text style={[font(700, 14, C.muted), { textAlign: 'center', padding: 28 }]}>{text}</Text>
}

function Pricing({ state: s, ui, setUi }: Props) {
  const tr = texts('hw6')
  const tokens = !!s.done.tokens
  const a11y = !!s.done.a11y
  const dark = !!s.extras.dark
  const textC = a11y ? (dark ? '#FFFFFF' : C.ink) : dark ? '#6E6A80' : '#B9B5C6'
  const accent = tokens ? C.brand : '#3B82F6'
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignSelf: 'flex-end', borderRadius: 12, borderWidth: 2, borderColor: C.line, padding: 2 }}>
        {(['desktop', 'phone'] as const).map((d) => (
          <Pressable key={d} testID={`device-${d}`} onPress={() => setUi((u) => ({ ...u, device: d, viewedMobile: u.viewedMobile || d === 'phone' }))} style={{ borderRadius: 9, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: ui.device === d ? C.brand : 'transparent' }}>
            <Text style={font(800, 12, ui.device === d ? C.white : C.muted)}>{d === 'desktop' ? t('x1n7iari') : t('x1f7u5w6')}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ borderRadius: 18, borderWidth: 2, borderColor: C.line, overflow: 'hidden', backgroundColor: dark ? '#14111F' : C.snow }}>
        <BrowserBar url="akvarel.school/pricing" />
        {!s.done.structure ? (
          <Empty text={tr('empty')} />
        ) : (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <View style={{ width: ui.device === 'phone' && s.done.mobile ? '100%' : 260, backgroundColor: dark ? '#1E1A2E' : C.white, borderRadius: tokens ? 20 : 6, borderWidth: 2, borderColor: tokens ? C.line : '#D0D0D0', padding: tokens ? 18 : 12 }}>
              {s.extras.badge ? <Text style={[font(900, 11, C.white), { alignSelf: 'flex-end', backgroundColor: C.coral, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 }]}>{tr('badge')}</Text> : null}
              <Text style={font(900, 13, tokens ? accent : '#666')}>{tr('plan')}</Text>
              <Text style={font(900, 28, textC)}>{tr('price')} <Text style={font(700, 13, textC)}>{tr('per')}</Text></Text>
              {['item1', 'item2', 'item3'].map((k) => <Text key={k} style={[font(700, 13.5, textC), { marginTop: 4 }]}>✓ {tr(k)}</Text>)}
              <View style={{ marginTop: 12, backgroundColor: accent, borderRadius: tokens ? 14 : 4, height: s.done.mobile ? 46 : 34, justifyContent: 'center' }}>
                <Text style={[font(900, 15, C.white), { textAlign: 'center' }]}>{tr('cta')}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
      {s.done.structure ? (
        <View style={{ gap: 6 }}>
          <Note ok={tokens} text={tokens ? tr('tokensOk') : tr('noTokens')} />
          <Note ok={a11y} text={a11y ? tr('a11yOk') : tr('lowContrast')} />
          {s.done.states ? <Note ok text={`${tr('states')}: ${['sNormal', 'sHover', 'sFocus', 'sDisabled', 'sLoading'].map(tr).join(' · ')}`} /> : null}
          {ui.device === 'phone' ? <Note ok={!!s.done.mobile} text={s.done.mobile ? tr('phoneOk') : tr('notAdaptive')} /> : s.done.mobile ? <Text style={[font(800, 13, C.brand), { textAlign: 'center' }]}>{tr('checkPhone')}</Text> : null}
        </View>
      ) : null}
    </View>
  )
}

function Habits(p: Props) {
  const { state: s } = p
  const tr = texts('hw7')
  const [checked, setChecked] = useState<Record<string, boolean>>({ h1: true })
  const dark = !!s.extras.dark
  const fg = dark ? C.white : C.ink
  return (
    <View style={{ gap: 10 }}>
      <View style={{ alignSelf: 'center', width: 250, borderRadius: 34, borderWidth: 8, borderColor: C.ink, overflow: 'hidden', backgroundColor: dark ? '#14111F' : C.snow, minHeight: 360 }}>
        <View style={{ alignSelf: 'center', width: 70, height: 14, borderRadius: 14, backgroundColor: C.ink, marginTop: 6 }} />
        {!s.done.screens ? (
          <Empty text={tr('empty')} />
        ) : !s.done.stack ? (
          <View style={{ padding: 12, gap: 6 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>{tr('title')}</Text>
            <Text style={{ color: '#0000EE' }}>• {tr('h1')}</Text>
            <Text style={{ color: '#0000EE' }}>• {tr('h2')}</Text>
            <Note ok={false} text={tr('web')} />
          </View>
        ) : (
          <View style={{ padding: 12, gap: 8, marginTop: s.done.safe ? 0 : -18 }}>
            <Text style={font(900, 11, C.muted)}>{tr('today').toUpperCase()}</Text>
            <Text style={font(900, 20, fg)}>{tr('title')}</Text>
            {s.extras.streak ? <Text style={font(900, 12, '#D97F00')}>{tr('streak')}</Text> : null}
            {['h1', 'h2', 'h3'].map((k) => (
              <Pressable key={k} onPress={() => setChecked((c) => ({ ...c, [k]: !c[k] }))} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, backgroundColor: dark ? '#231E35' : C.white, padding: 10 }}>
                <View style={{ width: 22, height: 22, borderRadius: 22, backgroundColor: checked[k] ? C.teal : 'transparent', borderWidth: checked[k] ? 0 : 2, borderColor: '#C9C4D8', alignItems: 'center', justifyContent: 'center' }}>
                  {checked[k] ? <Text style={font(900, 12, C.white)}>✓</Text> : null}
                </View>
                <Text style={[font(800, 14, fg), checked[k] ? { textDecorationLine: 'line-through', opacity: 0.6 } : null]}>{tr(k)}</Text>
              </Pressable>
            ))}
            <View style={{ borderRadius: 14, backgroundColor: C.coral, paddingVertical: 10, borderBottomWidth: 3, borderBottomColor: C.coralDark }}>
              <Text style={[font(900, 13.5, C.white), { textAlign: 'center' }]}>{tr('add')}</Text>
            </View>
            <Text style={[font(800, 11.5, s.done.storage ? C.tealDark : C.coralDark), { textAlign: 'center' }]}>{s.done.storage ? `💾 ${tr('stored')}` : `⚠️ ${tr('notStored')}`}</Text>
          </View>
        )}
      </View>
      {s.done.screens && !s.done.safe ? <Note ok={false} text={tr('notch')} /> : null}
      <ActionBtn {...p} flag="ran" label={tr('run')} locked={tr('runLocked')} done={tr('ran')} />
    </View>
  )
}

function Assistant(p: Props) {
  const { state: s, ui } = p
  const tr = texts('hw8')
  const ready = specActionReady(SPECS.hw8, s, 'tested')
  return (
    <View style={{ gap: 10 }}>
      <View style={{ borderRadius: 16, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, padding: 12, gap: 6 }}>
        <Text style={[font(900, 12.5, C.ink), { textAlign: 'center' }]}>
          🖥️ {tr('browser')} → {s.done.route ? `⚙️ ${tr('server')} /api/chat → ` : ''}🧠 {tr('model')}
        </Text>
        {!s.done.route ? <Note ok={false} text={tr('noServer')} /> : null}
        <Note ok={!!s.done.secret} text={s.done.secret ? `🔒 ${tr('keyEnv')}` : tr('keyLeak')} />
        <Note ok={!!s.done.system} text={s.done.system ? tr('rules') : tr('noRules')} />
        {s.done.limits ? <Note ok text={tr('limits')} /> : null}
      </View>
      <View style={{ borderRadius: 18, borderWidth: 2, borderColor: C.line, overflow: 'hidden', backgroundColor: '#FFF8F0' }}>
        <BrowserBar url={tr('site')} />
        <View style={{ padding: 12, gap: 8 }}>
          <Text style={font(900, 15, '#5C3A24')}>{tr('cafe')}</Text>
          <View style={{ borderRadius: 16, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, overflow: 'hidden' }}>
            <Text style={[font(900, 13, C.white), { backgroundColor: C.brand, paddingHorizontal: 12, paddingVertical: 7 }]}>🤖 {tr('chat')}</Text>
            <View style={{ padding: 10, gap: 6 }}>
              <Text style={[font(700, 13, C.ink), { alignSelf: 'flex-end', backgroundColor: C.brandLight, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 }]}>{tr('question')}</Text>
              {ui.tested && ready ? <Text style={[font(700, 13, C.ink), { backgroundColor: C.snow, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 }]}>{tr('answer')}</Text> : null}
            </View>
          </View>
        </View>
      </View>
      <ActionBtn {...p} flag="tested" label={tr('ask')} locked={tr('locked')} done="✓" />
    </View>
  )
}

function Agent(p: Props) {
  const { state: s, ui } = p
  const tr = texts('hw9')
  const ready = specActionReady(SPECS.hw9, s, 'testsRun')
  const any = Object.keys(s.done).length > 0
  return (
    <View style={{ gap: 10 }}>
      <View style={{ borderRadius: 16, backgroundColor: '#1b1726', padding: 12, gap: 5 }}>
        <Text style={font(800, 12, 'rgba(255,255,255,0.6)')}>{tr('plan').toUpperCase()}</Text>
        {!any ? <Text style={font(700, 13, 'rgba(255,255,255,0.5)')}>{tr('empty')}</Text> : (['pGoal', 'pScope', 'pDone', 'pTests'] as const).map((k, i) => {
          const ok = !!s.done[['goal', 'scope', 'done', 'tests'][i]]
          return <Text key={k} style={font(700, 13, ok ? '#6FE3D3' : 'rgba(255,255,255,0.35)')}>{ok ? '✓' : '○'} {tr(k)}</Text>
        })}
        {s.extras.review ? <Text style={font(700, 12, '#C7B6FF')}>⎇ {tr('branch')}</Text> : null}
      </View>
      {s.done.goal ? (
        <View style={{ borderRadius: 16, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, padding: 10, gap: 3 }}>
          <Text style={mono(12, C.muted)}>src/discount.ts</Text>
          <Text style={[mono(11.5, C.coralDark), { backgroundColor: C.coralLight }]}>- if (total {'>'} 5000)</Text>
          <Text style={[mono(11.5, C.tealDark), { backgroundColor: C.tealLight }]}>+ if (total {'>='} 5000)</Text>
          {s.done.tests ? <Text style={[mono(11.5, C.tealDark), { backgroundColor: C.tealLight }]}>+ test('5000 → 4500')</Text> : null}
          {!s.done.scope ? <Note ok={false} text={tr('wide')} /> : null}
        </View>
      ) : null}
      <View style={{ borderRadius: 16, backgroundColor: '#1b1726', padding: 12 }}>
        <Text style={mono(12, C.white)}>$ npm test</Text>
        <Text style={mono(12, ui.testsRun && ready ? '#6FE3D3' : 'rgba(255,255,255,0.4)')}>{ui.testsRun && ready ? 'Tests: 13 passed, 13 total' : '…'}</Text>
      </View>
      <ActionBtn {...p} flag="testsRun" label={tr('run')} locked={tr('runLocked')} done="✓ 13/13" />
    </View>
  )
}

export function SpecPreview(p: Props) {
  if (p.id === 'hw6') return <Pricing {...p} />
  if (p.id === 'hw7') return <Habits {...p} />
  if (p.id === 'hw8') return <Assistant {...p} />
  return <Agent {...p} />
}
