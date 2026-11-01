import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/Icon.tsx'
import { useCountdown } from '../../hooks/useCountdown.ts'
import { useWakeLock } from '../../hooks/useWakeLock.ts'
import { playMeditationCue } from '../../lib/audio.ts'
import { formatTime, vibrate } from '../../lib/data.ts'
import type { Cycle } from '../../types.ts'

type Phase = 'breath' | 'retention' | 'done'

export function MeditationSession({ cycles, onExit }: { cycles: Cycle[]; onExit: () => void }) {
  // Snapshot so edits synced from another device can't reshape a running session
  const [plan] = useState(cycles)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('breath')
  const timer = useCountdown(() => {
    playMeditationCue()
    vibrate([400, 200, 400])
    setPhase('retention')
  })
  const started = useRef(false)
  const cycle = plan[index]
  const isLast = index === plan.length - 1

  useWakeLock(phase !== 'done')

  useEffect(() => {
    if (started.current) return
    started.current = true
    timer.start(plan[0].breathSeconds * 1000)
  }, [timer, plan])

  const next = () => {
    if (isLast) {
      setPhase('done')
      return
    }
    setIndex(index + 1)
    setPhase('breath')
    timer.start(plan[index + 1].breathSeconds * 1000)
  }

  const skipBreath = () => {
    timer.stop()
    setPhase('retention')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0b0b0f] px-6"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)', paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
    >
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">
          {phase === 'done' ? 'Fim' : `Ciclo ${index + 1} de ${plan.length}`}
        </span>
        <button type="button" onClick={onExit} className="rounded-full px-3 py-1.5 text-sm text-zinc-400 active:bg-white/10">
          Encerrar
        </button>
      </div>

      {phase === 'breath' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-10">
          <h2 className="text-center text-2xl font-semibold">{cycle.name || `Ciclo ${index + 1}`}</h2>
          <div className="relative grid size-72 place-items-center">
            <div
              className="absolute inset-0 animate-breathe rounded-full bg-gradient-to-br from-cyan-400/40 to-indigo-500/30 shadow-[0_0_80px_rgba(34,211,238,0.25)]"
              style={{ animationPlayState: timer.running ? 'running' : 'paused' }}
            />
            <div className="relative text-center">
              <div className="text-6xl font-light tabular-nums">{formatTime(timer.remaining)}</div>
              <div className="mt-1 text-sm text-cyan-200/80">{timer.running ? 'Respire' : 'Pausado'}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => (timer.running ? timer.pause() : timer.start(timer.remaining))}
              className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-medium active:scale-95"
            >
              <Icon name={timer.running ? 'pause' : 'play'} />
              {timer.running ? 'Pausar' : 'Continuar'}
            </button>
            <button
              type="button"
              onClick={skipBreath}
              className="flex items-center gap-2 rounded-full px-5 py-3 text-zinc-400 active:bg-white/10"
            >
              <Icon name="skip" /> Pular
            </button>
          </div>
        </div>
      )}

      {phase === 'retention' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="size-40 rounded-full bg-gradient-to-br from-indigo-500/25 to-cyan-400/10 ring-1 ring-white/10" />
          <h2 className="text-4xl font-semibold">Retenção</h2>
          <p className="max-w-xs text-zinc-400">Solte o ar e segure sem pressa. Quando precisar respirar, toque abaixo.</p>
          <button
            type="button"
            onClick={next}
            className="mt-4 w-full max-w-xs rounded-2xl bg-cyan-500 py-4 text-lg font-semibold text-zinc-950 active:scale-[0.98]"
          >
            {isLast ? 'Finalizar' : 'Próximo ciclo'}
          </button>
          {!isLast && <p className="text-sm text-zinc-500">A seguir: {plan[index + 1].name || `Ciclo ${index + 2}`}</p>}
        </div>
      )}

      {phase === 'done' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="grid size-20 place-items-center rounded-full bg-cyan-500/15 text-cyan-300">
            <Icon name="check" className="size-10" />
          </div>
          <h2 className="text-3xl font-semibold">Sessão concluída</h2>
          <p className="text-zinc-400">
            {plan.length} {plan.length === 1 ? 'ciclo' : 'ciclos'} completos
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
