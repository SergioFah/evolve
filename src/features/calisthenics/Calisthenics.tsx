import { useState } from 'react'
import { Icon, IconButton } from '../../components/Icon.tsx'
import { unlockAudio } from '../../lib/audio.ts'
import { clamp, formatTime, move, uid } from '../../lib/data.ts'
import { readString, writeString } from '../../lib/storage.ts'
import type { DayKey, WorkoutStep } from '../../types.ts'
import { WorkoutSession } from './WorkoutSession.tsx'

const VIEW_KEY = 'evolve:calisthenicsDay'
const LETTERS = 'ABCDEFGH'

export function Calisthenics({
  days,
  onChange,
}: {
  days: Record<DayKey, WorkoutStep[]>
  onChange: (day: DayKey, steps: WorkoutStep[]) => void
}) {
  const [day, setDay] = useState<DayKey>(() => (readString(VIEW_KEY) === 'B' ? 'B' : 'A'))
  const [running, setRunning] = useState(false)
  // Only inputs created by a tap get focus, so the keyboard never pops up on page load
  const [focusId, setFocusId] = useState<string | null>(null)
  const steps = days[day]
  const totalSets = steps.reduce((sum, s) => sum + s.sets * s.exercises.length, 0)

  const save = (next: WorkoutStep[]) => onChange(day, next)
  const patch = (id: string, change: Partial<WorkoutStep>) =>
    save(steps.map((s) => (s.id === id ? { ...s, ...change } : s)))

  const selectDay = (d: DayKey) => {
    setDay(d)
    writeString(VIEW_KEY, d)
  }

  const addStep = () => {
    const exercise = { id: uid(), name: '' }
    const last = steps.at(-1)
    save([...steps, { id: uid(), exercises: [exercise], sets: last?.sets ?? 3, restSeconds: last?.restSeconds ?? 60 }])
    setFocusId(exercise.id)
  }

  const addExercise = (step: WorkoutStep) => {
    const exercise = { id: uid(), name: '' }
    patch(step.id, { exercises: [...step.exercises, exercise] })
    setFocusId(exercise.id)
  }

  const removeStep = (step: WorkoutStep, index: number) => {
    if (confirm(`Excluir o passo ${index + 1}?`)) save(steps.filter((s) => s.id !== step.id))
  }

  const start = () => {
    unlockAudio()
    setRunning(true)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-zinc-900 p-1 ring-1 ring-white/5">
        {(['A', 'B'] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => selectDay(d)}
            className={`rounded-xl py-2 text-sm font-medium transition ${
              day === d ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 active:bg-white/5'
            }`}
          >
            Dia {d}
          </button>
        ))}
      </div>

      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold">Dia {day}</h2>
        <span className="text-sm text-zinc-400">
          {steps.length} {steps.length === 1 ? 'passo' : 'passos'} · {totalSets} séries
        </span>
      </div>

      {steps.length === 0 && (
        <p className="rounded-2xl bg-zinc-900/60 p-6 text-center text-sm text-zinc-500">
          Nenhum passo ainda. Cada passo pode ter um exercício ou vários (superset).
        </p>
      )}

      <ul className="space-y-2">
        {steps.map((step, i) => {
          const superset = step.exercises.length > 1
          const setExercises = (exercises: WorkoutStep['exercises']) => patch(step.id, { exercises })
          return (
            <li key={step.id} className="rounded-2xl bg-zinc-900 p-3 ring-1 ring-white/5">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-emerald-300">Passo {i + 1}</span>
                {superset && (
                  <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300 ring-1 ring-emerald-500/30">
                    Superset · {step.exercises.length}
                  </span>
                )}
                <span className="mr-auto" />
                <IconButton name="up" label="Subir passo" disabled={i === 0} onClick={() => save(move(steps, i, -1))} />
                <IconButton
                  name="down"
                  label="Descer passo"
                  disabled={i === steps.length - 1}
                  onClick={() => save(move(steps, i, 1))}
                />
                <IconButton name="trash" label="Excluir passo" className="hover:text-rose-400" onClick={() => removeStep(step, i)} />
              </div>

              <div className="mt-1 space-y-1.5">
                {step.exercises.map((ex, j) => (
                  <div key={ex.id} className="flex items-center gap-2">
                    {superset && <span className="w-4 text-center text-xs font-semibold text-zinc-500">{LETTERS[j]}</span>}
                    <input
                      autoFocus={ex.id === focusId}
                      value={ex.name}
                      onChange={(e) =>
                        setExercises(step.exercises.map((x) => (x.id === ex.id ? { ...x, name: e.target.value } : x)))
                      }
                      placeholder="Nome do exercício"
                      aria-label="Nome do exercício"
                      className="field min-w-0 flex-1 text-base"
                    />
                    {superset && (
                      <IconButton
                        name="x"
                        label="Remover exercício"
                        onClick={() => setExercises(step.exercises.filter((x) => x.id !== ex.id))}
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addExercise(step)}
                className="mt-2 flex items-center gap-1 rounded-lg px-1 py-1 text-sm text-emerald-300 active:bg-white/5"
              >
                <Icon name="plus" className="size-4" />
                {superset ? 'Adicionar ao superset' : 'Fazer superset'}
              </button>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Stepper
                  label="Séries"
                  display={`${step.sets}x`}
                  onDec={() => patch(step.id, { sets: clamp(step.sets - 1, 1, 20) })}
                  onInc={() => patch(step.id, { sets: clamp(step.sets + 1, 1, 20) })}
                />
                <Stepper
                  label="Descanso"
                  display={formatTime(step.restSeconds * 1000)}
                  onDec={() => patch(step.id, { restSeconds: clamp(step.restSeconds - 15, 0, 600) })}
                  onInc={() => patch(step.id, { restSeconds: clamp(step.restSeconds + 15, 0, 600) })}
                />
              </div>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={addStep}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-700 py-3 text-zinc-400 active:bg-white/5"
      >
        <Icon name="plus" /> Adicionar passo
      </button>

      <button
        type="button"
        onClick={start}
        disabled={steps.length === 0}
        className="w-full rounded-2xl bg-emerald-500 py-4 text-lg font-semibold text-zinc-950 transition active:scale-[0.98] disabled:opacity-30"
      >
        Iniciar treino
      </button>

      {running && <WorkoutSession title={`Dia ${day}`} steps={steps} onExit={() => setRunning(false)} />}
    </div>
  )
}

function Stepper({ label, display, onDec, onInc }: { label: string; display: string; onDec: () => void; onInc: () => void }) {
  return (
    <div className="rounded-xl bg-zinc-800/60 px-1 py-1">
      <div className="text-center text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="flex items-center justify-between">
        <IconButton name="minus" label={`Diminuir ${label}`} onClick={onDec} />
        <span className="font-semibold tabular-nums">{display}</span>
        <IconButton name="plus" label={`Aumentar ${label}`} onClick={onInc} />
      </div>
    </div>
  )
}
