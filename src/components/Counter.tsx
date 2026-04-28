type CounterProps = {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  label?: string
}

export function Counter({ value, onChange, min, max, label }: CounterProps) {
  const dec = () => onChange(Math.max(min ?? -Infinity, value - 1))
  const inc = () => onChange(Math.min(max ?? Infinity, value + 1))
  const atMin = min !== undefined && value <= min
  const atMax = max !== undefined && value >= max

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={dec}
        disabled={atMin}
        aria-label={label ? `Decrease ${label}` : 'Decrease'}
        className="tap rounded-full bg-ink-800 text-2xl font-semibold text-ink-200 active:bg-ink-700 disabled:opacity-30"
      >
        −
      </button>
      <div className="min-w-[3ch] text-center text-3xl font-semibold tabular-nums">
        {value}
      </div>
      <button
        type="button"
        onClick={inc}
        disabled={atMax}
        aria-label={label ? `Increase ${label}` : 'Increase'}
        className="tap rounded-full bg-ink-800 text-2xl font-semibold text-ink-200 active:bg-ink-700 disabled:opacity-30"
      >
        +
      </button>
    </div>
  )
}
