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

const counterRateOver10 = (s: Session, key: string): Rate | null => {
  const r = findResult(s, key)
  return r ? { value: r.value, denominator: 10 } : null
}

export const alleyRate = (s: Session) => counterRateOver10(s, 'alley_3ft_makes')
export const headsUpRate = (s: Session) => counterRateOver10(s, 'heads_up_5ft_makes')
export const goodZoneRate = (s: Session) => counterRateOver10(s, 'good_zone_9ft')

export const greenAlleyRate = (s: Session) => counterRateOver10(s, 'green_alley_3ft')
export const greenCircle3ftRate = (s: Session) => counterRateOver10(s, 'green_circle_3ft')
export const greenCircle4ftRate = (s: Session) => counterRateOver10(s, 'green_circle_4ft')
export const greenLagRate = (s: Session) => counterRateOver10(s, 'green_lag_circle')

export function green9HoleStrokes(s: Session): number | null {
  const r = findResult(s, 'green_9hole_strokes')
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
  if (session.planId === 'putting-outdoor-p1') {
    const parts = outdoorHeadlineParts(session, (r) => `${r.value}/${r.denominator}`)
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
