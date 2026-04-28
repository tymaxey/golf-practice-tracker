import type { Plan } from '@/types/model'

/**
 * Golf — Live + Practice rounds with a free-form form.
 *
 * Tapping Golf on Home opens a sub-picker (Live | Practice). Tapping a mode
 * opens a form with: Course (text), Holes (number), Score (number), Notes
 * (textarea). All fields optional. Submit creates a Session.
 *
 * Each "drill" here is a mode, not a stepper screen. The form bypasses the
 * usual MetricInput flow and writes DrillResults directly. Course is stored
 * as DrillResult.text; holes/score as DrillResult.value.
 *
 * Golf sessions are excluded from the habit heatmap — playing isn't
 * practicing.
 */
export const GOLF_PLAN: Plan = {
  id: 'golf',
  disciplineId: 'golf',
  name: 'Golf',
  isActive: true,
  phases: [
    {
      id: 'golf-phase-1',
      planId: 'golf',
      name: 'Phase 1',
      order: 1,
      protocol: {
        drills: [
          {
            id: 'golf-live',
            type: 'golf_round',
            name: 'Live',
            durationMin: 0,
            metrics: [],
          },
          {
            id: 'golf-practice',
            type: 'golf_round',
            name: 'Practice',
            durationMin: 0,
            metrics: [],
          },
        ],
      },
    },
  ],
}
