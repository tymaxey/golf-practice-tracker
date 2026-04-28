import type { Draft, MetricValue } from '@/session/draft'
import type { DrillDef } from '@/types/model'
import { MetricInput } from './MetricInput'

type ReviewProps = {
  drills: DrillDef[]
  draft: Draft
  onChange: (key: string, val: MetricValue) => void
  onNotesChange: (notes: string) => void
  onBack: () => void
  backLabel: string
  onSave: () => void
  saving: boolean
  mode: 'new' | 'edit'
}

export function Review({
  drills,
  draft,
  onChange,
  onNotesChange,
  onBack,
  backLabel,
  onSave,
  saving,
  mode,
}: ReviewProps) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 p-5 pb-24">
      <header className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onBack}
          className="tap -ml-2 self-start px-2 text-sm text-ink-400 active:text-ink-200"
        >
          ← {backLabel}
        </button>
        <h1 className="text-xl font-semibold">
          {mode === 'edit' ? 'Edit session' : 'Review & save'}
        </h1>
        <div className="text-sm text-ink-400">
          {new Date(draft.startedAt).toLocaleString()}
        </div>
      </header>

      {drills.map((drill) => (
        <section
          key={drill.id}
          className="flex flex-col gap-4 rounded-2xl bg-ink-900 p-5"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
            {drill.name}
          </h2>
          {drill.metrics.map((m) => (
            <div key={m.key} className="flex flex-col gap-2">
              <div className="text-sm text-ink-200">{m.label}</div>
              <MetricInput
                metric={m}
                value={draft.values[m.key]}
                onChange={(v) => onChange(m.key, v)}
              />
            </div>
          ))}
        </section>
      ))}

      <section className="flex flex-col gap-2 rounded-2xl bg-ink-900 p-5">
        <label
          htmlFor="session-notes"
          className="text-sm font-semibold uppercase tracking-wide text-ink-400"
        >
          Notes
        </label>
        <textarea
          id="session-notes"
          value={draft.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          placeholder="Anything worth remembering"
          className="w-full resize-none rounded-xl bg-ink-800 p-3 text-sm text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </section>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="tap w-full rounded-2xl bg-accent-500 py-4 text-base font-semibold text-ink-950 active:opacity-80 disabled:opacity-50"
      >
        {saving
          ? 'Saving…'
          : mode === 'edit'
            ? 'Save changes'
            : 'Save session'}
      </button>
    </div>
  )
}
