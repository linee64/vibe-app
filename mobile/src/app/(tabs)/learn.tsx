/**
 * Путь обучения — как src/screens/Home.tsx: баннеры тиров, «прилипающие» карточки разделов, змейка объёмных
 * узлов (урок/домашка/итоговый тест), пузырь «НАЧАТЬ», попап узла, иллюстрации разделов, Бипи между разделами.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { UNIT_COLORS, type NodeKind, type Unit } from '@web/data/course'
import { HOMEWORK_XP } from '@web/data/homework'
import { currentNodeId, isNodeDone, isNodeReachable, unitNodes, type PathItem } from '@web/data/path'
import { TIERS, isTierComplete, isTierOpenByProgress, isTierPassedByTest, isTierUnlocked, pendingTierUp, tierItems, unitsOf, type Tier } from '@web/data/tiers'
import { t } from '@web/i18n/core'
import { tx } from '@web/i18n/rich'
import { useStore } from '../../store/Store'
import { useToast } from '../../components/Toast'
import { AgentArt, AiChatArt, Book, BrowserArt, BugArt, Check, Chest, DatabaseArt, DesignArt, Dumbbell, House, Lock, Mascot, PhoneArt, RocketArt, Star, TierBadge, Trophy } from '../../components/art'
import { Btn, ProgressBar } from '../../components/ui'
import { Bob, Float, Pop, Pulse } from '../../components/motion'
import { ExploreMore } from '../../components/path/ExploreMore'
import { takeLastNode } from '../../lib/flow'
import { buzz } from '../../lib/haptics'
import { C, caps, font } from '../../theme'

type NodeState = 'done' | 'current' | 'upcoming' | 'locked'

/** «Змейка» пути: узлы плавно уходят вправо и обратно */
const OFFSETS = [0, 44, 72, 44, 0, -44, -72, -44]
const isReward = (kind: NodeKind) => kind === 'chest' || kind === 'trophy'
const LOCK = { bg: '#ECE9F4', edge: '#D6D1E4', icon: '#B5B0C8' }

function KindIcon({ kind, size, color }: { kind: NodeKind | 'homework'; size: number; color: string }) {
  switch (kind) {
    case 'homework':
      return <House size={size} color={color} />
    case 'book':
      return <Book size={size} color={color} />
    case 'dumbbell':
      return <Dumbbell size={size} color={color} />
    case 'chest':
      return <Chest size={size} color={color} />
    case 'trophy':
      return <Trophy size={size} color={color} />
    default:
      return <Star size={size} color={color} />
  }
}

function UnitBanner({ unit, label, locked }: { unit: Unit; label: string; locked: boolean }) {
  const c = UNIT_COLORS[unit.color]
  const toast = useToast()
  return (
    <View style={{ backgroundColor: C.white, paddingTop: 4 }} testID={`unit-${unit.id}`}>
      <View style={{ borderRadius: 20, backgroundColor: locked ? '#A39DBA' : c.dark, paddingBottom: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, backgroundColor: locked ? '#B9B3CC' : c.main, paddingHorizontal: 20, paddingVertical: 16 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 8, rowGap: 4 }}>
              <Text style={[font(800, 13, 'rgba(255,255,255,0.8)'), caps(13)]}>{t('x1jr1m8h', { num: unit.num, label })}</Text>
              {unit.pro ? (
                <View style={{ borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 6, paddingVertical: 1 }}>
                  <Text style={[font(900, 11, C.white), caps(11)]}>Pro</Text>
                </View>
              ) : null}
            </View>
            <Text numberOfLines={1} style={[font(900, 21, C.white), { lineHeight: 26 }]}>{unit.title}</Text>
            <Text numberOfLines={2} style={[font(700, 14, 'rgba(255,255,255,0.85)'), { lineHeight: 18, marginTop: 2 }]}>{unit.description}</Text>
          </View>
          <Pressable
            disabled={locked}
            accessibilityLabel={locked ? t('x09hg17m') : t('x14u0jyk', { title: unit.title })}
            onPress={() => toast(t('x0xn1iho', { title: unit.title }))}
            style={{ borderRadius: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', paddingHorizontal: 12, paddingVertical: 10 }}
          >
            {locked ? <Lock size={20} color={C.white} /> : <Book size={20} color={C.white} />}
          </Pressable>
        </View>
      </View>
    </View>
  )
}

/** Попап узла: стрелочка + карточка (в потоке под узлом, чтобы кнопка нажималась на iOS) */
function Popover({ offset, solid, color, border, children }: { offset: number; solid: boolean; color: string; border: string; children: ReactNode }) {
  return (
    <Pop style={{ width: 280, alignSelf: 'center', marginTop: 26, transform: [{ translateX: -offset }] }}>
      <View style={{ position: 'absolute', top: -8, left: 140 + offset - 10, width: 20, height: 20, borderRadius: 4, transform: [{ rotate: '45deg' }], backgroundColor: solid ? color : C.white, borderColor: border, borderTopWidth: solid ? 0 : 2, borderLeftWidth: solid ? 0 : 2 }} />
      <View style={{ borderRadius: 20, padding: 16, backgroundColor: solid ? color : C.white, borderWidth: solid ? 0 : 2, borderColor: border }}>{children}</View>
    </Pop>
  )
}

function PathNode({ item, first, unit, state, offset, open, onToggle, onY }: { item: PathItem; first: boolean; unit: Unit; state: NodeState; offset: number; open: boolean; onToggle: () => void; onY: (y: number) => void }) {
  const router = useRouter()
  const c = UNIT_COLORS[unit.color]
  const hw = item.type === 'homework' ? item.hw : null
  const kind: NodeKind | 'homework' = hw ? 'homework' : item.type === 'lesson' ? item.lesson.kind : 'star'
  const locked = state === 'locked'
  const soft = state === 'upcoming'
  const golden = state === 'done' && (hw || (kind !== 'homework' && isReward(kind)))
  const bg = locked ? LOCK.bg : soft ? c.light : golden ? '#FFC23D' : c.main
  const edge = locked ? LOCK.edge : soft ? c.mid : golden ? '#E5A100' : c.dark
  const iconColor = locked ? LOCK.icon : soft ? c.mid : '#fff'
  const lessonCount = unit.lessons.length
  const [down, setDown] = useState(false)
  const sub = (s: boolean) => font(700, 15, s ? C.muted : 'rgba(255,255,255,0.8)')

  let pop: ReactNode = null
  if (open && hw && !locked) {
    pop = (
      <Popover offset={offset} solid={!soft} color={c.main} border={c.mid}>
        <Text style={[font(900, 12, soft ? C.muted : 'rgba(255,255,255,0.75)'), caps(12)]}>{t('x0klzw38')}</Text>
        <Text style={[font(900, 18, soft ? C.ink : C.white), { lineHeight: 22, marginTop: 2 }]}>{hw.title}</Text>
        <Text style={[sub(soft), { marginTop: 4, marginBottom: 16 }]}>{state === 'done' ? t('x1abu6o4', { name: hw.badge.name, emoji: hw.badge.emoji }) : t('x1129dql', { length: hw.requirements.length })}</Text>
        <Btn testID="popover-go" block tone={soft ? 'brand' : 'white'} colors={soft ? { c: c.main, e: c.dark } : undefined} textColor={soft ? undefined : c.main} label={state === 'done' ? t('x1al1xcn') : t('x0vp3igd', { HOMEWORK_XP })} onPress={() => router.push(`/homework/${hw.id}`)} />
      </Popover>
    )
  } else if (open && !locked && item.type === 'lesson') {
    const lesson = item.lesson
    const label = isReward(lesson.kind) ? t('x12zyds7') : t('x06td5dg', { v: item.index + 1, lessonCount })
    pop = (
      <Popover offset={offset} solid={!soft} color={c.main} border={c.mid}>
        <Text style={[font(900, 18, soft ? C.ink : C.white), { lineHeight: 22 }]}>{lesson.title}</Text>
        <Text style={[sub(soft), { marginTop: 4, marginBottom: 16 }]}>{state === 'done' ? t('x1ohea2y') : t('x07lcnjn', { label, length: lesson.exercises.length })}</Text>
        <Btn testID="popover-go" block tone={soft ? 'brand' : 'white'} colors={soft ? { c: c.main, e: c.dark } : undefined} textColor={soft ? undefined : c.main} label={state === 'done' ? t('x1j8rthb') : t('x1jn8q2x')} onPress={() => router.push(`/lesson/${lesson.id}`)} />
      </Popover>
    )
  }

  const title = hw ? t('x0a5c8tb', { short: hw.short }) : item.type === 'lesson' ? item.lesson.title : ''
  const w = hw ? 84 : 72
  const h = hw ? 72 : 66
  const r = hw ? 24 : 36
  return (
    <View onLayout={(e) => onY(e.nativeEvent.layout.y)} testID={`node-${item.id}`} style={{ alignItems: 'center', marginTop: first ? 0 : state === 'current' ? 56 : hw ? 32 : 24, zIndex: open ? 16 : 0 }}>
      <View style={{ transform: [{ translateX: offset }], alignItems: 'center' }}>
        {state === 'current' ? (
          <Bob style={{ position: 'absolute', top: -54, zIndex: 5, alignItems: 'center' }}>
            <View style={{ borderRadius: 12, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 8 }}>
              <Text numberOfLines={1} style={[font(900, 15, c.main), caps(15)]}>{hw ? t('x1b55y4z') : t('x1y49sih')}</Text>
            </View>
            <View style={{ marginTop: -7, width: 12, height: 12, transform: [{ rotate: '45deg' }], backgroundColor: C.white, borderRightWidth: 2, borderBottomWidth: 2, borderColor: C.line }} />
          </Bob>
        ) : null}
        <View>
          {state === 'current' ? <Pulse style={{ position: 'absolute', left: -11, top: -11, width: w + 22, height: h + 8 + 22, borderRadius: hw ? 30 : 50, borderWidth: 7, borderColor: c.mid }} /> : null}
          <Pressable
            testID={`node-btn-${item.id}`}
            accessibilityRole="button"
            accessibilityLabel={locked ? t('x0liqy8t', { title }) : title}
            accessibilityState={{ expanded: open }}
            onPress={onToggle}
            onPressIn={() => setDown(true)}
            onPressOut={() => setDown(false)}
            style={{ width: w, height: h + 8, paddingTop: down ? 6 : 0 }}
          >
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: h, borderRadius: r, backgroundColor: edge }} />
            <View style={{ width: w, height: h, borderRadius: r, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ position: 'absolute', left: 14, top: 8, width: 22, height: 10, borderRadius: 5, transform: [{ rotate: '-12deg' }], backgroundColor: soft || locked ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }} />
              {locked ? <Lock size={28} color={iconColor} /> : state === 'done' && kind !== 'homework' && !isReward(kind) ? <Check size={34} color={iconColor} /> : <KindIcon kind={kind} size={hw ? 38 : 32} color={iconColor} />}
            </View>
          </Pressable>
          {hw ? (
            <View pointerEvents="none" style={{ position: 'absolute', bottom: -30, left: -40, right: -40, alignItems: 'center' }}>
              <View style={{ borderRadius: 99, paddingHorizontal: 10, paddingVertical: 2, backgroundColor: locked ? '#F2F0F7' : c.light }}>
                <Text numberOfLines={1} style={[font(900, 11, locked ? LOCK.icon : c.dark), caps(11)]}>{tx('x0rld579', { v: state === 'done' ? ' ✓' : '' })}</Text>
              </View>
            </View>
          ) : null}
        </View>
        {hw ? <View style={{ height: 24 }} /> : null}
      </View>
      {pop}
    </View>
  )
}

const ART_W = 110
function UnitArt({ unit, dir, locked }: { unit: Unit; dir: number; locked: boolean }) {
  const s = ART_W
  const arts: Record<string, ReactNode> = {
    u1: <Float><Mascot size={104} /></Float>,
    u2: <BrowserArt size={s} />,
    u3: <BugArt size={s} />,
    u4: <DatabaseArt size={s} />,
    u5: <Float><RocketArt size={s} /></Float>,
    u6: <DesignArt size={s} />,
    u7: <Float><PhoneArt size={s} /></Float>,
    u8: <AiChatArt size={s} />,
    u9: <AgentArt size={s} />,
  }
  // иллюстрация — с той стороны, куда змейка не уходит в начале раздела
  const side = dir === 1 ? { right: '50%' as const, marginRight: 66 } : { left: '50%' as const, marginLeft: 66 }
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', top: 130, opacity: locked ? 0.4 : 1 }, side]}>
      {arts[unit.id] ?? <Mascot size={104} />}
    </View>
  )
}

function Interlude({ next, dir }: { next: Unit; dir: number }) {
  const c = UNIT_COLORS[next.color]
  const bubble = (
    <View style={{ maxWidth: 230, borderRadius: 16, borderWidth: 2, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 10 }}>
      <Text style={[font(700, 14), { lineHeight: 19 }]}>{tx('x1bo80fq', { title: next.title }, [(chunk) => <Text style={font(900, 14, c.dark)}>{chunk}</Text>])}</Text>
    </View>
  )
  return (
    <View style={{ marginTop: -32, marginBottom: 40, flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: dir === 1 ? 'flex-end' : 'flex-start', paddingHorizontal: 8 }}>
      {dir === -1 ? <Mascot mood="happy" size={70} /> : null}
      {bubble}
      {dir === 1 ? <Mascot mood="happy" size={70} /> : null}
    </View>
  )
}

function TierBanner({ tier }: { tier: Tier }) {
  const { progress } = useStore()
  const c = UNIT_COLORS[tier.color]
  const open = isTierUnlocked(tier, progress)
  const openFair = isTierOpenByProgress(tier, progress)
  const complete = isTierComplete(tier, progress)
  const byTest = isTierPassedByTest(tier, progress)
  const items = tierItems(tier, progress)
  const done = items.filter((i) => i.done).length
  const prev = TIERS[TIERS.findIndex((x) => x.id === tier.id) - 1]
  const prevItems = prev ? tierItems(prev, progress) : []
  const prevDone = prevItems.filter((i) => i.done).length
  const units = unitsOf(tier)
  const status = complete ? t('x1gyh9b2') : byTest ? t('x0uzej6s') : openFair ? t('x121hzbq') : open ? t('x08qbke9') : t('x0vqp3cx')
  const b = (chunk: ReactNode) => <Text style={font(900, 13, C.ink)}>{chunk}</Text>
  return (
    <View testID={`tier-${tier.id}`} style={{ marginBottom: 24, borderRadius: 26, backgroundColor: open ? c.mid : C.line, paddingBottom: 6 }}>
      <View style={{ borderRadius: 26, borderWidth: 2, borderColor: open ? c.mid : C.line, backgroundColor: open ? c.light : C.snow, padding: 20, overflow: 'hidden' }}>
        <View pointerEvents="none" style={{ position: 'absolute', right: -40, top: -48, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.5)' }} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
          <TierBadge tier={tier} size={76} locked={!open} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
              <Text style={[font(900, 12, open ? c.dark : C.muted), caps(12)]}>{t('x1vbkjkz', { num: tier.num })}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: open ? C.white : C.line }}>
                {!open ? <Lock size={11} color={C.muted} /> : null}
                <Text style={[font(900, 12, open ? c.dark : C.muted), caps(12)]}>{status}</Text>
              </View>
            </View>
            <Text style={[font(900, 28), { lineHeight: 33 }]}>{tier.name}</Text>
            <Text style={[font(700, 14, C.muted), { lineHeight: 18, marginTop: 2 }]}>{tx('x1knv19l', { v: units.map((u) => u.num).join('–'), v2: units.map((u) => u.title).join(' · ') })}</Text>
          </View>
        </View>
        <View style={{ marginTop: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={[font(900, 12, C.muted), caps(12)]}>{t('x01rxjb2')}</Text>
          <Text style={[font(800, 16), { lineHeight: 21, marginTop: 2 }]}>{tier.outcome}</Text>
        </View>
        {open ? (
          <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <ProgressBar value={Math.max((done / items.length) * 100, 4)} color={c.main} height={14} track={C.white} />
            </View>
            <Text style={font(800, 13, C.muted)}>{tx('x0btwvc6', { done, length: items.length }, [b])}</Text>
          </View>
        ) : (
          <Text style={[font(700, 14, C.muted), { marginTop: 16, lineHeight: 19 }]}>{tx('path.tierBannerLocked', { name: prev?.name, prevDone, length: prevItems.length }, [(chunk) => <Text style={font(900, 14, C.ink)}>{chunk}</Text>])}</Text>
        )}
      </View>
    </View>
  )
}

export default function LearnScreen() {
  const { progress } = useStore()
  const router = useRouter()
  const toast = useToast()
  const [openId, setOpenId] = useState<string | null>(null)
  const current = currentNodeId(progress)
  const scroll = useRef<ScrollView>(null)
  /** y обёрток верхнего уровня и узлов внутри своей обёртки — чтобы прокрутить к узлу */
  const blockY = useRef(new Map<string, number>())
  const nodeY = useRef(new Map<string, { block: string; y: number }>())

  // тир пройден, а праздника ещё не было — «Новый тир!»
  useEffect(() => {
    const tier = pendingTierUp(progress)
    if (tier) router.push({ pathname: '/tier-up/[id]', params: { id: tier.id } })
  }, [progress, router])

  // вернулись из урока/домашки — прокручиваем к узлу
  useFocusEffect(
    useCallback(() => {
      setOpenId(null)
      const last = takeLastNode()
      if (!last) return
      const id = setTimeout(() => {
        const n = nodeY.current.get(last)
        const tierY = blockY.current.get(last)
        const y = n ? (blockY.current.get(n.block) ?? 0) + n.y - 220 : tierY
        if (y != null) scroll.current?.scrollTo({ y: Math.max(0, y), animated: false })
      }, 60)
      return () => clearTimeout(id)
    }, []),
  )

  // Плоский список детей ScrollView: баннеры разделов «прилипают» (stickyHeaderIndices)
  const children: ReactNode[] = []
  const sticky: number[] = []
  let ui = 0
  TIERS.forEach((tier, ti) => {
    const locked = !isTierUnlocked(tier, progress)
    const units = unitsOf(tier)
    children.push(
      <View key={`tier-${tier.id}`} style={ti > 0 ? { marginTop: 16 } : undefined}>
        <TierBanner tier={tier} />
      </View>,
    )
    units.forEach((unit, k) => {
      const dir = ui++ % 2 === 0 ? 1 : -1
      const items = unitNodes(unit)
      const doneCount = items.filter((n) => isNodeDone(n, progress)).length
      const cur = items.find((n) => n.id === current)
      const label = locked ? t('x1ys55r5') : cur ? (cur.type === 'homework' ? t('x1b55y4z') : t('x00adsxa', { v: cur.index + 1 })) : `${doneCount}/${items.length}`
      const next = units[k + 1]
      sticky.push(children.length)
      children.push(
        <View key={`b-${unit.id}`} style={k > 0 ? { paddingTop: 24, backgroundColor: C.white } : undefined}>
          <UnitBanner unit={unit} label={label} locked={locked} />
        </View>,
      )
      children.push(
        <View key={`p-${unit.id}`}>
          <View style={{ alignItems: 'center', paddingBottom: 64, paddingTop: 56 }}>
            <UnitArt unit={unit} dir={dir} locked={locked} />
            {items.map((item, i) => {
              const state: NodeState = locked || !isNodeReachable(item.id, progress) ? 'locked' : isNodeDone(item, progress) ? 'done' : item.id === current ? 'current' : 'upcoming'
              return (
                <PathNode
                  key={item.id}
                  item={item}
                  first={i === 0}
                  unit={unit}
                  state={state}
                  offset={OFFSETS[i % OFFSETS.length] * dir}
                  open={openId === item.id}
                  onY={(y) => nodeY.current.set(item.id, { block: `p-${unit.id}`, y })}
                  onToggle={() => {
                    void buzz('tap')
                    if (state === 'locked') {
                      setOpenId(null)
                      toast(t('path.locked'))
                      return
                    }
                    setOpenId((o) => (o === item.id ? null : item.id))
                  }}
                />
              )
            })}
          </View>
          {next ? <Interlude next={next} dir={dir} /> : null}
        </View>,
      )
    })
  })
  children.push(<ExploreMore key="explore" />)

  return (
    <ScrollView ref={scroll} testID="path" style={{ flex: 1, backgroundColor: C.white }} stickyHeaderIndices={sticky} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 }} onScrollBeginDrag={() => openId && setOpenId(null)}>
      {children.map((ch) => {
        const key = (ch as { key: string }).key
        return (
          <View key={key} onLayout={(e) => blockY.current.set(key, e.nativeEvent.layout.y)}>
            {ch}
          </View>
        )
      })}
    </ScrollView>
  )
}

