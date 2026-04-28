import {
  exportHeadline,
  fivesRate,
  formatDuration,
  formatPct,
  formatPressure,
  ladderRate,
  pressureDistribution,
  pressureScore,
} from '@/session/derive'
import type { DrillResult, Session } from '@/types/model'

const pad2 = (n: number) => String(n).padStart(2, '0')

function localYMD(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function localMD(iso: string): string {
  const d = new Date(iso)
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function localDateTime(iso: string): string {
  const d = new Date(iso)
  return `${localYMD(iso)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

function findDrill(s: Session, metric: string): DrillResult | undefined {
  return s.drills.find((d) => d.metric === metric)
}

export function markdownSession(s: Session): string {
  const lines: string[] = []
  lines.push('## Putting Session Log')
  lines.push('')
  lines.push(`**Date:** ${localYMD(s.startedAt)}`)
  lines.push(`**Duration:** ${formatDuration(s.startedAt, s.endedAt)}`)
  const headline = exportHeadline(s)
  if (headline) lines.push(`**Headline:** ${headline}`)
  if (s.notes.trim()) lines.push(`**Notes:** ${s.notes.trim()}`)

  const face = renderFaceControl(s)
  if (face.length) {
    lines.push('')
    lines.push('### Face Control Block')
    lines.push(...face)
  }

  const distance = renderDistanceControl(s)
  if (distance.length) {
    lines.push('')
    lines.push('### Distance Control Block')
    lines.push(...distance)
  }

  const pressure = renderPressureBlock(s)
  if (pressure.length) {
    lines.push('')
    lines.push('### Pressure/Random Block')
    lines.push(...pressure)
  }

  return lines.join('\n')
}

function renderFaceControl(s: Session): string[] {
  const out: string[] = []
  const gate = findDrill(s, 'gate_5ft_clean')
  if (gate) out.push(`- Gate drill (5 ft): ${gate.value} / 10 clean throughs`)
  const streak = findDrill(s, 'consec_3ft_streak')
  if (streak) out.push(`- Consecutive 3-ft makes: ${streak.value} (best streak)`)
  const fives = fivesRate(s)
  if (fives) {
    out.push(
      `- 5-ft make rate: ${fives.value} / ${fives.denominator} (${formatPct(fives)})`,
    )
  }
  return out
}

function renderDistanceControl(s: Session): string[] {
  const out: string[] = []
  const ladder = ladderRate(s)
  if (ladder) {
    out.push(
      `- Ladder drill (3/6/9 ft): ${ladder.value} / ${ladder.denominator} within 6 inches (${formatPct(ladder)})`,
    )
  }
  const randomR = findDrill(s, 'random_within_6')
  if (randomR && randomR.denominator !== undefined) {
    const rate = { value: randomR.value, denominator: randomR.denominator }
    out.push(
      `- Random distances: ${rate.value} / ${rate.denominator} within 6 inches (${formatPct(rate)})`,
    )
  }
  return out
}

function renderPressureBlock(s: Session): string[] {
  const out: string[] = []
  const score = pressureScore(s)
  if (score !== null) out.push(`- Cumulative score: ${formatPressure(score)}`)
  const dist = pressureDistribution(s)
  if (dist) {
    out.push(
      `- Distribution: good ${dist.good} | near ${dist.near} | bad ${dist.bad}`,
    )
  }
  return out
}

export function markdownRange(
  sessions: Session[],
  rangeStartYMD: string,
  rangeEndYMD: string,
): string {
  if (sessions.length === 0) return ''

  const ordered = [...sessions].sort(
    (a, b) =>
      new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  )

  const lines: string[] = []
  lines.push(`## Putting Sessions — ${rangeStartYMD} to ${rangeEndYMD}`)
  lines.push('')
  lines.push('| Date | 5-ft % | Ladder % | Pressure score |')
  lines.push('|---|---|---|---|')
  for (const s of ordered) {
    const fives = fivesRate(s)
    const ladder = ladderRate(s)
    const score = pressureScore(s)
    lines.push(
      `| ${localMD(s.startedAt)} | ${fives ? formatPct(fives) : '—'} | ${ladder ? formatPct(ladder) : '—'} | ${score !== null ? formatPressure(score) : '—'} |`,
    )
  }

  for (const s of ordered) {
    lines.push('')
    lines.push('---')
    lines.push('')
    lines.push(markdownSession(s))
  }

  return lines.join('\n')
}

const CSV_HEADER = [
  'session_id',
  'started_at',
  'discipline_id',
  'plan_id',
  'phase_id',
  'drill_def_id',
  'metric',
  'value',
  'denominator',
  'unit',
  'notes',
]

function csvField(v: string | number | undefined | null): string {
  if (v === undefined || v === null) return ''
  const s = String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function csvFromSessions(sessions: Session[]): string {
  const rows: string[] = [CSV_HEADER.join(',')]
  for (const s of sessions) {
    const startedAtLocal = localDateTime(s.startedAt)
    for (const r of s.drills) {
      rows.push(
        [
          csvField(s.id),
          csvField(startedAtLocal),
          csvField(s.disciplineId),
          csvField(s.planId),
          csvField(s.phaseId),
          csvField(r.drillDefId),
          csvField(r.metric),
          csvField(r.value),
          csvField(r.denominator),
          csvField(r.unit),
          csvField(s.notes),
        ].join(','),
      )
    }
  }
  return rows.join('\n')
}

export function filterSessionsInRange(
  sessions: Session[],
  startYMD: string,
  endYMD: string,
): Session[] {
  return sessions.filter((s) => {
    const ymd = localYMD(s.startedAt)
    return ymd >= startYMD && ymd <= endYMD
  })
}

export function todayYMD(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function shiftYMD(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + deltaDays)
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
}

export function startOfMonthYMD(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-01`
}
