import { type FormEvent, useState } from 'react'
import { loadRemote, PinError } from '../lib/cloud.ts'

export function PinScreen({ onUnlock }: { onUnlock: (pin: string) => void }) {
  const [pin, setPin] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!pin) return
    setChecking(true)
    setError('')
    try {
      await loadRemote(pin)
      onUnlock(pin)
    } catch (err) {
      setError(err instanceof PinError ? 'PIN incorreto.' : 'Sem conexão. Tente de novo.')
      setChecking(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex h-full flex-col items-center justify-center gap-6 px-8">
      <img src="/logo.svg" alt="" className="size-20 rounded-3xl" />
      <div className="text-center">
        <h1 className="text-3xl font-bold">Evolve</h1>
        <p className="mt-1 text-zinc-400">Digite seu PIN</p>
      </div>
      <input
        type="password"
        autoFocus
        autoComplete="current-password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="field w-full max-w-xs py-3 text-center text-2xl tracking-[0.4em]"
      />
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button
        type="submit"
        disabled={!pin || checking}
        className="w-full max-w-xs rounded-2xl bg-white py-3.5 text-lg font-semibold text-zinc-950 active:scale-[0.98] disabled:opacity-40"
      >
        {checking ? 'Verificando…' : 'Entrar'}
      </button>
    </form>
  )
}
