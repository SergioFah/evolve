import { useState } from 'react'
import { Icon } from '../../components/Icon.tsx'
import { useCountdown } from '../../hooks/useCountdown.ts'
import { useWakeLock } from '../../hooks/useWakeLock.ts'
import { playBeep, unlockAudio } from '../../lib/audio.ts'
import { move, uid, vibrate } from '../../lib/data.ts'
import type { GuitarTask } from '../../types.ts'
import { TaskRow } from './TaskRow.tsx'

export function DayList({
  title,
  tasks,
  onChange,
}: {
  title: string
  tasks: GuitarTask[]
  onChange: (tasks: GuitarTask[]) => void
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [doneIds, setDoneIds] = useState<string[]>([])
  const timer = useCountdown(() => {
    playBeep()
    vibrate([300, 150, 300, 150, 300])
    if (activeId) setDoneIds((d) => [...d, activeId])
    setActiveId(null)
  })
  const totalMinutes = tasks.reduce((sum, t) => sum + t.minutes, 0)

  useWakeLock(timer.running)

  const patch = (id: string, change: Partial<GuitarTask>) =>
    onChange(tasks.map((t) => (t.id === id ? { ...t, ...change } : t)))

  const add = () => {
    const task: GuitarTask = { id: uid(), name: '', minutes: 10, type: 'mecanica', notes: '' }
    onChange([...tasks, task])
    setEditingId(task.id)
  }

  const remove = (task: GuitarTask) => {
    if (!confirm(`Excluir "${task.name || 'Nova tarefa'}"?`)) return
    if (activeId === task.id) stop()
    onChange(tasks.filter((t) => t.id !== task.id))
    setEditingId(null)
  }

  const play = (task: GuitarTask) => {
    unlockAudio()
    setDoneIds((d) => d.filter((id) => id !== task.id))
    if (activeId === task.id && timer.remaining > 0) {
      timer.start(timer.remaining)
      return
    }
    setActiveId(task.id)
    timer.start(task.minutes * 60_000)
  }

  const stop = () => {
    timer.stop()
    setActiveId(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <span className="text-sm text-zinc-400">
          {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'} · {totalMinutes} min
        </span>
      </div>

      {tasks.length === 0 && (
        <p className="rounded-2xl bg-zinc-900/60 p-6 text-center text-sm text-zinc-500">
          Nenhuma tarefa ainda. Adicione a primeira abaixo.
        </p>
      )}

      <ul className="space-y-2">
        {tasks.map((task, i) => (
          <TaskRow
            key={task.id}
            task={task}
            isFirst={i === 0}
            isLast={i === tasks.length - 1}
            editing={editingId === task.id}
            done={doneIds.includes(task.id)}
            timer={{
              active: activeId === task.id,
              running: activeId === task.id && timer.running,
              remaining: activeId === task.id ? timer.remaining : 0,
            }}
            onEdit={() => setEditingId(task.id)}
            onCloseEdit={() => setEditingId(null)}
            onChange={(change) => patch(task.id, change)}
            onMove={(delta) => onChange(move(tasks, i, delta))}
            onDelete={() => remove(task)}
            onPlay={() => play(task)}
            onPause={timer.pause}
            onStop={stop}
          />
        ))}
      </ul>

      <button
        type="button"
        onClick={add}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-700 py-3 text-zinc-400 active:bg-white/5"
      >
        <Icon name="plus" /> Adicionar tarefa
      </button>
    </div>
  )
}
