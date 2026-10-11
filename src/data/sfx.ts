/**
 * Звуки Вайбика — свой синтезатор, без сэмплов и чужих файлов (лицензия не нужна: звук рождается из формул).
 * Характер — «синти / lo-fi терминал», а не колокольчики:
 *   correct  — «компиляция прошла»: клик клавиши + чирп-свип вверх + битовый «✓»;
 *   wrong    — мягкий «глитч»: заикающийся отфильтрованный пилообразный bzzt вниз;
 *   complete — «деплой запущен»: зажигание (саб-удар), восходящее арпеджио с открывающимся фильтром и вжух ракеты;
 *   levelup  — стингер нового тира: свип-аккорд суперпилы и «искры» сверху.
 *
 * Чистая функция без DOM: веб рендерит буфер прямо в браузере (src/lib/sound.ts),
 * мобильное приложение получает те же звуки готовыми mp3 (scripts/sounds/render.ts → mobile/assets/sounds).
 */

export type SfxName = 'correct' | 'wrong' | 'complete' | 'levelup'
export const SFX_NAMES: SfxName[] = ['correct', 'wrong', 'complete', 'levelup']

type Wave = 'sine' | 'tri' | 'square' | 'saw'

const TAU = Math.PI * 2
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

/** Детерминированный шум (xorshift) — звук одинаковый при каждом рендере */
function noiseGen(seed = 0x9e3779b9) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s >>>= 0
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return (s / 0xffffffff) * 2 - 1
  }
}

/** PolyBLEP — сглаживает разрывы пилы и меандра, чтобы не было «цифрового песка» на высоких нотах */
function blep(t: number, dt: number) {
  if (t < dt) {
    t /= dt
    return t + t - t * t - 1
  }
  if (t > 1 - dt) {
    t = (t - 1) / dt
    return t * t + t + t + 1
  }
  return 0
}

interface ToneOpts {
  at: number
  dur: number
  freq: number
  /** частота, к которой скользит тон (портаменто) */
  to?: number
  /** время скольжения, с */
  glide?: number
  wave?: Wave
  /** скважность меандра */
  pw?: number
  gain?: number
  attack?: number
  /** постоянная экспоненциального затухания, с */
  decay?: number
  detune?: number
  vibRate?: number
  vibDepth?: number
}

class Canvas {
  readonly buf: Float32Array
  readonly sr: number
  constructor(sr: number, seconds: number) {
    this.sr = sr
    this.buf = new Float32Array(Math.ceil(sr * seconds))
  }

  /** Отрисовать тон в отдельный буфер (для своего фильтра) или сразу в общий */
  tone(o: ToneOpts, into: Float32Array = this.buf) {
    const { sr } = this
    const wave = o.wave ?? 'sine'
    const start = Math.floor(o.at * sr)
    const n = Math.floor(o.dur * sr)
    const attack = Math.max(1, Math.floor((o.attack ?? 0.004) * sr))
    const release = Math.max(1, Math.floor(0.012 * sr))
    const decay = o.decay ?? o.dur
    const gain = o.gain ?? 0.3
    const pw = o.pw ?? 0.5
    const det = Math.pow(2, (o.detune ?? 0) / 1200)
    let phase = 0
    for (let i = 0; i < n && start + i < into.length; i++) {
      const t = i / sr
      let f = o.freq
      if (o.to !== undefined) {
        const g = Math.min(1, t / (o.glide ?? o.dur))
        f = o.freq * Math.pow(o.to / o.freq, 1 - Math.pow(1 - g, 2))
      }
      if (o.vibRate) f *= 1 + (o.vibDepth ?? 0.01) * Math.sin(TAU * o.vibRate * t)
      f *= det
      const dt = f / sr
      let v: number
      switch (wave) {
        case 'sine':
          v = Math.sin(TAU * phase)
          break
        case 'tri':
          v = 1 - 4 * Math.abs(phase - 0.5)
          break
        case 'saw':
          v = 2 * phase - 1 - blep(phase, dt)
          break
        case 'square': {
          v = phase < pw ? 1 : -1
          v += blep(phase, dt)
          v -= blep((phase + 1 - pw) % 1, dt)
          break
        }
      }
      let env = Math.exp(-t / decay)
      if (i < attack) env *= i / attack
      if (n - i < release) env *= (n - i) / release
      into[start + i] += v * env * gain
      phase += dt
      if (phase >= 1) phase -= 1
    }
  }

  /** Шумовая вспышка (клик, вжух) */
  noise(at: number, dur: number, gain: number, shape: (x: number) => number, into: Float32Array = this.buf, seed?: number) {
    const rnd = noiseGen(seed)
    const start = Math.floor(at * this.sr)
    const n = Math.floor(dur * this.sr)
    for (let i = 0; i < n && start + i < into.length; i++) into[start + i] += rnd() * gain * shape(i / n)
  }

  layer() {
    return new Float32Array(this.buf.length)
  }

  mix(src: Float32Array, gain = 1) {
    for (let i = 0; i < src.length; i++) this.buf[i] += src[i] * gain
  }
}

/** Фильтр с переменной частотой среза (state variable, Chamberlin) — in-place */
function svf(buf: Float32Array, sr: number, cutoff: (t: number) => number, q = 0.7, mode: 'lp' | 'bp' | 'hp' = 'lp') {
  let low = 0
  let band = 0
  const damp = 1 / q
  for (let i = 0; i < buf.length; i++) {
    const fc = Math.min(cutoff(i / sr), sr / 6)
    const f = 2 * Math.sin((Math.PI * fc) / sr)
    // два прохода на сэмпл — устойчивее на высоких частотах
    let out = 0
    for (let k = 0; k < 2; k++) {
      low += f * band
      const high = buf[i] - low - damp * band
      band += f * high
      out = mode === 'lp' ? low : mode === 'bp' ? band : high
    }
    buf[i] = out
  }
  return buf
}

/** Lo-fi: понижение разрядности и частоты (sample & hold) */
function crush(buf: Float32Array, bits: number, hold: number) {
  const steps = Math.pow(2, bits - 1)
  let held = 0
  for (let i = 0; i < buf.length; i++) {
    if (i % hold === 0) held = Math.round(buf[i] * steps) / steps
    buf[i] = held
  }
  return buf
}

function finish(buf: Float32Array, sr: number, peak = 0.82) {
  let max = 0
  for (let i = 0; i < buf.length; i++) {
    buf[i] = Math.tanh(buf[i] * 1.2)
    max = Math.max(max, Math.abs(buf[i]))
  }
  const k = max > 0 ? peak / max : 1
  const fade = Math.floor(0.004 * sr)
  for (let i = 0; i < buf.length; i++) {
    let g = k
    if (i < fade) g *= i / fade
    if (buf.length - i < fade * 4) g *= (buf.length - i) / (fade * 4)
    buf[i] *= g
  }
  return buf
}

/* ------------------------------------------------------------------ сами звуки */

function correct(sr: number) {
  const c = new Canvas(sr, 0.42)
  // «клик клавиши Enter»
  const click = c.layer()
  c.noise(0, 0.012, 0.5, (x) => 1 - x, click, 7)
  c.mix(svf(click, sr, () => 4200, 1.4, 'hp'), 0.5)
  // чирп-свип вверх, битовый
  const chirp = c.layer()
  c.tone({ at: 0.008, dur: 0.11, freq: midi(72), to: midi(84), glide: 0.06, wave: 'square', pw: 0.3, gain: 0.32, decay: 0.07 }, chirp)
  c.mix(svf(crush(svf(chirp, sr, (t) => 2500 + t * 20000, 0.9), 7, 3), sr, () => 6500, 0.7))
  // «✓»: мягкий треугольник с быстрым вибрато-«мерцанием»
  c.tone({ at: 0.085, dur: 0.3, freq: midi(91), wave: 'tri', gain: 0.22, decay: 0.09, vibRate: 28, vibDepth: 0.006 })
  c.tone({ at: 0.085, dur: 0.3, freq: midi(79), wave: 'sine', gain: 0.12, decay: 0.12 })
  return finish(c.buf, sr, 0.7)
}

function wrong(sr: number) {
  const c = new Canvas(sr, 0.34)
  const buzz = c.layer()
  for (const det of [-14, 9]) c.tone({ at: 0, dur: 0.3, freq: 150, to: 92, glide: 0.26, wave: 'saw', gain: 0.28, decay: 0.16, detune: det, attack: 0.003 }, buzz)
  // «заикание»: гейт с провалами — звучит как сбой, а не как сирена
  const gate = [
    [0, 0.055],
    [0.072, 0.115],
    [0.13, 0.3],
  ]
  for (let i = 0; i < buzz.length; i++) {
    const t = i / sr
    if (!gate.some(([a, b]) => t >= a && t < b)) buzz[i] *= 0.08
  }
  svf(buzz, sr, (t) => 1500 - t * 2600, 1.6)
  c.mix(svf(crush(buzz, 6, 3), sr, () => 2400, 0.7))
  // цифровые «искорки» глитча
  const sparks = c.layer()
  c.noise(0.055, 0.02, 0.35, (x) => 1 - x, sparks, 3)
  c.noise(0.115, 0.016, 0.3, (x) => 1 - x, sparks, 11)
  c.mix(svf(sparks, sr, () => 2600, 2, 'bp'), 0.35)
  return finish(c.buf, sr, 0.62)
}

function complete(sr: number) {
  const c = new Canvas(sr, 1.45)
  // зажигание: саб-удар
  c.tone({ at: 0, dur: 0.22, freq: 72, to: 42, glide: 0.18, wave: 'sine', gain: 0.55, decay: 0.09, attack: 0.002 })
  // восходящее арпеджио (D-лидийский), суперпила через открывающийся фильтр
  const arp = c.layer()
  const notes = [62, 66, 69, 73, 74, 76, 78, 81]
  notes.forEach((n, i) => {
    for (const det of [-8, 0, 8]) c.tone({ at: 0.04 + i * 0.062, dur: 0.32, freq: midi(n), wave: 'saw', gain: 0.075, decay: 0.12, detune: det }, arp)
  })
  c.mix(svf(arp, sr, (t) => 600 + Math.min(1, t / 0.6) * 5200, 1.1))
  // вжух ракеты: шум через полосовой фильтр, который уходит вверх
  const whoosh = c.layer()
  c.noise(0.3, 0.85, 0.5, (x) => Math.sin(Math.PI * Math.min(1, x * 1.6)) * (1 - x * 0.6), whoosh, 23)
  c.mix(svf(whoosh, sr, (t) => (t < 0.3 ? 300 : 300 + Math.pow((t - 0.3) / 0.85, 1.6) * 4200), 2.2, 'bp'), 0.55)
  // «в сети»: мягкий аккорд-подушка с лёгким вибрато
  for (const [n, g] of [
    [74, 0.11],
    [81, 0.08],
    [86, 0.05],
  ] as const)
    c.tone({ at: 0.58, dur: 0.85, freq: midi(n), wave: 'tri', gain: g, decay: 0.38, attack: 0.03, vibRate: 5.5, vibDepth: 0.004 })
  return finish(c.buf, sr, 0.78)
}

function levelup(sr: number) {
  const c = new Canvas(sr, 1.3)
  c.tone({ at: 0, dur: 0.3, freq: 90, to: 45, glide: 0.25, wave: 'sine', gain: 0.5, decay: 0.12, attack: 0.002 })
  // свип-аккорд Cmaj9 — фильтр распахивается и закрывается
  const stab = c.layer()
  for (const n of [60, 64, 67, 71, 74]) for (const det of [-10, 10]) c.tone({ at: 0.02, dur: 0.9, freq: midi(n), wave: 'saw', gain: 0.06, decay: 0.35, detune: det, attack: 0.01 }, stab)
  c.mix(svf(stab, sr, (t) => (t < 0.22 ? 350 + (t / 0.22) * 4200 : Math.max(500, 4550 - (t - 0.22) * 5000)), 1.3))
  // искры: быстрые ноты пентатоники вверх
  const sparkle = [76, 79, 81, 84, 86, 88, 91, 93, 96, 98]
  sparkle.forEach((n, i) => c.tone({ at: 0.24 + i * 0.045, dur: 0.16, freq: midi(n), wave: 'tri', gain: 0.1 - i * 0.005, decay: 0.05 }))
  const air = c.layer()
  c.noise(0.2, 0.6, 0.2, (x) => Math.sin(Math.PI * x), air, 41)
  c.mix(svf(air, sr, (t) => 1800 + t * 3000, 1.5, 'bp'), 0.22)
  return finish(c.buf, sr, 0.78)
}

const RENDERERS: Record<SfxName, (sr: number) => Float32Array> = { correct, wrong, complete, levelup }

/** Сырой звук (моно, −1…1) */
export function renderSfx(name: SfxName, sampleRate = 44100): Float32Array {
  return RENDERERS[name](sampleRate)
}
