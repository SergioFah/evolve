export type Key = {
  major: string
  minor: string
  majorFull: string
  minorFull: string
  accidentals: string
  scale: string[]
}

export const KEYS: Key[] = [
  { major: 'C', minor: 'Am', majorFull: 'Dó maior (C)', minorFull: 'Am', accidentals: 'sem acidentes', scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  { major: 'G', minor: 'Em', majorFull: 'Sol maior (G)', minorFull: 'Em', accidentals: '1 sustenido', scale: ['G', 'A', 'B', 'C', 'D', 'E', 'F♯'] },
  { major: 'D', minor: 'Bm', majorFull: 'Ré maior (D)', minorFull: 'Bm', accidentals: '2 sustenidos', scale: ['D', 'E', 'F♯', 'G', 'A', 'B', 'C♯'] },
  { major: 'A', minor: 'F♯m', majorFull: 'Lá maior (A)', minorFull: 'F♯m', accidentals: '3 sustenidos', scale: ['A', 'B', 'C♯', 'D', 'E', 'F♯', 'G♯'] },
  { major: 'E', minor: 'C♯m', majorFull: 'Mi maior (E)', minorFull: 'C♯m', accidentals: '4 sustenidos', scale: ['E', 'F♯', 'G♯', 'A', 'B', 'C♯', 'D♯'] },
  { major: 'B', minor: 'G♯m', majorFull: 'Si maior (B)', minorFull: 'G♯m', accidentals: '5 sustenidos', scale: ['B', 'C♯', 'D♯', 'E', 'F♯', 'G♯', 'A♯'] },
  { major: 'F♯', minor: 'D♯m', majorFull: 'Fá♯ maior (F♯ / G♭)', minorFull: 'D♯m / E♭m', accidentals: '6 sustenidos ou 6 bemóis', scale: ['F♯', 'G♯', 'A♯', 'B', 'C♯', 'D♯', 'E♯'] },
  { major: 'D♭', minor: 'B♭m', majorFull: 'Ré♭ maior (D♭)', minorFull: 'B♭m', accidentals: '5 bemóis', scale: ['D♭', 'E♭', 'F', 'G♭', 'A♭', 'B♭', 'C'] },
  { major: 'A♭', minor: 'Fm', majorFull: 'Lá♭ maior (A♭)', minorFull: 'Fm', accidentals: '4 bemóis', scale: ['A♭', 'B♭', 'C', 'D♭', 'E♭', 'F', 'G'] },
  { major: 'E♭', minor: 'Cm', majorFull: 'Mi♭ maior (E♭)', minorFull: 'Cm', accidentals: '3 bemóis', scale: ['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D'] },
  { major: 'B♭', minor: 'Gm', majorFull: 'Si♭ maior (B♭)', minorFull: 'Gm', accidentals: '2 bemóis', scale: ['B♭', 'C', 'D', 'E♭', 'F', 'G', 'A'] },
  { major: 'F', minor: 'Dm', majorFull: 'Fá maior (F)', minorFull: 'Dm', accidentals: '1 bemol', scale: ['F', 'G', 'A', 'B♭', 'C', 'D', 'E'] },
]

const LETTER_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

/** Pitch class (0-11) of a note name like "F♯", "B♭", "E♯". */
export function pitchClass(note: string) {
  let pc = LETTER_PC[note[0]]
  for (const ch of note.slice(1)) {
    if (ch === '♯') pc += 1
    if (ch === '♭') pc -= 1
  }
  return (pc + 12) % 12
}

const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

/** Raise (shift 1) or lower (shift -1) a note by a semitone, keeping its letter when the result reads cleanly. */
export function alterNote(note: string, shift: number) {
  if (shift === 0) return note
  let acc = 0
  for (const ch of note.slice(1)) acc += ch === '♯' ? 1 : ch === '♭' ? -1 : 0
  acc += shift
  const spelled = note[0] + (acc > 0 ? '♯' : '♭').repeat(Math.abs(acc))
  if (Math.abs(acc) > 1 || ['F♭', 'C♭', 'E♯', 'B♯'].includes(spelled)) {
    const pc = (pitchClass(note) + shift + 12) % 12
    return (shift < 0 ? FLAT_NAMES : SHARP_NAMES)[pc]
  }
  return spelled
}

export const CHORD_INTERVALS = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dom7: [0, 4, 7, 10],
} as const

export type ChordQuality = keyof typeof CHORD_INTERVALS

/** Frequencies of a chord built from a root note, root in the C3-B3 octave. */
export function chordFrequencies(root: string, quality: ChordQuality) {
  const base = pitchClass(root)
  return CHORD_INTERVALS[quality].map((i) => 130.81 * 2 ** ((base + i) / 12))
}

/** Frequencies of a close-position triad on scale degree `degree` (0-6), root in the C3-B3 octave. */
export function triadFrequencies(scale: string[], degree: number) {
  const notes = [scale[degree], scale[(degree + 2) % 7], scale[(degree + 4) % 7]]
  let prev = -1
  return notes.map((note) => {
    let semis = pitchClass(note)
    while (semis <= prev) semis += 12
    prev = semis
    return 130.81 * 2 ** (semis / 12)
  })
}
