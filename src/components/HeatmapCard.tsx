import { bucketByDay, dayKey } from '@/session/derive'
import type { Session } from '@/types/model'

type HeatmapCardProps = {
  sessions: Session[]
  days?: number
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function HeatmapCard({ sessions, days = 90 }: HeatmapCardProps) {
  const buckets = bucketByDay(sessions)
  const weeks = buildWeeks(days)

  const totalSessions = weeks.reduce((acc, week) => {
    return (
      acc +
      week.reduce((sum, cell) => {
        if (!cell) return sum
        return sum + (buckets.get(cell.key)?.total ?? 0)
      }, 0)
    )
  }, 0)

  return (
    <section className="rounded-xl bg-ink-900 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
          Habit
        </h2>
        <span className="text-xs text-ink-400">
          {totalSessions} session{totalSessions === 1 ? '' : 's'} · {days}d
        </span>
      </div>

      <div className="flex gap-1.5">
        <div className="flex flex-col justify-between py-[1px] text-[10px] text-ink-400">
          <span>M</span>
          <span>W</span>
          <span>F</span>
        </div>
        <div className="flex flex-1 gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-1 flex-col gap-[3px]">
              {week.map((cell, di) => (
                <Cell key={di} cell={cell} buckets={buckets} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <Legend />
    </section>
  )
}

type CellInfo = { key: string; date: Date }

function Cell({
  cell,
  buckets,
}: {
  cell: CellInfo | null
  buckets: Map<string, { total: number }>
}) {
  if (!cell) {
    return <div className="aspect-square w-full" aria-hidden="true" />
  }
  const count = buckets.get(cell.key)?.total ?? 0
  const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3
  const className = LEVEL_CLASS[level]
  const title = `${cell.key} — ${count} session${count === 1 ? '' : 's'}`
  return <div className={`aspect-square w-full rounded-[3px] ${className}`} title={title} />
}

const LEVEL_CLASS: Record<0 | 1 | 2 | 3, string> = {
  0: 'bg-ink-800',
  1: 'bg-accent-500/30',
  2: 'bg-accent-500/60',
  3: 'bg-accent-500',
}

function Legend() {
  return (
    <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-ink-400">
      <span>less</span>
      <span className="h-2.5 w-2.5 rounded-[2px] bg-ink-800" />
      <span className="h-2.5 w-2.5 rounded-[2px] bg-accent-500/30" />
      <span className="h-2.5 w-2.5 rounded-[2px] bg-accent-500/60" />
      <span className="h-2.5 w-2.5 rounded-[2px] bg-accent-500" />
      <span>more</span>
    </div>
  )
}

function buildWeeks(days: number): (CellInfo | null)[][] {
  const today = startOfDay(new Date())
  const earliest = new Date(today.getTime() - (days - 1) * MS_PER_DAY)

  // Anchor each column to a Mon-Sun week (ISO style).
  // weekday() returns 0=Mon ... 6=Sun
  const startCol = new Date(
    earliest.getTime() - weekday(earliest) * MS_PER_DAY,
  )
  const endCol = new Date(today.getTime() + (6 - weekday(today)) * MS_PER_DAY)
  const totalCols = Math.round(
    (endCol.getTime() - startCol.getTime()) / MS_PER_DAY / 7,
  ) + 1

  const weeks: (CellInfo | null)[][] = []
  for (let w = 0; w < totalCols; w++) {
    const week: (CellInfo | null)[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(
        startCol.getTime() + (w * 7 + d) * MS_PER_DAY,
      )
      if (date < earliest || date > today) {
        week.push(null)
      } else {
        week.push({ key: dayKey(date.toISOString()), date })
      }
    }
    weeks.push(week)
  }
  return weeks
}

function startOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

function weekday(d: Date): number {
  // Mon=0 ... Sun=6
  return (d.getDay() + 6) % 7
}
