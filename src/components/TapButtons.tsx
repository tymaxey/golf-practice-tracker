import { useState } from 'react'

export type TapOutcome = 'good' | 'near' | 'bad'
export type TapCounts = { good: number; near: number; bad: number }

type TapButtonsProps = {
  counts: TapCounts
  onChange: (next: TapCounts) => void
}

export function TapButtons({ counts, onChange }: TapButtonsProps) {
  const [history, setHistory] = useState<TapOutcome[]>([])

  const tap = (outcome: TapOutcome) => {
    setHistory((h) => [...h, outcome])
    onChange({ ...counts, [outcome]: counts[outcome] + 1 })
  }

  const undo = () => {
    const last = history[history.length - 1]
    if (!last) return
    setHistory((h) => h.slice(0, -1))
    onChange({ ...counts, [last]: Math.max(0, counts[last] - 1) })
  }

  const score = counts.good - counts.bad
  const total = counts.good + counts.near + counts.bad

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <div className="text-xs uppercase tracking-wide text-ink-400">
          Score · {total} tap{total === 1 ? '' : 's'}
        </div>
        <div className="text-3xl font-semibold tabular-nums">
          {score > 0 ? `+${score}` : score}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <TapButton
          label="Good"
          delta="+1"
          count={counts.good}
          onTap={() => tap('good')}
          tone="good"
        />
        <TapButton
          label="Near"
          delta="0"
          count={counts.near}
          onTap={() => tap('near')}
          tone="near"
        />
        <TapButton
          label="Bad"
          delta="−1"
          count={counts.bad}
          onTap={() => tap('bad')}
          tone="bad"
        />
      </div>

      <button
        type="button"
        onClick={undo}
        disabled={history.length === 0}
        className="tap rounded-xl border border-ink-700 py-3 text-sm text-ink-300 active:bg-ink-800 disabled:opacity-30"
      >
        Undo last tap
      </button>
    </div>
  )
}

type TapButtonProps = {
  label: string
  delta: string
  count: number
  onTap: () => void
  tone: 'good' | 'near' | 'bad'
}

function TapButton({ label, delta, count, onTap, tone }: TapButtonProps) {
  const tones: Record<TapButtonProps['tone'], string> = {
    good: 'bg-emerald-500 text-ink-950',
    near: 'bg-ink-700 text-ink-100',
    bad: 'bg-rose-500 text-ink-950',
  }
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={`Tap ${label}`}
      className={`tap flex flex-col items-center justify-center gap-1 rounded-xl py-5 active:opacity-80 ${tones[tone]}`}
    >
      <span className="text-base font-semibold leading-none">{label}</span>
      <span className="text-xs opacity-70">{delta}</span>
      <span className="mt-1 text-xs tabular-nums opacity-80">{count}</span>
    </button>
  )
}
