import type { Discipline } from '@/types/model'

export const DISCIPLINES: Discipline[] = [
  { id: 'putting', name: 'Putting', icon: 'putting' },
  { id: 'chipping', name: 'Chipping', icon: 'chipping' },
  { id: 'simulator', name: 'Range/Sim', icon: 'simulator' },
  { id: 'range', name: 'Range', icon: 'range' },
  { id: 'workout', name: 'Workout', icon: 'workout' },
  { id: 'mobility', name: 'Mobility', icon: 'mobility' },
  { id: 'golf', name: 'Golf', icon: 'golf' },
  { id: 'coaching', name: 'Coaching', icon: 'coaching' },
]

export const getDiscipline = (id: string) =>
  DISCIPLINES.find((d) => d.id === id)
