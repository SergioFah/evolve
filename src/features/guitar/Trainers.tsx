import { type ReactNode, useState } from 'react'
import { KEYS, pitchClass } from './keys.ts'

const CHROMATIC = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B']

function randomIndex(n: number, avoid?: number) {
  let i = Math.floor(Math.random() * n)
  if (n > 1 && i === avoid) i = (i + 1 + Math.floor(Math.random() * (n - 1))) % n
  return i
}

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function optionClass(state: 'idle' | 'right' | 'wrong' | 'dim') {
  const base = 'rounded-xl py-3 text-lg font-semibold ring-1 transition'
  if (state === 'right') return `${base} bg-emerald-500 text-zinc-950 ring-emerald-400`
  if (state === 'wrong') return `${base} bg-red-500/80 text-zinc-950 ring-red-400`
  if (state === 'dim') return `${base} bg-zinc-900 text-zinc-500 ring-white/5`
  return `${base} bg-zinc-900 text-zinc-100 ring-white/5 active:bg-zinc-800`
}

function Feedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div className={`rounded-xl px-4 py-2.5 text-center text-sm font-medium ${ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
      {children}
    </div>
  )
}

function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full rounded-xl bg-amber-500 py-3 font-semibold text-zinc-950 active:bg-amber-400">
      Próxima
    </button>
  )
}

/* ---------------- Relativas ---------------- */

type RelQuestion = { keyIndex: number; fromMajor: boolean; options: number[] }

function newRelQuestion(prev?: RelQuestion): RelQuestion {
  const keyIndex = randomIndex(KEYS.length, prev?.keyIndex)
  const others = shuffle(KEYS.map((_, i) => i).filter((i) => i !== keyIndex)).slice(0, 3)
  return { keyIndex, fromMajor: Math.random() < 0.5, options: shuffle([keyIndex, ...others]) }
}

export function RelativesTrainer() {
  const [q, setQ] = useState(newRelQuestion)
  const [picked, setPicked] = useState<number | null>(null)
  const key = KEYS[q.keyIndex]
  const shown = q.fromMajor ? key.major : key.minor
  const answer = q.fromMajor ? key.minor : key.major
  const label = (i: number) => (q.fromMajor ? KEYS[i].minor : KEYS[i].major)

  const next = () => {
    setQ(newRelQuestion(q))
    setPicked(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Relativas</h2>
        <p className="text-sm text-zinc-400">Qual é a relativa {q.fromMajor ? 'menor' : 'maior'} deste tom?</p>
      </div>

      <div className="rounded-2xl bg-zinc-900 py-8 text-center ring-1 ring-white/5">
        <div className="text-6xl font-bold">{shown}</div>
        <div className="mt-1 text-sm text-zinc-500">{q.fromMajor ? 'maior' : 'menor'}</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {q.options.map((i) => {
          const state =
            picked === null ? 'idle' : i === q.keyIndex ? 'right' : i === picked ? 'wrong' : 'dim'
          return (
            <button key={i} type="button" disabled={picked !== null} onClick={() => setPicked(i)} className={optionClass(state)}>
              {label(i)}
            </button>
          )
        })}
      </div>

      {picked !== null && (
        <>
          <Feedback ok={picked === q.keyIndex}>
            {picked === q.keyIndex ? 'Certa!' : 'Errada'} — relativa de {shown} é {answer}
          </Feedback>
          <NextButton onClick={next} />
        </>
      )}
    </div>
  )
}

/* ---------------- Quartas e quintas ---------------- */

type Step = 'fourth' | 'fifth' | 'done'

export function FourthsFifthsTrainer() {
  const [keyIndex, setKeyIndex] = useState(() => randomIndex(KEYS.length))
  const [step, setStep] = useState<Step>('fourth')
  const [fourthPick, setFourthPick] = useState<number | null>(null)
  const [fifthPick, setFifthPick] = useState<number | null>(null)

  const key = KEYS[keyIndex]
  const fourthName = key.scale[3]
  const fifthName = key.scale[4]
  const fourthPc = pitchClass(fourthName)
  const fifthPc = pitchClass(fifthName)

  const pick = (pc: number) => {
    if (step === 'fourth') {
      setFourthPick(pc)
      setStep('fifth')
    } else if (step === 'fifth') {
      setFifthPick(pc)
      setStep('done')
    }
  }

  const next = () => {
    setKeyIndex(randomIndex(KEYS.length, keyIndex))
    setStep('fourth')
    setFourthPick(null)
    setFifthPick(null)
  }

  // Buttons only show the result of the step currently being judged (last pick)
  const lastPick = step === 'fifth' ? fourthPick : step === 'done' ? fifthPick : null
  const lastTarget = step === 'fifth' ? fourthPc : fifthPc

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Quartas e quintas</h2>
        <p className="text-sm text-zinc-400">Selecione a quarta e, em seguida, a quinta do tom.</p>
      </div>

      <div className="rounded-2xl bg-zinc-900 py-8 text-center ring-1 ring-white/5">
        <div className="text-6xl font-bold">{key.major}</div>
        <div className="mt-3 flex justify-center gap-2 text-sm">
          <StepChip label="Quarta" active={step === 'fourth'} pick={fourthPick} target={fourthPc} name={fourthName} />
          <StepChip label="Quinta" active={step === 'fifth'} pick={fifthPick} target={fifthPc} name={fifthName} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {CHROMATIC.map((name, pc) => {
          let state: 'idle' | 'right' | 'wrong' | 'dim' = 'idle'
          if (step === 'done') {
            state = pc === fifthPc ? 'right' : pc === fifthPick ? 'wrong' : 'dim'
          } else if (lastPick !== null && pc === lastPick) {
            state = lastPick === lastTarget ? 'right' : 'wrong'
          }
          return (
            <button
              key={name}
              type="button"
              disabled={step === 'done'}
              onClick={() => pick(pc)}
              className={`${optionClass(state)} !py-2.5 !text-sm`}
            >
              {name}
            </button>
          )
        })}
      </div>

      {step === 'fifth' && fourthPick !== null && (
        <Feedback ok={fourthPick === fourthPc}>
          Quarta {fourthPick === fourthPc ? 'certa!' : `errada — é ${fourthName}`} Agora a quinta.
        </Feedback>
      )}
      {step === 'done' && (
        <>
          <Feedback ok={fourthPick === fourthPc && fifthPick === fifthPc}>
            Quarta: {fourthName} {fourthPick === fourthPc ? '✓' : '✗'} · Quinta: {fifthName} {fifthPick === fifthPc ? '✓' : '✗'}
          </Feedback>
          <NextButton onClick={next} />
        </>
      )}
    </div>
  )
}

function StepChip({
  label,
  active,
  pick,
  target,
  name,
}: {
  label: string
  active: boolean
  pick: number | null
  target: number
  name: string
}) {
  const answered = pick !== null
  const ok = pick === target
  const cls = answered
    ? ok
      ? 'bg-emerald-500/15 text-emerald-300'
      : 'bg-red-500/15 text-red-300'
    : active
      ? 'bg-amber-500 text-zinc-950'
      : 'bg-zinc-800 text-zinc-500'
  return (
    <span className={`rounded-full px-3 py-1 font-medium ${cls}`}>
      {label}: {answered ? name : '?'}
    </span>
  )
}
