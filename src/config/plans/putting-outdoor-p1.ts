import type { Plan } from '@/types/model'

/**
 * Break 80 — Putting Outdoor (Green) Phase 1
 *
 * 30–45 minute practice green protocol. Run when at a course with practice
 * green access (~1x/week realistic).
 *
 * Drill design follows Mike Dickson's "Secrets to Short Game Mastery"
 * scoring rubrics — single ball, scored attempts, no restarts, targets
 * scaled to current scoring level. Score-90 targets noted in comments
 * as starting benchmarks; calibrate with real data after a few sessions.
 *
 * NOT activated by default. Toggle isActive: true on this plan AND
 * isActive: false on `putting-indoor-p1` when running an outdoor session.
 * `ACTIVE_PLAN_FOR_DISCIPLINE()` returns the first match — only one plan
 * per discipline can be active at a time.
 *
 * All metrics are NEW (no continuity with indoor). New extractors and
 * renderers required — see integration note.
 */
export const PUTTING_OUTDOOR_P1: Plan = {
  id: 'putting-outdoor-p1',
  disciplineId: 'putting',
  name: 'Break 80 — Putting Outdoor (Green)',
  isActive: false,
  phases: [
    {
      id: 'putting-outdoor-p1-phase-1',
      planId: 'putting-outdoor-p1',
      name: 'Phase 1',
      order: 1,
      protocol: {
        drills: [
          {
            id: 'face-control-green',
            type: 'face_control',
            name: 'Face Control Block',
            durationMin: 12,
            metrics: [
              // Down the Alley — straight uphill 3 ft putt, alignment sticks
              // creating a ball-width channel. 10 attempts, count makes.
              // Pure start-direction work. Score-90 target: 9/10 (Dickson).
              {
                key: 'green_alley_3ft',
                label: 'Down the Alley (3 ft) — makes',
                inputType: 'counter',
                min: 0,
                max: 10,
                instructions:
                  'Find a straight uphill 3 ft putt. Place two alignment sticks 12" in front of the ball, ball-width apart. 10 putts, count makes through the gate. Score-90 target: 9/10.',
              },
              // 1-Putt Circle at 3 ft — 5 markers as a pentagon at 3 ft from
              // the hole. One ball, two laps = 10 attempts. Variable reads
              // at the same distance. No restarts — play out all 10.
              // Score-90 target: 9/10 (Dickson).
              {
                key: 'green_circle_3ft',
                label: '1-Putt Circle (3 ft) — makes',
                inputType: 'counter',
                min: 0,
                max: 10,
                instructions:
                  'Place 5 tees as a pentagon at 3 ft from the hole. One ball, walk around the circle twice = 10 attempts at varied reads. No restarts — play out all 10. Score-90 target: 9/10.',
              },
              // 1-Putt Circle at 4 ft — same setup, stretch distance.
              // 10 attempts. Tracks short-putt make rate where the
              // make-rate gap between handicap levels widens most.
              // Score-90 target: 7/10 (Dickson).
              {
                key: 'green_circle_4ft',
                label: '1-Putt Circle (4 ft) — makes',
                inputType: 'counter',
                min: 0,
                max: 10,
                instructions:
                  'Same pentagon setup as the 3-ft circle, stretched to 4 ft. 10 attempts, no restarts. This is where the make-rate gap between handicaps widens most. Score-90 target: 7/10.',
              },
            ],
          },
          {
            id: 'distance-control-green',
            type: 'distance_control',
            name: 'Distance Control Block',
            durationMin: 12,
            metrics: [
              // Lag into 3-ft Circle — 10 putts from varied distances
              // (20–50 ft, no two from the same spot). Count putts ending
              // within a 3-ft radius of the hole. Outcome-focused: did you
              // leave it inside makable 2-putt range? Score-90 target: 7/10
              // (Dickson). Aligns with Lou Stagner's 30% rule.
              {
                key: 'green_lag_circle',
                label: 'Lag into 3-ft Circle — within 3 ft',
                inputType: 'counter',
                min: 0,
                max: 10,
                instructions:
                  '10 lag putts from varied distances (20–50 ft, no two from the same spot). Count those finishing within 3 ft of the hole — makable 2-putt range. Score-90 target: 7/10.',
              },
            ],
          },
          {
            id: 'pressure-game-green',
            type: 'pressure_random',
            name: 'Pressure / 9-Hole Game',
            durationMin: 15,
            metrics: [
              // 9-Hole Lag Putting Game — pick 9 different holes on the
              // practice green (3 short, 3 medium, 3 long). One ball,
              // putt each out, total strokes. Real-game simulation.
              // Score-90 target: 26 strokes (Dickson).
              //
              // numeric (not counter) for semantic clarity — it's a raw
              // measurement. Range exceeds NumberPad threshold (>12),
              // renders as +/- stepper. Single value entry.
              {
                key: 'green_9hole_strokes',
                label: '9-Hole Game — total strokes',
                inputType: 'counter',
                min: 0,
                max: 50,
                instructions:
                  'Pick 9 different holes on the green — 3 short, 3 medium, 3 long. One ball, putt each one out, log total strokes. Real-game simulation under fatigue. Score-90 target: 26.',
              },
            ],
          },
        ],
      },
    },
  ],
}
