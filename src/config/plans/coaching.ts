import type { Plan } from '@/types/model'

/**
 * Coaching — GOLFTEC lesson notes container.
 *
 * One free-form session record progressively filled across two moments:
 *   - Pre-session: prep notes (with last lesson's summary + actions visible
 *     for review at the top of the form).
 *   - Post-session: structured notes — flight patterns, resolution, actions
 *     for improvement, drills assigned (list of strings), summary.
 *
 * Single drill `coaching-session` exists only as a marker; the form bypasses
 * the metric stepper entirely. All field values are stored as DrillResult.text
 * keyed by `metric` (lesson_title, coach, location, prep_notes,
 * flight_patterns, resolution, actions, summary). Drills assigned are stored
 * as multiple rows of `metric: 'drill_assigned'` so each is independently
 * editable.
 *
 * Coaching sessions are excluded from the habit heatmap — lessons aren't
 * practice — but count toward the today-session badge. Unlike Workout and
 * Golf, coaching sessions ARE editable from Recent so the user can fill in
 * post-lesson sections after the lesson.
 */
export const COACHING_PLAN: Plan = {
  id: 'coaching',
  disciplineId: 'coaching',
  name: 'Coaching',
  isActive: true,
  phases: [
    {
      id: 'coaching-phase-1',
      planId: 'coaching',
      name: 'Phase 1',
      order: 1,
      protocol: {
        drills: [
          {
            id: 'coaching-session',
            type: 'coaching_session',
            name: 'Lesson',
            durationMin: 0,
            metrics: [],
          },
        ],
      },
    },
  ],
}
