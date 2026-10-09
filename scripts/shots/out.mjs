// Куда пишут скрипты скриншотов: <repo>/.artifacts/screenshots/ (папка в .gitignore).
// Переопределить: SHOTS_DIR=/abs/path node scripts/shots/<скрипт>.mjs
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const fallback = fileURLToPath(new URL('../../.artifacts/screenshots/', import.meta.url))
export const OUT = (process.env.SHOTS_DIR || fallback).replace(/\/?$/, '/')
mkdirSync(OUT, { recursive: true })
