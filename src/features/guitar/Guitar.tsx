import { useState } from 'react'
import { readString, writeString } from '../../lib/storage.ts'
import type { DayKey, GuitarTask, MetronomeSettings } from '../../types.ts'
import { CircleOfFifths } from './CircleOfFifths.tsx'
import { DayList } from './DayList.tsx'
import { Metronome } from './Metronome.tsx'
import { Tuner } from './Tuner.tsx'

type View = DayKey | 'metronomo' | 'quintas' | 'afinador'

const VIEWS: { id: View; label: string }[] = [
  { id: 'A', label: 'Dia A' },
  { id: 'B', label: 'Dia B' },
  { id: 'metronomo', label: 'Metrônomo' },
  { id: 'quintas', label: 'Quintas' },
  { id: 'afinador', label: 'Afinador' },
]

const VIEW_KEY = 'evolve:guitarView'

export function Guitar({
  days,
  onChange,
  metronome,
  onMetronomeChange,
}: {
  days: Record<DayKey, GuitarTask[]>
  onChange: (day: DayKey, tasks: GuitarTask[]) => void
  metronome: MetronomeSettings
  onMetronomeChange: (settings: MetronomeSettings) => void
}) {
  const [ticking, setTicking] = useState(false)
  const [view, setView] = useState<View>(() => {
    const saved = readString(VIEW_KEY)
    return VIEWS.some((v) => v.id === saved) ? (saved as View) : 'A'
  })

  const select = (v: View) => {
    setView(v)
    writeString(VIEW_KEY, v)
  }

  return (
    <div className="space-y-4">
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
        <div className="flex w-max gap-1 rounded-2xl bg-zinc-900 p-1 ring-1 ring-white/5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => select(v.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                view === v.id ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 active:bg-white/5'
              }`}
            >
              {v.label}
              {v.id === 'metronomo' && ticking && (
                <span className={`size-1.5 animate-pulse rounded-full ${view === v.id ? 'bg-zinc-950' : 'bg-amber-400'}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Days and metronome stay mounted so timers and clicks keep running while switching views */}
      {(['A', 'B'] as const).map((day) => (
        <div key={day} hidden={view !== day}>
          <DayList title={`Dia ${day}`} tasks={days[day]} onChange={(tasks) => onChange(day, tasks)} />
        </div>
      ))}
      <div hidden={view !== 'metronomo'}>
        <Metronome settings={metronome} onChange={onMetronomeChange} onPlayingChange={setTicking} />
      </div>
      {view === 'quintas' && <CircleOfFifths />}
      {view === 'afinador' && <Tuner />}
    </div>
  )
}
