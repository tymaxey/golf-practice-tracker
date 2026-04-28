import type { Discipline } from '@/types/model'

export const DISCIPLINES: Discipline[] = [
  { id: 'putting', name: 'Putting', icon: 'putting' },
  { id: 'chipping', name: 'Chipping', icon: 'chipping' },
  { id: 'simulator', name: 'Simulator', icon: 'simulator' },
  { id: 'range', name: 'Range', icon: 'range' },
]

export const getDiscipline = (id: string) =>
  DISCIPLINES.find((d) => d.id === id)
