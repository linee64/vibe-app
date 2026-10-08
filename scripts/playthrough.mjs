// Сквозная проверка курса: проходит ВСЕ уроки всех разделов на мобильном экране 375px,
// проверяет отсутствие горизонтального переполнения и ошибок консоли.
// node scripts/playthrough.mjs [baseUrl] [--desktop]
import { chromium } from 'playwright'
import { UNITS, watch, login, playLesson, BASE } from './lib/solver.mjs'

const desktop = process.argv.includes('--desktop')
const errors = []
const issues = []
const browser = await chromium.launch()
const ctx = await browser.newContext(
  desktop ? { viewport: { width: 1280, height: 800 } } : { viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true },
)
const page = await ctx.newPage()
watch(page, errors)
await login(page)

async function overflowCheck(where) {
  const r = await page.evaluate(() => {
    const out = []
    const W = document.documentElement.clientWidth
    for (const box of document.querySelectorAll('main .overflow-x-auto')) if (box.scrollWidth > box.clientWidth + 1) out.push(`code box scrolls horizontally (${box.scrollWidth} > ${box.clientWidth})`)
    if (document.documentElement.scrollWidth > W + 1) out.push(`page scrollWidth ${document.documentElement.scrollWidth} > ${W}`)
    for (const el of document.querySelectorAll('main .tile, main button')) {
      if (el.closest('.overflow-x-auto')) continue // код в баг-упражнениях может прокручиваться внутри своего блока
      const b = el.getBoundingClientRect()
      if (b.width && (b.right > W + 1 || b.left < -1)) out.push(`element out of viewport: "${el.textContent.slice(0, 50)}" [${Math.round(b.left)}–${Math.round(b.right)}]`)
      if (el.classList.contains('tile') && el.scrollWidth > el.clientWidth + 2) out.push(`tile text overflow: "${el.textContent.slice(0, 50)}"`)
    }
    return out
  })
  for (const x of r) issues.push(`${where}: ${x}`)
}

await overflowCheck('home')
let total = 0
for (const unit of UNITS) {
  for (const lesson of unit.lessons) {
    await page.evaluate((id) => (location.hash = `/lesson/${id}`), lesson.id)
    const res = await playLesson(page, lesson.id, {
      wrongAt: lesson.id.endsWith('-2') ? [0] : [],
      hooks: { beforeCheck: (ex, step) => overflowCheck(`${lesson.id} step ${step} (${ex.kind})`) },
    })
    await overflowCheck(`${lesson.id} complete`)
    await page.locator('footer').getByRole('button', { name: 'Продолжить', exact: true }).click()
    await page.waitForSelector('[data-lesson]')
    const done = await page.evaluate((id) => JSON.parse(localStorage.getItem('vaibik.progress')).completed.includes(id), lesson.id)
    if (!done) issues.push(`${lesson.id}: not marked completed`)
    total += lesson.exercises.length
    console.log(`✓ ${lesson.id} ${lesson.title} — ${res.steps.join(' ')}`)
  }
}
await overflowCheck('home after all')
const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('vaibik.progress')))
console.log(`\nAll lessons done: ${progress.completed.length}, exercises answered: ${total}, XP now ${progress.xp}`)
await browser.close()
console.log(issues.length ? 'LAYOUT ISSUES:\n' + issues.join('\n') : 'No overflow issues')
console.log(errors.length ? 'CONSOLE ISSUES:\n' + errors.join('\n') : 'No console errors/warnings')
console.log('base', BASE)
