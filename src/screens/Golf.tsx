import { useState } from 'react'
import { DateStripPicker } from '@/components/DateStripPicker'
import type { DrillDef } from '@/types/model'

export type GolfFormData = {
  startedAt: string
  course: string
  holes: string
  score: string
  notes: string
}

type GolfPickerProps = {
  drills: DrillDef[]
  onBack: () => void
  onPick: (drillId: string) => void
}

export function GolfPicker({ drills, onBack, onPick }: GolfPickerProps) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 px-5 pb-24 pt-3">
      <header className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onBack}
          className="tap -ml-2 self-start px-2 text-sm text-ink-400 active:text-ink-200"
        >
          ← Home
        </button>
        <h1 className="text-xl font-semibold">Golf</h1>
      </header>

      <section className="flex flex-col gap-3">
        {drills.map((drill) => (
          <button
            key={drill.id}
            type="button"
            onClick={() => onPick(drill.id)}
            className="tap flex w-full flex-col gap-1 rounded-2xl border-2 border-accent-500 px-5 py-4 text-left text-ink-200 active:bg-ink-900"
          >
            <span className="text-base font-semibold">{drill.name}</span>
          </button>
        ))}
      </section>
    </div>
  )
}

type GolfFormProps = {
  mode: 'live' | 'practice'
  saving: boolean
  onBack: () => void
  onSubmit: (data: GolfFormData) => void
}

export function GolfForm({ mode, saving, onBack, onSubmit }: GolfFormProps) {
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString())
  const [course, setCourse] = useState('')
  const [holes, setHoles] = useState('')
  const [score, setScore] = useState('')
  const [notes, setNotes] = useState('')

  const submit = () => {
    if (saving) return
    onSubmit({ startedAt, course, holes, score, notes })
  }

  const heading = mode === 'live' ? 'Golf — Live' : 'Golf — Practice'

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 px-5 pb-24 pt-3">
      <header className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onBack}
          className="tap -ml-2 self-start px-2 text-sm text-ink-400 active:text-ink-200"
        >
          ← Back
        </button>
        <h1 className="text-xl font-semibold">{heading}</h1>
      </header>

      <section className="flex flex-col gap-4">
        <DateStripPicker value={startedAt} onChange={setStartedAt} />

        <Field label="Course">
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full rounded-xl bg-ink-800 p-3 text-sm text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </Field>

        <Field label="Holes played">
          <input
            type="number"
            inputMode="numeric"
            value={holes}
            onChange={(e) => setHoles(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full rounded-xl bg-ink-800 p-3 text-sm text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </Field>

        <Field label="Score">
          <input
            type="number"
            inputMode="numeric"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full rounded-xl bg-ink-800 p-3 text-sm text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </Field>

        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional"
            className="mt-1 w-full resize-none rounded-xl bg-ink-800 p-3 text-sm text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </Field>
      </section>

      <button
        type="button"
        onClick={submit}
        disabled={saving}
        className="tap mt-2 w-full rounded-2xl bg-accent-500 py-4 text-base font-semibold text-ink-950 active:opacity-80 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Submit'}
      </button>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col text-sm font-semibold uppercase tracking-wide text-ink-400">
      {label}
      {children}
    </label>
  )
}
