# Drill authoring guide

A reference for generating new drill configs in this codebase. Self-contained:
nothing here requires reading other files.

## What you are generating

A TypeScript module that exports a `Plan` constant. The app loads it at boot.
There is no in-app drill builder — adding a drill = new file, register, restart.

## Where it goes

- New file: `src/config/plans/{discipline}-{plan-slug}.ts`
- Register it: import the new constant in `src/config/plans/index.ts` and add
  it to the `PLANS` array
- IDs (`plan.id`, `phase.id`, `drill.id`, `metric.key`) are **stable**. Once
  any session has saved against an ID, do not rename — sessions reference it
  by string and renaming orphans data

## Type contract

These types are the source of truth. A generated config must match exactly.

```ts
type Plan = {
  id: string
  disciplineId: 'putting' | 'chipping' | 'simulator' | 'range'
  name: string
  phases: Phase[]
  isActive: boolean
}

type Phase = {
  id: string
  planId: string
  name: string
  order: number
  protocol: { drills: DrillDef[] }
}

type DrillDef = {
  id: string
  type: 'face_control' | 'distance_control' | 'pressure_random' | string
  name: string
  durationMin: number
  metrics: MetricDef[]
}

type MetricDef = {
  key: string
  label: string
  inputType: 'counter' | 'success_total' | 'tap_buttons' | 'numeric'
  min?: number
  max?: number
}
```

## Input types

| `inputType` | UI behavior | Storage shape | Persistence (per metric) |
|---|---|---|---|
| `counter` | `+/−` stepper, OR a NumberPad grid if `max - min + 1 ≤ 12` | `{ value: number }` | one DrillResult row, `value` only |
| `numeric` | Identical to `counter` (semantic distinction only — use for raw measurements) | `{ value: number }` | one DrillResult row, `value` only |
| `success_total` | Dual stepper "successes / attempts" with auto-percent | `{ successes, attempts }` | one DrillResult row, `value=successes, denominator=attempts` |
| `tap_buttons` | Three buttons (good +1 / near 0 / bad −1) with undo | `{ good, near, bad }` | **four DrillResult rows** with hardcoded keys `pressure_score`, `pressure_good`, `pressure_near`, `pressure_bad` |

### Input-type rules

- **NumberPad threshold is 12.** For drill-entry speed, prefer bounded counters
  where `max - min + 1 ≤ 12` so the user gets a one-tap grid instead of
  press-and-hold stepping. The 30-second entry budget assumes this.
- **`tap_buttons` is single-instance per app.** The persistence and hydration
  pipelines hardcode the `pressure_` key prefix. Using `tap_buttons` in a
  second metric will collide silently. Either reuse the existing pressure
  metric (`pressure_taps`) or refactor `src/session/draft.ts` and
  `src/session/derive.ts` to take a configurable prefix.
- **Metric `key`s are globally unique** across all drills, plans, and
  disciplines. The session draft is a flat `Record<string, MetricValue>`;
  same key in two drills = silent overwrite.

## Naming conventions

- `plan.id`, `phase.id`, `drill.id`: lowercase-kebab (`putting-break-80-p1`,
  `face-control`, `distance-control`)
- `metric.key`: snake_case, descriptive (`gate_5ft_clean`, `random_within_6`,
  `consec_3ft_streak`). No `pressure_` prefix unless it is part of the
  built-in tap_buttons block.
- `name` (drill, plan, phase): title case, human-readable
- `label` (metric): exactly as it should appear in the UI and markdown export.
  Em-dashes and inch marks are fine: `'Gate drill (5 ft) — clean throughs'`

## Auto vs. wired surfaces

A new metric appears automatically in:

- The drill entry screen (renders via `MetricInput.tsx` based on `inputType`)
- The CSV export (one row per `DrillResult`, uses `metric.label` as-is)

A new metric does **NOT** appear automatically in:

- **Trends sparklines** — `src/session/derive.ts` has named extractors
  (`fivesRate`, `ladderRate`, `pressureScore`) keyed to specific metric
  strings. New metrics need a new extractor.
- **Home recent-session summary** — uses `headlineSummary()` in `derive.ts`,
  which is hand-written.
- **Markdown export per-block sections** — `src/export/format.ts` has
  hand-written `renderFaceControl` / `renderDistanceControl` /
  `renderPressureBlock` functions. A new drill block needs its own renderer
  and the corresponding export-headline entry in `exportHeadline()`.
- **Heatmap** — counts sessions, doesn't care about metrics. No work needed.

## Hard rules (from BRIEF §2)

- **30-second rule.** Full session entry must complete in ≤30s of input time.
  Bias toward bounded counters and `success_total` over freeform `numeric`.
  Avoid more than ~7 metrics per drill block.
- **Multi-discipline data model is permanent.** Drills must declare their
  `disciplineId`. Don't collapse back to putting-only.
- **Local-only.** No imports from external services or runtime fetches.

## Template

Copy this and fill in the placeholders. Replace every `<<<...>>>` token.

```ts
import type { Plan } from '@/types/model'

export const <<<CONST_NAME_UPPER_SNAKE>>>: Plan = {
  id: '<<<plan-id-kebab>>>',
  disciplineId: '<<<putting | chipping | simulator | range>>>',
  name: '<<<Plan name, title case>>>',
  isActive: true,
  phases: [
    {
      id: '<<<plan-id>>>-phase-1',
      planId: '<<<plan-id>>>',
      name: 'Phase 1',
      order: 1,
      protocol: {
        drills: [
          {
            id: '<<<drill-id-kebab>>>',
            type: '<<<face_control | distance_control | pressure_random | custom_string>>>',
            name: '<<<Drill name, title case>>>',
            durationMin: <<<minutes_int>>>,
            metrics: [
              {
                key: '<<<metric_key_snake>>>',
                label: '<<<Human-readable label>>>',
                inputType: '<<<counter | success_total | tap_buttons | numeric>>>',
                min: <<<int_or_omit>>>,
                max: <<<int_or_omit_recommended_for_grid_<=12_range>>>,
              },
              // ...more metrics
            ],
          },
          // ...more drills
        ],
      },
    },
  ],
}
```

After writing the file, edit `src/config/plans/index.ts`:

```ts
import { <<<CONST_NAME_UPPER_SNAKE>>> } from './<<<file-stem>>>'

export const PLANS: Plan[] = [PUTTING_PHASE_1, <<<CONST_NAME_UPPER_SNAKE>>>]
```

Only one plan per discipline can have `isActive: true` at a time —
`ACTIVE_PLAN_FOR_DISCIPLINE()` returns the first match.

## Worked example: existing putting plan (abbreviated)

```ts
export const PUTTING_PHASE_1: Plan = {
  id: 'putting-break-80-p1',
  disciplineId: 'putting',
  name: 'Break 80 — Putting Phase 1',
  isActive: true,
  phases: [{
    id: 'putting-break-80-p1-phase-1',
    planId: 'putting-break-80-p1',
    name: 'Phase 1',
    order: 1,
    protocol: {
      drills: [
        {
          id: 'face-control',
          type: 'face_control',
          name: 'Face Control Block',
          durationMin: 5,
          metrics: [
            // bounded counter -> NumberPad grid (10-1+1=10 ≤ 12)
            { key: 'gate_5ft_clean', label: 'Gate drill (5 ft) — clean throughs',
              inputType: 'counter', min: 0, max: 10 },
            // unbounded counter -> +/- stepper
            { key: 'consec_3ft_streak', label: 'Consecutive 3-ft makes — longest streak',
              inputType: 'counter', min: 0 },
            // dual stepper, derives a percentage
            { key: 'makes_5ft', label: '5-ft makes / attempts',
              inputType: 'success_total', min: 0 },
          ],
        },
        // distance-control: ladder_within_6 + random_within_6 (both success_total)
        // pressure-random: pressure_taps (tap_buttons) — special, see input-type rules
      ],
    },
  }],
}
```

## Checklist when adding a drill

- [ ] New file in `src/config/plans/` with the right `disciplineId`
- [ ] Registered in `src/config/plans/index.ts` PLANS array
- [ ] All metric keys are globally unique (grep `src/config/plans/`)
- [ ] No `tap_buttons` collision (only one allowed in the app today)
- [ ] If a metric should drive trends or the headline summary: add an
      extractor in `src/session/derive.ts` and reference it in
      `headlineSummary()` and/or `exportHeadline()`
- [ ] If a new drill block should appear in the markdown export: add a
      `renderXxxBlock()` in `src/export/format.ts` and call it from
      `markdownSession()`
- [ ] Counter/numeric metrics with bounded ranges: pick `max` so the range
      is ≤ 12 to get the NumberPad grid (faster entry)
- [ ] Verify the full session can be entered in ≤ 30s of taps
