import type { Plan } from '@/types/model'

/**
 * Workout — placeholder plan with three quick-log options.
 *
 * Each "drill" is just a tap target: GolfForever, Run, Mobility. No metrics,
 * no per-drill flow. Tapping any option in the WorkoutPicker creates a
 * session with the option name in `notes` and returns home immediately.
 */
export const WORKOUT_PLAN: Plan = {
  id: 'workout',
  disciplineId: 'workout',
  name: 'Workout',
  isActive: true,
  phases: [
    {
      id: 'workout-phase-1',
      planId: 'workout',
      name: 'Phase 1',
      order: 1,
      protocol: {
        drills: [
          {
            id: 'workout-golfforever',
            type: 'workout',
            name: 'GolfForever',
            durationMin: 0,
            metrics: [],
          },
          {
            id: 'workout-run',
            type: 'workout',
            name: 'Run',
            durationMin: 0,
            metrics: [],
          },
          {
            id: 'workout-mobility',
            type: 'workout',
            name: 'Mobility',
            durationMin: 0,
            metrics: [],
          },
        ],
      },
    },
  ],
}
