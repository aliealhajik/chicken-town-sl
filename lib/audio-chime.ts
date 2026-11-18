/**
 * Chicken Town SL - Audio Chime Synthesizer
 * Uses Web Audio API to create a crisp, pleasant dual-tone alert chime (D5 -> A5)
 * for incoming orders, status changes, and kitchen alerts.
 * 100% self-contained with no external audio file dependencies.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // AudioContext could not resume automatically without user gesture
    })
  }

  return audioCtx
}

export interface ChimeOptions {
  volume?: number // 0.0 to 1.0
  tone1Freq?: number // Default: 587.33 (D5)
  tone2Freq?: number // Default: 880.00 (A5)
  duration?: number // seconds
}

export function playOrderChime(options: ChimeOptions = {}) {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const volume = options.volume ?? 0.4
    const tone1Freq = options.tone1Freq ?? 587.33 // D5
    const tone2Freq = options.tone2Freq ?? 880.0 // A5

    const now = ctx.currentTime

    // ── First Note: D5 ──
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(tone1Freq, now)

    // Quick attack, gentle bell ring decay
    gain1.gain.setValueAtTime(0.001, now)
    gain1.gain.exponentialRampToValueAtTime(volume, now + 0.02)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)

    osc1.start(now)
    osc1.stop(now + 0.5)

    // ── Second Note: A5 (Higher Bell Chime) ──
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(tone2Freq, now + 0.15)

    gain2.gain.setValueAtTime(0.001, now + 0.15)
    gain2.gain.exponentialRampToValueAtTime(volume * 0.9, now + 0.17)
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.85)

    osc2.connect(gain2)
    gain2.connect(ctx.destination)

    osc2.start(now + 0.15)
    osc2.stop(now + 0.9)
  } catch (err) {
    console.warn('Web Audio chime could not be played:', err)
  }
}

/**
 * Urgent double alert chime for late orders or kitchen rush
 */
export function playUrgentChime() {
  playOrderChime({ tone1Freq: 659.25, tone2Freq: 987.77, volume: 0.55 })
  setTimeout(() => {
    playOrderChime({ tone1Freq: 659.25, tone2Freq: 987.77, volume: 0.55 })
  }, 350)
}
