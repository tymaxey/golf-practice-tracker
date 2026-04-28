import type {
  DrillDef,
  DrillResult,
  MetricDef,
  Session,
} from '@/types/model'

export type MetricValue =
  | { kind: 'number'; value: number }
  | { kind: 'success'; successes: number; attempts: number }
  | { kind: 'tap'; good: number; near: number; bad: number }

export type Draft = {
  startedAt: string
  notes: string
  values: Record<string, MetricValue>
}

export function initialMetricValue(m: MetricDef): MetricValue {
  switch (m.inputType) {
    case 'counter':
    case 'numeric':
      return { kind: 'number', value: m.min ?? 0 }
    case 'success_total':
      return { kind: 'success', successes: 0, attempts: 0 }
    case 'tap_buttons':
      return { kind: 'tap', good: 0, near: 0, bad: 0 }
  }
}

export function emptyDraft(drills: DrillDef[]): Draft {
  const values: Record<string, MetricValue> = {}
  for (const drill of drills) {
    for (const m of drill.metrics) {
      values[m.key] = initialMetricValue(m)
    }
  }
  return {
    startedAt: new Date().toISOString(),
    notes: '',
    values,
  }
}

export function serializeDraft(
  draft: Draft,
  drills: DrillDef[],
): DrillResult[] {
  const out: DrillResult[] = []
  for (const drill of drills) {
    for (const m of drill.metrics) {
      const v = draft.values[m.key]
      if (!v) continue
      if (v.kind === 'number') {
        out.push({
          drillDefId: drill.id,
          metric: m.key,
          label: m.label,
          value: v.value,
        })
      } else if (v.kind === 'success') {
        out.push({
          drillDefId: drill.id,
          metric: m.key,
          label: m.label,
          value: v.successes,
          denominator: v.attempts,
        })
      } else if (v.kind === 'tap') {
        const score = v.good - v.bad
        out.push({
          drillDefId: drill.id,
          metric: 'pressure_score',
          label: 'Pressure — score',
          value: score,
        })
        out.push({
          drillDefId: drill.id,
          metric: 'pressure_good',
          label: 'Pressure — good',
          value: v.good,
        })
        out.push({
          drillDefId: drill.id,
          metric: 'pressure_near',
          label: 'Pressure — near',
          value: v.near,
        })
        out.push({
          drillDefId: drill.id,
          metric: 'pressure_bad',
          label: 'Pressure — bad',
          value: v.bad,
        })
      }
    }
  }
  return out
}

export function hydrateDraft(session: Session, drills: DrillDef[]): Draft {
  const values: Record<string, MetricValue> = {}
  for (const drill of drills) {
    for (const m of drill.metrics) {
      values[m.key] = initialMetricValue(m)
    }
  }

  for (const r of session.drills) {
    if (r.metric === 'pressure_score') continue

    if (
      r.metric === 'pressure_good' ||
      r.metric === 'pressure_near' ||
      r.metric === 'pressure_bad'
    ) {
      const cur = values['pressure_taps']
      const tap =
        cur && cur.kind === 'tap' ? cur : ({ kind: 'tap', good: 0, near: 0, bad: 0 } as const)
      const which = r.metric.replace('pressure_', '') as 'good' | 'near' | 'bad'
      values['pressure_taps'] = { ...tap, [which]: r.value }
      continue
    }

    const drillDef = drills.find((d) => d.id === r.drillDefId)
    const metricDef = drillDef?.metrics.find((m) => m.key === r.metric)
    if (!metricDef) continue

    if (
      metricDef.inputType === 'counter' ||
      metricDef.inputType === 'numeric'
    ) {
      values[r.metric] = { kind: 'number', value: r.value }
    } else if (metricDef.inputType === 'success_total') {
      values[r.metric] = {
        kind: 'success',
        successes: r.value,
        attempts: r.denominator ?? 0,
      }
    }
  }

  return {
    startedAt: session.startedAt,
    notes: session.notes,
    values,
  }
}
