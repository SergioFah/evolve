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

export type Exercise = {
  id: string
  name: string
}

// One exercise = single; two or more = superset, alternated set by set
export type WorkoutStep = {
  id: string
  exercises: Exercise[]
  sets: number
  restSeconds: number
}

export type AppData = {
  meditation: { cycles: Cycle[] }
  guitar: Record<DayKey, GuitarTask[]>
  metronome: MetronomeSettings
  calisthenics: Record<DayKey, WorkoutStep[]>
}
