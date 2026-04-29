import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

type Props = {
  value: string
  onChange: (iso: string) => void
  label?: string
  daysBack?: number
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function DateStripPicker({
  value,
  onChange,
  label = 'Date',
  daysBack = 14,
}: Props) {
  const [open, setOpen] = useState(false)
  const nativeRef = useRef<HTMLInputElement>(null)

  const today = useMemo(() => startOfDay(new Date()), [])
  const selectedDay = useMemo(() => startOfDay(new Date(value)), [value])
  const diffDays = Math.round((today.getTime() - selectedDay.getTime()) / MS_PER_DAY)

  const days = useMemo(() => {
    const out: Date[] = []
    for (let i = daysBack - 1; i >= 0; i--) {
      out.push(new Date(today.getTime() - i * MS_PER_DAY))
    }
    return out
  }, [today, daysBack])

  const handlePick = (d: Date) => {
    onChange(withDate(value, d))
    setOpen(false)
  }

  const handleNativeChange = (raw: string) => {
    if (!raw) return
    const [y, m, day] = raw.split('-').map(Number)
    if (!y || !m || !day) return
    const picked = new Date(y, m - 1, day)
    if (picked.getTime() > today.getTime()) return
    onChange(withDate(value, picked))
    setOpen(false)
  }

  const todayIso = formatYmd(today)

  return (
    <div className="flex flex-col text-sm font-semibold uppercase tracking-wide text-ink-400">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="tap mt-1 flex items-center justify-between rounded-xl bg-ink-800 p-3 text-left text-sm font-medium normal-case tracking-normal text-ink-100 active:bg-ink-700"
      >
        <span>{formatLabel(selectedDay, diffDays)}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          <DayStrip
            days={days}
            selectedTime={selectedDay.getTime()}
            onPick={handlePick}
          />
          <button
            type="button"
            onClick={() => {
              const input = nativeRef.current
              if (!input) return
              if (typeof input.showPicker === 'function') input.showPicker()
              else input.click()
            }}
            className="tap self-end rounded-lg px-2 py-1 text-xs font-medium normal-case tracking-normal text-ink-400 active:text-ink-200"
          >
            Earlier…
          </button>
          <input
            ref={nativeRef}
            type="date"
            max={todayIso}
            value={formatYmd(selectedDay)}
            onChange={(e) => handleNativeChange(e.target.value)}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      )}
    </div>
  )
}

type DayStripProps = {
  days: Date[]
  selectedTime: number
  onPick: (d: Date) => void
}

function DayStrip({ days, selectedTime, onPick }: DayStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    const el = selectedRef.current
    if (!el) return
    el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' })
  }, [selectedTime])

  return (
    <div
      ref={scrollRef}
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {days.map((d) => {
        const selected = d.getTime() === selectedTime
        return (
          <button
            key={d.getTime()}
            ref={selected ? selectedRef : undefined}
            type="button"
            onClick={() => onPick(d)}
            className={`tap flex min-w-[3rem] flex-col items-center rounded-xl border px-2 py-2 text-center font-medium normal-case tracking-normal ${
              selected
                ? 'border-accent-500 bg-accent-500 text-ink-950'
                : 'border-ink-700 bg-ink-900 text-ink-200 active:bg-ink-800'
            }`}
            aria-pressed={selected}
          >
            <span className="text-[0.65rem] uppercase tracking-wide opacity-80">
              {weekdayShort(d)}
            </span>
            <span className="text-base tabular-nums">{d.getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function withDate(iso: string, day: Date): string {
  const base = new Date(iso)
  base.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
  return base.toISOString()
}

function formatYmd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function weekdayShort(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

function formatLabel(d: Date, diffDays: number): string {
  const monthDay = d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
  if (diffDays === 0) return `Today · ${monthDay}`
  if (diffDays === 1) return `Yesterday · ${monthDay}`
  if (diffDays > 0 && diffDays < 7) {
    return `${d.toLocaleDateString(undefined, { weekday: 'short' })} · ${monthDay}`
  }
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
