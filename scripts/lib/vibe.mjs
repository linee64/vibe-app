// Помощники для Playwright-скриптов: домашки, тиры, «Тест на уровень», демо-разблокировка.
// (Не трогает scripts/lib/solver.mjs — использует его как есть.)
import { createJiti } from 'jiti'
import { currentExercise, pick, check, proceed } from './solver.mjs'

const jiti = createJiti(import.meta.url)
export const { HOMEWORKS } = await jiti.import('../../src/data/homework.ts')
export const { TIERS, placementQuestions, PLACEMENT_PASS } = await jiti.import('../../src/data/tiers.ts')

export const readProgress = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('vaibik.progress') || '{}'))

/** Демо-разблокировка всех тиров. via: 'storage' (быстро) или 'profile' (через кнопку в профиле) */
export async function unlockAll(page, { via = 'storage' } = {}) {
  if (via === 'profile') {
    await page.evaluate(() => (location.hash = '/profile'))
    await page.getByRole('button', { name: 'Разблокировать всё (демо)' }).click()
    await page.getByRole('button', { name: 'Вернуть блокировки' }).waitFor()
    await page.evaluate(() => (location.hash = '/learn'))
  } else {
    await page.evaluate(() => {
      const p = JSON.parse(localStorage.getItem('vaibik.progress') || '{}')
      localStorage.setItem('vaibik.progress', JSON.stringify({ ...p, unlockAll: true, placementSeen: true }))
    })
    await page.reload()
  }
  await page.waitForSelector('[data-lesson]')
}

/** Закрыть предложение «Тест на уровень» на пути, если оно показано */
export async function dismissFirstRun(page) {
  const card = page.locator('[data-first-run]')
  if (await card.count()) await card.getByRole('button', { name: 'Пропустить' }).click()
}

export async function waitAi(page) {
  await page.waitForFunction(() => document.querySelector('[data-homework]')?.getAttribute('data-hw-busy') === '1', null, { timeout: 3000 }).catch(() => {})
  await page.waitForFunction(() => document.querySelector('[data-homework]')?.getAttribute('data-hw-busy') === '0', null, { timeout: 8000 })
  await page.waitForTimeout(250)
}

export async function reqStatus(page) {
  return page.evaluate(() => [...document.querySelectorAll('[data-req]')].map((li) => [li.getAttribute('data-req'), li.getAttribute('data-done') === '1']))
}

async function appendText(page, text) {
  const ta = page.locator('#hw-prompt')
  const cur = await ta.inputValue()
  await ta.fill(cur.trim() ? `${cur.trimEnd()} ${text}` : text)
}

export async function send(page) {
  await page.getByRole('button', { name: 'Отправить ИИ', exact: true }).click()
  await waitAi(page)
}

const preview = (page) => page.locator('section[aria-label="Превью результата"]')

export async function doAction(page, action) {
  const pv = preview(page)
  switch (action) {
    case 'viewMobile':
      await pv.getByRole('button', { name: '📱 Телефон' }).click()
      break
    case 'copyError':
      await pv.getByRole('button', { name: 'Скопировать ошибку' }).click()
      break
    case 'copyCode':
      await pv.getByRole('button', { name: 'Скопировать код' }).click()
      break
    case 'addTask':
      await pv.getByLabel('Новая задача').fill('Обжарить новую партию')
      await pv.getByRole('button', { name: 'Добавить', exact: true }).click()
      break
    case 'submitForm':
      await pv.getByLabel('Имя', { exact: true }).fill('Аидар')
      await pv.getByLabel('Email', { exact: true }).fill('aidar@example.com')
      await pv.getByLabel('Сообщение', { exact: true }).fill('Лучший раф в городе!')
      await pv.getByRole('button', { name: 'Отправить отзыв' }).click()
      break
    case 'openSite':
      await pv.getByRole('button', { name: 'Открыть сайт' }).click()
      break
  }
  await page.waitForTimeout(200)
}

/**
 * Пройти домашку «правильным путём» из src/data/homework.ts.
 * vagueFirst — сначала отправить расплывчатый промпт и проверить, что он НЕ засчитывается, потом «↺ Заново».
 * hooks.afterStep(step, i) — для скриншотов.
 */
export async function playHomework(page, hwId, { vagueFirst = false, hooks = {}, submit = true } = {}) {
  const hw = HOMEWORKS.find((h) => h.id === hwId)
  await page.waitForSelector(`[data-homework="${hwId}"]`)
  const log = []
  if (vagueFirst) {
    await appendText(page, hw.vague)
    await send(page)
    const st = await reqStatus(page)
    const n = st.filter(([, ok]) => ok).length
    log.push(`vague→${n}/${st.length}`)
    if (n >= 2) throw new Error(`${hwId}: расплывчатый промпт засчитал ${n} требований`)
    await page.getByRole('button', { name: '↺ Заново' }).click()
  }
  for (const [i, step] of hw.solution.entries()) {
    if (step.block) await page.locator('[data-blocks] button').filter({ hasText: new RegExp(`^[+✓] ${step.block.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).click()
    else if (step.type) await appendText(page, step.type)
    else if (step.send) await send(page)
    else if (step.action) await doAction(page, step.action)
    if (hooks.afterStep) await hooks.afterStep(step, i)
  }
  const st = await reqStatus(page)
  const missing = st.filter(([, ok]) => !ok).map(([id]) => id)
  if (missing.length) throw new Error(`${hwId}: не выполнены требования ${missing.join(', ')}`)
  log.push(`solution→${st.length}/${st.length}`)
  if (hooks.beforeSubmit) await hooks.beforeSubmit()
  if (submit) {
    await page.getByRole('button', { name: 'Сдать домашку' }).first().click()
    await page.waitForSelector(`[data-homework-done="${hwId}"]`)
  }
  return log
}

/** Пройти «Тест на уровень» (уже на экране теста, фаза intro). correct — сколько ответить верно */
export async function playPlacement(page, target, { correct = 8, hooks = {}, start = true } = {}) {
  const qs = placementQuestions(target)
  if (start) await page.getByRole('button', { name: 'Начать тест' }).click()
  await page.waitForSelector('[data-placement="quiz"]')
  for (let i = 0; i < qs.length; i++) {
    await page.waitForSelector('main h1')
    const ex = await currentExercise(page, { id: 'placement', exercises: qs })
    await pick(page, ex, { wrong: i >= correct })
    if (hooks.beforeCheck) await hooks.beforeCheck(ex, i)
    await check(page)
    await proceed(page)
    await page.waitForTimeout(120)
  }
  await page.waitForSelector('[data-placement="result"]')
  return page.evaluate(() => document.querySelector('[data-placement="result"]').getAttribute('data-passed') === '1')
}
