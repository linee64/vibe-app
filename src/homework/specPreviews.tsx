/**
 * Живые превью домашек 6–9 (спек-симулятор, src/homework/spec.ts).
 * Подписи — из определения домашки (HomeworkDef.texts.preview), поэтому переводятся вместе с ним.
 */
import { useState, type ReactNode } from 'react'
import { BrowserFrame, PhoneFrame } from './frames'
import { SPECS, specActionReady, type SpecState, type SpecUi } from './spec'
import type { PreviewProps } from './previews'
import { findHomework } from '../data/homework'
import { Mascot } from '../components/Mascot'
import { Check, Cross, Lock } from '../components/Icons'
import { t } from '../i18n/core'

type P = PreviewProps<SpecState, SpecUi>

const useTexts = (id: string) => {
  const p = findHomework(id)?.texts?.preview ?? {}
  return (k: string) => p[k] ?? k
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <Mascot mood="think" size={84} />
      <p className="max-w-[260px] text-[14px] font-bold text-muted">{text}</p>
    </div>
  )
}

function Note({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div className={`flex items-start gap-2 rounded-xl px-3 py-2 text-[12.5px] font-extrabold ${ok ? 'bg-teal-light text-teal-dark' : 'bg-coral-light text-coral-dark'}`}>
      <span className="mt-[1px] shrink-0">{ok ? <Check size={14} /> : <Cross size={14} />}</span>
      <span className="min-w-0">{children}</span>
    </div>
  )
}

function DeviceToggle({ ui, setUi }: { ui: SpecUi; setUi: P['setUi'] }) {
  return (
    <div className="flex shrink-0 rounded-xl border-2 border-line bg-white p-0.5" role="group" aria-label={t('x061wti5')}>
      {(['desktop', 'phone'] as const).map((d) => (
        <button
          key={d}
          data-device={d}
          onClick={() => setUi((u) => ({ ...u, device: d, viewedMobile: u.viewedMobile || d === 'phone' }))}
          className={`rounded-lg px-2 py-0.5 text-[12px] font-extrabold ${ui.device === d ? 'bg-brand text-white' : 'text-muted'}`}
          aria-pressed={ui.device === d}
        >
          {d === 'desktop' ? t('x1n7iari') : t('x1f7u5w6')}
        </button>
      ))}
    </div>
  )
}

// ================================================================ 6. Карточка тарифа

function PricingCard({ s, tr, phone }: { s: SpecState; tr: (k: string) => string; phone: boolean }) {
  const tokens = !!s.done.tokens
  const a11y = !!s.done.a11y
  const adaptive = !!s.done.mobile
  const dark = !!s.extras.dark
  const bg = dark ? '#1E1A2E' : '#FFFFFF'
  const text = a11y ? (dark ? '#FFFFFF' : '#2F2A47') : dark ? '#6E6A80' : '#B9B5C6'
  const accent = tokens ? '#7C4DFF' : '#3B82F6'
  const width = phone ? (adaptive ? '100%' : 320) : 300
  return (
    <div
      className="relative mx-auto transition-all"
      style={{
        width,
        background: bg,
        borderRadius: tokens ? 20 : 6,
        border: `2px solid ${tokens ? (dark ? '#3E3558' : '#E7E3F1') : '#D0D0D0'}`,
        padding: tokens ? 20 : 13,
        boxShadow: tokens ? '0 6px 0 rgba(124,77,255,.15)' : 'none',
      }}
    >
      {s.extras.badge && (
        <span className="absolute -top-3 right-4 rounded-full px-2.5 py-1 text-[11px] font-black uppercase text-white" style={{ background: tokens ? '#FF7A59' : '#F59E0B' }}>
          {tr('badge')}
        </span>
      )}
      <div className="text-[13px] font-black uppercase tracking-wider" style={{ color: tokens ? accent : '#666' }}>
        {tr('plan')}
      </div>
      <div className="mt-1 flex items-baseline gap-1" style={{ color: text }}>
        <span className="text-[30px] font-black">{tr('price')}</span>
        <span className="text-[13px] font-bold">{tr('per')}</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {['item1', 'item2', 'item3'].map((k) => (
          <li key={k} className="flex items-center gap-2 text-[13.5px] font-bold" style={{ color: text }}>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ background: tokens ? '#13C2AE' : '#9CA3AF' }} aria-hidden={!a11y}>
              <Check size={12} />
            </span>
            {tr(k)}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 w-full font-black text-white"
        style={{ background: accent, borderRadius: tokens ? 14 : 4, height: adaptive ? 48 : 34, fontSize: 15, boxShadow: tokens ? '0 4px 0 #5B2FD6' : 'none' }}
      >
        {tr('cta')}
      </button>
    </div>
  )
}

export function PricingPreview({ state: s, ui, setUi, version }: P) {
  const tr = useTexts('hw6')
  const toggle = <DeviceToggle ui={ui} setUi={setUi} />
  if (!s.done.structure)
    return (
      <BrowserFrame url="akvarel.school/pricing" right={toggle}>
        <Empty text={tr('empty')} />
      </BrowserFrame>
    )
  const notes = (
    <div className="mt-3 space-y-1.5">
      <Note ok={!!s.done.tokens}>{s.done.tokens ? tr('tokensOk') : tr('noTokens')}</Note>
      <Note ok={!!s.done.a11y}>{s.done.a11y ? tr('a11yOk') : tr('lowContrast')}</Note>
      {s.done.states && (
        <div className="card p-2.5">
          <div className="mb-1.5 text-[11px] font-black uppercase tracking-wider text-muted">{tr('states')}</div>
          <div className="flex flex-wrap gap-1.5">
            {[
              ['sNormal', { background: '#7C4DFF' }],
              ['sHover', { background: '#5B2FD6' }],
              ['sFocus', { background: '#7C4DFF', outline: '3px solid #13C2AE', outlineOffset: 2 }],
              ['sDisabled', { background: '#C7B6FF' }],
              ['sLoading', { background: '#7C4DFF' }],
            ].map(([k, st]) => (
              <span key={k as string} className="rounded-lg px-2.5 py-1 text-[11.5px] font-black text-white" style={st as object}>
                {k === 'sLoading' ? '⏳ ' : ''}
                {tr(k as string)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
  if (ui.device === 'phone')
    return (
      <div className="card p-3">
        <div className="mb-3 flex items-center justify-end gap-2">{toggle}</div>
        <PhoneFrame
          warn={!s.done.mobile && <div className="absolute inset-x-2 bottom-2 rounded-xl bg-coral px-3 py-2 text-center text-[12px] font-black text-white shadow-[0_3px_0_#E0573A]">{tr('notAdaptive')}</div>}
        >
          <div key={version} className="anim-fade-up overflow-hidden px-3 py-4" style={{ background: s.extras.dark ? '#14111F' : '#F7F5FC', minHeight: 470 }}>
            <PricingCard s={s} tr={tr} phone />
          </div>
        </PhoneFrame>
        {s.done.mobile && <p className="mt-3 text-center text-[13px] font-extrabold text-teal-dark">{tr('phoneOk')}</p>}
        {notes}
      </div>
    )
  return (
    <div>
      <BrowserFrame url="akvarel.school/pricing" right={toggle}>
        <div key={version} className="anim-fade-up px-4 py-8" style={{ background: s.extras.dark ? '#14111F' : '#F7F5FC' }}>
          <PricingCard s={s} tr={tr} phone={false} />
        </div>
      </BrowserFrame>
      {s.done.mobile && !ui.viewedMobile && <p className="mt-2 text-center text-[13px] font-extrabold text-brand">{tr('checkPhone')}</p>}
      {notes}
    </div>
  )
}

// ================================================================ 7. Трекер привычек

export function HabitsPreview({ state: s, ui, setUi, version }: P) {
  const tr = useTexts('hw7')
  const [checked, setChecked] = useState<Record<string, boolean>>({ h1: true })
  const ready = specActionReady(SPECS.hw7, s, 'ran')
  const dark = !!s.extras.dark
  const fg = dark ? '#FFFFFF' : '#2F2A47'
  const screens = !!s.done.screens
  return (
    <div className="card p-3">
      <PhoneFrame
        warn={
          screens && !s.done.safe ? (
            <div className="absolute inset-x-2 bottom-2 rounded-xl bg-coral px-3 py-2 text-center text-[12px] font-black text-white shadow-[0_3px_0_#E0573A]">{tr('notch')}</div>
          ) : undefined
        }
      >
        {!screens ? (
          <Empty text={tr('empty')} />
        ) : !s.done.stack ? (
          <div key={version} className="anim-fade-up p-3 font-serif text-[13px] text-[#0000EE]">
            <p className="text-[18px] font-bold text-black">{tr('title')}</p>
            <ul className="ml-5 list-disc">
              <li>{tr('h1')}</li>
              <li>{tr('h2')}</li>
            </ul>
            <p className="mt-4 rounded bg-coral-light p-2 font-sans text-[12px] font-extrabold text-coral-dark">{tr('web')}</p>
          </div>
        ) : (
          <div key={version} className="anim-fade-up flex min-h-[470px] flex-col" style={{ background: dark ? '#14111F' : '#F7F5FC', marginTop: s.done.safe ? 0 : -22 }}>
            <div className="px-4 pb-2 pt-3">
              <div className="text-[12px] font-black uppercase tracking-wider text-muted">{tr('today')}</div>
              <div className="text-[22px] font-black" style={{ color: fg }}>
                {tr('title')}
              </div>
              {s.extras.streak && <div className="mt-1 inline-block rounded-full bg-[#FFF1D9] px-2.5 py-0.5 text-[12px] font-black text-[#D97F00]">{tr('streak')}</div>}
            </div>
            <div className="flex-1 space-y-2 px-3">
              {['h1', 'h2', 'h3'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setChecked((c) => ({ ...c, [k]: !c[k] }))}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left"
                  style={{ background: dark ? '#231E35' : '#FFFFFF', boxShadow: '0 3px 0 rgba(47,42,71,.08)' }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white" style={{ background: checked[k] ? '#13C2AE' : 'transparent', border: checked[k] ? 'none' : '2px solid #C9C4D8' }}>
                    {checked[k] && <Check size={14} />}
                  </span>
                  <span className="text-[14.5px] font-extrabold" style={{ color: fg, textDecoration: checked[k] ? 'line-through' : 'none', opacity: checked[k] ? 0.6 : 1 }}>
                    {tr(k)}
                  </span>
                </button>
              ))}
            </div>
            <div className="px-3 pb-4 pt-3">
              <div className="rounded-2xl bg-coral py-3 text-center text-[14px] font-black text-white shadow-[0_4px_0_#E0573A]">{tr('add')}</div>
              <p className={`mt-2 text-center text-[11.5px] font-extrabold ${s.done.storage ? 'text-teal-dark' : 'text-coral-dark'}`}>{s.done.storage ? `💾 ${tr('stored')}` : `⚠️ ${tr('notStored')}`}</p>
            </div>
          </div>
        )}
      </PhoneFrame>
      <div className="mt-3 text-center">
        {ui.ran && ready ? (
          <p className="anim-pop text-[13.5px] font-extrabold text-teal-dark" data-spec-done>
            {tr('ran')}
          </p>
        ) : (
          <button type="button" data-spec-action="runApp" className="btn btn-teal btn-sm" disabled={!ready} onClick={() => setUi((u) => ({ ...u, ran: true }))}>
            {ready ? tr('run') : (
              <span className="inline-flex items-center gap-1.5">
                <Lock size={14} /> {tr('runLocked')}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ================================================================ 8. ИИ-помощник кофейни

function Node({ label, tone }: { label: string; tone: 'ok' | 'bad' | 'idle' }) {
  const c = tone === 'ok' ? 'border-teal bg-teal-light text-teal-dark' : tone === 'bad' ? 'border-coral bg-coral-light text-coral-dark' : 'border-line bg-snow text-muted'
  return <span className={`rounded-xl border-2 px-2.5 py-1.5 text-[12px] font-black ${c}`}>{label}</span>
}

export function AssistantPreview({ state: s, ui, setUi, version }: P) {
  const tr = useTexts('hw8')
  const ready = specActionReady(SPECS.hw8, s, 'tested')
  const route = !!s.done.route
  return (
    <div className="space-y-3">
      <div key={version} className="card anim-fade-up p-3">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <Node label={`🖥️ ${tr('browser')}`} tone="idle" />
          <span className="text-muted">→</span>
          {route && (
            <>
              <Node label={`⚙️ ${tr('server')} /api/chat`} tone="ok" />
              <span className="text-muted">→</span>
            </>
          )}
          <Node label={`🧠 ${tr('model')}`} tone="idle" />
        </div>
        <div className="mt-3 space-y-1.5">
          {!route && <Note ok={false}>{tr('noServer')}</Note>}
          <Note ok={!!s.done.secret}>{s.done.secret ? `🔒 ${tr('keyEnv')}` : tr('keyLeak')}</Note>
          <Note ok={!!s.done.system}>{s.done.system ? tr('rules') : tr('noRules')}</Note>
          {s.done.limits && <Note ok>{tr('limits')}</Note>}
        </div>
      </div>
      <BrowserFrame url={tr('site')}>
        <div className="bg-[#FFF8F0] p-3">
          <div className="text-[16px] font-black text-[#5C3A24]">{tr('cafe')}</div>
          <div className="text-[12px] font-bold text-[#4A3326]/70">{tr('tagline')}</div>
          <div className="mt-3 ml-auto w-full max-w-[300px] overflow-hidden rounded-2xl border-2 border-line bg-white shadow-[0_4px_0_rgba(47,42,71,.08)]">
            <div className="flex items-center gap-2 bg-brand px-3 py-2 text-[13px] font-black text-white">🤖 {tr('chat')}</div>
            <div className="space-y-2 p-3">
              <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-brand-light px-3 py-2 text-[13px] font-bold text-ink">{tr('question')}</div>
              {ui.tested && ready && (
                <div className="anim-fade-up w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-snow px-3 py-2 text-[13px] font-bold text-ink" data-spec-done>
                  {tr('answer')}
                  {s.extras.stream && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-brand align-middle" />}
                </div>
              )}
            </div>
            <div className="border-t-2 border-line p-2">
              <button type="button" data-spec-action="sendTest" className="btn btn-sm w-full" disabled={!ready || (ui.tested && ready)} onClick={() => setUi((u) => ({ ...u, tested: true }))}>
                {ready ? tr('ask') : (
                  <span className="inline-flex items-center gap-1.5">
                    <Lock size={14} /> {tr('locked')}
                  </span>
                )}
              </button>
              {s.extras.retry && <div className="mt-1.5 text-center text-[11.5px] font-extrabold text-muted">↻ {tr('retry')}</div>}
            </div>
          </div>
        </div>
      </BrowserFrame>
    </div>
  )
}

// ================================================================ 9. Задача для агента

const DIFF_FIX = ['- if (total > 5000) return total * 0.9', '+ if (total >= 5000) return total * 0.9']
const DIFF_TEST = ["+ test('5000 → 4500', () => expect(applyDiscount(5000)).toBe(4500))"]
const DIFF_WIDE = ['~ src/payments.ts', '~ src/styles.css', '~ src/Checkout.tsx']

export function AgentPreview({ state: s, ui, setUi, version }: P) {
  const tr = useTexts('hw9')
  const ready = specActionReady(SPECS.hw9, s, 'testsRun')
  const any = Object.keys(s.done).length > 0
  const plan: [string, boolean][] = [
    ['pGoal', !!s.done.goal],
    ['pScope', !!s.done.scope],
    ['pDone', !!s.done.done],
    ['pTests', !!s.done.tests],
  ]
  const files = (s.done.goal ? 1 : 0) + (s.done.tests ? 1 : 0) + (s.done.scope ? 0 : 3)
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl bg-[#1b1726]">
        <div className="border-b border-white/10 px-3 py-2 text-[12px] font-extrabold uppercase tracking-wider text-white/60">{tr('plan')}</div>
        {!any ? (
          <div className="px-3 py-6 text-center text-[13px] font-bold text-white/50">{tr('empty')}</div>
        ) : (
          <div key={version} className="anim-fade-up space-y-1.5 px-3 py-3">
            {plan.map(([k, ok]) => (
              <div key={k} className="flex items-center gap-2 text-[13px] font-bold" style={{ color: ok ? '#6FE3D3' : 'rgba(255,255,255,.35)' }}>
                <span className="w-4 shrink-0">{ok ? '✓' : '○'}</span>
                {tr(k)}
              </div>
            ))}
            {s.extras.review && <div className="pt-1 text-[12px] font-bold text-[#C7B6FF]">⎇ {tr('branch')}</div>}
            {s.extras.explain && <div className="text-[12px] font-bold text-[#FFD58C]">💡 {tr('explain')}</div>}
          </div>
        )}
      </div>
      {s.done.goal && (
        <div className="anim-fade-up overflow-hidden rounded-2xl border-2 border-line bg-white">
          <div className="flex items-center justify-between border-b-2 border-line bg-snow px-3 py-1.5 text-[12px] font-extrabold text-muted">
            <span>
              {tr('files')}: {files}
            </span>
          </div>
          <div className="code-font space-y-0.5 p-3 text-[12px] leading-relaxed">
            <div className="font-bold text-muted">src/discount.ts</div>
            {DIFF_FIX.map((l) => (
              <div key={l} className={l.startsWith('+') ? 'bg-teal-light text-teal-dark' : 'bg-coral-light text-coral-dark'}>
                {l}
              </div>
            ))}
            {s.done.tests && (
              <>
                <div className="pt-1 font-bold text-muted">src/discount.test.ts</div>
                {DIFF_TEST.map((l) => (
                  <div key={l} className="bg-teal-light text-teal-dark [overflow-wrap:anywhere]">
                    {l}
                  </div>
                ))}
              </>
            )}
            {!s.done.scope &&
              DIFF_WIDE.map((l) => (
                <div key={l} className="text-[#D97F00]">
                  {l}
                </div>
              ))}
          </div>
          {!s.done.scope && (
            <div className="px-3 pb-3">
              <Note ok={false}>{tr('wide')}</Note>
            </div>
          )}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl bg-[#1b1726]">
        <div className="code-font px-3 py-2.5 text-[12px] leading-relaxed text-white/80">
          <div className="text-white">$ npm test</div>
          {ui.testsRun && ready ? (
            <div data-spec-done>
              <div style={{ color: '#6FE3D3' }}>✓ discount › 5000 → 4500</div>
              <div style={{ color: '#6FE3D3' }}>Tests: 13 passed, 13 total</div>
            </div>
          ) : (
            <div className="text-white/40">…</div>
          )}
        </div>
        <div className="px-3 pb-3">
          <button type="button" data-spec-action="runTests" className="btn btn-teal btn-sm w-full" disabled={!ready || (ui.testsRun && ready)} onClick={() => setUi((u) => ({ ...u, testsRun: true }))}>
            {ready ? tr('run') : (
              <span className="inline-flex items-center gap-1.5">
                <Lock size={14} /> {tr('runLocked')}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
