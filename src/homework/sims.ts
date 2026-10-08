/**
 * Симулированный ИИ для домашек: детерминированный разбор промпта по ключевым словам, без API.
 * Каждый «движок» хранит состояние результата, которое копится между итерациями (уточнения меняют
 * только то, о чём просили), и умеет проверять требования чек-листа.
 */

export type Tone = 'good' | 'meh' | 'bad'

export interface Turn<S> {
  state: S
  /** Ответ ИИ в чате */
  reply: string
  /** Что изменилось в превью (галочки под ответом) */
  changes: string[]
  /** Кусок кода/диффа в ответе ИИ */
  code?: string[]
  /** Особая реплика Бипи (иначе Бипи подскажет по первому невыполненному требованию) */
  bipi?: string
  tone: Tone
}

export interface Sim<S, U> {
  init: () => S
  initUi: () => U
  apply: (s: S, prompt: string) => Turn<S>
  check: (s: S, ui: U) => Record<string, boolean>
  /** Подсказка Бипи по невыполненному требованию с учётом состояния (иначе — общая из homework.ts) */
  hint?: (s: S, ui: U, reqId: string) => string | undefined
}

/** нижний регистр, ё → е, кавычки-ёлочки сохраняем */
export const norm = (t: string) => t.toLowerCase().replace(/ё/g, 'е')
const has = (t: string, re: RegExp) => re.test(t)
/** Предложения/фразы: режем по точкам, переносам, запятым, точкам с запятой */
const clauses = (t: string) => t.split(/[.!?\n;,]+/).map((c) => c.trim()).filter(Boolean)
const words = (t: string) => t.split(/\s+/).filter(Boolean).length

const WEAK = /красив|креативн|вау|круто|классн|идеальн|получше|как-нибудь|куда-нибудь/

// ================================================================ 1. Карточка товара

export interface CardState {
  asked: boolean
  role: boolean
  goal: boolean
  context: boolean
  limits: boolean
  format: boolean
  friendly: boolean
}

export const cardSim: Sim<CardState, Record<string, never>> = {
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
    mark('role', has(t, /копирайтер|маркетолог|редактор|продавц|продавец|эксперт|автор|писател|специалист|в роли|выступи как/), 'Роль: пишу как копирайтер')
    mark(
      'goal',
      has(t, /(напиши|написать|составь|создай|сделай|придумай|подготовь|нужн[аоы]?)[^.]{0,40}(карточк|описани|текст)/) || has(t, /карточк[уа]? товара/),
      'Цель: карточка товара',
    )
    const product = has(t, /кружк|термо/)
    const detail = has(t, /студент|офис|покупател|аудитори|для кого|маркетплейс|6 час|шесть час|350|держит тепл|объем|протека|с собой/)
    mark('context', product && detail, 'Контекст: факты и покупатели')
    mark('limits', has(t, /не больше|не более|до \d+|максимум|не длиннее|без эмодзи|без воды|не используй|избегай|коротк|\d+\s*(слов|символ|предложен)/), 'Ограничения: коротко, без эмодзи')
    mark('format', has(t, /заголов|список|пункт|маркир|буллет|структур|формат|таблиц|абзац/), 'Формат: заголовок и пункты')
    if (has(t, /дружелюб|теплее|на ты|проще|живее/)) {
      s.friendly = true
      found.push('Тон: дружелюбнее')
    }
    const weak = has(t, WEAK) && found.length === 0
    const score = ['role', 'goal', 'context', 'limits', 'format'].filter((k) => s[k as keyof CardState]).length
    let reply: string
    if (!s.goal) reply = 'Привет! Я не совсем понял задачу 🤔 Что именно нужно написать — пост, отзыв, карточку?'
    else if (score === 5) reply = 'Готово! Заголовок, три преимущества и призыв купить — коротко и по делу.'
    else if (score >= 3) reply = 'Сделал карточку. Если уточнишь ещё пару деталей — станет точнее.'
    else reply = 'Вот описание. Писал наугад — ты не сказал, что за товар и какой нужен формат.'
    let bipi: string | undefined
    if (weak) bipi = '«Красиво и креативно» — это не требование: ИИ не знает, что для тебя красиво. Лучше задай длину, тон и формат.'
    else if (!s.goal && words(t) < 4) bipi = 'Слишком коротко: ИИ не понял, чего ты хочешь. Начни с цели — что нужно сделать?'
    return { state: s, reply, changes: found, tone: score === 5 ? 'good' : score >= 3 ? 'meh' : 'bad', bipi }
  },
  check: (s) => ({ role: s.role, goal: s.goal, context: s.context, limits: s.limits, format: s.format }),
}

// ================================================================ 2. Лендинг кофейни

export type PaletteKey = 'none' | 'coffee' | 'violet' | 'coral' | 'teal' | 'amber'

export interface LandingState {
  built: boolean
  coffee: boolean
  name: string | null
  slogan: string | null
  hero: boolean
  menu: boolean
  cta: boolean
  ctaText: string
  reviews: boolean
  contacts: boolean
  about: boolean
  nav: boolean
  palette: PaletteKey
  ctaColor: PaletteKey | null
  adaptive: boolean
}

export interface LandingUi {
  device: 'desktop' | 'phone'
  viewedMobile: boolean
}

function colorIn(t: string): PaletteKey | null {
  if (/коралл|лосос|персик/.test(t)) return 'coral'
  if (/фиолет|сиренев|лилов|violet/.test(t)) return 'violet'
  if (/бирюз|мятн|teal/.test(t)) return 'teal'
  if (/янтар|оранж|желт|золот/.test(t)) return 'amber'
  if (/коричн|кофейн\S* (цвет|тон|палитр|гамм)|цвет\S* кофе|бежев|кремов|тепл\S* (цвет|тон|палитр|кофейн)/.test(t)) return 'coffee'
  return null
}

const quoted = (t: string) => t.match(/[«"„]([^»"“]{2,40})[»"“]/)?.[1]?.trim() ?? null

export const landingSim: Sim<LandingState, LandingUi> = {
  init: () => ({
    built: false,
    coffee: false,
    name: null,
    slogan: null,
    hero: false,
    menu: false,
    cta: false,
    ctaText: 'Подробнее',
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
    if (has(t, /кофейн|кофе|бариста|капучино|латте/) && !s.coffee) {
      s.coffee = true
      ch.push('Тема: кофейня')
    }
    // название: «…» рядом со словами «кофейня / называется / название»
    const nameM = raw.match(/(?:кофейн\S*|называ\S*|назван\S*|назови\S*)\s*[—:-]?\s*[«"„]([^»"“]{2,30})[»"“]/i)
    if (nameM && nameM[1] !== s.name) {
      s.name = nameM[1].trim()
      ch.push(`Название: «${s.name}»`)
    }
    const sloganM = raw.match(/слоган\S*\s*[—:-]?\s*[«"„]([^»"“]{2,60})[»"“]/i)
    if (sloganM) {
      s.slogan = sloganM[1].trim()
      ch.push('Слоган на первом экране')
    }
    const add = (k: 'menu' | 'reviews' | 'contacts' | 'about' | 'nav', ok: boolean, label: string) => {
      if (ok && !s[k]) {
        s[k] = true
        ch.push(label)
      }
    }
    add('menu', has(t, /меню|напит|цен[аыу]|ассортимент|прайс/), 'Секция «Меню» с ценами')
    add('reviews', has(t, /отзыв/), 'Секция «Отзывы»')
    add('contacts', has(t, /контакт|адрес|карт[аеуы]([^а-я]|$)|часы работы|телефон кофейни/), 'Контакты и адрес')
    add('about', has(t, /о нас|истори/), 'Блок «О нас»')
    add('nav', has(t, /навигац|шапк|верхн\S* меню/), 'Навигация в шапке')
    // кнопка: текст в кавычках рядом со словом «кнопка»
    for (const c of clauses(raw)) {
      const n = norm(c)
      const btn = has(n, /кнопк|cta|призыв|забронир|бронир|заказ/)
      if (btn) {
        if (!s.cta) ch.push('Кнопка-призыв на первом экране')
        s.cta = true
        const q = quoted(c)
        if (q && /кнопк/.test(n)) s.ctaText = q
        else if (/бронир|забронир/.test(n) && s.ctaText === 'Подробнее') s.ctaText = 'Забронировать столик'
        else if (/заказ/.test(n) && s.ctaText === 'Подробнее') s.ctaText = 'Заказать'
      }
      const col = colorIn(n)
      if (col) {
        if (btn || /кнопк/.test(n)) {
          if (s.ctaColor !== col) ch.push('Цвет кнопки изменён')
          s.ctaColor = col
        } else if (s.palette !== col) {
          s.palette = col
          ch.push('Своя цветовая палитра')
        }
      }
    }
    if (has(t, /мобил|телефон|адаптив|смартфон|responsive|одну колонку/) && !s.adaptive) {
      s.adaptive = true
      ch.push('Адаптив: на телефоне — одна колонка')
    }
    const firstBuild = !prev.built
    const vague = ch.length === 0 || (firstBuild && ch.length <= 1 && words(t) < 5)
    const score = Object.values(landingSim.check(s, { device: 'desktop', viewedMobile: true })).filter(Boolean).length
    let reply: string
    if (firstBuild && !s.coffee) reply = 'Сделал сайт-заготовку: заголовок «Мой сайт» и немного текста. Про что сайт — не сказано, так что всё по шаблону.'
    else if (vague && !firstBuild) reply = 'Хм, не понял, что поменять — оставил как было.'
    else if (score >= 4) reply = 'Готово! Обновил лендинг — загляни в превью.'
    else reply = firstBuild ? 'Собрал первую версию лендинга. Чего не хватает — допишем уточнениями.' : 'Внёс правки — смотри превью.'
    let bipi: string | undefined
    if (firstBuild && !s.coffee) bipi = 'ИИ не телепат: он не знает, что это кофейня, как она называется и какие секции нужны. Получился серый шаблон. Опиши страницу по блокам!'
    else if (has(t, WEAK) && ch.length === 0) bipi = '«Вау» — не задание. Скажи конкретно: какую секцию добавить или что поменять.'
    return { state: s, reply, changes: ch, tone: score >= 4 ? 'good' : vague ? 'bad' : 'meh', bipi }
  },
  check: (s, ui) => ({
    hero: s.built && s.coffee && !!s.name,
    menu: s.menu,
    cta: s.cta,
    colors: s.palette !== 'none',
    mobile: s.adaptive && ui.viewedMobile,
  }),
  hint: (s, _ui, id) => (id === 'mobile' && s.adaptive ? 'Адаптив готов! Переключи превью в режим «📱 Телефон» и проверь, что всё в одну колонку.' : undefined),
}

// ================================================================ 3. Отладка списка дел

export const BUG_ERROR = "TypeError: Cannot read properties of undefined (reading 'push')\n    at addTask (App.jsx:14:16)"
export const BUG_CODE = ['const [tasks, setTasks] = useState([])', '', 'function addTask(text) {', '  this.tasks.push(text)', '}']
export const FIX_CODE = ['function addTask(text) {', '-  this.tasks.push(text)', '+  if (!text.trim()) return', '+  setTasks([...tasks, { id: Date.now(), text }])', '}']

export interface DebugState {
  error: boolean
  where: boolean
  code: boolean
  action: boolean
  expect: boolean
  fixed: boolean
  restyled: boolean
  vagueCount: number
}

export interface DebugUi {
  added: string[]
  failedClicks: number
  verified: boolean
}

export const debugSim: Sim<DebugState, DebugUi> = {
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
    got('error', has(t, /cannot read propert|typeerror|reading .push|undefined \(reading/), 'Вижу текст ошибки')
    got('where', has(t, /app\.jsx|addtask|строк\S*\s*14|:14/), 'Знаю, где искать')
    got('code', has(t, /tasks\.push|function addtask|const \[tasks|usestate\(/), 'Вижу код функции')
    got('action', has(t, /(нажима|нажал|нажму|жму|кликаю|кликнул|ввожу|ввел|пытаюсь)/), 'Понял шаги')
    got('expect', has(t, /ожида|должн|хочу,? чтобы|чтобы задача появ/), 'Понял, что ожидаешь')
    const info = ch.length
    if (s.fixed) {
      const reply = has(t, /пуст/)
        ? 'Уже добавил: пустую задачу (из одних пробелов) теперь не добавить.'
        : has(t, /почему|объясни|причин/)
          ? 'В функциональных компонентах React нет this: this.tasks — undefined. Состояние меняют через setTasks, создавая новый массив.'
          : 'Баг уже исправлен — проверь в превью!'
      return { state: s, reply, changes: [], tone: 'good' }
    }
    if (info === 0) {
      s.vagueCount++
      s.restyled = true
      return {
        state: s,
        reply: s.vagueCount === 1 ? 'Поменял цвет кнопки на фиолетовый и добавил анимацию ✨ Теперь должно работать!' : 'Переписал стили списка и добавил тень. Попробуй ещё раз?',
        changes: ['Изменены стили кнопки'],
        tone: 'bad',
        bipi:
          s.vagueCount === 1
            ? 'ИИ гадает: он не видит ни ошибку, ни код — и чинит не то. Скопируй красную строку из консоли и вставь в промпт.'
            : 'Похоже на петлю: просишь одно и то же, а ИИ меняет случайное. Дай новую информацию — ошибку, код и что ожидаешь.',
      }
    }
    const missing = !s.error ? 'error' : !s.where && !s.code ? 'where' : !s.code ? 'code' : !s.action || !s.expect ? 'steps' : !s.where ? 'where' : null
    if (missing) {
      const ask: Record<string, string> = {
        error: 'Понял, что что-то сломано. А что пишет консоль? Пришли текст ошибки целиком.',
        where: 'Ошибка ясна: что-то undefined при push. В каком файле и какой функции это происходит?',
        code: 'Я не вижу твой проект. Покажи, пожалуйста, код функции addTask.',
        steps: 'Почти разобрался! Опиши, что ты делаешь и чего ожидаешь, — чтобы я не сломал другое поведение.',
      }
      return { state: s, reply: ask[missing], changes: ch, tone: 'meh' }
    }
    s.fixed = true
    s.restyled = false
    return {
      state: s,
      reply: 'Нашёл! В компоненте-функции нет this, поэтому this.tasks — undefined. Меняем состояние через setTasks:',
      code: FIX_CODE,
      changes: [...ch, 'Исправлена функция addTask', 'Пустые задачи не добавляются'],
      tone: 'good',
      bipi: 'Ошибка + место + код + ожидание — и ИИ починил с первого раза. Теперь проверь: добавь задачу в превью!',
    }
  },
  check: (s, ui) => ({
    error: s.error,
    where: s.where,
    code: s.code,
    steps: s.action && s.expect,
    verified: s.fixed && ui.verified,
  }),
  hint: (s, _ui, id) => (id === 'verified' && s.fixed ? 'Баг исправлен — введи задачу в превью и нажми «Добавить».' : undefined),
}

// ================================================================ 4. Форма + таблица

export interface FormState {
  form: boolean
  name: boolean
  email: boolean
  message: boolean
  table: boolean
  validation: boolean
  keyLeaked: boolean
  keySafe: boolean
  thanks: boolean
}

export interface FormRow {
  id: number
  name: string
  email: string
  message: string
  bad?: boolean
}

export interface FormUi {
  rows: FormRow[]
  saved: boolean
}

const KEY_RE = /sk_(live|test)_\w+|eyj[a-z0-9_-]{10,}|service_role\s*[:=]|api[_ ]?key\s*[:=]\s*\S{8,}/

export const formSim: Sim<FormState, FormUi> = {
  init: () => ({ form: false, name: false, email: false, message: false, table: false, validation: false, keyLeaked: false, keySafe: false, thanks: false }),
  initUi: () => ({ rows: [], saved: false }),
  apply(prev, prompt) {
    const t = norm(prompt)
    const s = { ...prev }
    const ch: string[] = []
    if (!s.form) {
      s.form = true
      ch.push('Создана форма')
    }
    const field = (k: 'name' | 'email' | 'message', ok: boolean, label: string) => {
      if (ok && !s[k]) {
        s[k] = true
        ch.push(label)
      }
    }
    field('name', has(t, /(^|[^а-я])имя|имени|\bname\b/), 'Поле «Имя»')
    field('email', has(t, /email|e-mail|почт|имейл/), 'Поле «Email»')
    field('message', has(t, /сообщени|отзыв|комментари|текст/), 'Поле «Сообщение»')
    if (has(t, /таблиц|supabase|баз\S* данных|(^|[^а-я])бд([^а-я]|$)|сохраня|сохрани/) && !s.table) {
      s.table = true
      ch.push('Таблица feedback в базе')
    }
    if (has(t, /валидац|провер|обязательн|корректн|пуст/) && !s.validation) {
      s.validation = true
      ch.push('Проверка полей и email')
    }
    if (has(t, /спасибо|благодар/) && !s.thanks) {
      s.thanks = true
      ch.push('Сообщение «Спасибо!»')
    }
    let bipi: string | undefined
    let tone: Tone = 'meh'
    if (KEY_RE.test(t)) {
      s.keyLeaked = true
      s.keySafe = false
      ch.push('⚠️ Ключ вставлен прямо в код')
      bipi = 'Стоп! 🔑 Ты отправил секретный ключ в чат — ИИ вписал его прямо в код, и он утечёт вместе с репозиторием. Попроси брать ключ из .env, а сам ключ потом перевыпусти.'
      tone = 'bad'
    } else if (has(t, /\.env|переменн\S* окружени|environment|секрет|(не|нельзя)\s+(пиши|храни|вставля|клади|оставля)\S*[^.]{0,30}ключ|ключ\S*[^.]{0,30}(не в коде|в \.env|на сервер)/)) {
      if (!s.keySafe) ch.push(s.keyLeaked ? 'Ключ убран из кода → .env' : 'Ключ читается из .env')
      s.keySafe = true
      s.keyLeaked = false
    }
    const all = Object.values(formSim.check(s, { rows: [], saved: true })).every(Boolean)
    if (tone !== 'bad') tone = all ? 'good' : ch.length > 1 ? 'meh' : 'bad'
    let reply: string
    if (s.keyLeaked) reply = 'Подключил базу, вставил твой ключ в supabase.js. Работает!'
    else if (!s.name && !s.email && !s.message) reply = 'Сделал форму с одним полем «Текст». Куда отправлять данные — не сказано, так что они никуда не сохраняются.'
    else if (all) reply = 'Готово: форма с проверками сохраняет отзывы в таблицу feedback, ключ берётся из .env. Попробуй отправить отзыв!'
    else reply = s.table ? 'Обновил форму и подключил таблицу. Попробуй отправить отзыв в превью.' : 'Обновил форму. Пока данные никуда не сохраняются.'
    if (!bipi && !s.table && s.form && prev.form === false && !s.name) bipi = '«Сделай форму» — слишком мало. Какие поля? Куда сохранять? Что проверять? ИИ выбрал за тебя — и не угадал.'
    return { state: s, reply, changes: ch, tone, bipi }
  },
  check: (s, ui) => ({
    fields: s.name && s.email && s.message,
    table: s.table,
    validation: s.validation,
    secret: s.keySafe && !s.keyLeaked,
    saved: ui.saved && s.table,
  }),
  hint: (s, _ui, id) =>
    id === 'saved' ? (s.table ? 'Заполни форму в превью и нажми «Отправить отзыв» — строка появится в таблице.' : 'Сначала попроси сохранять отзывы в таблицу — иначе отправлять некуда.') : undefined,
}

// ================================================================ 5. Деплой

export interface DeployState {
  commit: string | null
  commitVague: boolean
  pushed: boolean
  repo: string
  deployed: boolean
  domain: string | null
  analytics: boolean
  ogImage: boolean
  log: string[]
}

export interface DeployUi {
  opened: boolean
}

const hash = (s: string) => {
  let h = 2166136261
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

export const deploySim: Sim<DeployState, DeployUi> = {
  init: () => ({ commit: null, commitVague: false, pushed: false, repo: 'zerno-coffee', deployed: false, domain: null, analytics: false, ogImage: false, log: [] }),
  initUi: () => ({ opened: false }),
  apply(prev, prompt) {
    const raw = prompt
    const t = norm(prompt)
    const s: DeployState = { ...prev, log: [...prev.log] }
    const ch: string[] = []
    const problems: string[] = []
    // 1. коммит
    if (has(t, /коммит|commit|закоммит|сохрани изменения/)) {
      const msg = raw.match(/(?:сообщени\S*|commit\s+-m|коммит\S*)\s*[—:-]?\s*[«"„]([^»"“]{3,60})[»"“]/i)?.[1]
      s.commit = msg ?? 'update'
      s.commitVague = !msg
      s.log.push(`$ git commit -m "${s.commit}"`, `[main ${hash(s.commit)}] ${s.commit} · 12 files changed`)
      ch.push(msg ? `Коммит «${msg}»` : 'Коммит «update»')
      if (!msg) problems.push('Сообщение «update» ничего не говорит. Попроси коммит с понятным сообщением — через месяц сам скажешь спасибо.')
    }
    // 2. push
    if (has(t, /\bpush|запуш|github|гитхаб|репозитор/)) {
      const repo = raw.match(/репозитори\S*\s+[«"]?([a-z0-9][\w.-]{2,40})/i)?.[1]
      if (repo) s.repo = repo.replace(/[»".]+$/, '')
      if (!s.commit) {
        s.log.push('$ git push origin main', 'error: src refspec main does not match any')
        problems.push('Пушить нечего: сначала коммит — он сохраняет изменения, а push отправляет их на GitHub.')
      } else {
        s.pushed = true
        s.log.push('$ git push origin main', `→ github.com/aidar/${s.repo} · main`)
        ch.push(`Код на GitHub: ${s.repo}`)
      }
    }
    // 3. деплой
    if (has(t, /деплой|задеплой|deploy|на vercel|выложи|опубликуй|хостинг|netlify|в интернет/)) {
      if (!s.pushed) {
        s.log.push('▲ vercel deploy', 'Error: no git repository connected')
        problems.push('Деплой упал: Vercel берёт код из репозитория на GitHub. Сначала коммит и push.')
      } else if (!s.deployed) {
        s.deployed = true
        s.log.push('▲ Vercel: Building…', '✓ Build completed in 23s', `✓ Ready: https://${s.repo}.vercel.app`)
        ch.push(`Сайт в сети: ${s.repo}.vercel.app`)
      }
    }
    // 4. домен
    if (has(t, /домен|domain/)) {
      const d = t.match(/([a-z0-9][a-z0-9-]{1,40}\.(ru|com|app|dev|io|рф|kz|uz|by|online|site|cafe|coffee|me))/)?.[1]
      if (!s.deployed) problems.push('Домен подключают к уже задеплоенному проекту. Сначала деплой!')
      else if (!d) problems.push('Какой домен подключить? Напиши адрес целиком, например zerno-coffee.ru.')
      else if (s.domain !== d) {
        s.domain = d
        s.log.push(`$ vercel domains add ${d}`, `✓ DNS ok · SSL выдан · https://${d}`)
        ch.push(`Домен ${d} подключён`)
      }
    }
    // 5. аналитика
    if (has(t, /аналитик|analytics|метрик|счетчик|посещени|посетител/)) {
      if (!s.deployed) problems.push('Аналитику подключают к живому сайту — сначала задеплой.')
      else if (!s.analytics) {
        s.analytics = true
        s.log.push('+ @vercel/analytics', '✓ Analytics enabled')
        ch.push('Аналитика посещений')
      }
    }
    if (has(t, /превью для соцсет|og|open graph/) && s.deployed && !s.ogImage) {
      s.ogImage = true
      ch.push('Картинка-превью для соцсетей')
    }
    const all = Object.values(deploySim.check(s, { opened: true })).every(Boolean)
    let reply: string
    if (ch.length === 0 && problems.length === 0) reply = 'Куда выложить и что сделать? Я вижу только папку с кодом. Скажи по шагам: git, GitHub, хостинг, домен.'
    else if (problems.length && ch.length === 0) reply = 'Не получилось — смотри лог в превью.'
    else if (all) reply = `Готово! Сайт живёт на https://${s.domain} 🎉`
    else reply = 'Сделал, что смог, — лог в превью.'
    return { state: s, reply, changes: ch, tone: all ? 'good' : problems.length || ch.length === 0 ? 'bad' : 'meh', bipi: problems[0] }
  },
  check: (s) => ({
    commit: !!s.commit && !s.commitVague,
    push: s.pushed,
    deploy: s.deployed,
    domain: !!s.domain,
    analytics: s.analytics,
  }),
}
