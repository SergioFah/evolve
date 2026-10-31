import type { SyncStatus } from '../hooks/useAppData.ts'

const LABELS: Record<SyncStatus, { text: string; dot: string }> = {
  local: { text: 'só neste aparelho', dot: 'bg-zinc-500' },
  syncing: { text: 'sincronizando…', dot: 'bg-sky-400 animate-pulse' },
  saved: { text: 'salvo', dot: 'bg-emerald-400' },
  offline: { text: 'offline', dot: 'bg-amber-400' },
  error: { text: 'erro ao salvar', dot: 'bg-rose-500' },
}

export function SyncBadge({ status }: { status: SyncStatus }) {
  const { text, dot } = LABELS[status]
  return (
    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span className={`size-2 rounded-full ${dot}`} />
      {text}
    </span>
  )
}
