const STROKE = {
  up: 'M6 15l6-6 6 6',
  down: 'M6 9l6 6 6-6',
  x: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  check: 'M5 12l5 5 9-10',
  pencil: 'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4',
  skip: 'M5 5l8 7-8 7M17 5v14',
  person: 'M12 3a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM4 21c1-4 4-7 8-7s7 3 8 7',
  music: 'M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM20 16a3 3 0 11-6 0 3 3 0 016 0z',
}

const FILL = {
  play: 'M8 5v14l11-7z',
  pause: 'M7 5h4v14H7zM13 5h4v14h-4z',
  stop: 'M6 6h12v12H6z',
}

export type IconName = keyof typeof STROKE | keyof typeof FILL

export function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
  const filled = name in FILL
  const d = filled ? FILL[name as keyof typeof FILL] : STROKE[name as keyof typeof STROKE]
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  )
}

export function IconButton({
  name,
  label,
  onClick,
  disabled,
  className = '',
}: {
  name: IconName
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid size-9 shrink-0 place-items-center rounded-full text-zinc-400 transition active:scale-90 active:bg-white/10 disabled:opacity-25 ${className}`}
    >
      <Icon name={name} className="size-5" />
    </button>
  )
}
