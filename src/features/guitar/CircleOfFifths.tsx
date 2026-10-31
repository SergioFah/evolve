import { type ReactNode, useState } from 'react'

type Key = {
  major: string
  minor: string
  majorFull: string
  minorFull: string
  accidentals: string
  scale: string[]
}

const KEYS: Key[] = [
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

const DEGREES = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
const CHORD_SUFFIX = ['', 'm', 'm', '', '', 'm', 'dim']

const R_OUTER = 155
const R_MID = 105
const R_INNER = 62

function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180
  return [r * Math.cos(a), r * Math.sin(a)]
}

function segment(r1: number, r2: number, a0: number, a1: number) {
  const [x0, y0] = polar(r2, a0)
  const [x1, y1] = polar(r2, a1)
  const [x2, y2] = polar(r1, a1)
  const [x3, y3] = polar(r1, a0)
  return `M${x0} ${y0}A${r2} ${r2} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r1} ${r1} 0 0 0 ${x3} ${y3}Z`
}

export function CircleOfFifths() {
  const [selected, setSelected] = useState(0)
  const key = KEYS[selected]
  const fourth = KEYS[(selected + 11) % 12]
  const fifth = KEYS[(selected + 1) % 12]

  const fillFor = (i: number, inner: boolean) => {
    if (i === selected) return inner ? 'fill-amber-300' : 'fill-amber-500'
    if (i === (selected + 1) % 12 || i === (selected + 11) % 12) return 'fill-amber-500/25'
    return inner ? 'fill-zinc-800' : 'fill-zinc-900'
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Ciclo de quintas</h2>
        <p className="text-sm text-zinc-400">Toque numa tonalidade. Anel de fora: maiores · de dentro: relativas menores.</p>
      </div>

      <svg viewBox="-160 -160 320 320" className="mx-auto w-full max-w-sm select-none">
        {KEYS.map((k, i) => {
          const a0 = i * 30 - 15
          const a1 = i * 30 + 15
          const [ox, oy] = polar((R_OUTER + R_MID) / 2, i * 30)
          const [ix, iy] = polar((R_MID + R_INNER) / 2, i * 30)
          const active = i === selected
          return (
            <g key={k.major} onClick={() => setSelected(i)} className="cursor-pointer">
              <path d={segment(R_MID, R_OUTER, a0, a1)} className={`${fillFor(i, false)} stroke-[#0b0b0f] transition-colors`} strokeWidth={2} />
              <path d={segment(R_INNER, R_MID, a0, a1)} className={`${fillFor(i, true)} stroke-[#0b0b0f] transition-colors`} strokeWidth={2} />
              <text
                x={ox}
                y={oy}
                textAnchor="middle"
                dominantBaseline="central"
                className={`pointer-events-none text-[17px] font-semibold ${active ? 'fill-zinc-950' : 'fill-zinc-100'}`}
              >
                {k.major}
              </text>
              <text
                x={ix}
                y={iy}
                textAnchor="middle"
                dominantBaseline="central"
                className={`pointer-events-none text-[11px] ${active ? 'fill-zinc-950 font-semibold' : 'fill-zinc-400'}`}
              >
                {k.minor}
              </text>
            </g>
          )
        })}
        <circle r={R_INNER - 2} className="fill-zinc-950" />
        <text y={-8} textAnchor="middle" dominantBaseline="central" className="fill-zinc-100 text-[26px] font-bold">
          {key.major}
        </text>
        <text y={20} textAnchor="middle" dominantBaseline="central" className="fill-amber-300 text-[13px]">
          {key.minor}
        </text>
      </svg>

      <div className="space-y-3 rounded-2xl bg-zinc-900 p-4 ring-1 ring-white/5">
        <div>
          <div className="text-lg font-semibold">{key.majorFull}</div>
          <div className="text-sm text-zinc-400">
            Relativa menor: <span className="text-amber-300">{key.minorFull}</span> · {key.accidentals}
          </div>
        </div>
        <Info label="Vizinhos">
          {fourth.major} (IV) · {fifth.major} (V)
        </Info>
        <Info label="Escala">{key.scale.join(' ')}</Info>
        <div>
          <div className="mb-1.5 text-xs uppercase tracking-wide text-zinc-500">Campo harmônico</div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {key.scale.map((note, i) => (
              <div key={DEGREES[i]} className={`rounded-lg py-1.5 ${i === 5 ? 'bg-amber-500/15' : 'bg-zinc-800'}`}>
                <div className="text-[10px] text-zinc-500">{DEGREES[i]}</div>
                <div className="text-sm font-medium">
                  {note}
                  {CHORD_SUFFIX[i] === 'dim' ? '°' : CHORD_SUFFIX[i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="font-medium">{children}</div>
    </div>
  )
}
