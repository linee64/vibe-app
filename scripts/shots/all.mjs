// Все скриншоты веб-приложения по очереди: node scripts/shots/all.mjs [baseUrl]
// Нужен запущенный сайт (npm run dev или npm run preview). Результат — .artifacts/screenshots/.
// Мобильные снимки (Expo web) — отдельно: npm run shots:mobile -- [baseUrl].
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const base = process.argv[2] || 'http://localhost:5173'
const mobile = process.argv.includes('--mobile')
const list = mobile ? ['mobile-feedback', 'mobile-i18n'] : ['app', 'landing', 'pricing', 'path', 'homework', 'exercises', 'feedback', 'i18n']
const args = mobile ? process.argv.slice(2).filter((a) => a !== '--mobile') : [base]

let failed = 0
for (const name of list) {
  const file = fileURLToPath(new URL(`./${name}.mjs`, import.meta.url))
  console.log(`\n▶ shots/${name}.mjs`)
  const r = spawnSync(process.execPath, [file, ...args], { stdio: 'inherit' })
  if (r.status !== 0) failed++
}
process.exit(failed ? 1 : 0)
