import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../components/Icon.tsx'
import { useCountdown } from '../../hooks/useCountdown.ts'
import { useWakeLock } from '../../hooks/useWakeLock.ts'
import { playExerciseCue } from '../../lib/audio.ts'
import { formatTime, vibrate } from '../../lib/data.ts'
import type { WorkoutStep } from '../../types.ts'

type Phase = 'work' | 'rest' | 'done'
type Item = { step: number; set: number; exercise: number }

// Flattens steps into the exact order they are performed: supersets alternate exercises within each set
function buildSequence(steps: WorkoutStep[]): Item[] {
  return steps.flatMap((s, step) =>
    Array.from({ length: s.sets }, (_, set) => s.exercises.map((_, exercise) => ({ step, set, exercise }))).flat(),
  )
}

export function WorkoutSession({ title, steps, onExit }: { title: string; steps: WorkoutStep[]; onExit: () => void }) {
  // Snapshot so edits synced from another device can't reshape a running workout
  const [plan] = useState(steps)
  const items = useMemo(() => buildSequence(plan), [plan])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>(items.length ? 'work' : 'done')
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(startedAt)
  const [finishedAt, setFinishedAt] = useState<number | null>(null)
  const rest = useCountdown(() => {
    playExerciseCue()
    vibrate([300, 150, 300])
    setIndex((i) => i + 1)
    setPhase('work')
  })

  useWakeLock(phase !== 'done')

  useEffect(() => {
    if (phase === 'done') return
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [phase])

  const item = items[Math.min(index, items.length - 1)]
  const step = item ? plan[item.step] : undefined
  const next = items[index + 1]
  const elapsed = Math.floor(((finishedAt ?? now) - startedAt) / 1000) * 1000
  const completed = index + (phase === 'rest' ? 1 : 0)
  const progress = phase === 'done' ? 100 : (completed / items.length) * 100
  const totalSets = items.length

  const nameOf = (it: Item) => plan[it.step].exercises[it.exercise].name.trim() || `Exercício ${it.exercise + 1}`

  const finishSet = () => {
    if (!next || !step) {
      setFinishedAt(Date.now())
      setPhase('done')
      return
    }
    if (step.restSeconds <= 0) {
      setIndex(index + 1)
      return
    }
    setPhase('rest')
    rest.start(step.restSeconds * 1000)
  }

  const skipRest = () => {
    rest.stop()
    setIndex(index + 1)
    setPhase('work')
  }

  const exit = () => {
    if (phase === 'done' || confirm('Encerrar o treino?')) onExit()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0b0b0f] px-6"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)', paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
    >
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">
          {title} · <span className="tabular-nums text-zinc-100">{formatTime(elapsed)}</span>
        </span>
        <button type="button" onClick={exit} className="rounded-full px-3 py-1.5 text-sm text-zinc-400 active:bg-white/10">
          Encerrar
        </button>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      {item && phase !== 'done' && (
        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>
            Passo {item.step + 1} de {plan.length}
          </span>
          <span>
            {plan.length - item.step === 1 ? 'último passo' : `faltam ${plan.length - item.step} passos`}
          </span>
        </div>
      )}

      {phase === 'work' && item && step && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          {step.exercises.length > 1 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {step.exercises.map((ex, j) => (
                <span
                  key={ex.id}
                  className={`rounded-full px-3 py-1 text-xs ring-1 ${
                    j === item.exercise ? 'bg-emerald-500 font-semibold text-zinc-950 ring-emerald-400' : 'text-zinc-500 ring-white/10'
                  }`}
                >
                  {ex.name.trim() || `Exercício ${j + 1}`}
                </span>
              ))}
            </div>
          )}
          <h2 className="text-4xl font-bold leading-tight">{nameOf(item)}</h2>
          <div className="text-xl text-emerald-300">
            Série {item.set + 1} de {step.sets}
          </div>
          <button
            type="button"
            onClick={finishSet}
            className="mt-4 w-full max-w-xs rounded-2xl bg-emerald-500 py-5 text-lg font-semibold text-zinc-950 active:scale-[0.98]"
          >
            {next ? 'Concluí a série' : 'Finalizar treino'}
          </button>
          {next && (
            <p className="text-sm text-zinc-500">
              A seguir: {nameOf(next)} · série {next.set + 1}
            </p>
          )}
        </div>
      )}

      {phase === 'rest' && next && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="text-sm uppercase tracking-widest text-zinc-500">Descanso</div>
          <div className="text-8xl font-light tabular-nums">{formatTime(rest.remaining)}</div>
          <div>
            <div className="text-sm text-zinc-500">A seguir</div>
            <div className="text-2xl font-semibold">{nameOf(next)}</div>
            <div className="text-emerald-300">
              Série {next.set + 1} de {plan[next.step].sets}
              {next.step !== item?.step && ' · novo passo'}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => rest.start(rest.remaining + 15_000)}
              className="rounded-full bg-white/10 px-6 py-3 font-medium active:scale-95"
            >
              +15s
            </button>
            <button
              type="button"
              onClick={skipRest}
              className="flex items-center gap-2 rounded-full px-5 py-3 text-zinc-400 active:bg-white/10"
            >
              <Icon name="skip" /> Pular
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="grid size-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
            <Icon name="check" className="size-10" />
          </div>
          <h2 className="text-3xl font-semibold">Treino concluído</h2>
          <div className="text-5xl font-light tabular-nums">{formatTime(elapsed)}</div>
          <p className="text-zinc-400">
            {plan.length} {plan.length === 1 ? 'passo' : 'passos'} · {totalSets} séries
          </p>
          <button
            type="button"
            onClick={onExit}
            className="mt-4 w-full max-w-xs rounded-2xl bg-white/10 py-4 text-lg font-medium active:scale-[0.98]"
          >
            Voltar
          </button>
        </div>
      )}
    </div>
  )
}
