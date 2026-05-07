import { useEffect, useRef, useState } from 'react'
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
  onDeleteSession: (id: string) => void
}

export function Home({
  plans,
  sessions,
  onStart,
  onOpenSession,
  onDeleteSession,
}: HomeProps) {
  const todaySessions = sessions.filter(isToday)
  const todayCount = todaySessions.length
  const completedToday = new Set(todaySessions.map((s) => s.disciplineId))
  const recent = sessions.slice(0, 7)
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-5 pb-24 pt-3">
      <div className="text-sm text-ink-400">{todayLabel(todayCount)}</div>

      <section className="flex flex-col gap-3">
        {plans.map((plan) => {
          const disc = getDiscipline(plan.disciplineId)
          const done = completedToday.has(plan.disciplineId)
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onStart(plan.id)}
              className={
                done
                  ? 'tap flex w-full rounded-2xl border-2 border-ink-700 px-5 py-4 text-left text-ink-400 active:bg-ink-900'
                  : 'tap flex w-full rounded-2xl border-2 border-accent-500 px-5 py-4 text-left text-ink-200 active:bg-ink-900'
              }
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
                isOpen={openId === s.id}
                onSwipeOpen={() => setOpenId(s.id)}
                onSwipeClose={() => setOpenId((o) => (o === s.id ? null : o))}
                onOpen={() => onOpenSession(s.id)}
                onDelete={() => {
                  setOpenId(null)
                  onDeleteSession(s.id)
                }}
              />
            ))}
          </ul>
        )}
      </section>

      <HeatmapCard
        sessions={sessions.filter(
          (s) => s.disciplineId !== 'golf' && s.disciplineId !== 'coaching',
        )}
      />
    </div>
  )
}

const REVEAL_PX = 88
const SWIPE_THRESHOLD_PX = 40
const AXIS_LOCK_PX = 6

function RecentSessionCard({
  session,
  isOpen,
  onSwipeOpen,
  onSwipeClose,
  onOpen,
  onDelete,
}: {
  session: Session
  isOpen: boolean
  onSwipeOpen: () => void
  onSwipeClose: () => void
  onOpen: () => void
  onDelete: () => void
}) {
  const date = new Date(session.startedAt)
  const summary = headlineSummary(session)
  const disc = getDiscipline(session.disciplineId)

  const [offset, setOffset] = useState(isOpen ? -REVEAL_PX : 0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const baseOffset = useRef(0)
  const axis = useRef<null | 'h' | 'v'>(null)
  const moved = useRef(false)

  useEffect(() => {
    if (!dragging) setOffset(isOpen ? -REVEAL_PX : 0)
  }, [isOpen, dragging])

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    startX.current = t.clientX
    startY.current = t.clientY
    baseOffset.current = isOpen ? -REVEAL_PX : 0
    axis.current = null
    moved.current = false
    setDragging(true)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return
    const t = e.touches[0]
    const dx = t.clientX - startX.current
    const dy = t.clientY - startY.current

    if (axis.current === null) {
      if (Math.abs(dx) > AXIS_LOCK_PX || Math.abs(dy) > AXIS_LOCK_PX) {
        axis.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
      } else {
        return
      }
    }

    if (axis.current !== 'h') return
    moved.current = true

    const next = baseOffset.current + dx
    setOffset(Math.min(0, Math.max(-REVEAL_PX * 1.3, next)))
  }

  const onTouchEnd = () => {
    if (!dragging) return
    setDragging(false)
    if (axis.current !== 'h') return
    if (offset < -SWIPE_THRESHOLD_PX) {
      onSwipeOpen()
      setOffset(-REVEAL_PX)
    } else {
      onSwipeClose()
      setOffset(0)
    }
  }

  const handleClick = () => {
    if (moved.current) {
      moved.current = false
      return
    }
    if (isOpen) {
      onSwipeClose()
      return
    }
    onOpen()
  }

  return (
    <li className="relative overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete session"
        tabIndex={isOpen ? 0 : -1}
        style={{ zIndex: 0 }}
        className="absolute inset-y-0 right-0 flex w-[88px] items-center justify-center bg-red-500 text-sm font-semibold text-ink-950 active:opacity-80"
      >
        Delete
      </button>

      <button
        type="button"
        onClick={handleClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        style={{
          transform: `translate3d(${offset}px, 0, 0)`,
          transition: dragging ? 'none' : 'transform 200ms ease-out',
          touchAction: 'pan-y',
          willChange: 'transform',
          zIndex: 1,
        }}
        className="tap relative flex w-full flex-col gap-2 bg-ink-900 p-4 text-left active:bg-ink-800"
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
