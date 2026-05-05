import { useState } from 'react'

type Props = {
  label: string
  instructions?: string
}

export function MetricLabel({ label, instructions }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-ink-200">{label}</span>
        {instructions && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Hide instructions' : 'Show instructions'}
            aria-expanded={open}
            className={`tap -mr-1 -mt-0.5 shrink-0 rounded-full p-1 ${
              open ? 'text-accent-500' : 'text-ink-400 active:text-ink-200'
            }`}
          >
            <InfoIcon />
          </button>
        )}
      </div>
      {open && instructions && (
        <p className="rounded-lg border-l-2 border-accent-500 bg-ink-800 px-3 py-2 text-xs leading-relaxed text-ink-300">
          {instructions}
        </p>
      )}
    </>
  )
}

function InfoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}
