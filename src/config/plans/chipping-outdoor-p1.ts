import type { Plan } from '@/types/model'

/**
 * Break 80 — Chipping Outdoor Phase 1
 *
 * 30–45 minute outdoor chipping protocol for a park, practice range, or
 * course practice green. Source material: Mike Dickson, "Secrets to Short
 * Game Mastery."
 *
 * Three blocks, all single-ball, scored:
 *   1. Multi-Club Chip Block (~10–12 min) — PW / 8i / 6i to one target.
 *      Same swing, change the club for distance. Trains the discipline
 *      most amateurs invert (always SW, vary the swing).
 *   2. Pitch Shot Block (~10–12 min) — Square-face SW/GW pitches, 1:1
 *      tempo, fan the face open in takeaway. Dickson's non-obvious cues:
 *      don't grip down, don't lean the shaft forward.
 *   3. 9-Hole Chipping Game (~15–20 min) — Dickson's headline drill.
 *      9 varied spots, chip + putt out, single ball, total strokes.
 *      Score-90 target: 25 strokes.
 *
 * Defaults to isActive: true. The legacy `chipping-break-80-p1` plan
 * (with `chip_within_3ft`, `chip_within_6ft`, `chip_lie_acceptable`)
 * should be flipped to isActive: false — see integration note.
 *
 * Decisions logged at draft time:
 *   - No bunker block in v1. Most parks and ranges lack a practice
 *     bunker. If you want bunker work, spin up a separate
 *     `chipping-bunker-p1` plan and toggle.
 *   - No lie-quality tracking on the 9-hole game. The strokes total
 *     encodes lie difficulty implicitly. Revisit after 4–6 sessions.
 *   - Replaces (not coexists with) the legacy 3-metric chipping plan.
 *     If you want both, set both isActive flags accordingly — only one
 *     wins the active-plan lookup.
 */
export const CHIPPING_OUTDOOR_P1: Plan = {
  id: 'chipping-outdoor-p1',
  disciplineId: 'chipping',
  name: 'Break 80 — Chipping Outdoor',
  isActive: true,
  phases: [
    {
      id: 'chipping-outdoor-p1-phase-1',
      planId: 'chipping-outdoor-p1',
      name: 'Phase 1',
      order: 1,
      protocol: {
        drills: [
          {
            id: 'multi-club-chip',
            type: 'multi_club_chip',
            name: 'Multi-Club Chip Block',
            durationMin: 12,
            metrics: [
              {
                key: 'chip_pw_within_6ft',
                label: 'PW chips (5) — within 6 ft',
                inputType: 'counter',
                min: 0,
                max: 5,
                instructions:
                  'Stand within 4 paces of the green edge. Pick a hole 8–15 paces away. Putting-style setup: forearms in line with shaft, 8–10" from ball, grip down. Land spot 25% of the way to the hole. 5 PW chips. Count chips finishing inside 6 ft.',
              },
              {
                key: 'chip_8i_within_6ft',
                label: '8i chips (5) — within 6 ft',
                inputType: 'counter',
                min: 0,
                max: 5,
                instructions:
                  'Same lie position, same hole. Switch to 8-iron, same setup, same swing length as the PW. Land spot stays 25% to hole — ball runs farther due to lower loft. 5 chips. Count chips finishing inside 6 ft.',
              },
              {
                key: 'chip_6i_within_6ft',
                label: '6i chips (5) — within 6 ft',
                inputType: 'counter',
                min: 0,
                max: 5,
                instructions:
                  'Same lie, same hole. 6-iron — minimal carry, maximum roll. Land spot just on the green; ball releases like a putt. Same swing as PW and 8i. 5 chips. Count chips inside 6 ft. The drill is changing clubs, not swings.',
              },
            ],
          },
          {
            id: 'pitch-shot',
            type: 'pitch_shot',
            name: 'Pitch Shot Block',
            durationMin: 12,
            metrics: [
              {
                key: 'pitch_within_6ft',
                label: 'Pitches (10) — within 6 ft',
                inputType: 'counter',
                min: 0,
                max: 10,
                instructions:
                  'SW or GW. Pick a target 30–50 yards away. Square face at address. Do NOT grip down. Stand tall, narrow stance, hands raised. Fan the face open in takeaway. 1:1 tempo back-to-through. 10 pitches. Count finishes inside 6 ft.',
              },
              {
                key: 'pitch_solid_contact',
                label: 'Pitches (10) — solid contact',
                inputType: 'counter',
                min: 0,
                max: 10,
                instructions:
                  'Same 10 pitches. Count solid strikes only — trail edge engages turf first, no chunks, skulls, or thin contact. Strike quality counts independently from proximity. A skull that ends up close still scores 0 here.',
              },
            ],
          },
          {
            id: 'nine-hole-chipping',
            type: 'pressure_random',
            name: '9-Hole Chipping Game',
            durationMin: 18,
            metrics: [
              {
                key: 'chip_9hole_strokes',
                label: '9-Hole Game — total strokes',
                inputType: 'counter',
                min: 0,
                max: 50,
                instructions:
                  'Pick 9 spots around the green: 3 short, 3 medium, 3 long. Mix lies (perfect / good / bad). Single ball. Chip + putt each out. No restarts — play through misses like on the course. Sum total strokes. Score-90 target: 25.',
              },
            ],
          },
        ],
      },
    },
  ],
}
