import { useState } from 'react'
import { Icon, IconButton } from '../../components/Icon.tsx'
import { unlockAudio } from '../../lib/audio.ts'
import { formatTime, move, uid } from '../../lib/data.ts'
import type { Cycle } from '../../types.ts'
import { MeditationSession } from './MeditationSession.tsx'

function toInt(value: string, max: number) {
  const n = Number.parseInt(value, 10)
  return Number.isNaN(n) ? 0 : Math.min(Math.max(n, 0), max)
}

export function Meditation({ cycles, onChange }: { cycles: Cycle[]; onChange: (cycles: Cycle[]) => void }) {
  const [running, setRunning] = useState(false)
  const total = cycles.reduce((sum, c) => sum + c.breathSeconds, 0)

  const edit = (id: string, patch: Partial<Cycle>) =>
    onChange(cycles.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const add = () => {
    const last = cycles.at(-1)
    onChange([...cycles, { id: uid(), name: `Ciclo ${cycles.length + 1}`, breathSeconds: last?.breathSeconds ?? 90 }])
  }

  const start = () => {
    unlockAudio()
    setRunning(true)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Wim Hof</h2>
        <p className="text-sm text-zinc-400">
          {cycles.length} {cycles.length === 1 ? 'ciclo' : 'ciclos'} · {formatTime(total * 1000)} de respiração
        </p>
      </div>

      <ul className="space-y-2">
        {cycles.map((c, i) => (
          <li key={c.id} className="rounded-2xl bg-zinc-900 p-3 ring-1 ring-white/5">
            <div className="flex items-center gap-1">
              <span className="mr-1 grid size-7 shrink-0 place-items-center rounded-full bg-cyan-500/15 text-sm font-semibold text-cyan-300">
                {i + 1}
              </span>
              <label className="flex min-w-0 flex-1 items-center gap-1.5 border-b border-dashed border-zinc-700 focus-within:border-cyan-400">
                <input
                  value={c.name}
                  onChange={(e) => edit(c.id, { name: e.target.value })}
                  placeholder="Nome do ciclo"
                  aria-label="Nome do ciclo"
                  className="min-w-0 flex-1 bg-transparent py-1 text-base font-medium outline-none placeholder:text-zinc-600"
                />
                <Icon name="pencil" className="size-4 shrink-0 text-zinc-500" />
              </label>
              <IconButton name="up" label="Subir" disabled={i === 0} onClick={() => onChange(move(cycles, i, -1))} />
              <IconButton
                name="down"
                label="Descer"
                disabled={i === cycles.length - 1}
                onClick={() => onChange(move(cycles, i, 1))}
              />
              <IconButton
                name="x"
                label="Remover ciclo"
                className="hover:text-rose-400"
                onClick={() => onChange(cycles.filter((x) => x.id !== c.id))}
              />
            </div>
            <div className="mt-2 flex items-center gap-2 pl-9 text-sm text-zinc-400">
              <span className="mr-auto">Respiração</span>
              <input
                type="number"
                inputMode="numeric"
                aria-label="Minutos"
                value={Math.floor(c.breathSeconds / 60)}
                onChange={(e) => edit(c.id, { breathSeconds: toInt(e.target.value, 59) * 60 + (c.breathSeconds % 60) })}
                className="field w-14 text-center"
              />
              min
              <input
                type="number"
                inputMode="numeric"
                aria-label="Segundos"
                value={c.breathSeconds % 60}
                onChange={(e) =>
                  edit(c.id, { breathSeconds: Math.floor(c.breathSeconds / 60) * 60 + toInt(e.target.value, 59) })
                }
                className="field w-14 text-center"
              />
              s
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={add}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-700 py-3 text-zinc-400 active:bg-white/5"
      >
        <Icon name="plus" /> Adicionar ciclo
      </button>

      <button
        type="button"
        onClick={start}
        disabled={cycles.length === 0 || total === 0}
        className="w-full rounded-2xl bg-cyan-500 py-4 text-lg font-semibold text-zinc-950 transition active:scale-[0.98] disabled:opacity-30"
      >
        Começar
      </button>

      {running && <MeditationSession cycles={cycles} onExit={() => setRunning(false)} />}
    </div>
  )
}
