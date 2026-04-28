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
  const r = findResult(s, 'ladder_within_6')
  if (!r || r.denominator === undefined || r.denominator <= 0) return null
  return { value: r.value, denominator: r.denominator }
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
