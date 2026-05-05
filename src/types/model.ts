export type Discipline = {
  id: string
  name: string
  icon: string
}

export type Plan = {
  id: string
  disciplineId: string
  name: string
  phases: Phase[]
  isActive: boolean
}

export type Phase = {
  id: string
  planId: string
  name: string
  order: number
  protocol: ProtocolDef
}

export type ProtocolDef = {
  drills: DrillDef[]
}

export type DrillInputType =
  | 'counter'
  | 'success_total'
  | 'tap_buttons'
  | 'numeric'

export type DrillType =
  | 'face_control'
  | 'distance_control'
  | 'pressure_random'
  | (string & {})

export type DrillDef = {
  id: string
  type: DrillType
  name: string
  durationMin: number
  metrics: MetricDef[]
}

export type MetricDef = {
  key: string
  label: string
  inputType: DrillInputType
  min?: number
  max?: number
  instructions?: string
}

export type Session = {
  id: string
  startedAt: string
  endedAt: string | null
  disciplineId: string
  planId: string
  phaseId: string
  notes: string
  drills: DrillResult[]
  attachments: Attachment[]
}

export type DrillResult = {
  drillDefId: string
  metric: string
  label: string
  value: number
  text?: string
  denominator?: number
  unit?: string
}

export type Attachment = {
  id: string
  type: 'image' | 'csv' | (string & {})
  blob: Blob | null
  ref?: string
  metadata: Record<string, unknown>
}
