// Рендер звуков Вайбика в файлы для мобильного приложения: npx jiti scripts/sounds/render.ts
// Источник — синтезатор src/data/sfx.ts (веб играет его прямо в браузере). Нужен ffmpeg с libmp3lame.
// Результат: mobile/assets/sounds/<name>.mp3 (моно, 44.1 кГц, ~96 кбит/с, каждый файл < 30 КБ).
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { SFX_NAMES, renderSfx } from '../../src/data/sfx'

const SR = 44100
const out = new URL('../../mobile/assets/sounds/', import.meta.url).pathname
const keepWav = process.argv.includes('--wav')
mkdirSync(out, { recursive: true })
const tmp = mkdtempSync(join(tmpdir(), 'vaibik-sfx-'))

function wav(samples: Float32Array) {
  const data = Buffer.alloc(samples.length * 2)
  samples.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2))
  const h = Buffer.alloc(44)
  h.write('RIFF', 0)
  h.writeUInt32LE(36 + data.length, 4)
  h.write('WAVE', 8)
  h.write('fmt ', 12)
  h.writeUInt32LE(16, 16)
  h.writeUInt16LE(1, 20)
  h.writeUInt16LE(1, 22)
  h.writeUInt32LE(SR, 24)
  h.writeUInt32LE(SR * 2, 28)
  h.writeUInt16LE(2, 32)
  h.writeUInt16LE(16, 34)
  h.write('data', 36)
  h.writeUInt32LE(data.length, 40)
  return Buffer.concat([h, data])
}

for (const name of SFX_NAMES) {
  const samples = renderSfx(name, SR)
  const w = join(keepWav ? out : tmp, `${name}.wav`)
  writeFileSync(w, wav(samples))
  const mp3 = join(out, `${name}.mp3`)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', w, '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '96k', '-map_metadata', '-1', mp3])
  const kb = statSync(mp3).size / 1024
  console.log(`${name}.mp3  ${(samples.length / SR).toFixed(2)} s  ${kb.toFixed(1)} KB`)
  if (kb > 30) {
    console.error(`  ✗ ${name}.mp3 больше 30 КБ`)
    process.exitCode = 1
  }
}
rmSync(tmp, { recursive: true, force: true })
