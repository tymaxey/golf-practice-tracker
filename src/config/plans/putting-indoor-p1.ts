import type { Plan } from '@/types/model'

/**
 * Break 80 — Putting Indoor (Mat) Phase 1
 *
 * Daily 15-minute Wellputt mat protocol. Replaces the original
 * `putting-break-80-p1` plan as the indoor default.
 *
 * Block structure preserved (face / distance / pressure) because it maps to
 * Ty's data leaks. Drill mechanics refreshed to break mat-fatigue.
 *
 * Continuity-preserved metrics:
 *   - `makes_5ft` — Phase 1 benchmark metric (>55% by week 6). Read by the
 *     existing `fivesRate` extractor in derive.ts. DO NOT RENAME.
 *   - `pressure_taps` — singleton tap_buttons (hardcoded `pressure_` prefix
 *     in draft.ts/derive.ts). Read by the existing `pressureScore` extractor.
 *     DO NOT RENAME.
 *
 * New metrics:
 *   - `alley_3ft_makes` — replaces `gate_5ft_clean`
 *   - `heads_up_5ft_makes` — replaces `consec_3ft_streak`
 *   - `good_zone_9ft` — added to distance-control for "die it past" speed
 *   - `random_ladder_within_6` — replaces `ladder_within_6` + `random_within_6`
 *     (consolidates two drills into one randomized 10-attempt drill)
 *
 * Code touches required when activating this plan — see integration note.
 */
export const PUTTING_INDOOR_P1: Plan = {
  id: 'putting-indoor-p1',
  disciplineId: 'putting',
  name: 'Break 80 — Putting Indoor (Mat)',
  isActive: true,
  phases: [
    {
      id: 'putting-indoor-p1-phase-1',
      planId: 'putting-indoor-p1',
      name: 'Phase 1',
      order: 1,
      protocol: {
        drills: [
          {
            id: 'face-control-mat',
            type: 'face_control',
            name: 'Face Control Block',
            durationMin: 5,
            metrics: [
              // Alley drill — two alignment sticks creating a ball-width
              // channel 12" in front of the ball, 10 putts at 3 ft, count makes.
              // Replaces the 5 ft gate drill with a tighter, more sensitive
              // start-direction check.
              {
                key: 'alley_3ft_makes',
                label: 'Alley drill (3 ft) — makes',
                inputType: 'counter',
                min: 0,
                max: 10,
                instructions:
                  'Place two alignment sticks 12" in front of the ball, ball-width apart. 10 putts at 3 ft. Count how many roll cleanly through the gate and into the hole.',
              },
              // Heads-up putting at 5 ft — eyes on the hole during the stroke.
              // Sasho MacKenzie's research shows better speed control and
              // make rates with this technique. Different motor pattern from
              // the streak drill it replaces; keeps face-control work novel.
              {
                key: 'heads_up_5ft_makes',
                label: 'Heads-up (5 ft) — makes',
                inputType: 'counter',
                min: 0,
                max: 10,
                instructions:
                  '10 putts at 5 ft with your eyes on the hole during the stroke (not the ball). Trains feel and tempo — Sasho MacKenzie\'s research shows better make rates this way. Count makes.',
              },
              // Phase 1 benchmark metric. Tracked weekly; week-6 target >55%.
              // KEEP THIS KEY — fivesRate extractor in derive.ts reads it.
              {
                key: 'makes_5ft',
                label: '5 ft makes / attempts',
                inputType: 'success_total',
                min: 0,
                instructions:
                  'Phase 1 benchmark metric. Putt straight 5 ft putts and log makes / attempts. Target: >55% by week 6. Volume is up to you — accuracy matters more than count.',
              },
            ],
          },
          {
            id: 'distance-control-mat',
            type: 'distance_control',
            name: 'Distance Control Block',
            durationMin: 5,
            metrics: [
              // Good Zone past the hole at 9 ft — 10 putts, count finishes
              // in the Wellputt good zone just past the hole. Trains the
              // "die it 6–12 inches past" speed optimal for lag.
              {
                key: 'good_zone_9ft',
                label: 'Good Zone (9 ft) — in zone',
                inputType: 'counter',
                min: 0,
                max: 10,
                instructions:
                  '10 putts at 9 ft. Count finishes inside the Wellputt mat\'s "good zone" just past the hole. Trains the "die it 6–12 inches past" speed that\'s optimal for lag putting.',
              },
              // Random ladder — 10 putts randomized across 3/5/7/9 ft, count
              // those finishing within 6 inches of target. Variable practice
              // for distance calibration. Consolidates the prior two drills
              // (ladder_within_6 + random_within_6) into one.
              {
                key: 'random_ladder_within_6',
                label: 'Random ladder (3/5/7/9 ft) — within 6 in',
                inputType: 'counter',
                min: 0,
                max: 10,
                instructions:
                  '10 putts randomized across 3, 5, 7, and 9 ft — mix the order so you can\'t groove a stroke. Count those finishing within 6 inches of target. Variable practice for distance calibration.',
              },
            ],
          },
          {
            id: 'pressure-random-mat',
            type: 'pressure_random',
            name: 'Pressure / Random Block',
            durationMin: 5,
            metrics: [
              // Singleton tap_buttons — hardcoded `pressure_` prefix in the
              // persistence pipeline. Cannot use tap_buttons elsewhere in
              // the app without refactoring draft.ts and derive.ts.
              // Random distances, full pre-putt routine, single attempt,
              // good +1 / near 0 / bad -1.
              {
                key: 'pressure_taps',
                label: 'Pressure putts — good / near / bad',
                inputType: 'tap_buttons',
                instructions:
                  'Random distance, full pre-putt routine, single attempt — no resets. Tap good (+1) for a make or close miss, near (0) for a reasonable miss, bad (−1) for a poor result. Repeat until your time is up.',
              },
            ],
          },
        ],
      },
    },
  ],
}
