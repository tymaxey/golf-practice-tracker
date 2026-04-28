import { Counter } from './Counter'

type SuccessTotalProps = {
  successes: number
  attempts: number
  onChange: (next: { successes: number; attempts: number }) => void
}

export function SuccessTotal({
  successes,
  attempts,
  onChange,
}: SuccessTotalProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="mb-1 text-xs uppercase tracking-wide text-ink-400">
          Made
        </div>
        <Counter
          label="made"
          value={successes}
          min={0}
          max={attempts > 0 ? attempts : undefined}
          onChange={(v) => onChange({ successes: v, attempts })}
        />
      </div>
      <div>
        <div className="mb-1 text-xs uppercase tracking-wide text-ink-400">
          Attempts
        </div>
        <Counter
          label="attempts"
          value={attempts}
          min={Math.max(0, successes)}
          onChange={(v) => onChange({ successes, attempts: v })}
        />
      </div>
    </div>
  )
}
