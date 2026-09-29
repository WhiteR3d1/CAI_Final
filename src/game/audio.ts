// Tiny Web Audio synth for UI feedback and the in-game "test sound".
let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', peak = 0.12) {
  const c = audio()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  const t = c.currentTime + start
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

export type SoundName = 'chime' | 'coin' | 'error' | 'click' | 'success'

export function playSound(name: SoundName) {
  switch (name) {
    case 'chime':
      tone(523.25, 0, 0.5)
      tone(659.25, 0.15, 0.5)
      tone(783.99, 0.3, 0.8)
      break
    case 'coin':
      tone(987.77, 0, 0.12, 'square', 0.05)
      tone(1318.51, 0.08, 0.3, 'square', 0.05)
      break
    case 'error':
      tone(196, 0, 0.25, 'triangle', 0.1)
      tone(155.56, 0.12, 0.35, 'triangle', 0.1)
      break
    case 'click':
      tone(880, 0, 0.05, 'triangle', 0.04)
      break
    case 'success':
      tone(659.25, 0, 0.18)
      tone(880, 0.12, 0.4)
      break
  }
}
