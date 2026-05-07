import type { Plan } from '@/types/model'

/**
 * Mobility — Dr. Kuruc rehab protocol (May 2026).
 *
 * Three-week thoracic / shoulder rehab protocol prescribed May 6, 2026.
 * 2x/day, four exercises per session. Mirror of `mobility-rehab-protocol.md`
 * at the repo root — that file is the human-readable reference; this is the
 * in-app source of truth (TS config, no markdown rendering at runtime).
 *
 * If Kuruc updates the prescription, edit BOTH the markdown and this file.
 *
 * Surfaced via Home → Workout → Mobility → Dr. Kuruc (NOT a Home tile).
 * `isActive: false` keeps it off Home; the MobilityPicker hardcodes the list.
 */
export const MOBILITY_KURUC: Plan = {
  id: 'mobility-kuruc',
  disciplineId: 'mobility',
  name: 'Dr. Kuruc',
  isActive: false,
  phases: [
    {
      id: 'mobility-kuruc-phase-1',
      planId: 'mobility-kuruc',
      name: 'Phase 1',
      order: 1,
      protocol: {
        drills: [
          {
            id: 'kuruc-cool-kid',
            type: 'mobility',
            name: 'Cool Kid Stretch',
            durationMin: 0,
            metrics: [],
            content: {
              targets: 'Anterior shoulder, pec major, pec minor.',
              why: 'Tight anterior shoulder structures pull the humerus forward into a position that compresses the rotator cuff and biceps tendon during the backswing. Releasing the front side allows the shoulder to sit deeper in the joint and reduces impingement risk.',
              setup:
                'Stand in a doorway or beside a wall. Place the affected arm against the doorframe or wall with the elbow bent at 90° and the forearm vertical (the "I don\'t know" gesture). Forearm flat against the surface, elbow at shoulder height.',
              execution:
                'Step the same-side foot forward into a small lunge. Slowly rotate the torso *away* from the wall until you feel a stretch across the front of the shoulder and chest. Hold. Return. Switch sides.',
              dose: 'Hold 30 seconds, 3 reps per side. (Reasonable default — confirm with Kuruc at next visit.)',
              cues: 'Stretch should be felt across the front of the chest/shoulder, not in the shoulder joint itself. If you feel pinching in the front of the shoulder, back off the rotation. Keep the shoulder blade pulled down and back — don\'t let it shrug up. Adjust elbow height higher or lower to bias different fibers of the pec.',
              stopCriteria:
                'Sharp pain, tingling down the arm, or any reproduction of the original shoulder pain. Stretch sensation only — never pain.',
            },
          },
          {
            id: 'kuruc-tspine',
            type: 'mobility',
            name: 'Foam Roller Wall T-Spine Rotation',
            durationMin: 0,
            metrics: [],
            content: {
              targets: 'Thoracic spine extension and rotation.',
              why: 'The headline finding from the assessment. Direct intervention on the 40° → 50° target. T-spine mobility is the upstream factor — improving it reduces shoulder compensation during the backswing and lets the centered turn-back work execute without shoulder strain.',
              setup:
                'Kneel facing a wall, hips stacked back over heels. Place a foam roller vertically against the wall at chest height. Forearm of one arm rests on the roller, elbow bent ~90°.',
              execution:
                'Rotate the torso, opening the chest away from the roller. Eyes follow the free hand as it traces an arc behind you. Lead with the chest and ribs. Pause briefly at end range, return slowly. The free arm can sweep behind you for added range as tolerated.',
              dose: '8 reps per side, 2 sets. (Reasonable default — confirm with Kuruc at next visit.)',
              cues: 'Movement comes from the mid-back, not the lower back. Hips stay square and stacked over knees throughout — if your hips rotate, you\'re cheating the t-spine. Breathe out through the rotation. Reach long, not far — the goal is rib mobility, not lumbar contortion.',
              stopCriteria:
                'Sharp lower back pain (means hips are rotating). Any shoulder pain (means the arm is doing the work instead of the spine).',
            },
          },
          {
            id: 'kuruc-lat-stretch',
            type: 'mobility',
            name: 'Swiss Ball Lat Stretch',
            durationMin: 0,
            metrics: [],
            content: {
              targets: 'Latissimus dorsi, posterior shoulder capsule.',
              why: 'Tight lats restrict shoulder flexion (arms overhead) and contribute to internal rotation of the shoulder at rest. Top-three TPI flag for amateur golfers — directly limits the top of the backswing position and forces compensation through the lower back or neck.',
              setup:
                'Kneel in front of a swiss ball. Place both forearms on top of the ball, thumbs pointing up, elbows roughly shoulder-width apart.',
              execution:
                'Sit hips back toward heels while keeping the arms extended on the ball. Drop the chest toward the floor as the ball rolls forward. The stretch builds along the side body from armpit to hip. To bias the affected lat more, walk the ball slightly to the opposite side and side-bend toward the unaffected side.',
              dose: 'Hold 30–45 seconds, 3 reps. (Reasonable default — confirm with Kuruc at next visit.)',
              cues: 'Keep the head neutral — don\'t crane the neck up. Breathe into the stretch, exhaling deeper into the position with each cycle. Thumbs up keeps the shoulder externally rotated and protects the joint capsule. Stretch should be felt in the side body and lat, not in the front of the shoulder.',
              stopCriteria:
                'Front-of-shoulder pain (joint capsule is being compressed instead of lat being stretched). Lower back pain (hips aren\'t dropping; lumbar is compensating).',
            },
          },
          {
            id: 'kuruc-serratus',
            type: 'mobility',
            name: "Banded Serratus Child's Pose",
            durationMin: 0,
            metrics: [],
            content: {
              targets: 'Serratus anterior activation, scapular stability.',
              why: 'Serratus anterior is the primary scapular stabilizer. Without it firing properly, the scapula doesn\'t sit on the rib cage correctly during shoulder movement, and the shoulder loses its mechanical advantage. This drill activates serratus in a position that simultaneously stretches the lats — a two-for-one. Pairs with the Swiss Ball Lat Stretch.',
              setup:
                'Loop a light resistance band around both wrists. Start in child\'s pose: kneeling, hips back to heels, arms extended forward on the floor, palms down.',
              execution:
                'Press outward against the band to create constant tension. From child\'s pose, slide the hands forward along the floor until the chest reaches toward the ground. Hold briefly at the deepest position, then return. Band tension stays constant throughout — never goes slack.',
              dose: '10 reps with a 2–3 second hold at end range, 2 sets. (Reasonable default — confirm with Kuruc at next visit.)',
              cues: 'Constant outward pressure on the band — if it goes slack, serratus has stopped working. Shoulder blades should wrap around the rib cage (protraction), not pinch toward the spine. Keep the head neutral, eyes down. Stretch felt in the lats and side body; activation felt below and behind the armpit.',
              stopCriteria:
                'Shoulder joint pain. Cramping in the rib area is OK and expected — the muscle is waking up.',
            },
          },
        ],
      },
    },
  ],
}
