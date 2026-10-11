/**
 * Звуки в вебе: синтезируем буферы из src/data/sfx.ts прямо в браузере (Web Audio API) —
 * ни одного аудиофайла в бандле. Настройка «Звуки» (вкл/выкл) хранится в localStorage, по умолчанию — вкл.
 * Всё молча отключается, если Web Audio недоступен или браузер не дал запустить звук.
 */
import { useSyncExternalStore } from 'react'
import { renderSfx, type SfxName } from '../data/sfx'

export type { SfxName }

export const SOUND_STORAGE_KEY = 'vaibik.sound'
const VOLUME = 0.55

const listeners = new Set<() => void>()

function readEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

let enabled = typeof window === 'undefined' ? true : readEnabled()

export const isSoundOn = () => enabled

export function setSoundOn(on: boolean) {
  enabled = on
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    /* приватный режим — живём без сохранения */
  }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  const onStorage = (e: StorageEvent) => {
    if (e.key === SOUND_STORAGE_KEY) {
      enabled = readEnabled()
      l()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', onStorage)
  }
}

/** Включены ли звуки; компонент перерисуется при переключении (в т.ч. из другой вкладки) */
export const useSoundOn = () => useSyncExternalStore(subscribe, isSoundOn, () => true)

type Ctx = AudioContext
let ctx: Ctx | null = null
let master: GainNode | null = null
const buffers = new Map<SfxName, AudioBuffer>()

function audio(): Ctx | null {
  if (ctx) return ctx
  // до первого жеста пользователя браузер не даст запустить звук (и ругнётся в консоль) — ждём клика
  const ua = typeof navigator !== 'undefined' ? (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation : undefined
  if (ua && !ua.hasBeenActive) return null
  const AC = typeof window !== 'undefined' ? (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) : undefined
  if (!AC) return null
  try {
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = VOLUME
    master.connect(ctx.destination)
  } catch {
    ctx = null
  }
  return ctx
}

function buffer(c: Ctx, name: SfxName): AudioBuffer {
  let b = buffers.get(name)
  if (!b) {
    const data = renderSfx(name, c.sampleRate)
    b = c.createBuffer(1, data.length, c.sampleRate)
    b.copyToChannel(data as Float32Array<ArrayBuffer>, 0)
    buffers.set(name, b)
  }
  return b
}

/** Последний сыгранный звук — для скриптов проверки (window.__vaibikLastSound) */
function mark(name: SfxName) {
  if (typeof window !== 'undefined') (window as unknown as { __vaibikLastSound?: string }).__vaibikLastSound = name
}

/** Сыграть звук, если звуки включены. Безопасно вызывать откуда угодно. */
export function playSound(name: SfxName) {
  if (!enabled) return
  const c = audio()
  if (!c || !master) return
  try {
    if (c.state === 'suspended') void c.resume()
    const src = c.createBufferSource()
    src.buffer = buffer(c, name)
    src.connect(master)
    src.start()
    mark(name)
  } catch {
    /* звук — украшение, не ломаем урок */
  }
}
