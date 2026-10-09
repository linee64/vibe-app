/**
 * Локализованный симулятор домашек — та же логика, что src/homework/sims.ts, но ключевые слова и реплики
 * берутся из языкового пакета (src/i18n/homework/packs/<locale>.ts).
 *
 * Слова языка объединяются с русскими (всегда) и английскими (для не-en): так понимаются и канонические
 * русские фразы ИИ-разбора (src/homework/ai.ts), и смешанный ввод («сделай deploy на Vercel»).
 * Для ru поведение совпадает с исходным sims.ts (это проверяет tests/client/i18n-sims.test.ts).
 * Типы состояний — общие с sims.ts, поэтому превью (previews.tsx) работают без изменений.
 */
import {
  FIX_CODE,
  type CardState,
  type DebugState,
  type DebugUi,
  type DeployState,
  type DeployUi,
  type FormState,
  type FormUi,
  type LandingState,
  type LandingUi,
  type PaletteKey,
  type Sim,
  type Tone,
} from '../../homework/sims'
import type { Locale } from '../locales'
import type { SimKeywords, SimPack } from './types'
import { ru } from './packs/ru'
import { en } from './packs/en'
import { kk } from './packs/kk'
import { es } from './packs/es'
import { zh } from './packs/zh'

export const SIM_PACKS: Record<Locale, SimPack> = { ru, en, kk, es, zh }

/** нижний регистр, ё → е, у латиницы снимаем диакритику (é → e, ñ → n); кириллица и иероглифы не меняются */
export const normI18n = (t: string) =>
  t
    .toLowerCase()
    .replace(/ё/g, 'е')
    .normalize('NFD')
    .replace(/([a-z])[\u0300-\u036f]+/g, '$1')
    .normalize('NFC')

const CJK = /[\u3400-\u9fff\uf900-\ufaff]/g
/** Слова; для китайского — примерно 2 иероглифа = 1 слово */
const words = (t: string) => t.split(/\s+/).filter((w) => w && w.replace(CJK, '')).length + Math.ceil((t.match(CJK)?.length ?? 0) / 2)
const clauses = (t: string) => t.split(/[.!?\n;,。！？；，、]+/).map((c) => c.trim()).filter(Boolean)
const OPEN = '[«"„“「『]'
const CLOSE = '[»"“”」』]'
const INNER = '[^»"“”」』]'
const fill = (s: string, p: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => p[k] ?? '')

type K = Record<keyof SimKeywords, RegExp | null>

function compile(locale: Locale): { K: K; src: Record<keyof SimKeywords, string> } {
  const packs = locale === 'ru' ? [ru] : locale === 'en' ? [ru, en] : [ru, en, SIM_PACKS[locale]]
  const src = {} as Record<keyof SimKeywords, string>
  const K = {} as K
  for (const key of Object.keys(ru.kw) as (keyof SimKeywords)[]) {
    const parts = [...new Set(packs.map((p) => p.kw[key]).filter(Boolean))]
    src[key] = parts.map((p) => `(?:${p})`).join('|')
    K[key] = parts.length ? new RegExp(src[key]) : null
  }
  return { K, src }
}

const test = (re: RegExp | null, t: string) => !!re && re.test(t)

/** Текст в кавычках рядом со словом-якорем: «якорь “X”» или «“X” якорь» */
function quotedNear(raw: string, lead: string, trail: string, min: number, max: number): string | null {
  if (lead) {
    const m = raw.match(new RegExp(`(?:${lead})\\s*[—:：-]?\\s*${OPEN}(${INNER}{${min},${max}})${CLOSE}`, 'i'))
    if (m) return m[m.length - 1]
  }
  if (trail) {
    const m = raw.match(new RegExp(`${OPEN}(${INNER}{${min},${max}})${CLOSE}\\s*(?:${trail})`, 'i'))
    if (m) return m[1]
  }
  return null
}

const quoted = (t: string) => t.match(new RegExp(`${OPEN}(${INNER}{2,40})${CLOSE}`))?.[1]?.trim() ?? null

const REPO_STOP = /^(the|a|an|my|your|our|this|new|github|repo|repository|main|code|el|la|un|una|mi|tu|nuevo)$/i

const hash = (s: string) => {
  let h = 2166136261
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

const KEY_RE = /sk_(live|test)_\w+|eyj[a-z0-9_-]{10,}|service_role\s*[:=]|api[_ ]?key\s*[:=]\s*\S{8,}/
const ERROR_RE = /cannot read propert|typeerror|reading .push|undefined \(reading/
const CODE_RE = /tasks\.push|function addtask|const \[tasks|usestate\(/
const DOMAIN_IN_TEXT = /([a-z0-9][a-z0-9-]{1,40}\.(ru|com|app|dev|io|рф|kz|uz|by|online|site|cafe|coffee|me))/

export interface LocalizedSims {
  hw1: Sim<CardState, Record<string, never>>
  hw2: Sim<LandingState, LandingUi>
  hw3: Sim<DebugState, DebugUi>
  hw4: Sim<FormState, FormUi>
  hw5: Sim<DeployState, DeployUi>
}

const cache = new Map<Locale, LocalizedSims>()

export function getLocalizedSims(locale: Locale): LocalizedSims {
  const hit = cache.get(locale)
  if (hit) return hit
  const { K, src } = compile(locale)
  const T = SIM_PACKS[locale].txt
  const norm = normI18n
  const has = test

  // ============================================================== 1. Карточка товара
  const cardSim: Sim<CardState, Record<string, never>> = {
    init: () => ({ asked: false, role: false, goal: false, context: false, limits: false, format: false, friendly: false }),
    initUi: () => ({}),
    apply(prev, prompt) {
      const t = norm(prompt)
      const s = { ...prev, asked: true }
      const found: string[] = []
      const mark = (k: 'role' | 'goal' | 'context' | 'limits' | 'format', ok: boolean, label: string) => {
        if (ok && !s[k]) found.push(label)
        if (ok) s[k] = true
      }
      mark('role', has(K.cardRole, t), T.card.role)
      mark('goal', has(K.cardGoal, t), T.card.goal)
      mark('context', has(K.cardProduct, t) && has(K.cardDetail, t), T.card.context)
      mark('limits', has(K.cardLimits, t), T.card.limits)
      mark('format', has(K.cardFormat, t), T.card.format)
      if (has(K.cardFriendly, t)) {
        s.friendly = true
        found.push(T.card.friendly)
      }
      const weak = has(K.weak, t) && found.length === 0
      const score = (['role', 'goal', 'context', 'limits', 'format'] as const).filter((k) => s[k]).length
      let reply: string
      if (!s.goal) reply = T.card.replyNoGoal
      else if (score === 5) reply = T.card.replyAll
      else if (score >= 3) reply = T.card.replyMost
      else reply = T.card.replyFew
      let bipi: string | undefined
      if (weak) bipi = T.card.bipiWeak
      else if (!s.goal && words(t) < 4) bipi = T.card.bipiShort
      return { state: s, reply, changes: found, tone: score === 5 ? 'good' : score >= 3 ? 'meh' : 'bad', bipi }
    },
    check: (s) => ({ role: s.role, goal: s.goal, context: s.context, limits: s.limits, format: s.format }),
  }

  // ============================================================== 2. Лендинг кофейни
  const colorIn = (t: string): PaletteKey | null => {
    if (has(K.colorCoral, t)) return 'coral'
    if (has(K.colorViolet, t)) return 'violet'
    if (has(K.colorTeal, t)) return 'teal'
    if (has(K.colorAmber, t)) return 'amber'
    if (has(K.colorCoffee, t)) return 'coffee'
    return null
  }

  const landingSim: Sim<LandingState, LandingUi> = {
    init: () => ({
      built: false,
      coffee: false,
      name: null,
      slogan: null,
      hero: false,
      menu: false,
      cta: false,
      ctaText: T.landing.ctaDefault,
      reviews: false,
      contacts: false,
      about: false,
      nav: false,
      palette: 'none',
      ctaColor: null,
      adaptive: false,
    }),
    initUi: () => ({ device: 'desktop', viewedMobile: false }),
    apply(prev, prompt) {
      const raw = prompt
      const t = norm(prompt)
      const s: LandingState = { ...prev, built: true, hero: true }
      const ch: string[] = []
      if (has(K.coffee, t) && !s.coffee) {
        s.coffee = true
        ch.push(T.landing.theme)
      }
      const name = quotedNear(raw, src.nameLead, src.nameTrail, 2, 30)
      if (name && name !== s.name) {
        s.name = name.trim()
        ch.push(fill(T.landing.name, { name: s.name }))
      }
      const slogan = quotedNear(raw, src.sloganLead, src.sloganTrail, 2, 60)
      if (slogan) {
        s.slogan = slogan.trim()
        ch.push(T.landing.slogan)
      }
      const add = (k: 'menu' | 'reviews' | 'contacts' | 'about' | 'nav', ok: boolean, label: string) => {
        if (ok && !s[k]) {
          s[k] = true
          ch.push(label)
        }
      }
      add('menu', has(K.menu, t), T.landing.menu)
      add('reviews', has(K.reviews, t), T.landing.reviews)
      add('contacts', has(K.contacts, t), T.landing.contacts)
      add('about', has(K.about, t), T.landing.about)
      add('nav', has(K.nav, t), T.landing.nav)
      for (const c of clauses(raw)) {
        const n = norm(c)
        const btn = has(K.btn, n)
        if (btn) {
          if (!s.cta) ch.push(T.landing.cta)
          s.cta = true
          const q = quoted(c)
          if (q && has(K.btnWord, n)) s.ctaText = q
          else if (has(K.book, n) && s.ctaText === T.landing.ctaDefault) s.ctaText = T.landing.ctaBook
          else if (has(K.order, n) && s.ctaText === T.landing.ctaDefault) s.ctaText = T.landing.ctaOrder
        }
        const col = colorIn(n)
        if (col) {
          if (btn || has(K.btnWord, n)) {
            if (s.ctaColor !== col) ch.push(T.landing.ctaColor)
            s.ctaColor = col
          } else if (s.palette !== col) {
            s.palette = col
            ch.push(T.landing.palette)
          }
        }
      }
      if (has(K.mobile, t) && !s.adaptive) {
        s.adaptive = true
        ch.push(T.landing.adaptive)
      }
      const firstBuild = !prev.built
      const vague = ch.length === 0 || (firstBuild && ch.length <= 1 && words(t) < 5)
      const score = Object.values(landingSim.check(s, { device: 'desktop', viewedMobile: true })).filter(Boolean).length
      let reply: string
      if (firstBuild && !s.coffee) reply = T.landing.replyTemplate
      else if (vague && !firstBuild) reply = T.landing.replyVague
      else if (score >= 4) reply = T.landing.replyGood
      else reply = firstBuild ? T.landing.replyFirst : T.landing.replyEdit
      let bipi: string | undefined
      if (firstBuild && !s.coffee) bipi = T.landing.bipiNoCoffee
      else if (has(K.weak, t) && ch.length === 0) bipi = T.landing.bipiWeak
      return { state: s, reply, changes: ch, tone: score >= 4 ? 'good' : vague ? 'bad' : 'meh', bipi }
    },
    check: (s, ui) => ({
      hero: s.built && s.coffee && !!s.name,
      menu: s.menu,
      cta: s.cta,
      colors: s.palette !== 'none',
      mobile: s.adaptive && ui.viewedMobile,
    }),
    hint: (s, _ui, id) => (id === 'mobile' && s.adaptive ? T.landing.hintMobile : undefined),
  }

  // ============================================================== 3. Отладка списка дел
  const debugSim: Sim<DebugState, DebugUi> = {
    init: () => ({ error: false, where: false, code: false, action: false, expect: false, fixed: false, restyled: false, vagueCount: 0 }),
    initUi: () => ({ added: [], failedClicks: 0, verified: false }),
    apply(prev, prompt) {
      const t = norm(prompt)
      const s = { ...prev }
      const ch: string[] = []
      const got = (k: 'error' | 'where' | 'code' | 'action' | 'expect', ok: boolean, label: string) => {
        if (ok && !s[k]) ch.push(label)
        if (ok) s[k] = true
      }
      got('error', ERROR_RE.test(t), T.debug.error)
      got('where', has(K.where, t), T.debug.where)
      got('code', CODE_RE.test(t), T.debug.code)
      got('action', has(K.action, t), T.debug.action)
      got('expect', has(K.expect, t), T.debug.expect)
      const info = ch.length
      if (s.fixed) {
        const reply = has(K.empty, t) ? T.debug.fixedEmpty : has(K.why, t) ? T.debug.fixedWhy : T.debug.fixedAlready
        return { state: s, reply, changes: [], tone: 'good' }
      }
      if (info === 0) {
        s.vagueCount++
        s.restyled = true
        return {
          state: s,
          reply: s.vagueCount === 1 ? T.debug.vague1 : T.debug.vague2,
          changes: [T.debug.vagueChange],
          tone: 'bad',
          bipi: s.vagueCount === 1 ? T.debug.bipiVague1 : T.debug.bipiVague2,
        }
      }
      const missing = !s.error ? 'error' : !s.where && !s.code ? 'where' : !s.code ? 'code' : !s.action || !s.expect ? 'steps' : !s.where ? 'where' : null
      if (missing) {
        const ask: Record<string, string> = { error: T.debug.askError, where: T.debug.askWhere, code: T.debug.askCode, steps: T.debug.askSteps }
        return { state: s, reply: ask[missing], changes: ch, tone: 'meh' }
      }
      s.fixed = true
      s.restyled = false
      return {
        state: s,
        reply: T.debug.fixReply,
        code: FIX_CODE,
        changes: [...ch, T.debug.fixChange1, T.debug.fixChange2],
        tone: 'good',
        bipi: T.debug.bipiFixed,
      }
    },
    check: (s, ui) => ({ error: s.error, where: s.where, code: s.code, steps: s.action && s.expect, verified: s.fixed && ui.verified }),
    hint: (s, _ui, id) => (id === 'verified' && s.fixed ? T.debug.hintVerified : undefined),
  }

  // ============================================================== 4. Форма + таблица
  const formSim: Sim<FormState, FormUi> = {
    init: () => ({ form: false, name: false, email: false, message: false, table: false, validation: false, keyLeaked: false, keySafe: false, thanks: false }),
    initUi: () => ({ rows: [], saved: false }),
    apply(prev, prompt) {
      const t = norm(prompt)
      const s = { ...prev }
      const ch: string[] = []
      if (!s.form) {
        s.form = true
        ch.push(T.form.form)
      }
      const field = (k: 'name' | 'email' | 'message', ok: boolean, label: string) => {
        if (ok && !s[k]) {
          s[k] = true
          ch.push(label)
        }
      }
      field('name', has(K.fieldName, t), T.form.name)
      field('email', has(K.fieldEmail, t), T.form.email)
      field('message', has(K.fieldMessage, t), T.form.message)
      if (has(K.table, t) && !s.table) {
        s.table = true
        ch.push(T.form.table)
      }
      if (has(K.validation, t) && !s.validation) {
        s.validation = true
        ch.push(T.form.validation)
      }
      if (has(K.thanks, t) && !s.thanks) {
        s.thanks = true
        ch.push(T.form.thanks)
      }
      let bipi: string | undefined
      let tone: Tone = 'meh'
      if (KEY_RE.test(t)) {
        s.keyLeaked = true
        s.keySafe = false
        ch.push(T.form.leaked)
        bipi = T.form.bipiLeaked
        tone = 'bad'
      } else if (has(K.keySafe, t)) {
        if (!s.keySafe) ch.push(s.keyLeaked ? T.form.keyMoved : T.form.keyEnv)
        s.keySafe = true
        s.keyLeaked = false
      }
      const all = Object.values(formSim.check(s, { rows: [], saved: true })).every(Boolean)
      if (tone !== 'bad') tone = all ? 'good' : ch.length > 1 ? 'meh' : 'bad'
      let reply: string
      if (s.keyLeaked) reply = T.form.replyLeaked
      else if (!s.name && !s.email && !s.message) reply = T.form.replyNoFields
      else if (all) reply = T.form.replyAll
      else reply = s.table ? T.form.replyTable : T.form.replyNoTable
      if (!bipi && !s.table && s.form && prev.form === false && !s.name) bipi = T.form.bipiVague
      return { state: s, reply, changes: ch, tone, bipi }
    },
    check: (s, ui) => ({ fields: s.name && s.email && s.message, table: s.table, validation: s.validation, secret: s.keySafe && !s.keyLeaked, saved: ui.saved && s.table }),
    hint: (s, _ui, id) => (id === 'saved' ? (s.table ? T.form.hintSavedOk : T.form.hintSavedNoTable) : undefined),
  }

  // ============================================================== 5. Деплой
  const findRepo = (raw: string): string | undefined => {
    const lead = src.repoLead && raw.match(new RegExp(`(?:${src.repoLead})\\s*[«"“]?([a-z0-9][\\w.-]{2,40})`, 'i'))?.at(-1)
    if (lead && !REPO_STOP.test(lead)) return lead
    const trail = src.repoTrail && raw.match(new RegExp(`[«"“]?([a-z0-9][\\w.-]{2,40})[»"”]?\\s*(?:${src.repoTrail})`, 'i'))?.[1]
    if (trail && !REPO_STOP.test(trail)) return trail
    return undefined
  }

  const deploySim: Sim<DeployState, DeployUi> = {
    init: () => ({ commit: null, commitVague: false, pushed: false, repo: 'zerno-coffee', deployed: false, domain: null, analytics: false, ogImage: false, log: [] }),
    initUi: () => ({ opened: false }),
    apply(prev, prompt) {
      const raw = prompt
      const t = norm(prompt)
      const s: DeployState = { ...prev, log: [...prev.log] }
      const ch: string[] = []
      const problems: string[] = []
      if (has(K.commit, t)) {
        const msg = quotedNear(raw, src.commitLead, src.commitTrail, 3, 60) ?? undefined
        s.commit = msg ?? 'update'
        s.commitVague = !msg
        s.log.push(`$ git commit -m "${s.commit}"`, `[main ${hash(s.commit)}] ${s.commit} · 12 files changed`)
        ch.push(fill(T.deploy.commit, { msg: msg ?? 'update' }))
        if (!msg) problems.push(T.deploy.problemCommitVague)
      }
      if (has(K.push, t)) {
        const repo = findRepo(raw)
        if (repo) s.repo = repo.replace(/[»"”.]+$/, '')
        if (!s.commit) {
          s.log.push('$ git push origin main', 'error: src refspec main does not match any')
          problems.push(T.deploy.problemPushNothing)
        } else {
          s.pushed = true
          s.log.push('$ git push origin main', `→ github.com/aidar/${s.repo} · main`)
          ch.push(fill(T.deploy.push, { repo: s.repo }))
        }
      }
      if (has(K.deploy, t)) {
        if (!s.pushed) {
          s.log.push('▲ vercel deploy', 'Error: no git repository connected')
          problems.push(T.deploy.problemDeploy)
        } else if (!s.deployed) {
          s.deployed = true
          s.log.push('▲ Vercel: Building…', '✓ Build completed in 23s', `✓ Ready: https://${s.repo}.vercel.app`)
          ch.push(fill(T.deploy.deployed, { url: `${s.repo}.vercel.app` }))
        }
      }
      if (has(K.domain, t)) {
        const d = t.match(DOMAIN_IN_TEXT)?.[1]
        if (!s.deployed) problems.push(T.deploy.problemDomainNoDeploy)
        else if (!d) problems.push(T.deploy.problemDomainMissing)
        else if (s.domain !== d) {
          s.domain = d
          s.log.push(`$ vercel domains add ${d}`, `✓ DNS ok · ${T.deploy.sslIssued} · https://${d}`)
          ch.push(fill(T.deploy.domain, { domain: d }))
        }
      }
      if (has(K.analytics, t)) {
        if (!s.deployed) problems.push(T.deploy.problemAnalytics)
        else if (!s.analytics) {
          s.analytics = true
          s.log.push('+ @vercel/analytics', '✓ Analytics enabled')
          ch.push(T.deploy.analytics)
        }
      }
      if (has(K.og, t) && s.deployed && !s.ogImage) {
        s.ogImage = true
        ch.push(T.deploy.og)
      }
      const all = Object.values(deploySim.check(s, { opened: true })).every(Boolean)
      let reply: string
      if (ch.length === 0 && problems.length === 0) reply = T.deploy.replyNothing
      else if (problems.length && ch.length === 0) reply = T.deploy.replyFailed
      else if (all) reply = fill(T.deploy.replyDone, { domain: s.domain ?? '' })
      else reply = T.deploy.replyPartial
      return { state: s, reply, changes: ch, tone: all ? 'good' : problems.length || ch.length === 0 ? 'bad' : 'meh', bipi: problems[0] }
    },
    check: (s) => ({ commit: !!s.commit && !s.commitVague, push: s.pushed, deploy: s.deployed, domain: !!s.domain, analytics: s.analytics }),
  }

  const sims: LocalizedSims = { hw1: cardSim, hw2: landingSim, hw3: debugSim, hw4: formSim, hw5: deploySim }
  cache.set(locale, sims)
  return sims
}
