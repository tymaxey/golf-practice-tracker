import type { Plan } from '@/types/model'

export const PUTTING_PHASE_1: Plan = {
  id: 'putting-break-80-p1',
  disciplineId: 'putting',
  name: 'Break 80 — Putting Phase 1',
  isActive: true,
  phases: [
    {
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
              {
                key: 'gate_5ft_clean',
                label: 'Gate drill (5 ft) — clean throughs',
                inputType: 'counter',
                min: 0,
                max: 10,
              },
              {
                key: 'consec_3ft_streak',
                label: 'Consecutive 3-ft makes — longest streak',
                inputType: 'counter',
                min: 0,
              },
              {
                key: 'makes_5ft',
                label: '5-ft makes / attempts',
                inputType: 'success_total',
                min: 0,
              },
            ],
          },
          {
            id: 'distance-control',
            type: 'distance_control',
            name: 'Distance Control Block',
            durationMin: 5,
            metrics: [
              {
                key: 'ladder_within_6',
                label: 'Ladder drill (3/6/9 ft) — within 6"',
                inputType: 'success_total',
                min: 0,
              },
              {
                key: 'random_within_6',
                label: 'Random distances — within 6"',
                inputType: 'success_total',
                min: 0,
              },
            ],
          },
          {
            id: 'pressure-random',
            type: 'pressure_random',
            name: 'Pressure / Random Block',
            durationMin: 5,
            metrics: [
              {
                key: 'pressure_taps',
                label: 'Per-attempt result',
                inputType: 'tap_buttons',
              },
            ],
          },
        ],
      },
    },
  ],
}
