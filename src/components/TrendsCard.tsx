import { Sparkline } from '@/components/Sparkline'
import {
  fivesRate,
  formatPct,
  formatPressure,
  ladderRate,
  pressureScore,
  ratePct,
} from '@/session/derive'
import type { Session } from '@/types/model'

type TrendsCardProps = {
  sessions: Session[]
  windowSize?: number
}

export function TrendsCard({ sessions, windowSize = 7 }: TrendsCardProps) {
  const ordered = [...sessions]
    .slice(0, windowSize)
    .reverse()

  if (ordered.length === 0) {
    return (
      <section className="rounded-xl bg-ink-900 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
          Trends
        </h2>
        <p className="text-sm text-ink-400">
          Log a session to see trends.
        </p>
      </section>
    )
  }

  const fivesPoints = ordered.map(fivesRate).filter(notNull).map(ratePct)
  const ladderPoints = ordered.map(ladderRate).filter(notNull).map(ratePct)
  const pressurePoints = ordered.map(pressureScore).filter(notNull)

  const lastFives = lastDefined(ordered.map(fivesRate))
  const lastLadder = lastDefined(ordered.map(ladderRate))
  const lastPressure = lastDefined(ordered.map(pressureScore))

  return (
    <section className="rounded-xl bg-ink-900 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
          Trends
        </h2>
        <span className="text-xs text-ink-400">last {ordered.length}</span>
      </div>
      <ul className="flex flex-col gap-2.5">
        <TrendRow
          label="5-ft"
          value={lastFives ? formatPct(lastFives) : '—'}
          points={fivesPoints}
          domain={[0, 1]}
        />
        <TrendRow
          label="Ladder"
          value={lastLadder ? formatPct(lastLadder) : '—'}
          points={ladderPoints}
          domain={[0, 1]}
        />
        <TrendRow
          label="Pressure"
          value={lastPressure !== null ? formatPressure(lastPressure) : '—'}
          points={pressurePoints}
        />
      </ul>
    </section>
  )
}

type TrendRowProps = {
  label: string
  value: string
  points: number[]
  domain?: [number, number]
}

function TrendRow({ label, value, points, domain }: TrendRowProps) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink-200">{label}</span>
      <div className="flex items-center gap-3">
        {points.length > 0 ? (
          <span className="text-accent-500">
            <Sparkline points={points} domain={domain} />
          </span>
        ) : (
          <span className="text-xs text-ink-400">no data</span>
        )}
        <span className="w-12 text-right text-sm tabular-nums text-ink-200">
          {value}
        </span>
      </div>
    </li>
  )
}

function notNull<T>(v: T | null): v is T {
  return v !== null
}

function lastDefined<T>(arr: (T | null)[]): T | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== null) return arr[i]
  }
  return null
}
