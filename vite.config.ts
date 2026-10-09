import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'

// Версия для отзывов и отчётов об ошибках: package.json + короткий коммит (Vercel отдаёт его при сборке)
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }
const sha = (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7)
const appVersion = sha ? `${pkg.version}+${sha}` : pkg.version

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { __APP_VERSION__: JSON.stringify(appVersion) },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
})
