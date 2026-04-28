import { HeatmapCard } from '@/components/HeatmapCard'
import { TrendsCard } from '@/components/TrendsCard'
import { headlineSummary } from '@/session/derive'
import type { Session } from '@/types/model'

type HomeProps = {
  planName: string
  sessions: Session[]
  onStart: () => void
  onOpenSession: (id: string) => void
  onOpenSettings: () => void
}

export function Home({
  planName,
  sessions,
  onStart,
  onOpenSession,
  onOpenSettings,
}: HomeProps) {
  const todayCount = sessions.filter(isToday).length
  const recent = sessions.slice(0, 7)

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 p-5 pb-24">
      <header className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-ink-400">
            Practice Tracker
          </div>
          <h1 className="text-xl font-semibold">{planName}</h1>
          <div className="mt-1 text-sm text-ink-400">{todayLabel(todayCount)}</div>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="tap -mr-2 rounded-full p-2 text-ink-400 active:bg-ink-800 active:text-ink-200"
        >
          <GearIcon />
        </button>
      </header>

      <button
        type="button"
        onClick={onStart}
        className="tap w-full rounded-2xl bg-accent-500 py-5 text-base font-semibold text-ink-950 active:opacity-80"
      >
        {todayCount > 0 ? 'Start another session' : 'Start session'}
      </button>

      <TrendsCard sessions={sessions} />

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

      <HeatmapCard sessions={sessions} />
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

function GearIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
