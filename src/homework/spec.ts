/**
 * «Спек-симулятор» для домашек 6–9: декларативный разбор промпта по ключевым словам на всех языках курса.
 *
 * Каждое требование — набор групп ключевых слов (должна совпасть каждая группа). Слова всех языков
 * объединены, поэтому один и тот же симулятор работает для ru/en/kk/es/zh (и для смешанного ввода).
 * Требования-действия (ui) засчитываются, когда ученик сделал действие в превью и готовы требования из after.
 * Реплики и подписи берутся из живого (локализованного) определения домашки — HomeworkDef.texts.
 */
import { findHomework, type PreviewAction } from '../data/homework'
import type { Sim, Tone } from './sims'

export type SpecFlag = 'viewedMobile' | 'ran' | 'tested' | 'testsRun'

export interface SpecReq {
  id: string
  /** Группы альтернатив (источники RegExp): должна совпасть каждая группа */
  all?: string[][]
  /** Требование выполняется действием в превью */
  ui?: { flag: SpecFlag; after?: string[] }
}

export interface SpecDef {
  id: string
  reqs: SpecReq[]
  /** Дополнительные возможности (не требования) */
  extras: { id: string; all: string[][] }[]
  /** «Опасная» просьба — ИИ от неё отказывается */
  trap: string[]
  /** «Пустые слова» */
  weak: string[]
}

export interface SpecState {
  asked: boolean
  done: Record<string, boolean>
  extras: Record<string, boolean>
  trapped: number
  /** Какие группы ключевых слов уже встречались (требование можно описать за несколько промптов) */
  parts: Record<string, number[]>
}

export interface SpecUi {
  device: 'desktop' | 'phone'
  viewedMobile: boolean
  ran: boolean
  tested: boolean
  testsRun: boolean
}

/** Что делает действие в превью с UI-состоянием (то же используют валидатор и e2e) */
export const SPEC_UI_ACTIONS: Partial<Record<PreviewAction, Partial<SpecUi>>> = {
  viewMobile: { viewedMobile: true, device: 'phone' },
  runApp: { ran: true },
  sendTest: { tested: true },
  runTests: { testsRun: true },
}

/** нижний регистр, ё → е, без диакритики у латиницы */
export const normSpec = (t: string) =>
  t
    .toLowerCase()
    .replace(/ё/g, 'е')
    .normalize('NFD')
    .replace(/([a-z])[\u0300-\u036f]+/g, '$1')
    .normalize('NFC')
    .replace(/[’`]/g, "'")

const rx = (alts: string[]) => new RegExp(alts.map((a) => `(?:${a})`).join('|'), 'i')
/** «не / don't / no …» прямо перед совпадением — это не просьба, а запрет */
const NEG = /(?:^|[^\p{L}])(?:не|нельзя|don'?t|do not|never|not|no|nunca)\s+\S{0,12}\s*$|(?:不要|别|不)\S{0,4}$/u

export const SPECS: Record<'hw6' | 'hw7' | 'hw8' | 'hw9', SpecDef> = {
  hw6: {
    id: 'hw6',
    reqs: [
      {
        id: 'structure',
        all: [
          ['цен[аыуе]', 'стоимост', '₸', '\\$\\s?\\d', '\\d\\s?\\$', 'price', 'баға', 'бағасы', 'precio', '价格', '价'],
          ['кнопк', 'button', 'батырма', 'boton', '按钮', '按键'],
        ],
      },
      { id: 'tokens', all: [['токен', 'token', 'дизайн-систем', 'design system', 'дизайн жүйе', 'sistema de diseno', '设计系统', '设计令牌', '令牌', 'css-переменн', 'css variable']] },
      {
        id: 'states',
        all: [['состояни', 'наведен', 'hover', 'фокус', 'focus', 'неактивн', 'disabled', 'загрузк', 'loading', 'күй', 'меңзер', 'белсенді емес', 'жүктел', 'estado', 'enfoque', 'deshabilitad', 'desactivad', 'cargando', '状态', '悬停', '焦点', '禁用', '加载']],
      },
      {
        id: 'a11y',
        all: [['контраст', 'contrast', 'скринридер', 'экранн\\S* диктор', 'screen reader', 'доступност', 'accessib', 'a11y', 'aria', 'экран оқу', 'қолжетімді', 'lector de pantalla', 'accesib', 'contraste', '对比度', '读屏', '屏幕阅读', '无障碍', '可访问']],
      },
      {
        id: 'mobile',
        all: [['адаптив', 'responsive', 'телефон', 'мобильн', 'узк\\S* экран', 'во всю ширину', 'mobile', 'phone', 'narrow', 'full.width', 'бейімд', 'ұялы', 'тар экран', 'толық ен', 'adaptable', 'adaptativ', 'movil', 'telefono', 'pantallas? estrech', 'ancho completo', '响应式', '自适应', '手机', '移动端', '窄屏', '全宽']],
        ui: { flag: 'viewedMobile' },
      },
    ],
    extras: [
      { id: 'badge', all: [['бейдж', 'badge', 'популярн', 'popular', 'танымал', 'insignia', 'etiqueta', '徽章', '标签', '热门']] },
      { id: 'dark', all: [['т[её]мн\\S* тем', 'dark', 'қараңғы', 'күңгірт', 'oscur', '深色', '暗色', '夜间']] },
    ],
    trap: ['один в один', 'скопируй', 'copy (it |the )?exactly', 'clone', 'copy stripe', 'stripe.{0,30}(one.to.one|exactly|1:1)', 'дәл көшір', 'көшіріп ал', 'copia (exactamente|tal cual|identic)', 'copia la tarjeta', '照搬', '一模一样', '原样复制', '完全复制'],
    weak: ['красив', 'современн', 'стильн', 'beautiful', 'modern', 'pretty', 'nice', 'әдемі', 'заманауи', 'bonit', 'moderno', '好看', '漂亮', '现代'],
  },
  hw7: {
    id: 'hw7',
    reqs: [
      { id: 'stack', all: [['expo', 'react.native']] },
      {
        id: 'screens',
        all: [
          ['список', 'list', 'тізім', 'lista', '列表', '清单'],
          ['добавлен', 'добав', '\\badd', 'қос', 'agreg', 'anad', 'nuev', '添加', '新增', '增加'],
        ],
      },
      { id: 'storage', all: [['asyncstorage', 'async storage', 'храни', 'хранен', 'сохраня', 'persist', '\\bstore\\b', 'storage', 'сақта', 'guarda', 'almacen', '保存', '存储', '本地']] },
      {
        id: 'safe',
        all: [['safe.?area', 'безопасн\\S* зон', 'вырез', 'ч[её]лк', 'notch', 'клавиатур', 'keyboard', 'пернетақта', 'қауіпсіз аймақ', 'teclado', 'zona segura', 'area segura', 'muesca', '键盘', '安全区', '刘海']],
      },
      { id: 'run', ui: { flag: 'ran', after: ['stack', 'screens'] } },
    ],
    extras: [
      { id: 'dark', all: [['т[её]мн\\S* тем', 'dark', 'қараңғы', 'күңгірт', 'oscur', '深色', '暗色', '夜间']] },
      { id: 'streak', all: [['сери', 'подряд', 'streak', 'in a row', 'қатарынан', 'серия', 'racha', 'seguidos', '连续']] },
    ],
    trap: ['на html', 'html и css', 'html.{0,3}css', 'in html', 'html and css', 'html мен css', 'html жән', 'en html', 'html y css', '用 ?html'],
    weak: ['удобн', 'красив', 'convenient', 'beautiful', 'user.friendly', 'нице', 'ыңғайлы', 'әдемі', 'comod', 'bonit', '方便', '好看', '漂亮'],
  },
  hw8: {
    id: 'hw8',
    reqs: [
      { id: 'route', all: [['/api', 'сервер', 'server', 'маршрут', '\\broute', 'endpoint', 'backend', 'бэкенд', 'servidor', '\\bruta', '服务器', '服务端', '后端', '路由']] },
      { id: 'secret', all: [['\\benv\\b', '\\.env', 'окружени', 'environment', 'переменн', 'entorno', '环境变量', 'орта айнымал', 'айнымал']] },
      {
        id: 'system',
        all: [
          ['системн', '\\bsystem', 'жүйелік', 'sistema', '系统'],
          ['меню', 'menu', 'мәзір', '菜单', 'час\\S* работ', 'hours', 'жұмыс уақыт', 'сағат', 'horario', '营业时间'],
        ],
      },
      {
        id: 'limits',
        all: [['лимит', 'limit', 'max_tokens', 'не больше', 'не более', 'огранич', 'шектеу', 'шектеп', 'аспайт', 'артық емес', 'limite', 'no mas de', 'maximo', '限制', '上限', '最多', '不超过']],
      },
      { id: 'test', ui: { flag: 'tested', after: ['route', 'secret', 'system'] } },
    ],
    extras: [
      { id: 'stream', all: [['стрим', 'stream', 'постепенн', '\\bsse\\b', 'по мере', 'ағын', 'біртіндеп', 'transmision', 'progresiv', 'poco a poco', '流式', '逐步', '逐字']] },
      { id: 'retry', all: [['повтор', 'retry', 'try again', 'қайтала', 'reintent', 'volver a intentar', '重试', '再试']] },
    ],
    trap: ['sk-[a-z0-9_-]{8,}', 'sk_(live|test)_\\w+', 'api[_ ]?key\\s*[:=]\\s*\\S{8,}'],
    weak: ['умн', 'smart', 'круто', 'cool', 'ақылды', 'inteligente', '聪明', '智能一点'],
  },
  hw9: {
    id: 'hw9',
    reqs: [
      {
        id: 'goal',
        all: [
          ['скидк', 'discount', 'жеңілдік', 'descuento', '折扣', '优惠'],
          ['исправ', 'почин', '\\bfix', 'түзет', 'түзе', 'arregl', 'corrig', 'repar', '修复', '修正', '修好'],
        ],
      },
      {
        id: 'scope',
        all: [['не трогай', 'не меняй', 'не трогать', 'меняй только', 'только (в |файл)?\\S*\\.ts', "don'?t touch", 'do not (touch|change|modify)', 'only (change|edit|modify|touch)', 'тиіспе', 'өзгертпе', 'тек \\S+\\.ts', 'no toques', 'no cambies', 'no modifiques', 'solo (cambia|modifica|edita)', '不要(修改|改动|碰|动)', '只(修改|改|动)', '别动', '别碰']],
      },
      {
        id: 'done',
        all: [['готово,? когда', 'критери', 'done when', 'is done when', 'acceptance', 'definition of done', 'дайын болады', 'дайын деп', 'өткенде дайын', 'кезде дайын', 'дайын саналады', 'дайын,? қашан', 'listo cuando', 'estara list', 'esta list[oa] cuando', 'terminad[oa] cuando', 'criterio', '完成标准', '验收', '才算完成', '即为完成', '就算完成', '视为完成']],
      },
      {
        id: 'tests',
        all: [['добавь тест', 'напиши тест', 'тест на', 'тест для', 'add (a |one )?(unit )?test', 'write (a )?test', 'test for', 'тест қос', 'тест жаз', 'тест құр', 'agrega (una |un )?(prueba|test)', 'anade (una |un )?(prueba|test)', 'escribe (una |un )?(prueba|test)', '(prueba|test) para', '添加(一个)?测试', '写(一个)?测试', '编写测试', '增加(一个)?测试', '补充测试', '加(一个)?测试']],
      },
      { id: 'run', ui: { flag: 'testsRun', after: ['goal', 'tests'] } },
    ],
    extras: [
      { id: 'review', all: [['ветк', 'branch', 'pull request', '\\bpr\\b', 'тармақ', '\\brama\\b', '分支', '拉取请求']] },
      { id: 'explain', all: [['объясни', 'explain', 'түсіндір', 'explica', '解释', '说明']] },
    ],
    trap: ['удали\\S* (тест|проверк)', 'тест мешает', 'delete (the |that |this )?tests?', 'remove (the |that |this )?tests?', 'skip (the )?tests?', 'force.?push', 'тестті өшір', 'тестті жой', 'elimina (la |esa |el )?(prueba|test)', 'borra (la |esa |el )?(prueba|test)', '删除(这个|该)?测试', '删掉(这个|该)?测试', '把测试删'],
    weak: ['побыстрее', 'как-нибудь', 'хорошо', 'quickly', 'somehow', 'жақсылап', 'тезірек', 'rapido', 'como sea', '随便', '快点'],
  },
}

type Compiled = { reqs: { id: string; groups: RegExp[]; ui?: SpecReq['ui'] }[]; extras: { id: string; groups: RegExp[] }[]; trap: RegExp; weak: RegExp }
const compiled = new Map<string, Compiled>()
function compile(def: SpecDef): Compiled {
  const hit = compiled.get(def.id)
  if (hit) return hit
  const c: Compiled = {
    reqs: def.reqs.map((r) => ({ id: r.id, groups: (r.all ?? []).map(rx), ui: r.ui })),
    extras: def.extras.map((e) => ({ id: e.id, groups: e.all.map(rx) })),
    trap: rx(def.trap),
    weak: rx(def.weak),
  }
  compiled.set(def.id, c)
  return c
}

/** Совпадение без отрицания перед ним */
function hitPositive(re: RegExp, t: string): boolean {
  const g = new RegExp(re.source, 'gi')
  for (const m of t.matchAll(g)) if (!NEG.test(t.slice(Math.max(0, m.index - 24), m.index))) return true
  return false
}

const allGroups = (groups: RegExp[], t: string) => groups.length > 0 && groups.every((g) => hitPositive(g, t))

export function specCheck(def: SpecDef, s: SpecState, ui: SpecUi): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const r of def.reqs) {
    const kw = r.all ? !!s.done[r.id] : true
    const action = r.ui ? !!ui[r.ui.flag] && (r.ui.after ?? []).every((a) => s.done[a]) : true
    out[r.id] = kw && action
  }
  return out
}

/** Готовы ли требования, после которых доступно действие в превью */
export const specActionReady = (def: SpecDef, s: SpecState, flag: SpecFlag) =>
  def.reqs.filter((r) => r.ui?.flag === flag).every((r) => (r.all ? s.done[r.id] : true) && (r.ui?.after ?? []).every((a) => s.done[a]))

export function makeSpecSim(def: SpecDef): Sim<SpecState, SpecUi> {
  return {
    init: () => ({ asked: false, done: {}, extras: {}, trapped: 0, parts: {} }),
    initUi: () => ({ device: 'desktop', viewedMobile: false, ran: false, tested: false, testsRun: false }),
    apply(prev, prompt) {
      const c = compile(def)
      const hw = findHomework(def.id)
      const T = hw?.texts
      const t = normSpec(prompt)
      const s: SpecState = { asked: true, done: { ...prev.done }, extras: { ...prev.extras }, trapped: prev.trapped, parts: { ...prev.parts } }
      const changes: string[] = []
      let progressed = false
      for (const r of c.reqs) {
        if (!r.groups.length || s.done[r.id]) continue
        const seen = new Set(s.parts[r.id] ?? [])
        r.groups.forEach((g, i) => {
          if (hitPositive(g, t) && !seen.has(i)) {
            seen.add(i)
            progressed = true
          }
        })
        s.parts[r.id] = [...seen]
        if (seen.size === r.groups.length) {
          s.done[r.id] = true
          changes.push(hw?.requirements.find((x) => x.id === r.id)?.label ?? r.id)
        }
      }
      for (const e of c.extras) {
        if (s.extras[e.id]) continue
        if (allGroups(e.groups, t)) {
          s.extras[e.id] = true
          changes.push(T?.extras[e.id] ?? e.id)
        }
      }
      const trapped = hitPositive(c.trap, t)
      if (trapped) s.trapped++
      const promptReqs = def.reqs.filter((r) => r.all)
      const allDone = promptReqs.every((r) => s.done[r.id])
      let reply: string
      let tone: Tone
      let bipi: string | undefined
      if (trapped) {
        reply = T?.trap ?? ''
        tone = 'bad'
        bipi = T?.trapBipi
      } else if (changes.length === 0 && !progressed) {
        reply = allDone ? (T?.done ?? '') : (T?.nothing ?? '')
        tone = allDone ? 'good' : 'bad'
        if (c.weak.test(t)) bipi = T?.weak
      } else if (allDone) {
        reply = T?.done ?? ''
        tone = 'good'
      } else {
        reply = T?.partial ?? ''
        tone = 'meh'
      }
      return { state: s, reply, changes, tone, bipi }
    },
    check: (s, ui) => specCheck(def, s, ui),
  }
}

export const specSims = {
  hw6: makeSpecSim(SPECS.hw6),
  hw7: makeSpecSim(SPECS.hw7),
  hw8: makeSpecSim(SPECS.hw8),
  hw9: makeSpecSim(SPECS.hw9),
}
