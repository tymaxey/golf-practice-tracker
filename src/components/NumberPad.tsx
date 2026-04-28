type NumberPadProps = {
  value: number
  min: number
  max: number
  onChange: (next: number) => void
  label?: string
  perRow?: number
}

export function NumberPad({
  value,
  min,
  max,
  onChange,
  label,
  perRow = 6,
}: NumberPadProps) {
  const numbers: number[] = []
  for (let n = min; n <= max; n++) numbers.push(n)

  const rows: number[][] = []
  for (let i = 0; i < numbers.length; i += perRow) {
    rows.push(numbers.slice(i, i + perRow))
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, ri) => (
        <div
          key={ri}
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${perRow}, minmax(0, 1fr))` }}
        >
          {row.map((n) => {
            const selected = value === n
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                aria-label={label ? `Set ${label} to ${n}` : `${n}`}
                aria-pressed={selected}
                className={`tap rounded-xl py-3 text-lg font-semibold tabular-nums active:opacity-80 ${
                  selected
                    ? 'bg-accent-500 text-ink-950'
                    : 'bg-ink-800 text-ink-200'
                }`}
              >
                {n}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
