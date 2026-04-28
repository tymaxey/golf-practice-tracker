import type { Plan } from '@/types/model'

/**
 * Simulator (R10 garage sessions) — Phase 1 plan for Break-80 project.
 *
 * Captures the structured R10 session blocks defined in the Phase 1 plan:
 *  1. Setup verification (photos + knuckle count)
 *  2. Smart Ball warm-up (connection)
 *  3. 7-iron face control block (the keystone metrics)
 *  4. Multi-club face check (optional, transfer test)
 *
 * Metric keys are prefixed with `sim_` to avoid collisions with the existing
 * putting plan keys. Drill ids are prefixed `sim-` for the same reason.
 *
 * To register: import this constant in `src/config/plans/index.ts` and add
 * it to the PLANS array. Set `isActive: false` if the existing simulator
 * plan needs to remain authoritative; only one plan per discipline can be
 * active at a time.
 */
export const SIMULATOR_PHASE_1: Plan = {
  id: 'simulator-break-80-p1',
  disciplineId: 'simulator',
  name: 'Break 80 — Simulator Phase 1',
  isActive: true,
  phases: [
    {
      id: 'simulator-break-80-p1-phase-1',
      planId: 'simulator-break-80-p1',
      name: 'Phase 1',
      order: 1,
      protocol: {
        drills: [
          {
            id: 'sim-setup-verification',
            type: 'setup_check',
            name: 'Setup Verification',
            durationMin: 5,
            metrics: [
              // 0-2: face-on photo + down-the-line photo. Range 3 -> NumberPad.
              {
                key: 'setup_photos_taken',
                label: 'Photos taken (face-on + DTL)',
                inputType: 'counter',
                min: 0,
                max: 2,
              },
              // Lead hand knuckle count at address. Range 4 -> NumberPad.
              // Target per Cameron: closer to 3 than 2.
              {
                key: 'lead_hand_knuckles',
                label: 'Lead hand knuckles visible (target ~3)',
                inputType: 'counter',
                min: 0,
                max: 3,
              },
            ],
          },
          {
            id: 'sim-smart-ball-warmup',
            type: 'connection_warmup',
            name: 'Smart Ball Warm-up',
            durationMin: 10,
            metrics: [
              // Reps with the Smart Ball held between forearms.
              // Unbounded counter -> +/- stepper.
              {
                key: 'smart_ball_reps',
                label: 'Reps with ball held',
                inputType: 'counter',
                min: 0,
              },
              // Subjective connection rating. Range 5 -> NumberPad.
              {
                key: 'connection_feel',
                label: 'Connection feel (1=lost, 5=locked in)',
                inputType: 'counter',
                min: 1,
                max: 5,
              },
            ],
          },
          {
            id: 'sim-face-control-7i',
            type: 'face_control',
            name: '7-iron Face Control Block',
            durationMin: 25,
            metrics: [
              // Total balls hit in the block. Unbounded -> stepper.
              {
                key: 'sim_7i_balls_hit',
                label: '7-iron balls hit',
                inputType: 'counter',
                min: 0,
              },
              // Headline metric from R10 export. Numeric for raw degrees.
              // Convention: positive = open, negative = closed.
              {
                key: 'sim_7i_face_angle_avg',
                label: '7i face angle avg (° — + open / − closed)',
                inputType: 'numeric',
              },
              // Variance metric — the real progress indicator in Phase 1.
              {
                key: 'sim_7i_face_angle_sd',
                label: '7i face angle SD (°)',
                inputType: 'numeric',
              },
              // Smash factor for contact quality.
              {
                key: 'sim_7i_smash_avg',
                label: '7i smash factor avg',
                inputType: 'numeric',
              },
            ],
          },
          {
            id: 'sim-multi-club-check',
            type: 'face_control',
            name: 'Multi-Club Face Check (optional, Phase 2 dry-run)',
            durationMin: 10,
            metrics: [
              // Phase 2 introduces multi-club tracking. Phase 1 = optional
              // sanity check. All numeric, all degree-based.
              {
                key: 'sim_driver_face_avg',
                label: 'Driver face angle avg (°)',
                inputType: 'numeric',
              },
              {
                key: 'sim_driver_smash_avg',
                label: 'Driver smash avg',
                inputType: 'numeric',
              },
              {
                key: 'sim_4h_face_avg',
                label: '4H face angle avg (°)',
                inputType: 'numeric',
              },
              {
                key: 'sim_wedge_face_avg',
                label: 'Wedge face angle avg (°)',
                inputType: 'numeric',
              },
            ],
          },
        ],
      },
    },
  ],
}
