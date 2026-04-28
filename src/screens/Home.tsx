import type { Session } from '@/types/model'

type HomeProps = {
  planName: string
  sessions: Session[]
  onStart: () => void
  onOpenSession: (id: string) => void
}

export function Home({ planName, sessions, onStart, onOpenSession }: HomeProps) {
  const todayCount = sessions.filter(isToday).length
  const recent = sessions.slice(0, 3)

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 p-5 pb-24">
      <header>
        <div className="text-xs uppercase tracking-wide text-ink-400">
          Practice Tracker
        </div>
        <h1 className="text-xl font-semibold">{planName}</h1>
        <div className="mt-1 text-sm text-ink-400">{todayLabel(todayCount)}</div>
      </header>

      <button
        type="button"
        onClick={onStart}
        className="tap w-full rounded-2xl bg-accent-500 py-5 text-base font-semibold text-ink-950 active:opacity-80"
      >
        {todayCount > 0 ? 'Start another session' : 'Start session'}
      </button>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
          Recent sessions
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-ink-400">
            No sessions yet. Tap above to start.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.map((s) => (
              <RecentSessionCard
                key={s.id}
                session={s}
                onOpen={() => onOpenSession(s.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function RecentSessionCard({
  session,
  onOpen,
}: {
  session: Session
  onOpen: () => void
}) {
  const date = new Date(session.startedAt)
  const summary = headlineSummary(session)
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="tap flex w-full flex-col gap-2 rounded-xl bg-ink-900 p-4 text-left active:bg-ink-800"
      >
        <div className="flex items-center justify-between text-xs text-ink-400">
          <span>{formatDate(date)}</span>
          <span className="tabular-nums">{formatTime(date)}</span>
        </div>
        <div className="text-sm text-ink-200">{summary}</div>
      </button>
    </li>
  )
}

function headlineSummary(session: Session): string {
  const parts: string[] = []
  const find = (metric: string) =>
    session.drills.find((d) => d.metric === metric)

  const fives = find('makes_5ft')
  if (fives && fives.denominator !== undefined && fives.denominator > 0) {
    parts.push(`5-ft ${fives.value}/${fives.denominator}`)
  }
  const ladder = find('ladder_within_6')
  if (ladder && ladder.denominator !== undefined && ladder.denominator > 0) {
    parts.push(`Ladder ${ladder.value}/${ladder.denominator}`)
  }
  const score = find('pressure_score')
  if (score) {
    parts.push(
      `Pressure ${score.value > 0 ? `+${score.value}` : score.value}`,
    )
  }
  if (parts.length === 0) return `${session.drills.length} metrics`
  return parts.join(' · ')
}

function isToday(s: Session): boolean {
  const d = new Date(s.startedAt)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

function todayLabel(n: number): string {
  if (n === 0) return 'Not started today'
  if (n === 1) return '1 session today'
  return `${n} sessions today`
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}
