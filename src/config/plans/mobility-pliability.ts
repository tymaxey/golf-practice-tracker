import type { Plan } from '@/types/model'

/**
 * Mobility — Pliability.
 *
 * External app session (Tom Brady's Pliability). The app provides the routine;
 * this plan exists only as a tap-to-log surface. Single drill with no content.
 *
 * Surfaced via Home → Workout → Mobility → Pliability (NOT a Home tile).
 * `isActive: false` keeps it off Home; the MobilityPicker hardcodes the list.
 */
export const MOBILITY_PLIABILITY: Plan = {
  id: 'mobility-pliability',
  disciplineId: 'mobility',
  name: 'Pliability',
  isActive: false,
  phases: [
    {
      id: 'mobility-pliability-phase-1',
      planId: 'mobility-pliability',
      name: 'Phase 1',
      order: 1,
      protocol: {
        drills: [
          {
            id: 'pliability-session',
            type: 'mobility',
            name: 'Pliability session',
            durationMin: 0,
            metrics: [],
          },
        ],
      },
    },
  ],
}
