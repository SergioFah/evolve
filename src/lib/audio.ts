// All sounds are synthesized with Web Audio, so the app needs no audio files and works offline

let ctx: AudioContext | null = null
let toneWave: PeriodicWave | null = null

function audio() {
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

const SOUND_FILES = {
  meditation: `${import.meta.env.BASE_URL}meditation.mp3`,
  exercise: `${import.meta.env.BASE_URL}exercise.mp3`,
}

const buffers = new Map<string, Promise<AudioBuffer | null>>()

function loadSound(url: string) {
  let buffer = buffers.get(url)
  if (!buffer) {
    const ac = audio()
    buffer = fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.statusText))))
      .then((data) => ac.decodeAudioData(data))
      .catch(() => null)
    buffers.set(url, buffer)
  }
  return buffer
}

// Falls back to the synthesized sound if the file is missing or can't be decoded
async function playFile(url: string, fallback: () => void) {
  const buffer = await loadSound(url)
  if (!buffer) return fallback()
  const ac = audio()
  const source = ac.createBufferSource()
  source.buffer = buffer
  source.connect(ac.destination)
  source.start()
}

// Android only allows audio after a user gesture: call this from a click handler.
// Also preloads the sound files so the first cue plays without delay.
export function unlockAudio() {
  audio()
  for (const url of Object.values(SOUND_FILES)) void loadSound(url)
}

// End of a breathing phase
export function playMeditationCue() {
  void playFile(SOUND_FILES.meditation, playGong)
}

// End of a rest period
export function playExerciseCue() {
  void playFile(SOUND_FILES.exercise, playBeep)
}

// Singing-bowl style bell: inharmonic partials with long decays
export function playGong() {
  const ac = audio()
  const t = ac.currentTime
  const master = ac.createGain()
  master.gain.value = 0.5
  master.connect(ac.destination)
  const partials: [ratio: number, amp: number, decay: number][] = [
    [1, 1, 6],
    [2.76, 0.5, 4],
    [5.4, 0.25, 2.5],
    [8.93, 0.12, 1.5],
  ]
  for (const [ratio, amp, decay] of partials) {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.frequency.value = 196 * ratio
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(amp, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    osc.connect(gain).connect(master)
    osc.start(t)
    osc.stop(t + decay + 0.1)
  }
}

export function playBeep() {
  const ac = audio()
  const t = ac.currentTime
  for (let i = 0; i < 3; i++) {
    const start = t + i * 0.3
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.4, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18)
    osc.connect(gain).connect(ac.destination)
    osc.start(start)
    osc.stop(start + 0.2)
  }
}

export function audioTime() {
  return audio().currentTime
}

// Metronome tick scheduled ahead on the audio clock. level: 2 = bar accent, 1 = beat, 0 = subdivision
export function scheduleClick(time: number, level: 0 | 1 | 2) {
  const ac = audio()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.frequency.value = [800, 1000, 1600][level]
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime([0.2, 0.5, 0.8][level], time + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05)
  osc.connect(gain).connect(ac.destination)
  osc.start(time)
  osc.stop(time + 0.06)
}

let chordWave: PeriodicWave | null = null

// Piano-like chord: all notes start together and fade out naturally. volume: 0-1
export function playChord(freqs: number[], volume: number) {
  const ac = audio()
  chordWave ??= ac.createPeriodicWave(new Float32Array(7), Float32Array.from([0, 1, 0.5, 0.3, 0.15, 0.08, 0.04]))
  const t = ac.currentTime
  const master = ac.createGain()
  master.gain.value = (volume * 0.6) / freqs.length
  master.connect(ac.destination)
  for (const freq of freqs) {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.setPeriodicWave(chordWave)
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(1, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5)
    osc.connect(gain).connect(master)
    osc.start(t)
    osc.stop(t + 2.6)
  }
}

// Sustained reference note; harmonics keep low strings audible on phone speakers
export function startTone(freq: number) {
  const ac = audio()
  toneWave ??= ac.createPeriodicWave(new Float32Array(6), Float32Array.from([0, 1, 0.7, 0.45, 0.3, 0.2]))
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.setPeriodicWave(toneWave)
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(0.3, t + 0.05)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  return () => {
    const now = ac.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(0, now + 0.08)
    osc.stop(now + 0.1)
  }
}
