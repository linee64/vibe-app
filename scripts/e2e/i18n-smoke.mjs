// Смоук-проверка языка: VAIBIK_LANG=kk node scripts/e2e/i18n-smoke.mjs [baseUrl] [--shot=path.png]
//  • вход на выбранном языке, <html lang>, урок u1-1 целиком, домашка hw1 («расплывчатый» → «правильный путь» → сдать);
//  • ширины 320/375/1280: лендинг, путь, урок, домашка, профиль, пейволл — без горизонтального переполнения,
//    без обрезанного текста в кнопках/плитках; в en/es/zh — без кириллицы на экране.
import { chromium } from 'playwright'
import { LANG, L } from './lib/i18n.mjs'
import { watch, login, playLesson, BASE } from './lib/solver.mjs'
import { dismissFirstRun, playHomework } from './lib/vibe.mjs'

const shot = process.argv.find((a) => a.startsWith('--shot='))?.slice(7)
const errors = []
const issues = []
const browser = await chromium.launch()

async function audit(page, where) {
  const r = await page.evaluate((lang) => {
    const out = []
    const W = document.documentElement.clientWidth
    if (document.documentElement.scrollWidth > W + 1) out.push(`page scrollWidth ${document.documentElement.scrollWidth} > ${W}`)
    for (const el of document.querySelectorAll('button, a.btn, .tile, h1, h2, h3, label, [role="radio"], select')) {
      if (el.closest('.overflow-x-auto') || !el.offsetParent) continue
      const b = el.getBoundingClientRect()
      if (b.width && (b.right > W + 1 || b.left < -1) && !el.closest('[aria-hidden="true"]')) out.push(`out of viewport: "${el.textContent.trim().slice(0, 40)}" [${Math.round(b.left)}–${Math.round(b.right)}]`)
      const cs = getComputedStyle(el)
      if (el.scrollWidth > el.clientWidth + 2 && cs.overflowX !== 'auto' && cs.overflowX !== 'scroll' && cs.textOverflow !== 'ellipsis' && el.tagName !== 'SELECT') out.push(`text overflow: "${el.textContent.trim().slice(0, 40)}" (${el.scrollWidth} > ${el.clientWidth})`)
    }
    if (lang === 'en' || lang === 'es' || lang === 'zh') {
      const txt = document.body.innerText.replace(/Русский|Қазақша|Вайбик/g, '')
      const m = txt.match(/[А-Яа-яЁё][^\n]{0,40}/)
      if (m) out.push(`кириллица на экране: «${m[0]}»`)
    }
    if (document.documentElement.lang.split("-")[0] !== lang) out.push(`<html lang="${document.documentElement.lang}">`)
    return out
  }, LANG)
  for (const x of r) issues.push(`${where}: ${x}`)
}

// ---------- урок и домашка (375)
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  watch(page, errors)
  await login(page)
  await dismissFirstRun(page)
  await audit(page, 'home 375')
  await page.evaluate(() => (location.hash = '/lesson/u1-1'))
  let shotDone = false
  const res = await playLesson(page, 'u1-1', {
    wrongAt: [1],
    hooks: {
      beforeCheck: async (ex, step) => {
        await audit(page, `u1-1 step ${step} (${ex.kind})`)
        if (shot && !shotDone && step === 0) {
          await page.screenshot({ path: shot })
          shotDone = true
        }
      },
    },
  })
  await audit(page, 'u1-1 complete')
  await page.locator('footer').getByRole('button', { name: L('Продолжить'), exact: true }).click()
  await page.waitForSelector('[data-lesson]')
  const done = await page.evaluate(() => JSON.parse(localStorage.getItem('vaibik.progress')).completed.includes('u1-1'))
  if (!done) issues.push('u1-1 не отмечен пройденным')
  console.log(`✓ [${LANG}] u1-1 ${res.lesson.title} — ${res.steps.join(' ')}`)
  await page.evaluate(() => (location.hash = '/homework/hw1'))
  const log = await playHomework(page, 'hw1', { vagueFirst: true, hooks: { beforeSubmit: () => audit(page, 'hw1 all done') } })
  await audit(page, 'hw1 complete')
  console.log(`✓ [${LANG}] hw1 — ${log.join(' ')}`)
  await ctx.close()
}

// ---------- ширины
for (const w of [320, 375, 1280]) {
  const mobile = w < 800
  const ctx = await browser.newContext(mobile ? { viewport: { width: w, height: 740 }, isMobile: true, hasTouch: true } : { viewport: { width: w, height: 800 } })
  const page = await ctx.newPage()
  watch(page, errors)
  await page.goto(BASE + '/#/')
  await page.evaluate((l) => {
    localStorage.clear()
    localStorage.setItem('vaibik.locale', l)
  }, LANG)
  await page.reload()
  await page.waitForSelector('h1')
  await page.evaluate(() => document.fonts.ready)
  await audit(page, `landing ${w}`)
  await login(page)
  await dismissFirstRun(page)
  for (const [hash, sel] of [['/learn', '[data-lesson]'], ['/lesson/u1-2', 'main h1'], ['/homework/hw1', '[data-homework]'], ['/profile', '[data-profile-tier]'], ['/leaderboard', 'main'], ['/quests', 'main']]) {
    await page.evaluate((h) => (location.hash = h), hash)
    await page.waitForSelector(sel, { timeout: 10000 }).catch(() => issues.push(`${hash} ${w}: не открылся`))
    await page.waitForTimeout(250)
    await audit(page, `${hash} ${w}`)
  }
  await ctx.close()
}

await browser.close()
console.log(issues.length ? 'ISSUES:\n' + [...new Set(issues)].join('\n') : 'No overflow/i18n issues')
console.log(errors.length ? 'CONSOLE ISSUES:\n' + errors.join('\n') : 'No console errors/warnings')
console.log('base', BASE, 'lang', LANG)
if (issues.length || errors.length) process.exitCode = 1
