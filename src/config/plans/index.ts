import type { Plan, Phase, DrillDef } from '@/types/model'
import { PUTTING_PHASE_1 } from './putting-phase-1'

export const PLANS: Plan[] = [PUTTING_PHASE_1]

export const ACTIVE_PLAN_FOR_DISCIPLINE = (
  disciplineId: string,
): Plan | undefined =>
  PLANS.find((p) => p.disciplineId === disciplineId && p.isActive)

export const getPlan = (planId: string): Plan | undefined =>
  PLANS.find((p) => p.id === planId)

export const getPhase = (
  planId: string,
  phaseId: string,
): Phase | undefined => getPlan(planId)?.phases.find((ph) => ph.id === phaseId)

export const getDrill = (
  planId: string,
  phaseId: string,
  drillId: string,
): DrillDef | undefined =>
  getPhase(planId, phaseId)?.protocol.drills.find((d) => d.id === drillId)
