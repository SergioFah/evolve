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
