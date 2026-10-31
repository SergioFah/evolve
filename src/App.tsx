import { useState } from 'react'
import { Icon, type IconName } from './components/Icon.tsx'
import { PinScreen } from './components/PinScreen.tsx'
import { SyncBadge } from './components/SyncBadge.tsx'
import { Guitar } from './features/guitar/Guitar.tsx'
import { Meditation } from './features/meditation/Meditation.tsx'
import { useAppData } from './hooks/useAppData.ts'
import { cloudEnabled } from './lib/cloud.ts'
import { readString, removeKey, writeString } from './lib/storage.ts'

const PIN_KEY = 'evolve:pin'
const TAB_KEY = 'evolve:tab'

type Tab = 'meditation' | 'guitar'

const TABS: { id: Tab; label: string; icon: IconName; active: string }[] = [
  { id: 'meditation', label: 'Meditação', icon: 'person', active: 'text-cyan-300' },
  { id: 'guitar', label: 'Guitarra', icon: 'music', active: 'text-amber-400' },
]

export default function App() {
  const [pin, setPin] = useState(() => (cloudEnabled ? readString(PIN_KEY) : null))

  if (cloudEnabled && !pin) {
    return (
      <PinScreen
        onUnlock={(p) => {
          writeString(PIN_KEY, p)
          setPin(p)
        }}
      />
    )
  }

  return (
    <Shell
      pin={pin}
      onPinRejected={() => {
        removeKey(PIN_KEY)
        setPin(null)
      }}
    />
  )
}

function Shell({ pin, onPinRejected }: { pin: string | null; onPinRejected: () => void }) {
  const { data, update, status } = useAppData(pin, onPinRejected)
  const [tab, setTab] = useState<Tab>(() => (readString(TAB_KEY) === 'guitar' ? 'guitar' : 'meditation'))

  const selectTab = (t: Tab) => {
    setTab(t)
    writeString(TAB_KEY, t)
  }

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col">
      <header
        className="flex items-center justify-between px-4 pb-2"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
      >
        <span className="flex items-center gap-2 font-semibold">
          <img src="/logo.svg" alt="" className="size-7 rounded-lg" />
          Evolve
        </span>
        <SyncBadge status={status} />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-2 pb-8">
        {tab === 'meditation' ? (
          <Meditation
            cycles={data.meditation.cycles}
            onChange={(cycles) => update((d) => ({ ...d, meditation: { cycles } }))}
          />
        ) : null}
        {/* Guitar stays mounted so a running practice timer keeps going on the meditation tab */}
        <div hidden={tab !== 'guitar'}>
          <Guitar
            days={data.guitar}
            onChange={(day, tasks) => update((d) => ({ ...d, guitar: { ...d.guitar, [day]: tasks } }))}
            metronome={data.metronome}
            onMetronomeChange={(metronome) => update((d) => ({ ...d, metronome }))}
          />
        </div>
      </main>

      <nav
        className="grid grid-cols-2 border-t border-white/5 bg-[#0b0b0f]/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-xs transition ${
              tab === t.id ? t.active : 'text-zinc-500'
            }`}
          >
            <Icon name={t.icon} className="size-6" />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
