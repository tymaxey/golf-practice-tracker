import { useEffect, useRef } from 'react'

type CounterProps = {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  label?: string
  step?: number
  decimals?: number
}

const HOLD_DELAY_MS = 400
const TICK_INTERVAL_MS = 125

export function Counter({
  value,
  onChange,
  min,
  max,
  label,
  step = 1,
  decimals = 0,
}: CounterProps) {
  const valueRef = useRef(value)
  valueRef.current = value
  const holdRef = useRef<{
    timeout: ReturnType<typeof setTimeout> | null
    interval: ReturnType<typeof setInterval> | null
    fired: boolean
  }>({ timeout: null, interval: null, fired: false })

  useEffect(() => {
    return () => {
      if (holdRef.current.timeout) clearTimeout(holdRef.current.timeout)
      if (holdRef.current.interval) clearInterval(holdRef.current.interval)
    }
  }, [])

  const round = (n: number) => {
    const f = 10 ** decimals
    return Math.round(n * f) / f
  }

  const apply = (direction: 1 | -1) => {
    const cur = valueRef.current
    const next = round(
      direction === 1
        ? Math.min(max ?? Infinity, cur + step)
        : Math.max(min ?? -Infinity, cur - step),
    )
    if (next !== cur) onChange(next)
  }

  const startHold = (direction: 1 | -1) => {
    holdRef.current.fired = false
    holdRef.current.timeout = setTimeout(() => {
      holdRef.current.interval = setInterval(() => {
        holdRef.current.fired = true
        apply(direction)
      }, TICK_INTERVAL_MS)
    }, HOLD_DELAY_MS)
  }

  const stopHold = () => {
    if (holdRef.current.timeout) {
      clearTimeout(holdRef.current.timeout)
      holdRef.current.timeout = null
    }
    if (holdRef.current.interval) {
      clearInterval(holdRef.current.interval)
      holdRef.current.interval = null
    }
  }

  const handleClick = (direction: 1 | -1) => {
    if (holdRef.current.fired) {
      holdRef.current.fired = false
      return
    }
    apply(direction)
  }

  const atMin = min !== undefined && value <= min
  const atMax = max !== undefined && value >= max
  const display = decimals > 0 ? value.toFixed(decimals) : String(value)

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => handleClick(-1)}
        onPointerDown={() => startHold(-1)}
        onPointerUp={stopHold}
        onPointerCancel={stopHold}
        onPointerLeave={stopHold}
        disabled={atMin}
        aria-label={label ? `Decrease ${label}` : 'Decrease'}
        className="tap rounded-full bg-ink-800 text-2xl font-semibold text-ink-200 active:bg-ink-700 disabled:opacity-30"
      >
        −
      </button>
      <div className="min-w-[3ch] text-center text-3xl font-semibold tabular-nums">
        {display}
      </div>
      <button
        type="button"
        onClick={() => handleClick(1)}
        onPointerDown={() => startHold(1)}
        onPointerUp={stopHold}
        onPointerCancel={stopHold}
        onPointerLeave={stopHold}
        disabled={atMax}
        aria-label={label ? `Increase ${label}` : 'Increase'}
        className="tap rounded-full bg-ink-800 text-2xl font-semibold text-ink-200 active:bg-ink-700 disabled:opacity-30"
      >
        +
      </button>
    </div>
  )
}
