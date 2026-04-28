import { HeatmapCard } from '@/components/HeatmapCard'
import { TrendsCard } from '@/components/TrendsCard'
import { getDiscipline } from '@/config/disciplines'
import { headlineSummary } from '@/session/derive'
import type { Plan, Session } from '@/types/model'

type HomeProps = {
  plans: Plan[]
  sessions: Session[]
  onStart: (planId: string) => void
  onOpenSession: (id: string) => void
}

export function Home({
  plans,
  sessions,
  onStart,
  onOpenSession,
}: HomeProps) {
  const todayCount = sessions.filter(isToday).length
  const recent = sessions.slice(0, 7)

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-5 pb-24 pt-3">
      <div className="text-sm text-ink-400">{todayLabel(todayCount)}</div>

      <section className="flex flex-col gap-3">
        {plans.map((plan) => {
          const disc = getDiscipline(plan.disciplineId)
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onStart(plan.id)}
              className="tap flex w-full rounded-2xl border-2 border-accent-500 px-5 py-4 text-left text-ink-200 active:bg-ink-900"
            >
              <span className="text-base font-semibold">
                {disc?.name ?? plan.disciplineId}
              </span>
            </button>
          )
        })}
      </section>

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

      <HeatmapCard
        sessions={sessions.filter((s) => s.disciplineId !== 'golf')}
      />
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
  const disc = getDiscipline(session.disciplineId)
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="tap flex w-full flex-col gap-2 rounded-xl bg-ink-900 p-4 text-left active:bg-ink-800"
      >
        <div className="flex items-center justify-between text-xs text-ink-400">
          <span>
            {disc?.name ?? session.disciplineId} · {formatDate(date)}
          </span>
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

