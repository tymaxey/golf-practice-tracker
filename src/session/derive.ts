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

export function ratePct(r: Rate): number {
  return r.denominator === 0 ? 0 : r.value / r.denominator
}

export function formatPct(r: Rate): string {
  return `${Math.round(ratePct(r) * 100)}%`
}

export function formatPressure(score: number): string {
  return score > 0 ? `+${score}` : `${score}`
}

export function headlineSummary(session: Session): string {
  const parts: string[] = []
  const fives = fivesRate(session)
  if (fives) parts.push(`5-ft ${fives.value}/${fives.denominator}`)
  const ladder = ladderRate(session)
  if (ladder) parts.push(`Ladder ${ladder.value}/${ladder.denominator}`)
  const score = pressureScore(session)
  if (score !== null) parts.push(`Pressure ${formatPressure(score)}`)
  if (parts.length === 0) return `${session.drills.length} metrics`
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
