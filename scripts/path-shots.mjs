// Скриншоты пути из 5 разделов и уроков разделов 4–5 (20…25-*.png):
// node scripts/path-shots.mjs [baseUrl]
import { chromium } from 'playwright'
import { BASE, watch, login, playLesson, openLessonFromPath } from './lib/solver.mjs'
import { unlockAll } from './lib/vibe.mjs'

const OUT = new URL('../screenshots/', import.meta.url).pathname
const errors = []
const browser = await chromium.launch()

const save = async (page, name, opts = {}) => {
  await page.waitForTimeout(500)
  await page.screenshot({ path: OUT + name, ...opts })
  console.log('saved', name)
}

/** Прокрутить так, чтобы баннер раздела был у верхнего края */
async function scrollToUnit(page, unitId, offset = 0) {
  await page.evaluate(
    ([id, off]) => {
      document.documentElement.style.scrollBehavior = 'auto'
      // обёртка баннера: на десктопе она уже включает отступ 20px сверху
      const wrap = document.getElementById(`unit-${id}`)
      window.scrollTo(0, wrap.getBoundingClientRect().top + window.scrollY - off)
    },
    [unitId, offset],
  )
}

async function noOverflow(page, where) {
  const w = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
  if (w[0] > w[1]) errors.push(`[overflow] ${where}: ${w[0]} > ${w[1]}`)
}

// ---------- Desktop ----------
const desk = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 })
const p = await desk.newPage()
watch(p, errors)
await login(p)
await unlockAll(p) // тиры 2–3 закрыты по умолчанию — для скриншотов открываем всё (демо)
await noOverflow(p, 'desktop home')

// Урок раздела 4: «Ключи и секреты» — снимок баг-упражнения после верного ответа
await openLessonFromPath(p, 'u4-4')
let r = await playLesson(p, 'u4-4', {
  hooks: {
    afterCheck: async (ex, step, wrong) => {
      if (ex.kind === 'bug' && !wrong) await save(p, '23-lesson-level4.png')
    },
  },
})
console.log('played u4-4:', r.steps.join(' '))
await p.getByText(/^(Урок пройден!|Безупречно!)$/).waitFor()
await p.locator('footer').getByRole('button', { name: 'Продолжить', exact: true }).click()
await p.waitForSelector('[data-lesson]')
await p.waitForTimeout(400)
await scrollToUnit(p, 'u4')
await save(p, '21-path-level4.png')
// попап «будущего» урока: открыт, можно начать сразу
await p.locator('[data-lesson="u4-5"] > div > button').click()
await save(p, '21b-path-level4-popover.png')
await p.keyboard.press('Escape')

// Урок раздела 5: «Деплой на Vercel»
await openLessonFromPath(p, 'u5-2')
r = await playLesson(p, 'u5-2', {
  hooks: {
    afterCheck: async (ex, step, wrong) => {
      if (ex.kind === 'bug' && !wrong) await save(p, '24-lesson-level5.png')
    },
  },
})
console.log('played u5-2:', r.steps.join(' '))
await p.locator('footer').getByRole('button', { name: 'Продолжить', exact: true }).click()
await p.waitForSelector('[data-lesson]')
await p.waitForTimeout(400)
await scrollToUnit(p, 'u5')
await save(p, '22-path-level5.png')

const progress = await p.evaluate(() => JSON.parse(localStorage.getItem('vaibik.progress')))
console.log('completed after plays:', progress.completed.join(', '), '| ВП', progress.xp)

// Полный путь (1x, чтобы файл был разумного размера)
const full = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, storageState: await desk.storageState() })
const f = await full.newPage()
watch(f, errors)
await f.goto(BASE + '/#/learn')
await f.waitForSelector('[data-lesson]')
await f.evaluate(() => document.fonts.ready)
await save(f, '20-path-overview.png', { fullPage: true })

// ---------- Mobile ----------
const mob = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const m = await mob.newPage()
watch(m, errors)
await login(m)
await unlockAll(m)
await noOverflow(m, 'mobile home')
await save(m, '25-path-mobile.png')
await scrollToUnit(m, 'u4', 62)
await noOverflow(m, 'mobile level 4')
await save(m, '25b-path-mobile-level4.png')
await scrollToUnit(m, 'u5', 62)
await save(m, '25c-path-mobile-level5.png')
await openLessonFromPath(m, 'u5-4')
await playLesson(m, 'u5-4', {
  hooks: {
    afterCheck: async (ex) => {
      if (ex.kind === 'duel') {
        await m.evaluate(() => document.querySelector('main').scrollTo(0, 0))
        await save(m, '25d-lesson-mobile-level5.png')
      }
    },
  },
})
await noOverflow(m, 'mobile lesson complete')

await browser.close()
console.log(errors.length ? 'CONSOLE/LAYOUT ISSUES:\n' + errors.join('\n') : 'No console errors/warnings, no overflow')
