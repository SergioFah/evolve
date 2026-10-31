import { useEffect, useRef, useState } from 'react'
import { startTone } from '../../lib/audio.ts'

const STRINGS = [
  { id: 's6', name: 'E', detail: '6ª corda · E2', freq: 82.41 },
  { id: 's5', name: 'A', detail: '5ª corda · A2', freq: 110 },
  { id: 's4', name: 'D', detail: '4ª corda · D3', freq: 146.83 },
  { id: 's3', name: 'G', detail: '3ª corda · G3', freq: 196 },
  { id: 's2', name: 'B', detail: '2ª corda · B3', freq: 246.94 },
  { id: 's1', name: 'E', detail: '1ª corda · E4', freq: 329.63 },
]

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

// Octave 3 (C3–B3), A4 = 440 Hz reference
const CHROMATIC = NOTE_NAMES.map((name, i) => ({
  id: `n${i}`,
  name,
  freq: 440 * 2 ** ((48 + i - 69) / 12),
}))

export function Tuner() {
  const [playing, setPlaying] = useState<string | null>(null)
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => () => stopRef.current?.(), [])

  const toggle = (id: string, freq: number) => {
    stopRef.current?.()
    stopRef.current = null
    if (playing === id) {
      setPlaying(null)
      return
    }
    stopRef.current = startTone(freq)
    setPlaying(id)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Afinador</h2>
        <p className="text-sm text-zinc-400">Toque numa corda para ouvir a nota de referência. Toque de novo para parar.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {STRINGS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id, s.freq)}
            className={`rounded-2xl p-4 text-center ring-1 transition active:scale-95 ${
              playing === s.id ? 'bg-amber-500 text-zinc-950 ring-amber-400' : 'bg-zinc-900 ring-white/5'
            }`}
          >
            <div className={`text-4xl font-semibold ${playing === s.id ? 'animate-pulse' : ''}`}>{s.name}</div>
            <div className={`mt-1 text-[11px] ${playing === s.id ? 'text-zinc-900' : 'text-zinc-500'}`}>{s.detail}</div>
          </button>
        ))}
      </div>

      <div>
        <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Todas as notas (oitava 3)</div>
        <div className="grid grid-cols-6 gap-1.5">
          {CHROMATIC.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => toggle(n.id, n.freq)}
              className={`rounded-xl py-3 text-sm font-medium ring-1 transition active:scale-95 ${
                playing === n.id ? 'bg-amber-500 text-zinc-950 ring-amber-400' : 'bg-zinc-900 ring-white/5'
              }`}
            >
              {n.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
