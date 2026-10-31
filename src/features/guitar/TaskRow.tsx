import { Icon, IconButton } from '../../components/Icon.tsx'
import { formatTime, TASK_TYPES } from '../../lib/data.ts'
import type { GuitarTask, TaskType } from '../../types.ts'

export type RowTimer = { active: boolean; running: boolean; remaining: number }

type Props = {
  task: GuitarTask
  isFirst: boolean
  isLast: boolean
  editing: boolean
  done: boolean
  timer: RowTimer
  onEdit: () => void
  onCloseEdit: () => void
  onChange: (patch: Partial<GuitarTask>) => void
  onMove: (delta: number) => void
  onDelete: () => void
  onPlay: () => void
  onPause: () => void
  onStop: () => void
}

function TypeChip({ type }: { type: TaskType }) {
  const t = TASK_TYPES[type] ?? TASK_TYPES.mecanica
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${t.chip}`}>{t.label}</span>
}

export function TaskRow(p: Props) {
  const { task, timer } = p

  if (p.editing) {
    const setMinutes = (m: number) => p.onChange({ minutes: Math.min(Math.max(Math.round(m) || 0, 0), 180) })
    return (
      <li className="space-y-3 rounded-2xl bg-zinc-900 p-3 ring-1 ring-amber-500/40">
        <input
          autoFocus={!task.name}
          value={task.name}
          onChange={(e) => p.onChange({ name: e.target.value })}
          placeholder="Nome da tarefa"
          className="field w-full text-base font-medium"
        />
        <div className="flex gap-2">
          {(Object.keys(TASK_TYPES) as TaskType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => p.onChange({ type })}
              className={`flex-1 rounded-full py-1.5 text-sm ring-1 transition ${
                task.type === type ? TASK_TYPES[type].chip : 'text-zinc-500 ring-white/10'
              }`}
            >
              {TASK_TYPES[type].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="mr-auto">Tempo</span>
          <IconButton name="down" label="Menos 1 minuto" onClick={() => setMinutes(task.minutes - 1)} />
          <input
            type="number"
            inputMode="numeric"
            aria-label="Minutos"
            value={task.minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="field w-16 text-center"
          />
          <IconButton name="up" label="Mais 1 minuto" onClick={() => setMinutes(task.minutes + 1)} />
          min
        </div>
        <textarea
          value={task.notes}
          onChange={(e) => p.onChange({ notes: e.target.value })}
          placeholder="Observação (BPM, exercício, música…)"
          rows={3}
          className="field w-full resize-none"
        />
        <div className="flex items-center gap-1">
          <IconButton name="up" label="Mover para cima" disabled={p.isFirst} onClick={() => p.onMove(-1)} />
          <IconButton name="down" label="Mover para baixo" disabled={p.isLast} onClick={() => p.onMove(1)} />
          <IconButton name="trash" label="Excluir tarefa" className="hover:text-rose-400" onClick={p.onDelete} />
          <button
            type="button"
            onClick={p.onCloseEdit}
            className="ml-auto rounded-full bg-amber-500 px-6 py-2 font-semibold text-zinc-950 active:scale-95"
          >
            OK
          </button>
        </div>
      </li>
    )
  }

  const total = task.minutes * 60_000
  const progress = timer.active && total > 0 ? ((total - timer.remaining) / total) * 100 : 0

  return (
    <li className={`rounded-2xl bg-zinc-900 ring-1 transition ${timer.active ? 'ring-amber-500/50' : 'ring-white/5'}`}>
      <div className="flex items-start gap-3 p-3">
        <button
          type="button"
          aria-label={timer.running ? 'Pausar' : 'Iniciar'}
          disabled={task.minutes <= 0}
          onClick={timer.running ? p.onPause : p.onPlay}
          className={`grid size-11 shrink-0 place-items-center rounded-full transition active:scale-90 disabled:opacity-30 ${
            p.done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500 text-zinc-950'
          }`}
        >
          <Icon name={timer.running ? 'pause' : p.done ? 'check' : 'play'} />
        </button>
        <button type="button" onClick={p.onEdit} className="min-w-0 flex-1 text-left">
          <div className="flex items-baseline gap-2">
            <span className={`truncate font-medium ${task.name ? '' : 'text-zinc-500'}`}>{task.name || 'Nova tarefa'}</span>
            <span className="ml-auto shrink-0 text-sm tabular-nums text-zinc-400">{task.minutes} min</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <TypeChip type={task.type} />
            {p.done && <span className="text-xs text-emerald-400">feito</span>}
          </div>
          {task.notes && <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-sm text-zinc-400">{task.notes}</p>}
        </button>
      </div>
      {timer.active && (
        <div className="flex items-center gap-3 border-t border-white/5 px-3 py-2">
          <span className="w-20 text-3xl font-light tabular-nums">{formatTime(timer.remaining)}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-amber-500 transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
          <IconButton name="stop" label="Parar" onClick={p.onStop} />
        </div>
      )}
    </li>
  )
}
