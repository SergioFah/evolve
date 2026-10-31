export type Cycle = {
  id: string
  name: string
  breathSeconds: number
}

export type TaskType = 'mecanica' | 'teoria' | 'repertorio'

export type GuitarTask = {
  id: string
  name: string
  minutes: number
  type: TaskType
  notes: string
}

export type DayKey = 'A' | 'B'

export type MetronomeSettings = {
  bpm: number
  beats: number
  subdivision: number
}

export type AppData = {
  meditation: { cycles: Cycle[] }
  guitar: Record<DayKey, GuitarTask[]>
  metronome: MetronomeSettings
}
