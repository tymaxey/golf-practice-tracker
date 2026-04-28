import Dexie, { type EntityTable } from 'dexie'
import type { Session } from '@/types/model'

export class PracticeDB extends Dexie {
  sessions!: EntityTable<Session, 'id'>

  constructor() {
    super('practice-tracker')
    this.version(1).stores({
      sessions: 'id, startedAt, disciplineId, planId, phaseId',
    })
  }
}

export const db = new PracticeDB()

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

export async function createSession(
  input: Omit<Session, 'id' | 'attachments'> & {
    attachments?: Session['attachments']
  },
): Promise<Session> {
  const session: Session = {
    id: newId(),
    attachments: [],
    ...input,
  }
  await db.sessions.add(session)
  return session
}

export async function updateSession(
  id: string,
  patch: Partial<Omit<Session, 'id'>>,
): Promise<void> {
  await db.sessions.update(id, patch)
}

export async function getSession(id: string): Promise<Session | undefined> {
  return db.sessions.get(id)
}

export async function listSessions(): Promise<Session[]> {
  return db.sessions.orderBy('startedAt').reverse().toArray()
}

export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id)
}

export async function clearAll(): Promise<void> {
  await db.sessions.clear()
}
