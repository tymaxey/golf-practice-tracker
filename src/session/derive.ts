import type { Session } from '@/types/model'

export type Rate = { value: number; denominator: number }

const findResult = (s: Session, metric: string) =>
  s.drills.find((d) => d.metric === metric)

export function fivesRate(s: Session): Rate | null {
  const r = findResult(s, 'makes_5ft')
  if (!r || r.denominator === undefined || r.denominator <= 0) return null
  return { value: r.value, denominator: r.denominator }
}

export function ladderRate(s: Session): Rate | null {
  // Indoor plan: random_ladder_within_6 is a 0–10 counter (no stored denominator).
  const newR = findResult(s, 'random_ladder_within_6')
  if (newR) return { value: newR.value, denominator: 10 }
  // Legacy plan: success_total with explicit denominator.
  const legacy = findResult(s, 'ladder_within_6')
  if (legacy && legacy.denominator !== undefined && legacy.denominator > 0) {
    return { value: legacy.value, denominator: legacy.denominator }
  }
  return null
}

const counterRate = (s: Session, key: string, denominator: number): Rate | null => {
  const r = findResult(s, key)
  return r ? { value: r.value, denominator } : null
}

export const alleyRate = (s: Session) => counterRate(s, 'alley_3ft_makes', 10)
export const headsUpRate = (s: Session) => counterRate(s, 'heads_up_5ft_makes', 10)
export const goodZoneRate = (s: Session) => counterRate(s, 'good_zone_9ft', 10)

export const greenAlleyRate = (s: Session) => counterRate(s, 'green_alley_3ft', 10)
export const greenCircle3ftRate = (s: Session) => counterRate(s, 'green_circle_3ft', 10)
export const greenCircle4ftRate = (s: Session) => counterRate(s, 'green_circle_4ft', 10)
export const greenLagRate = (s: Session) => counterRate(s, 'green_lag_circle', 10)

export function green9HoleStrokes(s: Session): number | null {
  const r = findResult(s, 'green_9hole_strokes')
  return r ? r.value : null
}

export const chipPwRate = (s: Session) => counterRate(s, 'chip_pw_within_6ft', 5)
export const chip8iRate = (s: Session) => counterRate(s, 'chip_8i_within_6ft', 5)
export const chip6iRate = (s: Session) => counterRate(s, 'chip_6i_within_6ft', 5)

export function chipMultiClubRate(s: Session): Rate | null {
  const pw = findResult(s, 'chip_pw_within_6ft')
  const i8 = findResult(s, 'chip_8i_within_6ft')
  const i6 = findResult(s, 'chip_6i_within_6ft')
  if (!pw && !i8 && !i6) return null
  const value = (pw?.value ?? 0) + (i8?.value ?? 0) + (i6?.value ?? 0)
  return { value, denominator: 15 }
}

export const pitchProximityRate = (s: Session) => counterRate(s, 'pitch_within_6ft', 10)
export const pitchContactRate = (s: Session) => counterRate(s, 'pitch_solid_contact', 10)

export function chip9HoleStrokes(s: Session): number | null {
  const r = findResult(s, 'chip_9hole_strokes')
  return r ? r.value : null
}

export function pressureScore(s: Session): number | null {
  const r = findResult(s, 'pressure_score')
  return r ? r.value : null
}

export type PressureDistribution = { good: number; near: number; bad: number }

export function pressureDistribution(s: Session): PressureDistribution | null {
  const good = findResult(s, 'pressure_good')
  const near = findResult(s, 'pressure_near')
  const bad = findResult(s, 'pressure_bad')
  if (!good && !near && !bad) return null
  return {
    good: good?.value ?? 0,
    near: near?.value ?? 0,
    bad: bad?.value ?? 0,
  }
}

export function ratePct(r: Rate): number {
  return r.denominator === 0 ? 0 : r.value / r.denominator
}

export function formatPct(r: Rate): string {
  return `${Math.round(ratePct(r) * 100)}%`
}

export function formatPressure(score: number): string {
  return score > 0 ? `+${score}` : `${score}`
}

export function formatDuration(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return '—'
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime()
  if (!Number.isFinite(ms) || ms < 0) return '—'
  const totalSec = Math.round(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}m ${String(s).padStart(2, '0')}s`
}

export function exportHeadline(session: Session): string {
  if (session.planId === 'putting-outdoor-p1') return outdoorHeadlineParts(session, formatPct).join(' · ')
  if (session.planId === 'chipping-outdoor-p1') return chippingHeadlineParts(session, formatPct).join(' · ')
  const parts: string[] = []
  const fives = fivesRate(session)
  if (fives) parts.push(`5-ft ${formatPct(fives)}`)
  const ladder = ladderRate(session)
  if (ladder) parts.push(`Ladder ${formatPct(ladder)}`)
  const score = pressureScore(session)
  if (score !== null) parts.push(`Pressure ${formatPressure(score)}`)
  return parts.join(' · ')
}

export function headlineSummary(session: Session): string {
  if (session.disciplineId === 'golf') return golfSummary(session)
  if (session.disciplineId === 'coaching') return coachingSummary(session)
  if (session.disciplineId === 'mobility') return mobilitySummary(session)
  if (session.planId === 'putting-outdoor-p1') {
    const parts = outdoorHeadlineParts(session, (r) => `${r.value}/${r.denominator}`)
    if (parts.length === 0) return session.drills.length === 0 ? session.notes || 'Logged' : `${session.drills.length} metrics`
    return parts.join(' · ')
  }
  if (session.planId === 'chipping-outdoor-p1') {
    const parts = chippingHeadlineParts(session, (r) => `${r.value}/${r.denominator}`)
    if (parts.length === 0) return session.drills.length === 0 ? session.notes || 'Logged' : `${session.drills.length} metrics`
    return parts.join(' · ')
  }

  const parts: string[] = []
  const fives = fivesRate(session)
  if (fives) parts.push(`5-ft ${fives.value}/${fives.denominator}`)
  const ladder = ladderRate(session)
  if (ladder) parts.push(`Ladder ${ladder.value}/${ladder.denominator}`)
  const score = pressureScore(session)
  if (score !== null) parts.push(`Pressure ${formatPressure(score)}`)
  if (parts.length === 0) {
    if (session.drills.length === 0) return session.notes || 'Logged'
    return `${session.drills.length} metrics`
  }
  return parts.join(' · ')
}

function outdoorHeadlineParts(session: Session, fmt: (r: Rate) => string): string[] {
  const parts: string[] = []
  const c3 = greenCircle3ftRate(session)
  if (c3) parts.push(`Circle 3ft ${fmt(c3)}`)
  const c4 = greenCircle4ftRate(session)
  if (c4) parts.push(`Circle 4ft ${fmt(c4)}`)
  const lag = greenLagRate(session)
  if (lag) parts.push(`Lag ${fmt(lag)}`)
  const strokes = green9HoleStrokes(session)
  if (strokes !== null) parts.push(`9-hole ${strokes}`)
  return parts
}

function chippingHeadlineParts(session: Session, fmt: (r: Rate) => string): string[] {
  const parts: string[] = []
  const strokes = chip9HoleStrokes(session)
  if (strokes !== null) parts.push(`9-hole ${strokes}`)
  const multi = chipMultiClubRate(session)
  if (multi) parts.push(`Multi-club ${fmt(multi)}`)
  const pitch = pitchProximityRate(session)
  if (pitch) parts.push(`Pitch ${fmt(pitch)}`)
  return parts
}

function golfSummary(session: Session): string {
  const mode = session.drills[0]?.drillDefId === 'golf-live' ? 'Live' : 'Practice'
  const course = findResult(session, 'course')?.text
  const holes = findResult(session, 'holes')?.value
  const score = findResult(session, 'score')?.value
  const parts: string[] = [mode]
  if (course) parts.push(course)
  if (holes !== undefined && score !== undefined) {
    parts.push(`${holes}h · ${score}`)
  } else if (score !== undefined) {
    parts.push(String(score))
  } else if (holes !== undefined) {
    parts.push(`${holes}h`)
  }
  return parts.join(' · ')
}

function mobilitySummary(session: Session): string {
  if (session.planId === 'mobility-kuruc') return 'Dr. Kuruc'
  if (session.planId === 'mobility-pliability') return 'Pliability'
  return 'Mobility'
}

function coachingSummary(session: Session): string {
  const title = findResult(session, 'lesson_title')?.text
  const coach = findResult(session, 'coach')?.text
  const summary = findResult(session, 'summary')?.text
  const prep = findResult(session, 'prep_notes')?.text
  const parts: string[] = []
  if (title) parts.push(title)
  if (coach) parts.push(coach)
  if (parts.length > 0) return parts.join(' · ')
  if (summary) return summary.split('\n')[0].slice(0, 60)
  if (prep) return `Prep · ${prep.split('\n')[0].slice(0, 50)}`
  return 'Lesson'
}

export function dayKey(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export type DayBucket = {
  total: number
  byDiscipline: Map<string, number>
}

export function bucketByDay(sessions: Session[]): Map<string, DayBucket> {
  const map = new Map<string, DayBucket>()
  for (const s of sessions) {
    const key = dayKey(s.startedAt)
    let bucket = map.get(key)
    if (!bucket) {
      bucket = { total: 0, byDiscipline: new Map() }
      map.set(key, bucket)
    }
    bucket.total += 1
    bucket.byDiscipline.set(
      s.disciplineId,
      (bucket.byDiscipline.get(s.disciplineId) ?? 0) + 1,
    )
  }
  return map
}
