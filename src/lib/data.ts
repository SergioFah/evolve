import type { AppData, TaskType } from '../types.ts'

// crypto.randomUUID only exists on HTTPS, and the dev server is opened over plain HTTP on the LAN
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function defaultData(): AppData {
  return {
    meditation: {
      cycles: [1, 2, 3].map((n) => ({ id: uid(), name: `Ciclo ${n}`, breathSeconds: 90 })),
    },
    guitar: { A: [], B: [] },
    metronome: { bpm: 80, beats: 4, subdivision: 1 },
    calisthenics: { A: [], B: [] },
  }
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(Number.isFinite(n) ? n : min, min), max)
}

// Guards against old or partial documents coming from storage or the cloud
export function normalize(raw: unknown): AppData {
  const r = (raw ?? {}) as Partial<AppData>
  const cycles = r.meditation?.cycles
  const a = r.guitar?.A
  const b = r.guitar?.B
  const m = r.metronome
  const ca = r.calisthenics?.A
  const cb = r.calisthenics?.B
  return {
    meditation: { cycles: Array.isArray(cycles) ? cycles : defaultData().meditation.cycles },
    guitar: { A: Array.isArray(a) ? a : [], B: Array.isArray(b) ? b : [] },
    metronome: {
      bpm: clamp(Number(m?.bpm ?? 80), 30, 300),
      beats: clamp(Number(m?.beats ?? 4), 1, 7),
      subdivision: clamp(Number(m?.subdivision ?? 1), 1, 4),
    },
    calisthenics: { A: Array.isArray(ca) ? ca : [], B: Array.isArray(cb) ? cb : [] },
  }
}

export const TASK_TYPES: Record<TaskType, { label: string; chip: string }> = {
  mecanica: { label: 'Mecânica', chip: 'bg-rose-500/15 text-rose-300 ring-rose-500/30' },
  teoria: { label: 'Teoria', chip: 'bg-sky-500/15 text-sky-300 ring-sky-500/30' },
  repertorio: { label: 'Repertório', chip: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30' },
}

export function formatTime(ms: number) {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta
  if (target < 0 || target >= list.length) return list
  const next = [...list]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}

export function vibrate(pattern: number[]) {
  navigator.vibrate?.(pattern)
}
