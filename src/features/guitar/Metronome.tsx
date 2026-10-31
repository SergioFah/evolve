import { useEffect, useRef, useState } from 'react'
import { Icon, IconButton } from '../../components/Icon.tsx'
import { useWakeLock } from '../../hooks/useWakeLock.ts'
import { audioTime, scheduleClick, unlockAudio } from '../../lib/audio.ts'
import { clamp } from '../../lib/data.ts'
import type { MetronomeSettings } from '../../types.ts'

const MIN_BPM = 30
const MAX_BPM = 300
const BEAT_OPTIONS = [1, 2, 3, 4, 5, 6, 7]
const SUBDIVISIONS = [
  { value: 1, symbol: '♩', label: 'Semínima' },
  { value: 2, symbol: '♫', label: 'Colcheia' },
  { value: 3, symbol: '3', label: 'Tercina' },
  { value: 4, symbol: '♬', label: 'Semicolcheia' },
]

// Lookahead scheduler: a coarse JS timer queues clicks slightly ahead on the precise audio clock
const LOOKAHEAD_S = 0.12
const TIMER_MS = 25

export function Metronome({
  settings,
  onChange,
  onPlayingChange,
}: {
  settings: MetronomeSettings
  onChange: (settings: MetronomeSettings) => void
  onPlayingChange: (playing: boolean) => void
}) {
  const [playing, setPlaying] = useState(false)
  const [beat, setBeat] = useState(-1)
  const settingsRef = useRef(settings)
  const taps = useRef<number[]>([])

  useWakeLock(playing)

  useEffect(() => {
    settingsRef.current = settings
  })

  useEffect(() => {
    if (!playing) return
    let next = audioTime() + 0.06
    let tick = 0
    const pending = new Set<number>()
    const id = setInterval(() => {
      const { bpm, beats, subdivision } = settingsRef.current
      const now = audioTime()
      while (next < now + LOOKAHEAD_S) {
        const pos = tick % (beats * subdivision)
        const onBeat = pos % subdivision === 0
        scheduleClick(next, pos === 0 && beats > 1 ? 2 : onBeat ? 1 : 0)
        if (onBeat) {
          const b = pos / subdivision
          const t = window.setTimeout(() => {
            pending.delete(t)
            setBeat(b)
          }, (next - now) * 1000)
          pending.add(t)
        }
        next += 60 / bpm / subdivision
        tick++
      }
    }, TIMER_MS)
    return () => {
      clearInterval(id)
      pending.forEach(clearTimeout)
    }
  }, [playing])

  const toggle = () => {
    unlockAudio()
    setBeat(-1)
    setPlaying(!playing)
    onPlayingChange(!playing)
  }

  const setBpm = (bpm: number) => onChange({ ...settings, bpm: clamp(Math.round(bpm), MIN_BPM, MAX_BPM) })

  const tap = () => {
    const now = performance.now()
    const last = taps.current.at(-1)
    taps.current = last && now - last < 2000 ? [...taps.current, now].slice(-5) : [now]
    const t = taps.current
    if (t.length < 2) return
    setBpm(60000 / ((t[t.length - 1] - t[0]) / (t.length - 1)))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Metrônomo</h2>

      <div className="flex justify-center gap-3">
        {Array.from({ length: settings.beats }, (_, i) => (
          <span
            key={i}
            className={`rounded-full transition-colors duration-75 ${i === 0 && settings.beats > 1 ? 'size-6' : 'size-4 self-center'} ${
              playing && beat === i ? (i === 0 ? 'bg-amber-400' : 'bg-amber-500/80') : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>

      <div className="text-center">
        <div className="text-7xl font-light tabular-nums">{settings.bpm}</div>
        <div className="text-sm tracking-widest text-zinc-500">BPM</div>
      </div>

      <div className="flex items-center gap-2">
        <IconButton name="down" label="Menos 1 BPM" onClick={() => setBpm(settings.bpm - 1)} className="bg-zinc-900" />
        <input
          type="range"
          aria-label="BPM"
          min={MIN_BPM}
          max={MAX_BPM}
          value={settings.bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="h-2 flex-1 accent-amber-500"
        />
        <IconButton name="up" label="Mais 1 BPM" onClick={() => setBpm(settings.bpm + 1)} className="bg-zinc-900" />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={toggle}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-lg font-semibold active:scale-[0.98] ${
            playing ? 'bg-white/10 text-zinc-100' : 'bg-amber-500 text-zinc-950'
          }`}
        >
          <Icon name={playing ? 'stop' : 'play'} />
          {playing ? 'Parar' : 'Tocar'}
        </button>
        <button
          type="button"
          onClick={tap}
          className="w-28 rounded-2xl bg-zinc-900 py-4 font-semibold text-zinc-300 ring-1 ring-white/5 active:scale-95 active:bg-zinc-800"
        >
          Tap
        </button>
      </div>

      <div>
        <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Tempos por compasso</div>
        <div className="grid grid-cols-7 gap-1.5">
          {BEAT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...settings, beats: n })}
              className={`rounded-xl py-2.5 font-medium ring-1 transition ${
                settings.beats === n ? 'bg-amber-500 text-zinc-950 ring-amber-400' : 'bg-zinc-900 ring-white/5'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Subdivisão</div>
        <div className="grid grid-cols-4 gap-1.5">
          {SUBDIVISIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange({ ...settings, subdivision: s.value })}
              className={`rounded-xl py-2 ring-1 transition ${
                settings.subdivision === s.value ? 'bg-amber-500 text-zinc-950 ring-amber-400' : 'bg-zinc-900 ring-white/5'
              }`}
            >
              <div className="text-xl leading-tight">{s.symbol}</div>
              <div className={`text-[10px] ${settings.subdivision === s.value ? 'text-zinc-900' : 'text-zinc-500'}`}>
                {s.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
