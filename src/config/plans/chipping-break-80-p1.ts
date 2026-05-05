import type { Plan } from '@/types/model'

/**
 * Chipping (park sessions) — Phase 1 plan for Break-80 project.
 *
 * Phase 1 chipping is maintenance, not development. Park sessions are 1–2x
 * weekly, ~30 min each, focused on keeping short game solid while face
 * control work dominates the rest of practice.
 *
 * Two drills:
 *  1. Distance control — proximity-to-target accuracy at varied distances
 *  2. Lie variety — different lies to maintain adaptability
 *
 * Both metrics use `success_total` for fast entry (dual stepper, auto-percent).
 * No facade about complexity — Phase 1 chipping should be 30s of entry
 * and zero friction.
 *
 * Metric keys are prefixed `chip_` for global uniqueness. Drill ids are
 * prefixed `chip-`. To register: import in `src/config/plans/index.ts` and
 * add to the PLANS array.
 */
export const CHIPPING_PHASE_1: Plan = {
  id: 'chipping-break-80-p1',
  disciplineId: 'chipping',
  name: 'Break 80 — Chipping Phase 1',
  isActive: false,
  phases: [
    {
      id: 'chipping-break-80-p1-phase-1',
      planId: 'chipping-break-80-p1',
      name: 'Phase 1',
      order: 1,
      protocol: {
        drills: [
          {
            id: 'chip-distance-control',
            type: 'distance_control',
            name: 'Distance Control',
            durationMin: 15,
            metrics: [
              // Tight proximity — the harder bar.
              {
                key: 'chip_within_3ft',
                label: 'Chips within 3 ft / attempts',
                inputType: 'success_total',
                min: 0,
              },
              // Wider proximity — catches the misses that still saved par.
              {
                key: 'chip_within_6ft',
                label: 'Chips within 6 ft / attempts',
                inputType: 'success_total',
                min: 0,
              },
            ],
          },
          {
            id: 'chip-lie-variety',
            type: 'lie_variety',
            name: 'Lie Variety',
            durationMin: 10,
            metrics: [
              // Subjective "acceptable outcome" — landed on intended target,
              // didn't chunk/skull, finished within reasonable proximity.
              // Looser standard than the proximity drills above; the point
              // is adapting to different lies, not absolute accuracy.
              {
                key: 'chip_lie_acceptable',
                label: 'Acceptable outcomes / attempts',
                inputType: 'success_total',
                min: 0,
              },
            ],
          },
        ],
      },
    },
  ],
}
