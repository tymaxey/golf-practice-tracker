import type { Plan, DrillContent, DrillDef } from '@/types/model'

type MobilityProtocolProps = {
  plan: Plan
  saving: boolean
  todayCount: number
  onBack: () => void
  onComplete: () => void
}

export function MobilityProtocol({
  plan,
  saving,
  todayCount,
  onBack,
  onComplete,
}: MobilityProtocolProps) {
  const drills = plan.phases[0]?.protocol.drills ?? []
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 px-5 pb-28 pt-3">
      <header className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onBack}
          className="tap -ml-2 self-start px-2 text-sm text-ink-400 active:text-ink-200"
        >
          ← Mobility
        </button>
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold">{plan.name}</h1>
          <span className="text-xs uppercase tracking-wide text-ink-400 tabular-nums">
            {todayCount} today
          </span>
        </div>
      </header>

      {drills.length === 0 || drills.every((d) => !d.content) ? (
        <p className="text-sm text-ink-400">
          Tap "Mark complete" after your session.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          {drills.map((d, i) => (
            <DrillCard key={d.id} index={i + 1} drill={d} />
          ))}
        </ol>
      )}

      <button
        type="button"
        onClick={onComplete}
        disabled={saving}
        className="tap mt-2 w-full rounded-2xl bg-accent-500 py-4 text-base font-semibold text-ink-950 active:opacity-80 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Mark complete'}
      </button>
    </div>
  )
}

function DrillCard({ index, drill }: { index: number; drill: DrillDef }) {
  const c = drill.content
  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-ink-900 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold text-ink-200">{drill.name}</h2>
        <span className="text-xs uppercase tracking-wide text-ink-400 tabular-nums">
          {index}
        </span>
      </div>
      {c ? <DrillContentBlock content={c} /> : null}
    </li>
  )
}

function DrillContentBlock({ content }: { content: DrillContent }) {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-ink-200">
      {content.targets ? (
        <Section label="Targets" body={content.targets} />
      ) : null}
      {content.dose ? <Section label="Dose" body={content.dose} accent /> : null}
      {content.setup ? <Section label="Setup" body={content.setup} /> : null}
      {content.execution ? (
        <Section label="Execution" body={content.execution} />
      ) : null}
      {content.cues ? <Section label="Cues" body={content.cues} /> : null}
      {content.why ? <Section label="Why" body={content.why} muted /> : null}
      {content.stopCriteria ? (
        <Section label="Stop if" body={content.stopCriteria} warn />
      ) : null}
    </div>
  )
}

type SectionProps = {
  label: string
  body: string
  accent?: boolean
  muted?: boolean
  warn?: boolean
}

function Section({ label, body, accent, muted, warn }: SectionProps) {
  const labelClass = warn
    ? 'text-amber-400'
    : accent
    ? 'text-accent-500'
    : 'text-ink-400'
  const bodyClass = muted ? 'text-ink-400' : 'text-ink-200'
  return (
    <div className="flex flex-col gap-1">
      <span
        className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}
      >
        {label}
      </span>
      <p className={bodyClass}>{body}</p>
    </div>
  )
}
