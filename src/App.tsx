import { useEffect, useMemo, useState } from 'react'
import { Counter } from '@/components/Counter'
import { SuccessTotal } from '@/components/SuccessTotal'
import { Toast } from '@/components/Toast'
import { ACTIVE_PLAN_FOR_DISCIPLINE } from '@/config/plans'
import { createSession, listSessions } from '@/db'
import type { DrillResult, MetricDef, Session } from '@/types/model'

type FaceControlInputs = {
  gate_5ft_clean: number
  consec_3ft_streak: number
  makes_5ft: { successes: number; attempts: number }
}

const EMPTY_INPUTS: FaceControlInputs = {
  gate_5ft_clean: 0,
  consec_3ft_streak: 0,
  makes_5ft: { successes: 0, attempts: 0 },
}

export default function App() {
  const plan = ACTIVE_PLAN_FOR_DISCIPLINE('putting')
  const phase = plan?.phases[0]
  const faceControl = phase?.protocol.drills.find(
    (d) => d.type === 'face_control',
  )

  const metricByKey = useMemo(() => {
    const map = new Map<string, MetricDef>()
    faceControl?.metrics.forEach((m) => map.set(m.key, m))
    return map
  }, [faceControl])

  const [inputs, setInputs] = useState<FaceControlInputs>(EMPTY_INPUTS)
  const [sessions, setSessions] = useState<Session[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [startedAt] = useState(() => new Date().toISOString())

  useEffect(() => {
    listSessions().then(setSessions)
  }, [])

  if (!plan || !phase || !faceControl) {
    return (
      <div className="p-6 text-red-400">
        No active putting plan found. Check src/config/plans.
      </div>
    )
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const drills: DrillResult[] = [
        {
          drillDefId: faceControl.id,
          metric: 'gate_5ft_clean',
          label: metricByKey.get('gate_5ft_clean')!.label,
          value: inputs.gate_5ft_clean,
        },
        {
          drillDefId: faceControl.id,
          metric: 'consec_3ft_streak',
          label: metricByKey.get('consec_3ft_streak')!.label,
          value: inputs.consec_3ft_streak,
        },
        {
          drillDefId: faceControl.id,
          metric: 'makes_5ft',
          label: metricByKey.get('makes_5ft')!.label,
          value: inputs.makes_5ft.successes,
          denominator: inputs.makes_5ft.attempts,
        },
      ]

      await createSession({
        startedAt,
        endedAt: new Date().toISOString(),
        disciplineId: plan.disciplineId,
        planId: plan.id,
        phaseId: phase.id,
        notes: '',
        drills,
      })

      const next = await listSessions()
      setSessions(next)
      setInputs(EMPTY_INPUTS)
      setToast('Saved')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 p-5 pb-24">
      <header>
        <div className="text-xs uppercase tracking-wide text-ink-400">
          {plan.name}
        </div>
        <h1 className="text-xl font-semibold">{faceControl.name}</h1>
        <div className="text-sm text-ink-400">
          {phase.name} · {faceControl.durationMin} min
        </div>
      </header>

      <section className="flex flex-col gap-5 rounded-2xl bg-ink-900 p-5">
        <Field label={metricByKey.get('gate_5ft_clean')!.label}>
          <Counter
            label="gate clean throughs"
            value={inputs.gate_5ft_clean}
            min={metricByKey.get('gate_5ft_clean')!.min}
            max={metricByKey.get('gate_5ft_clean')!.max}
            onChange={(v) => setInputs((s) => ({ ...s, gate_5ft_clean: v }))}
          />
        </Field>

        <Field label={metricByKey.get('consec_3ft_streak')!.label}>
          <Counter
            label="3-ft streak"
            value={inputs.consec_3ft_streak}
            min={metricByKey.get('consec_3ft_streak')!.min}
            onChange={(v) =>
              setInputs((s) => ({ ...s, consec_3ft_streak: v }))
            }
          />
        </Field>

        <Field label={metricByKey.get('makes_5ft')!.label}>
          <SuccessTotal
            successes={inputs.makes_5ft.successes}
            attempts={inputs.makes_5ft.attempts}
            onChange={(v) => setInputs((s) => ({ ...s, makes_5ft: v }))}
          />
        </Field>
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="tap w-full rounded-2xl bg-accent-500 py-4 text-base font-semibold text-ink-950 active:opacity-80 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save drill'}
      </button>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
          Saved sessions ({sessions.length})
        </h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-ink-400">
            No sessions yet. Save one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </ul>
        )}
      </section>

      <Toast message={toast} onDismiss={() => setToast(null)} />
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

function SessionCard({ session }: { session: Session }) {
  const date = new Date(session.startedAt)
  return (
    <li className="rounded-xl bg-ink-900 p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-ink-400">
        <span>{date.toLocaleString()}</span>
        <span>
          {session.disciplineId} · {session.planId}
        </span>
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        {session.drills.map((d, i) => (
          <li key={`${d.metric}-${i}`} className="flex justify-between gap-3">
            <span className="text-ink-400">{d.label}</span>
            <span className="font-medium tabular-nums">
              {d.denominator !== undefined
                ? `${d.value} / ${d.denominator}`
                : d.value}
            </span>
          </li>
        ))}
      </ul>
    </li>
  )
}
