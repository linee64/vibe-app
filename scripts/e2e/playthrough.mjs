// Сквозная проверка курса на мобильном экране 375px (или 1280px с --desktop):
//  A. Строго по шагам: открыт только первый урок, остальные узлы серые с замком, нажатие — тост
//     «Сначала пройди предыдущий уровень», прямые ссылки ведут на экран «закрыто» (без пейвола), теста на уровень нет.
//  B. Честное прохождение: ВСЕ уроки (54) + домашки (9) («правильный путь», перед ним — расплывчатый промпт,
//     который не должен засчитываться) по порядку пути; тиры открываются по мере прохождения, экраны «Тир пройден!».
//  C. «Разблокировать всё (демо)» из профиля.
//  D. Экономика: магазин токенов, подсказка за 10 токенов, «Бипи на нуле» → разбор ошибки даёт +1 деление.
// Везде: нет горизонтального переполнения и ошибок консоли.
// node scripts/e2e/playthrough.mjs [baseUrl] [--desktop]
// Нужна сборка с закрытыми тирами: VITE_REVIEW_MODE=false npm run build && npm run preview → npm run e2e -- http://localhost:4173
import { chromium } from 'playwright'
import { UNITS, watch, login, playLesson, BASE, findLesson, currentExercise, pick, check } from './lib/solver.mjs'
import { T, L, LANG, plain } from './lib/i18n.mjs'
import { HOMEWORKS, TIERS, readProgress, unlockAll, dismissFirstRun, playHomework } from './lib/vibe.mjs'

const desktop = process.argv.includes('--desktop')
const errors = []
const issues = []
const browser = await chromium.launch()
const ctxOpts = desktop ? { viewport: { width: 1280, height: 800 } } : { viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true }

const assert = (cond, msg) => {
  if (!cond) issues.push(msg)
  return cond
}

async function overflowCheck(page, where) {
  const r = await page.evaluate(() => {
    const out = []
    const W = document.documentElement.clientWidth
    for (const box of document.querySelectorAll('main .overflow-x-auto')) if (box.scrollWidth > box.clientWidth + 1) out.push(`code box scrolls horizontally (${box.scrollWidth} > ${box.clientWidth})`)
    if (document.documentElement.scrollWidth > W + 1) out.push(`page scrollWidth ${document.documentElement.scrollWidth} > ${W}`)
    for (const el of document.querySelectorAll('main .tile, main button, [data-homework] button, [data-homework] textarea')) {
      if (el.closest('.overflow-x-auto')) continue // код в баг-упражнениях может прокручиваться внутри своего блока
      const b = el.getBoundingClientRect()
      if (b.width && (b.right > W + 1 || b.left < -1)) out.push(`element out of viewport: "${el.textContent.slice(0, 50)}" [${Math.round(b.left)}–${Math.round(b.right)}]`)
      if (el.classList.contains('tile') && el.scrollWidth > el.clientWidth + 2) out.push(`tile text overflow: "${el.textContent.slice(0, 50)}"`)
    }
    return out
  })
  for (const x of r) issues.push(`${where}: ${x}`)
}

const go = (page, hash) => page.evaluate((h) => (location.hash = h), hash)
const tierLocked = (page, id) => page.evaluate((t) => document.querySelector(`[data-tier="${t}"]`)?.getAttribute('data-tier-locked') === '1', id)
const lockedNodes = (page) => page.evaluate(() => [...document.querySelectorAll('[data-lesson][data-locked]')].map((n) => n.getAttribute('data-lesson')))

// ================================================================ A. Блокировки и тест на уровень
{
  const ctx = await browser.newContext(ctxOpts)
  const page = await ctx.newPage()
  watch(page, errors)
  await login(page)
  await overflowCheck(page, 'A home')
  assert(!(await page.locator('[data-first-run]').count()), 'A: предложения «Тест на уровень» больше нет')
  assert(!(await page.locator('[data-placement]').count()), 'A: тестов на уровень на пути больше нет')
  assert(!(await tierLocked(page, 'novice')), 'A: Новичок должен быть открыт')
  assert(await tierLocked(page, 'mid'), 'A: Средний должен быть закрыт')
  assert(await tierLocked(page, 'pro'), 'A: Продвинутый должен быть закрыт')
  // строго по шагам: пройденные (done) → один текущий (current) → всё остальное с замком (locked)
  const states = await page.evaluate(() => [...document.querySelectorAll('[data-lesson]')].map((n) => n.getAttribute('data-state')).join(','))
  assert(/^(done,)*current(,locked)+$/.test(states), `A: путь должен быть строго по шагам, а он: ${states}`)
  const locked = await lockedNodes(page)
  // нажатие на закрытый узел: тост, без попапа и без перехода
  const probe = [locked[0], locked.find((id) => id.startsWith('u2')), 'u3-1'].filter(Boolean)
  for (const id of probe) {
    await page.keyboard.press('Escape')
    await page.evaluate((x) => document.querySelector(`[data-lesson="${x}"]`).scrollIntoView({ block: 'center', behavior: 'instant' }), id)
    await page.locator(`[data-lesson="${id}"] > div > button`).click()
    assert(await page.getByRole('status').getByText(T('path.locked')).isVisible(), `A: нет тоста «${T('path.locked')}» для ${id}`)
    assert(!(await page.locator(`[data-lesson="${id}"] .anim-pop`).count()), `A: у закрытого ${id} не должно быть попапа`)
  }
  await overflowCheck(page, 'A locked toast')
  // прямые ссылки: закрыто, без пейвола
  for (const h of [`/lesson/${locked[0]}`, '/lesson/u2-2', '/homework/hw2', '/lesson/u3-1', '/homework/hw4']) {
    await go(page, h)
    assert(await page.waitForSelector('[data-locked-screen]', { timeout: 5000 }).then(() => true, () => false), `A: ${h} должен показывать экран «закрыто»`)
    assert(!(await page.locator('[data-paywall]').count()), `A: ${h} не должен показывать пейвол`)
  }
  await go(page, '/placement/mid')
  await page.waitForSelector('[data-lesson]')
  assert(!(await page.locator('[data-placement]').count()), 'A: маршрут /placement больше не работает')
  console.log('✓ A: строго по шагам — замки, тост, прямые ссылки, без теста на уровень')
  await ctx.close()
}

// ================================================================ B. Честное прохождение
const ctx = await browser.newContext(ctxOpts)
const page = await ctx.newPage()
watch(page, errors)
await login(page)
await dismissFirstRun(page)
await overflowCheck(page, 'home')

/** После «Продолжить»: путь или экран «Тир пройден!» */
async function afterContinue(expectTierUp) {
  await page.waitForSelector('[data-lesson], [data-tier-up]')
  // без автоожидания: getAttribute у отсутствующего элемента ждал бы 30 с
  const tu = await page.evaluate(() => document.querySelector('[data-tier-up]')?.getAttribute('data-tier-up') ?? null)
  if (expectTierUp) {
    if (assert(tu === expectTierUp, `ожидался экран «Тир ${expectTierUp} пройден», а получили ${tu}`)) {
      await overflowCheck(page, `tier-up ${tu}`)
      await page.locator('footer').getByRole('button').click()
      await page.waitForSelector('[data-lesson]')
      console.log(`★ Тир «${TIERS.find((t) => t.id === tu).name}» пройден — экран показан`)
    }
  } else assert(!tu, `неожиданный экран «Тир пройден» (${tu})`)
}

let total = 0
for (const tier of TIERS) {
  assert(!(await tierLocked(page, tier.id)), `B: тир ${tier.id} должен быть открыт к началу`)
  const next = TIERS[TIERS.indexOf(tier) + 1]
  if (next) assert(await tierLocked(page, next.id), `B: тир ${next.id} должен быть закрыт, пока не пройден ${tier.id}`)
  const units = UNITS.filter((u) => tier.units.includes(u.id))
  for (const [ui, unit] of units.entries()) {
    const hw = HOMEWORKS.find((h) => h.unitId === unit.id)
    const cp = unit.lessons[unit.lessons.length - 1]
    const order = [...unit.lessons.slice(0, -1).map((l) => l.id), hw.id, cp.id]
    for (const id of order) {
      const lastOfTier = ui === units.length - 1 && id === cp.id
      if (id.startsWith('hw')) {
        if (id === 'hw1') {
          // одну домашку открываем через попап на пути
          await page.evaluate(() => document.querySelector('[data-lesson="hw1"]').scrollIntoView({ block: 'center', behavior: 'instant' }))
          await page.locator('[data-lesson="hw1"] > div > button').click()
          await page.locator('[data-lesson="hw1"]').getByRole('button', { name: T('x0vp3igd', { HOMEWORK_XP: 50 }), exact: true }).click()
        } else await go(page, `/homework/${id}`)
        const log = await playHomework(page, id, {
          vagueFirst: true,
          hooks: { beforeSubmit: () => overflowCheck(page, `${id} all done`) },
        })
        await overflowCheck(page, `${id} complete`)
        await page.locator('footer').getByRole('button', { name: L('Продолжить'), exact: true }).click()
        await afterContinue(null)
        const p = await readProgress(page)
        assert(p.homework.includes(id), `${id}: домашка не отмечена сданной`)
        console.log(`✓ ${id} ${hw.title} — ${log.join(' ')}`)
        continue
      }
      const lesson = unit.lessons.find((l) => l.id === id)
      await go(page, `/lesson/${id}`)
      const res = await playLesson(page, id, {
        // ошибки разных типов: упражнение вернётся в конец урока, исправление даёт +1 деление заряда
        wrongAt: { 2: [0], 3: [3], 4: [0], 5: [1] }[id.slice(-1)] ?? [],
        hooks: { beforeCheck: (ex, step) => overflowCheck(page, `${id} step ${step} (${ex.kind})`) },
      })
      await overflowCheck(page, `${id} complete`)
      await page.locator('footer').getByRole('button', { name: L('Продолжить'), exact: true }).click()
      await afterContinue(lastOfTier ? tier.id : null)
      const done = await page.evaluate((lid) => JSON.parse(localStorage.getItem('vaibik.progress')).completed.includes(lid), id)
      assert(done, `${id}: not marked completed`)
      total += lesson.exercises.length
      console.log(`✓ ${id} ${lesson.title} — ${res.steps.join(' ')}`)
    }
  }
  if (next) assert(!(await tierLocked(page, next.id)), `B: после прохождения ${tier.id} тир ${next.id} должен открыться`)
}
await overflowCheck(page, 'home after all')
const progress = await readProgress(page)
console.log(`\nAll lessons done: ${progress.completed.length}, homework: ${progress.homework.length}, exercises answered: ${total}, вайб-поинты: ${progress.xp}`)
assert(progress.tiersCelebrated.length === 3 && progress.tiersByTest.length === 0, `B: тиры ${JSON.stringify(progress.tiersCelebrated)} / по тесту ${JSON.stringify(progress.tiersByTest)}`)
await ctx.close()

// ================================================================ D. Экономика: подсказка за токены, заряд Бипи на нуле
{
  const ctx = await browser.newContext(ctxOpts)
  const page = await ctx.newPage()
  watch(page, errors)
  await login(page)
  await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem('vaibik.progress') || '{}')
    localStorage.setItem('vaibik.progress', JSON.stringify({ ...p, hearts: 1, gems: 40 }))
  })
  await page.reload()
  await page.waitForSelector('[data-lesson]')
  assert((await page.locator('[data-eco="charge"]:visible [data-charge]').first().getAttribute('data-charge')) === '1', 'D: в шапке должен быть заряд 1')
  // мини-магазин токенов
  await page.locator('[data-eco="tokens"]:visible').first().click()
  assert(await page.locator('[data-shop]:visible').first().isVisible(), 'D: не открылся магазин токенов')
  await overflowCheck(page, 'D shop')
  await page.keyboard.press('Escape')
  await go(page, '/lesson/u1-1')
  await page.waitForSelector('main h1')
  const lesson = findLesson('u1-1')
  // подсказка: −10 токенов, на экране пометка Бипи
  await page.locator('[data-hint-btn]').click()
  await page.locator('main [data-hint]').waitFor()
  assert((await readProgress(page)).gems === 30, 'D: подсказка должна стоить 10 токенов')
  // ошибка на последнем делении → модалка «Бипи на нуле» → разбор ошибки (+1)
  const ex = await currentExercise(page, lesson)
  await pick(page, ex, { wrong: true })
  await check(page)
  await page.locator('footer').getByRole('button', { name: L('Понятно'), exact: true }).click()
  const modal = page.locator('[data-empty="review"]')
  if (assert(await modal.isVisible().catch(() => false), 'D: нет модалки «Бипи на нуле»')) {
    await overflowCheck(page, 'D empty modal')
    await modal.click()
    await page.locator('[data-empty="done"]').click()
    assert((await readProgress(page)).hearts === 1, 'D: разбор ошибки должен дать +1 деление')
    console.log('✓ D: подсказка за токены, «Бипи на нуле» → разбор ошибки (+1 деление)')
  }
  await ctx.close()
}

// ================================================================ C. Демо-разблокировка
{
  const ctx = await browser.newContext(ctxOpts)
  const page = await ctx.newPage()
  watch(page, errors)
  await login(page)
  await unlockAll(page, { via: 'profile' })
  assert((await lockedNodes(page)).length === 0, 'C: после «Разблокировать всё» остались закрытые узлы')
  assert(!(await tierLocked(page, 'pro')), 'C: Продвинутый должен быть открыт')
  await go(page, '/homework/hw5')
  // экран домашки грузится отдельным чанком (lazy) — ждём появления
  const hwOpen = await page.waitForSelector('[data-homework="hw5"]', { timeout: 10000 }).then(() => true, () => false)
  assert(hwOpen, 'C: домашка 5 должна открываться')
  await overflowCheck(page, 'C homework hw5 start')
  console.log('✓ C: «Разблокировать всё (демо)» открывает все тиры')
  await ctx.close()
}

await browser.close()
console.log(issues.length ? 'ISSUES:\n' + issues.join('\n') : 'No overflow/logic issues')
console.log(errors.length ? 'CONSOLE ISSUES:\n' + errors.join('\n') : 'No console errors/warnings')
console.log('base', BASE, desktop ? '(desktop 1280)' : '(mobile 375)', 'lang', LANG)
if (issues.length || errors.length) process.exitCode = 1
