/**
 * Звуки в мобильном приложении (expo-audio). Те же звуки, что в вебе: их синтезирует src/data/sfx.ts,
 * а scripts/sounds/render.ts кладёт готовые mp3 в assets/sounds. Настройка «Звуки» — в AsyncStorage,
 * по умолчанию включены; беззвучный режим iPhone уважаем (playsInSilentMode: false), чужую музыку не глушим.
 */
import { useSyncExternalStore } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { SfxName } from '@web/data/sfx'

export const SOUND_STORAGE_KEY = 'vaibik.sound'

const SOURCES: Record<SfxName, number> = {
  correct: require('../../assets/sounds/correct.mp3'),
  wrong: require('../../assets/sounds/wrong.mp3'),
  complete: require('../../assets/sounds/complete.mp3'),
  levelup: require('../../assets/sounds/levelup.mp3'),
}

let enabled = true
const listeners = new Set<() => void>()
void AsyncStorage.getItem(SOUND_STORAGE_KEY)
  .then((v) => {
    enabled = v !== 'off'
    listeners.forEach((l) => l())
  })
  .catch(() => {})

export const isSoundOn = () => enabled
export function setSoundOn(on: boolean) {
  enabled = on
  void AsyncStorage.setItem(SOUND_STORAGE_KEY, on ? 'on' : 'off').catch(() => {})
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}
export const useSoundOn = () => useSyncExternalStore(subscribe, isSoundOn, isSoundOn)

type Player = { play(): void; seekTo(s: number): Promise<void> | void; volume: number }
let audio: Promise<typeof import('expo-audio') | null> | null = null
const players = new Map<SfxName, Player>()

function load() {
  audio ??= import('expo-audio')
    .then(async (A) => {
      await A.setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false }).catch(() => {})
      return A
    })
    .catch(() => null)
  return audio
}

/** Сыграть звук, если звуки включены. Ошибки глотаем: звук — украшение. */
export function playSound(name: SfxName) {
  if (!enabled) return
  void load().then((A) => {
    if (!A) return
    try {
      let p = players.get(name)
      if (!p) {
        p = A.createAudioPlayer(SOURCES[name]) as unknown as Player
        p.volume = 0.7
        players.set(name, p)
      }
      void p.seekTo(0)
      p.play()
    } catch {
      /* нет аудио (симулятор, веб без жеста) — молчим */
    }
  })
}
