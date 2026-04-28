import { useMemo, useState } from 'react'
import {
  csvFromSessions,
  filterSessionsInRange,
  markdownRange,
  markdownSession,
  shiftYMD,
  startOfMonthYMD,
  todayYMD,
} from '@/export/format'
import { copyText, shareOrDownloadCsv } from '@/export/share'
import { headlineSummary } from '@/session/derive'
import type { Session } from '@/types/model'

type SettingsProps = {
  sessions: Session[]
  onBack: () => void
  onClearAll: () => Promise<void>
  onToast: (msg: string) => void
}

type Preset = 'last7' | 'last30' | 'thisMonth' | 'custom'

type RangeState = {
  preset: Preset
  start: string
  end: string
}

function rangeForPreset(preset: Preset, current: RangeState): RangeState {
  const today = todayYMD()
  switch (preset) {
    case 'last7':
      return { preset, start: shiftYMD(today, -6), end: today }
    case 'last30':
      return { preset, start: shiftYMD(today, -29), end: today }
    case 'thisMonth':
      return { preset, start: startOfMonthYMD(), end: today }
    case 'custom':
      return { ...current, preset }
  }
}

export function Settings({
  sessions,
  onBack,
  onClearAll,
  onToast,
}: SettingsProps) {
  const [range, setRange] = useState<RangeState>(() =>
    rangeForPreset('last7', { preset: 'last7', start: '', end: '' }),
  )
  const [picking, setPicking] = useState(false)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [working, setWorking] = useState(false)

  const inRange = useMemo(
    () => filterSessionsInRange(sessions, range.start, range.end),
    [sessions, range.start, range.end],
  )

  const rangeValid =
    range.start.length === 10 &&
    range.end.length === 10 &&
    range.start <= range.end

  const handleCopyRange = async () => {
    if (working) return
    setWorking(true)
    try {
      const md = markdownRange(inRange, range.start, range.end)
      const ok = await copyText(md)
      onToast(ok ? `Copied ${inRange.length} sessions` : 'Copy failed')
    } finally {
      setWorking(false)
    }
  }

  const handleCsvExport = async () => {
    if (working) return
    setWorking(true)
    try {
      const csv = csvFromSessions(inRange)
      const filename = `practice-${range.start}_to_${range.end}.csv`
      const result = await shareOrDownloadCsv(filename, csv)
      if (result === 'shared') onToast('Shared CSV')
      else if (result === 'downloaded') onToast('Downloaded CSV')
      else onToast('Export failed')
    } finally {
      setWorking(false)
    }
  }

  const handlePickSession = () => setPicking((p) => !p)

  const handleCopyOne = async (s: Session) => {
    if (working) return
    setWorking(true)
    try {
      const ok = await copyText(markdownSession(s))
      onToast(ok ? 'Copied session' : 'Copy failed')
      if (ok) setPicking(false)
    } finally {
      setWorking(false)
    }
  }

  const handleClearAll = async () => {
    if (working) return
    setWorking(true)
    try {
      await onClearAll()
      onToast('Cleared all data')
      setConfirmingClear(false)
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 p-5 pb-24">
      <header className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onBack}
          className="tap -ml-2 self-start px-2 text-sm text-ink-400 active:text-ink-200"
        >
          ← Home
        </button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl bg-ink-900 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
          Export range
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {(['last7', 'last30', 'thisMonth'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setRange((r) => rangeForPreset(p, r))}
              className={`tap rounded-xl px-3 py-3 text-sm font-medium ${
                range.preset === p
                  ? 'bg-accent-500 text-ink-950'
                  : 'bg-ink-800 text-ink-200 active:bg-ink-700'
              }`}
            >
              {p === 'last7' ? 'Last 7' : p === 'last30' ? 'Last 30' : 'This month'}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setRange((r) =>
              r.preset === 'custom'
                ? rangeForPreset('last7', r)
                : { ...r, preset: 'custom' },
            )
          }
          className="tap self-start text-xs text-ink-400 active:text-ink-200"
        >
          {range.preset === 'custom' ? '↑ Use a preset' : '↓ Custom range'}
        </button>

        {range.preset === 'custom' && (
          <div className="flex gap-2">
            <label className="flex-1 text-xs text-ink-400">
              Start
              <input
                type="date"
                value={range.start}
                max={range.end}
                onChange={(e) =>
                  setRange((r) => ({ ...r, start: e.target.value }))
                }
                className="mt-1 w-full rounded-xl bg-ink-800 p-3 text-sm text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </label>
            <label className="flex-1 text-xs text-ink-400">
              End
              <input
                type="date"
                value={range.end}
                min={range.start}
                onChange={(e) =>
                  setRange((r) => ({ ...r, end: e.target.value }))
                }
                className="mt-1 w-full rounded-xl bg-ink-800 p-3 text-sm text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </label>
          </div>
        )}

        <div className="text-xs text-ink-400">
          {!rangeValid
            ? 'Pick a valid date range.'
            : inRange.length === 0
              ? 'No sessions in range.'
              : `${inRange.length} session${inRange.length === 1 ? '' : 's'} in range.`}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCopyRange}
            disabled={working || !rangeValid || inRange.length === 0}
            className="tap w-full rounded-2xl bg-accent-500 py-4 text-sm font-semibold text-ink-950 active:opacity-80 disabled:opacity-40"
          >
            Copy markdown
          </button>
          <button
            type="button"
            onClick={handleCsvExport}
            disabled={working || !rangeValid || inRange.length === 0}
            className="tap w-full rounded-2xl bg-ink-800 py-4 text-sm font-semibold text-ink-100 active:bg-ink-700 disabled:opacity-40"
          >
            Export CSV
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-ink-900 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
          Single session
        </h2>
        <button
          type="button"
          onClick={handlePickSession}
          disabled={sessions.length === 0}
          className="tap w-full rounded-2xl bg-ink-800 py-4 text-sm font-semibold text-ink-100 active:bg-ink-700 disabled:opacity-40"
        >
          {picking ? 'Cancel' : 'Pick a session to copy'}
        </button>

        {picking && (
          <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {sessions.length === 0 ? (
              <li className="text-sm text-ink-400">No sessions yet.</li>
            ) : (
              sessions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => handleCopyOne(s)}
                    disabled={working}
                    className="tap flex w-full flex-col gap-1 rounded-xl bg-ink-800 p-3 text-left active:bg-ink-700 disabled:opacity-50"
                  >
                    <span className="text-xs text-ink-400">
                      {formatPickerDate(s.startedAt)}
                    </span>
                    <span className="text-sm text-ink-200">
                      {headlineSummary(s)}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl bg-ink-900 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
          Danger zone
        </h2>
        {!confirmingClear ? (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            disabled={sessions.length === 0}
            className="tap w-full rounded-2xl bg-ink-800 py-4 text-sm font-semibold text-red-400 active:bg-ink-700 disabled:opacity-40"
          >
            Clear all data
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-ink-200">
              Delete all {sessions.length} sessions? This can&apos;t be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingClear(false)}
                disabled={working}
                className="tap flex-1 rounded-2xl bg-ink-800 py-3 text-sm font-semibold text-ink-100 active:bg-ink-700 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={working}
                className="tap flex-1 rounded-2xl bg-red-500 py-3 text-sm font-semibold text-ink-950 active:opacity-80 disabled:opacity-40"
              >
                {working ? 'Clearing…' : 'Delete all'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function formatPickerDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
