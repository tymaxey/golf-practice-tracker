import { Counter } from '@/components/Counter'
import { NumberPad } from '@/components/NumberPad'
import { SuccessTotal } from '@/components/SuccessTotal'
import { TapButtons } from '@/components/TapButtons'
import type { MetricValue } from '@/session/draft'
import { initialMetricValue } from '@/session/draft'
import type { MetricDef } from '@/types/model'

const NUMBERPAD_THRESHOLD = 12

type Props = {
  metric: MetricDef
  value: MetricValue | undefined
  onChange: (next: MetricValue) => void
}

export function MetricInput({ metric, value, onChange }: Props) {
  const v = value ?? initialMetricValue(metric)

  if (metric.inputType === 'counter' || metric.inputType === 'numeric') {
    const cur = v.kind === 'number' ? v.value : 0
    const min = metric.min ?? 0
    const max = metric.max
    const useNumberPad =
      max !== undefined && max - min + 1 <= NUMBERPAD_THRESHOLD

    if (useNumberPad) {
      return (
        <NumberPad
          label={metric.label}
          value={cur}
          min={min}
          max={max!}
          onChange={(n) => onChange({ kind: 'number', value: n })}
        />
      )
    }
    const isNumeric = metric.inputType === 'numeric'
    return (
      <Counter
        label={metric.label}
        value={cur}
        min={metric.min}
        max={metric.max}
        step={isNumeric ? 0.1 : 1}
        decimals={isNumeric ? 1 : 0}
        onChange={(n) => onChange({ kind: 'number', value: n })}
      />
    )
  }

  if (metric.inputType === 'success_total') {
    const s =
      v.kind === 'success' ? v : { kind: 'success' as const, successes: 0, attempts: 0 }
    return (
      <SuccessTotal
        successes={s.successes}
        attempts={s.attempts}
        onChange={(next) =>
          onChange({ kind: 'success', successes: next.successes, attempts: next.attempts })
        }
      />
    )
  }

  if (metric.inputType === 'tap_buttons') {
    const t =
      v.kind === 'tap'
        ? v
        : { kind: 'tap' as const, good: 0, near: 0, bad: 0 }
    return (
      <TapButtons
        counts={{ good: t.good, near: t.near, bad: t.bad }}
        onChange={(c) => onChange({ kind: 'tap', ...c })}
      />
    )
  }

  return null
}
