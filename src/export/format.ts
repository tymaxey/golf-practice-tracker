import { getDiscipline } from '@/config/disciplines'
import {
  alleyRate,
  chip6iRate,
  chip8iRate,
  chip9HoleStrokes,
  chipPwRate,
  exportHeadline,
  fivesRate,
  formatDuration,
  formatPct,
  formatPressure,
  goodZoneRate,
  green9HoleStrokes,
  greenAlleyRate,
  greenCircle3ftRate,
  greenCircle4ftRate,
  greenLagRate,
  headsUpRate,
  ladderRate,
  pitchContactRate,
  pitchProximityRate,
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
  const discName = getDiscipline(s.disciplineId)?.name ?? 'Practice'
  lines.push(`## ${discName} Session Log`)
  lines.push('')
  lines.push(`**Date:** ${localYMD(s.startedAt)}`)
  lines.push(`**Duration:** ${formatDuration(s.startedAt, s.endedAt)}`)
  const headline = exportHeadline(s)
  if (headline) lines.push(`**Headline:** ${headline}`)
  if (s.notes.trim()) lines.push(`**Notes:** ${s.notes.trim()}`)

  const sections = sectionsFor(s)

  for (const [heading, body] of sections) {
    if (body.length) {
      lines.push('')
      lines.push(`### ${heading}`)
      lines.push(...body)
    }
  }

  return lines.join('\n')
}

function sectionsFor(s: Session): readonly (readonly [string, string[]])[] {
  switch (s.planId) {
    case 'putting-outdoor-p1':
      return [
        ['Face Control Block', renderFaceControlGreen(s)],
        ['Distance Control Block', renderDistanceControlGreen(s)],
        ['9-Hole Game', renderPressureGameGreen(s)],
      ] as const
    case 'putting-indoor-p1':
      return [
        ['Face Control Block', renderFaceControlMat(s)],
        ['Distance Control Block', renderDistanceControlMat(s)],
        ['Pressure/Random Block', renderPressureBlock(s)],
      ] as const
    case 'chipping-outdoor-p1':
      return [
        ['Multi-Club Chip Block', renderMultiClubChipBlock(s)],
        ['Pitch Shot Block', renderPitchShotBlock(s)],
        ['9-Hole Chipping Game', renderNineHoleChipBlock(s)],
      ] as const
    default:
      return [
        ['Face Control Block', renderFaceControlLegacy(s)],
        ['Distance Control Block', renderDistanceControlLegacy(s)],
        ['Pressure/Random Block', renderPressureBlock(s)],
      ] as const
  }
}

function renderFaceControlMat(s: Session): string[] {
  const out: string[] = []
  const alley = alleyRate(s)
  if (alley) out.push(`- Alley drill (3 ft): ${alley.value} / 10 makes`)
  const heads = headsUpRate(s)
  if (heads) out.push(`- Heads-up (5 ft): ${heads.value} / 10 makes`)
  const fives = fivesRate(s)
  if (fives) {
    out.push(
      `- 5-ft make rate: ${fives.value} / ${fives.denominator} (${formatPct(fives)})`,
    )
  }
  return out
}

function renderDistanceControlMat(s: Session): string[] {
  const out: string[] = []
  const goodZone = goodZoneRate(s)
  if (goodZone) out.push(`- Good Zone (9 ft): ${goodZone.value} / 10 in zone`)
  const ladder = ladderRate(s)
  if (ladder) {
    out.push(
      `- Random ladder (3/5/7/9 ft): ${ladder.value} / ${ladder.denominator} within 6 inches (${formatPct(ladder)})`,
    )
  }
  return out
}

function renderFaceControlGreen(s: Session): string[] {
  const out: string[] = []
  const alley = greenAlleyRate(s)
  if (alley) out.push(`- Down the Alley (3 ft): ${alley.value} / 10 makes`)
  const c3 = greenCircle3ftRate(s)
  if (c3) out.push(`- 1-Putt Circle (3 ft): ${c3.value} / 10 makes`)
  const c4 = greenCircle4ftRate(s)
  if (c4) out.push(`- 1-Putt Circle (4 ft): ${c4.value} / 10 makes`)
  return out
}

function renderDistanceControlGreen(s: Session): string[] {
  const out: string[] = []
  const lag = greenLagRate(s)
  if (lag) out.push(`- Lag into 3-ft Circle: ${lag.value} / 10 within 3 ft`)
  return out
}

function renderPressureGameGreen(s: Session): string[] {
  const out: string[] = []
  const strokes = green9HoleStrokes(s)
  if (strokes !== null) out.push(`- 9-Hole Game: ${strokes} total strokes`)
  return out
}

function renderMultiClubChipBlock(s: Session): string[] {
  const out: string[] = []
  const pw = chipPwRate(s)
  if (pw) out.push(`- PW chips (5): ${pw.value} / 5 within 6 ft (${formatPct(pw)})`)
  const i8 = chip8iRate(s)
  if (i8) out.push(`- 8i chips (5): ${i8.value} / 5 within 6 ft (${formatPct(i8)})`)
  const i6 = chip6iRate(s)
  if (i6) out.push(`- 6i chips (5): ${i6.value} / 5 within 6 ft (${formatPct(i6)})`)
  return out
}

function renderPitchShotBlock(s: Session): string[] {
  const out: string[] = []
  const prox = pitchProximityRate(s)
  if (prox) out.push(`- Pitches (10): ${prox.value} / 10 within 6 ft (${formatPct(prox)})`)
  const contact = pitchContactRate(s)
  if (contact) out.push(`- Pitches (10): ${contact.value} / 10 solid contact (${formatPct(contact)})`)
  return out
}

function renderNineHoleChipBlock(s: Session): string[] {
  const out: string[] = []
  const strokes = chip9HoleStrokes(s)
  if (strokes !== null) out.push(`- 9-Hole Chipping Game: ${strokes} total strokes`)
  return out
}

function renderFaceControlLegacy(s: Session): string[] {
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

function renderDistanceControlLegacy(s: Session): string[] {
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

export const JSON_SCHEMA_TAG = 'practice-tracker.v1'

export function jsonFromSessions(sessions: Session[]): string {
  return JSON.stringify(
    {
      schema: JSON_SCHEMA_TAG,
      exportedAt: new Date().toISOString(),
      sessions,
    },
    null,
    2,
  )
}

export type ParseImportResult =
  | { ok: true; sessions: Session[]; malformed: number }
  | { ok: false; error: string }

function isStringField(v: unknown): v is string {
  return typeof v === 'string'
}

function validDrillResult(r: unknown): r is DrillResult {
  if (!r || typeof r !== 'object') return false
  const o = r as Record<string, unknown>
  if (!isStringField(o.drillDefId)) return false
  if (!isStringField(o.metric)) return false
  if (!isStringField(o.label)) return false
  if (typeof o.value !== 'number' || !Number.isFinite(o.value)) return false
  if (o.text !== undefined && typeof o.text !== 'string') return false
  if (o.denominator !== undefined && typeof o.denominator !== 'number') {
    return false
  }
  if (o.unit !== undefined && typeof o.unit !== 'string') return false
  return true
}

function validSession(s: unknown): s is Session {
  if (!s || typeof s !== 'object') return false
  const o = s as Record<string, unknown>
  if (!isStringField(o.id)) return false
  if (!isStringField(o.startedAt)) return false
  if (o.endedAt !== null && !isStringField(o.endedAt)) return false
  if (!isStringField(o.disciplineId)) return false
  if (!isStringField(o.planId)) return false
  if (!isStringField(o.phaseId)) return false
  if (!isStringField(o.notes)) return false
  if (!Array.isArray(o.drills)) return false
  if (!o.drills.every(validDrillResult)) return false
  return true
}

export function parseImportJson(text: string): ParseImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'File is not valid JSON.' }
  }
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Unexpected file shape.' }
  }
  const obj = parsed as Record<string, unknown>
  if (obj.schema !== JSON_SCHEMA_TAG) {
    return {
      ok: false,
      error: `Unknown schema (expected ${JSON_SCHEMA_TAG}).`,
    }
  }
  if (!Array.isArray(obj.sessions)) {
    return { ok: false, error: 'Missing sessions array.' }
  }

  const valid: Session[] = []
  let malformed = 0
  for (const raw of obj.sessions) {
    if (validSession(raw)) {
      valid.push({ ...raw, attachments: [] })
    } else {
      malformed += 1
    }
  }
  return { ok: true, sessions: valid, malformed }
}
