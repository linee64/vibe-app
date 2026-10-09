/**
 * Языковой пакет симулятора домашек: ключевые слова (источники RegExp) и реплики.
 * Ключевые слова пишем в нижнем регистре, латиницу — без диакритики (norm() снимает ударения: «botón» → «boton»).
 * В движке слова языка ОБЪЕДИНЯЮТСЯ с русскими (и английскими для не-en): канонические фразы ИИ-разбора
 * (src/homework/ai.ts) — русские, а люди часто пишут технические слова по-английски.
 */
export interface SimKeywords {
  /** «Пустые слова» */
  weak: string
  // 1. Карточка товара
  cardRole: string
  cardGoal: string
  cardProduct: string
  cardDetail: string
  cardLimits: string
  cardFormat: string
  cardFriendly: string
  // 2. Лендинг
  coffee: string
  /** Слово ПЕРЕД кавычками с названием: «кофейня «Зерно»», “called “Zerno”” */
  nameLead: string
  /** Слово ПОСЛЕ кавычек с названием (kk, zh): «Зерно» кофеханасы, “Zerno”咖啡店 */
  nameTrail: string
  sloganLead: string
  sloganTrail: string
  menu: string
  reviews: string
  contacts: string
  about: string
  nav: string
  /** Фраза про кнопку/призыв */
  btn: string
  /** Именно слово «кнопка» (текст в кавычках рядом с ним = надпись на кнопке) */
  btnWord: string
  book: string
  order: string
  mobile: string
  colorCoral: string
  colorViolet: string
  colorTeal: string
  colorAmber: string
  colorCoffee: string
  // 3. Отладка
  where: string
  action: string
  expect: string
  empty: string
  why: string
  // 4. Форма
  fieldName: string
  fieldEmail: string
  fieldMessage: string
  table: string
  validation: string
  thanks: string
  keySafe: string
  // 5. Деплой
  commit: string
  commitLead: string
  commitTrail: string
  push: string
  repoLead: string
  repoTrail: string
  deploy: string
  domain: string
  analytics: string
  og: string
}

export interface SimTexts {
  card: {
    role: string
    goal: string
    context: string
    limits: string
    format: string
    friendly: string
    replyNoGoal: string
    replyAll: string
    replyMost: string
    replyFew: string
    bipiWeak: string
    bipiShort: string
  }
  landing: {
    ctaDefault: string
    ctaBook: string
    ctaOrder: string
    theme: string
    /** {name} */
    name: string
    slogan: string
    menu: string
    reviews: string
    contacts: string
    about: string
    nav: string
    cta: string
    ctaColor: string
    palette: string
    adaptive: string
    replyTemplate: string
    replyVague: string
    replyGood: string
    replyFirst: string
    replyEdit: string
    bipiNoCoffee: string
    bipiWeak: string
    hintMobile: string
  }
  debug: {
    error: string
    where: string
    code: string
    action: string
    expect: string
    fixedEmpty: string
    fixedWhy: string
    fixedAlready: string
    vague1: string
    vague2: string
    vagueChange: string
    bipiVague1: string
    bipiVague2: string
    askError: string
    askWhere: string
    askCode: string
    askSteps: string
    fixReply: string
    fixChange1: string
    fixChange2: string
    bipiFixed: string
    hintVerified: string
  }
  form: {
    form: string
    name: string
    email: string
    message: string
    table: string
    validation: string
    thanks: string
    leaked: string
    keyMoved: string
    keyEnv: string
    bipiLeaked: string
    bipiVague: string
    replyLeaked: string
    replyNoFields: string
    replyAll: string
    replyTable: string
    replyNoTable: string
    hintSavedOk: string
    hintSavedNoTable: string
  }
  deploy: {
    /** {msg} */
    commit: string
    problemCommitVague: string
    problemPushNothing: string
    /** {repo} */
    push: string
    problemDeploy: string
    /** {url} */
    deployed: string
    problemDomainNoDeploy: string
    problemDomainMissing: string
    /** «SSL выдан» в логе */
    sslIssued: string
    /** {domain} */
    domain: string
    problemAnalytics: string
    analytics: string
    og: string
    replyNothing: string
    replyFailed: string
    /** {domain} */
    replyDone: string
    replyPartial: string
  }
}

export interface SimPack {
  kw: SimKeywords
  txt: SimTexts
}
