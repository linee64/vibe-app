// Помощник для Playwright-скриптов: знает правильные ответы (читает src/data/course.ts через jiti)
// и умеет проходить уроки в браузере.
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
export const { UNITS, findLesson } = await jiti.import('../../src/data/course.ts')

export const BASE = process.argv[2] || 'http://localhost:5173'

export function watch(page, errors) {
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
}

export async function login(page, email = 'aidar@example.com') {
  await page.goto(BASE + '/#/login')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()
  await page.waitForSelector('text=С возвращением!')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill('secret123')
  await page.getByRole('button', { name: 'Войти', exact: true }).click()
  await page.waitForSelector('[data-lesson]')
  await page.evaluate(() => document.fonts.ready)
}

/** Какое упражнение сейчас на экране (по заголовку и реплике Бипи) */
export async function currentExercise(page, lesson) {
  const title = (await page.locator('main h1').first().textContent()).trim()
  const text = await page.locator('main').innerText()
  const same = lesson.exercises.filter((e) => e.title === title)
  if (same.length === 1) return same[0]
  const hit = same.find((e) => !e.prompt || text.includes(e.prompt))
  if (!hit) throw new Error(`Не нашёл упражнение «${title}» в ${lesson.id}`)
  return hit
}

const main = (page) => page.locator('main')
const at = (page, attr, i) => main(page).locator(`[${attr}="${i}"]`).first()

/** Выбрать ответ (правильный или намеренно неверный), не нажимая «Проверить» */
export async function pick(page, ex, { wrong = false } = {}) {
  switch (ex.kind) {
    case 'choice':
    case 'nextmove': {
      const i = wrong ? (ex.correct + 1) % ex.options.length : ex.correct
      await at(page, 'data-option', i).click()
      break
    }
    case 'predict': {
      const i = wrong ? (ex.correct + 1) % ex.outcomes.length : ex.correct
      await at(page, 'data-outcome', i).click()
      break
    }
    case 'bug': {
      const i = wrong ? (ex.correct + 1) % ex.code.length : ex.correct
      await at(page, 'data-line', i).click()
      break
    }
    case 'duel': {
      // неверно: верная сторона, но неверная причина
      await at(page, 'data-side', ex.winner).click()
      const r = wrong ? (ex.reason + 1) % ex.reasons.length : ex.reason
      await at(page, 'data-reason', r).click()
      break
    }
    case 'upgrade': {
      const good = ex.chips.map((c, i) => (c.trap ? -1 : i)).filter((i) => i >= 0)
      for (const i of good) await at(page, 'data-chip', i).click()
      // неверно: добавляем ловушку
      if (wrong) await at(page, 'data-chip', ex.chips.findIndex((c) => c.trap)).click()
      break
    }
    case 'diff': {
      for (let i = 0; i < ex.hunks.length; i++) {
        let reject = !!ex.hunks[i].harmful
        if (wrong && i === 0) reject = !reject
        await at(page, 'data-hunk', i)
          .getByRole('button', { name: reject ? '✕ Отклонить' : '✓ Принять' })
          .click()
      }
      break
    }
    case 'pipeline': {
      const order = ex.steps.map((_, i) => i)
      if (wrong) [order[0], order[1]] = [order[1], order[0]]
      for (const c of order) await main(page).locator(`[data-bank] [data-card="${c}"]`).click()
      break
    }
    default:
      throw new Error('Неизвестный тип ' + ex.kind)
  }
}

export async function check(page) {
  await page.getByRole('button', { name: 'Проверить', exact: true }).click()
  await page.locator('footer').getByRole('button', { name: /^(Продолжить|Понятно)$/ }).waitFor()
}

export async function proceed(page) {
  await page.locator('footer').getByRole('button', { name: /^(Продолжить|Понятно)$/ }).click()
  // заряд Бипи сел → разбираем ошибку (+1 деление) и продолжаем
  const review = page.locator('[data-empty="review"]')
  if (await review.isVisible().catch(() => false)) {
    await review.click()
    await page.locator('[data-empty="done"]').click()
  }
}

/**
 * Пройти урок целиком. hooks.beforeCheck / hooks.afterCheck(ex, step) — для скриншотов и проверок.
 * wrongAt — индексы шагов, на которых ответить неверно (упражнение вернётся в конец очереди).
 */
export async function playLesson(page, lessonId, { hooks = {}, wrongAt = [] } = {}) {
  const lesson = findLesson(lessonId)
  if (!lesson) throw new Error('Нет урока ' + lessonId)
  await page.waitForSelector('main h1')
  let step = 0
  const answered = []
  for (;;) {
    if (await page.getByText(/^(Урок пройден!|Безупречно!)$/).count()) break
    const ex = await currentExercise(page, lesson)
    const wrong = wrongAt.includes(step)
    await pick(page, ex, { wrong })
    if (hooks.beforeCheck) await hooks.beforeCheck(ex, step, wrong)
    await check(page)
    if (hooks.afterCheck) await hooks.afterCheck(ex, step, wrong)
    answered.push(`${ex.kind}${wrong ? '✗' : '✓'}`)
    await proceed(page)
    step++
    await page.waitForTimeout(120)
    if (step > 40) throw new Error('Слишком много шагов в ' + lessonId)
  }
  return { lesson, steps: answered }
}

export async function openLessonFromPath(page, lessonId) {
  const center = (sel) => page.evaluate((q) => document.querySelector(q).scrollIntoView({ block: 'center', behavior: 'instant' }), sel)
  await center(`[data-lesson="${lessonId}"]`)
  await page.locator(`[data-lesson="${lessonId}"] > div > button`).click()
  const start = page.locator(`[data-lesson="${lessonId}"]`).getByRole('button', { name: /^(Начать|Повторить) \+\d+ ВП$/ })
  await start.waitFor()
  await page.evaluate((q) => document.querySelector(q).querySelector('.btn').scrollIntoView({ block: 'center', behavior: 'instant' }), `[data-lesson="${lessonId}"]`)
  await start.click()
  await page.waitForSelector('main h1')
}
