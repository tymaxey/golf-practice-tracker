import type { MetricValue } from '@/session/draft'
import type { DrillDef } from '@/types/model'
import { MetricInput } from './MetricInput'

type DrillProps = {
  drill: DrillDef
  values: Record<string, MetricValue>
  onChange: (key: string, val: MetricValue) => void
  step: { current: number; total: number }
  onBack: () => void
  backLabel: string
  onNext: () => void
  nextLabel: string
}

export function Drill({
  drill,
  values,
  onChange,
  step,
  onBack,
  backLabel,
  onNext,
  nextLabel,
}: DrillProps) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 p-5 pb-24">
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="tap -ml-2 px-2 text-sm text-ink-400 active:text-ink-200"
          >
            ← {backLabel}
          </button>
          <span className="text-xs uppercase tracking-wide text-ink-400 tabular-nums">
            {step.current} / {step.total}
          </span>
        </div>
        <h1 className="text-xl font-semibold">{drill.name}</h1>
        <div className="text-sm text-ink-400">{drill.durationMin} min</div>
      </header>

      <section className="flex flex-col gap-5 rounded-2xl bg-ink-900 p-5">
        {drill.metrics.map((m) => (
          <Field key={m.key} label={m.label}>
            <MetricInput
              metric={m}
              value={values[m.key]}
              onChange={(v) => onChange(m.key, v)}
            />
          </Field>
        ))}
      </section>

      <button
        type="button"
        onClick={onNext}
        className="tap w-full rounded-2xl bg-accent-500 py-4 text-base font-semibold text-ink-950 active:opacity-80"
      >
        {nextLabel} →
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
    <div className="flex flex-col gap-2">
      <div className="text-sm text-ink-200">{label}</div>
      {children}
    </div>
  )
}
