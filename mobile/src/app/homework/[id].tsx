import { useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { findHomework, HOMEWORK_XP, type BlockColor, type HomeworkDef, type PromptBlock } from '@web/data/homework'
import { UNITS } from '@web/data/course'
import { UNIT_COLORS } from '@web/data/types'
import { buildReviewRequest, mergeAiIntoPrompt } from '@web/homework/ai'
import { cardSim, debugSim, deploySim, formSim, landingSim, type Sim, type Tone } from '@web/homework/sims'
import { reviewPrompt, type ReviewOutcome } from '@web/lib/review'
import { AI_ENABLED } from '../../lib/env'
import { useStore } from '../../store/Store'
import { recordHomeworkSubmission } from '../../store/progress'
import { CardPreview, DeployPreview, FormPreview, LandingPreview, TodoPreview } from '../../components/homework/previews'
import { MascotHead } from '../../components/Mascot'
import { Btn, Chip, ProgressBar, Txt } from '../../components/ui'
import { Sheet } from '../../components/Sheet'
import { C, font } from '../../theme'

const BLOCK_COLORS: Record<BlockColor, { main: string; light: string; dark: string }> = {
  brand: { main: C.brand, light: C.brandLight, dark: C.brandDark },
  coral: { main: C.coral, light: C.coralLight, dark: C.coralDark },
  teal: { main: C.teal, light: C.tealLight, dark: C.tealDark },
  deep: { main: '#5B2FD6', light: '#E8E0FF', dark: '#3E1A9E' },
  amber: { main: C.amber, light: C.goldLight, dark: '#D97F00' },
  grey: { main: '#A39DBA', light: C.snow, dark: '#8C86A3' },
}
const TONE_BG: Record<Tone | 'intro', { bg: string; fg: string }> = {
  good: { bg: C.tealLight, fg: C.tealDark },
  meh: { bg: C.goldLight, fg: '#8a6a1e' },
  bad: { bg: C.coralLight, fg: C.coralDark },
  intro: { bg: C.brandLight, fg: C.brandDark },
}

interface Msg { id: number; role: 'user' | 'ai' | 'bipi'; text: string; changes?: string[]; bullets?: string[]; improved?: string; tone?: Tone | 'intro' }

const SIMS: Record<string, Sim<never, never>> = { hw1: cardSim, hw2: landingSim, hw3: debugSim, hw4: formSim, hw5: deploySim } as unknown as Record<string, Sim<never, never>>

export default function HomeworkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const def = findHomework(id)
  if (!def) return <Missing />
  const sim = SIMS[def.id]
  if (!sim) return <Missing />
  return <Runner def={def} sim={sim} />
}

function Missing() {
  const router = useRouter()
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Txt w={900} size={20}>Домашка не найдена</Txt>
      <Btn label="На путь" onPress={() => router.replace('/(tabs)/learn')} />
    </View>
  )
}

function Runner<S, U>({ def, sim }: { def: HomeworkDef; sim: Sim<S, U> }) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { progress, completeHomework } = useStore()
  const unit = UNITS.find((u) => u.id === def.unitId)!
  const color = UNIT_COLORS[unit.color]
  const [state, setState] = useState<S>(sim.init)
  const [ui, setUi] = useState<U>(sim.initUi)
  const [draft, setDraft] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, role: 'bipi', text: def.intro, tone: 'intro' }])
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<'chat' | 'preview'>('chat')
  const [quit, setQuit] = useState(false)
  const [done, setDone] = useState(false)
  const stateRef = useRef(state)
  const uiRef = useRef(ui)
  useEffect(() => {
    stateRef.current = state
    uiRef.current = ui
  })
  const nextId = useRef(1)
  const runId = useRef(0)
  const announced = useRef(false)
  const fallbackNoted = useRef(false)
  const [aiMode, setAiMode] = useState<'on' | 'off'>(AI_ENABLED ? 'on' : 'off')

  const checks = sim.check(state, ui)
  const doneCount = def.requirements.filter((r) => checks[r.id]).length
  const allDone = doneCount === def.requirements.length
  const sends = msgs.filter((m) => m.role === 'user').length

  useEffect(() => {
    if (allDone && !announced.current && !busy) {
      announced.current = true
      setMsgs((m) => [...m, { id: nextId.current++, role: 'bipi', text: 'Все требования выполнены! 🎉 Жми «Сдать домашку».', tone: 'good' }])
    }
  }, [allDone, busy])

  const push = (...add: Omit<Msg, 'id'>[]) => setMsgs((m) => [...m, ...add.map((x) => ({ ...x, id: nextId.current++ }))])

  const finish = (prompt: string, outcome: ReviewOutcome | null) => {
    let text = prompt
    let review = null
    if (outcome?.ok) {
      review = outcome.review
      text = mergeAiIntoPrompt(sim, def, stateRef.current, prompt, review).text
    }
    const turn = sim.apply(stateRef.current, text)
    const ck = sim.check(turn.state, uiRef.current)
    const missing = def.requirements.find((r) => !ck[r.id])
    const ok = !missing
    let bipi = turn.bipi
    const tip = missing ? (sim.hint?.(turn.state, uiRef.current, missing.id) ?? missing.hint) : ''
    if (!bipi && review) bipi = ok ? 'Все требования выполнены! 🎉 Жми «Сдать домашку».' : `Промпт на ${review.score}/100. Вот что подскажу:`
    if (!bipi) bipi = ok ? 'Все требования выполнены! 🎉 Жми «Сдать домашку».' : `${turn.tone === 'good' ? 'Отлично! Осталось ещё чуть-чуть. ' : turn.tone === 'meh' ? 'Уже лучше! ' : 'Хм, результат так себе. '}${tip}`
    if (ok) announced.current = true
    setState(turn.state)
    const add: Omit<Msg, 'id'>[] = [
      { role: 'ai', text: turn.reply, changes: turn.changes },
      { role: 'bipi', text: bipi, tone: ok ? 'good' : turn.tone, bullets: review?.feedback, improved: review && !ok && review.improved_prompt && review.improved_prompt !== prompt ? review.improved_prompt : undefined },
    ]
    if (outcome && !outcome.ok && outcome.reason !== 'disabled' && !fallbackNoted.current) {
      fallbackNoted.current = true
      add.push({ role: 'bipi', tone: 'meh', text: outcome.reason === 'limit' ? `${outcome.message} Дальше проверяю офлайн — превью и чек-лист работают как обычно.` : 'ИИ-ментор сейчас недоступен — проверяю офлайн, всё работает как обычно 🙂' })
    }
    if (outcome && !outcome.ok && (outcome.reason === 'limit' || outcome.reason === 'disabled' || outcome.reason === 'auth')) setAiMode('off')
    push(...add)
    setBusy(false)
  }

  const send = () => {
    const prompt = draft.trim()
    if (!prompt || busy) return
    const history = msgs.filter((m) => m.role === 'user').map((m) => m.text)
    push({ role: 'user', text: prompt })
    setDraft('')
    setBusy(true)
    const run = ++runId.current
    const ai: Promise<ReviewOutcome | null> = aiMode === 'on' ? reviewPrompt(buildReviewRequest(def, prompt, history)) : Promise.resolve(null)
    const minWait = new Promise<void>((r) => setTimeout(r, 900))
    void Promise.all([ai, minWait]).then(([outcome]) => {
      if (run !== runId.current) return
      finish(prompt, outcome)
    })
  }

  const toggleBlock = (b: PromptBlock) => setDraft((d) => (d.includes(b.text) ? d.replace(b.text, '').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim() : d.trim() ? `${d.trimEnd()} ${b.text}` : b.text))
  const insert = (text: string) => setDraft((d) => (d.trim() ? `${d.trimEnd()}\n${text}` : text))
  const restart = () => {
    runId.current++
    setBusy(false)
    setState(sim.init())
    setUi(sim.initUi())
    setDraft('')
    announced.current = false
    setMsgs([{ id: nextId.current++, role: 'bipi', text: 'Начнём с чистого листа! ' + def.intro, tone: 'intro' }])
  }
  const submit = () => {
    const prompts = msgs.filter((m) => m.role === 'user').map((m) => m.text)
    completeHomework(def.id, HOMEWORK_XP)
    void recordHomeworkSubmission(def.id, prompts, true)
    setDone(true)
  }

  const groups: { name: string; blocks: PromptBlock[] }[] = []
  for (const b of def.blocks) {
    const g = groups.find((x) => x.name === b.group)
    if (g) g.blocks.push(b)
    else groups.push({ name: b.group, blocks: [b] })
  }

  const preview = (() => {
    if (def.id === 'hw1') return <CardPreview state={state as never} />
    if (def.id === 'hw2') return <LandingPreview state={state as never} ui={ui as never} setUi={setUi as never} />
    if (def.id === 'hw3') return <TodoPreview state={state as never} ui={ui as never} setUi={setUi as never} insert={insert} />
    if (def.id === 'hw4') return <FormPreview state={state as never} ui={ui as never} setUi={setUi as never} />
    return <DeployPreview state={state as never} ui={ui as never} setUi={setUi as never} />
  })()

  if (done) {
    const again = progress.homework.includes(def.id)
    return (
      <View testID="hw-done" style={{ flex: 1, backgroundColor: C.goldLight, paddingTop: insets.top + 30, paddingBottom: insets.bottom + 16, paddingHorizontal: 22, alignItems: 'center', gap: 10 }}>
        <Text style={{ fontSize: 56 }}>{def.badge.emoji}</Text>
        <Txt w={900} size={26} center>Домашка сдана!</Txt>
        <Txt w={800} size={16} center>{def.short}</Txt>
        <View style={{ borderRadius: 16, backgroundColor: C.white, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Txt w={900} size={15} center>{again ? '+10 ВП за повтор' : `+${HOMEWORK_XP} ВП · +20 токенов`}</Txt>
        </View>
        <Txt w={700} size={13} color={C.muted} center>Значок «{def.badge.name}» — твой</Txt>
        <View style={{ flex: 1 }} />
        <Btn label="На путь" block onPress={() => router.replace('/(tabs)/learn')} style={{ alignSelf: 'stretch' }} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.white }} testID={`homework-${def.id}`}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 14, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: C.line, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable testID="close-hw" accessibilityLabel="Закрыть домашку" onPress={() => (sends ? setQuit(true) : router.replace('/(tabs)/learn'))} hitSlop={8}>
            <Text style={font(900, 24, C.muted)}>✕</Text>
          </Pressable>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: color.main, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: color.dark }}>
            <Text style={{ fontSize: 18 }}>🏠</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={font(800, 11, C.muted)}>ДОМАШКА · РАЗДЕЛ {unit.num}</Text>
            <Text numberOfLines={1} style={font(900, 15)}>{def.short}</Text>
          </View>
          <Text style={font(900, 15, C.tealDark)}>{doneCount}/{def.requirements.length}</Text>
        </View>
        <ProgressBar value={(doneCount / def.requirements.length) * 100} color={C.teal} height={8} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['chat', 'preview'] as const).map((t) => (
            <Pressable key={t} testID={`tab-${t}`} onPress={() => setTab(t)} style={{ flex: 1, borderRadius: 12, paddingVertical: 6, backgroundColor: tab === t ? C.brand : C.snow }}>
              <Text style={[font(900, 13, tab === t ? C.white : C.muted), { textAlign: 'center' }]}>{t === 'chat' ? 'Чат' : 'Превью'}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {tab === 'chat' ? (
        <ScrollView contentContainerStyle={{ padding: 14, gap: 10 }} keyboardShouldPersistTaps="handled">
          {msgs.map((m) => <Bubble key={m.id} m={m} onUse={(t) => setDraft(t)} />)}
          {busy ? (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 18 }}>✨</Text>
              <Text style={font(800, 13, C.muted)}>{aiMode === 'on' ? 'Бипи проверяет промпт…' : 'ИИ пишет…'}</Text>
            </View>
          ) : null}
          <View style={{ gap: 6, marginTop: 4 }}>
            {def.requirements.map((r) => (
              <View key={r.id} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                <Text style={font(900, 14, checks[r.id] ? C.tealDark : C.line)}>{checks[r.id] ? '✓' : '○'}</Text>
                <Text style={[font(700, 13.5, checks[r.id] ? C.tealDark : C.ink), { flex: 1 }]}>{r.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={{ alignSelf: 'stretch' }} contentContainerStyle={{ padding: 14, alignItems: 'stretch' }}>{preview}</ScrollView>
      )}

      <View style={{ borderTopWidth: 2, borderTopColor: C.line, paddingHorizontal: 12, paddingTop: 8, paddingBottom: insets.bottom + 8, gap: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: 'center' }}>
          {groups.map((g) => (
            <View key={g.name} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Text style={font(800, 11, C.muted)}>{g.name}</Text>
              {g.blocks.map((b) => (
                <Chip key={b.label} label={b.label} color={BLOCK_COLORS[b.color]} on={draft.includes(b.text)} onPress={() => toggleBlock(b)} />
              ))}
            </View>
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
          <TextInput testID="hw-input" value={draft} onChangeText={setDraft} placeholder={def.placeholder} placeholderTextColor={C.muted} multiline style={[font(700, 14), { flex: 1, maxHeight: 110, borderRadius: 14, borderWidth: 2, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 8 }]} />
          <Pressable testID="hw-send" accessibilityLabel="Отправить промпт" disabled={!draft.trim() || busy} onPress={send} style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center', opacity: !draft.trim() || busy ? 0.4 : 1, borderBottomWidth: 4, borderBottomColor: C.brandDark }}>
            <Text style={font(900, 18, C.white)}>➤</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Btn label="Заново" tone="ghost" small style={{ flex: 1 }} onPress={restart} />
          {allDone ? <Btn testID="hw-submit" label="Сдать домашку" tone="gold" small style={{ flex: 2 }} onPress={submit} /> : null}
        </View>
      </View>

      <Sheet open={quit} onClose={() => setQuit(false)} label="Выйти из домашки">
        <Txt w={900} size={20} center>Выйти из домашки?</Txt>
        <Txt w={600} size={14} color={C.muted} center>Промпты этого захода не сохранятся.</Txt>
        <Btn label="Остаться" block onPress={() => setQuit(false)} />
        <Btn label="Выйти" tone="coral" block onPress={() => router.replace('/(tabs)/learn')} />
      </Sheet>
    </View>
  )
}

function Bubble({ m, onUse }: { m: Msg; onUse: (t: string) => void }) {
  if (m.role === 'user')
    return (
      <View style={{ alignItems: 'flex-end' }}>
        <View style={{ maxWidth: '88%', borderRadius: 16, borderBottomRightRadius: 5, backgroundColor: C.brand, paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={[font(700, 14, C.white), { lineHeight: 19 }]}>{m.text}</Text>
        </View>
      </View>
    )
  if (m.role === 'bipi') {
    const t = TONE_BG[m.tone ?? 'intro']
    return (
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
        <View style={{ width: 34, height: 34, borderRadius: 34, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' }}>
          <MascotHead size={24} />
        </View>
        <View style={{ flex: 1, borderRadius: 16, borderBottomLeftRadius: 5, backgroundColor: t.bg, paddingHorizontal: 12, paddingVertical: 8, gap: 4 }}>
          <Text style={[font(900, 11, t.fg), { opacity: 0.7 }]}>БИПИ</Text>
          <Text style={[font(700, 14, t.fg), { lineHeight: 19 }]}>{m.text}</Text>
          {m.bullets?.map((b, i) => (
            <Text key={i} style={font(600, 13, t.fg)}>• {b}</Text>
          ))}
          {m.improved ? <Pressable onPress={() => onUse(m.improved!)} style={{ alignSelf: 'flex-start', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 8, paddingVertical: 4 }}><Text style={font(900, 12, C.brand)}>✨ Вставить улучшенный промпт</Text></Pressable> : null}
        </View>
      </View>
    )
  }
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <View style={{ width: 34, height: 34, borderRadius: 34, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: C.white }}>✨</Text>
      </View>
      <View style={{ flex: 1, borderRadius: 16, borderTopLeftRadius: 5, borderWidth: 2, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 8, gap: 4 }}>
        <Text style={font(900, 11, C.muted)}>ИИ</Text>
        <Text style={[font(700, 14), { lineHeight: 19 }]}>{m.text}</Text>
        {m.changes?.map((c, i) => (
          <Text key={i} style={font(700, 13, C.tealDark)}>✓ {c}</Text>
        ))}
      </View>
    </View>
  )
}
