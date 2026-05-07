import type { Plan, Phase, DrillDef } from '@/types/model'
import { PUTTING_PHASE_1 } from './putting-phase-1'
import { PUTTING_INDOOR_P1 } from './putting-indoor-p1'
import { PUTTING_OUTDOOR_P1 } from './putting-outdoor-p1'
import { CHIPPING_PHASE_1 } from './chipping-break-80-p1'
import { CHIPPING_OUTDOOR_P1 } from './chipping-outdoor-p1'
import { SIMULATOR_PHASE_1 } from './simulator-break-80-p1'
import { WORKOUT_PLAN } from './workout'
import { MOBILITY_PLIABILITY } from './mobility-pliability'
import { MOBILITY_KURUC } from './mobility-kuruc'
import { GOLF_PLAN } from './golf'
import { COACHING_PLAN } from './coaching'

// PUTTING_PHASE_1 is kept inactive so legacy sessions still resolve drills via getPlan().
// Only one plan per discipline can be isActive — toggle indoor/outdoor when at the green.
// Mobility plans are inactive (kept off Home tiles); the MobilityPicker hardcodes the list.
export const PLANS: Plan[] = [
  WORKOUT_PLAN,
  MOBILITY_PLIABILITY,
  MOBILITY_KURUC,
  PUTTING_PHASE_1,
  PUTTING_INDOOR_P1,
  PUTTING_OUTDOOR_P1,
  SIMULATOR_PHASE_1,
  CHIPPING_PHASE_1,
  CHIPPING_OUTDOOR_P1,
  GOLF_PLAN,
  COACHING_PLAN,
]

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
