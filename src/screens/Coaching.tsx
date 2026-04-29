import { useState } from 'react'
import { DateStripPicker } from '@/components/DateStripPicker'
import type { DrillResult, Session } from '@/types/model'

export type CoachingFormData = {
  startedAt: string
  lessonTitle: string
  coach: string
  location: string
  prepNotes: string
  flightPatterns: string
  resolution: string
  actions: string
  summary: string
  drillsAssigned: string[]
}

const COACHING_DRILL_ID = 'coaching-session'

const FIELD_KEYS: Array<{ metric: string; label: string; key: keyof CoachingFormData }> = [
  { metric: 'lesson_title', label: 'Lesson title', key: 'lessonTitle' },
  { metric: 'coach', label: 'Coach', key: 'coach' },
  { metric: 'location', label: 'Location', key: 'location' },
  { metric: 'prep_notes', label: 'Prep notes', key: 'prepNotes' },
  { metric: 'flight_patterns', label: 'Flight patterns', key: 'flightPatterns' },
  { metric: 'resolution', label: 'Resolution', key: 'resolution' },
  { metric: 'actions', label: 'Actions for improvement', key: 'actions' },
  { metric: 'summary', label: 'Summary', key: 'summary' },
]

export const emptyCoachingForm = (): CoachingFormData => ({
  startedAt: new Date().toISOString(),
  lessonTitle: '',
  coach: '',
  location: '',
  prepNotes: '',
  flightPatterns: '',
  resolution: '',
  actions: '',
  summary: '',
  drillsAssigned: [],
})

export function extractCoachingForm(s: Session): CoachingFormData {
  const get = (m: string) =>
    s.drills.find((d) => d.metric === m)?.text ?? ''
  return {
    startedAt: s.startedAt,
    lessonTitle: get('lesson_title'),
    coach: get('coach'),
    location: get('location'),
    prepNotes: get('prep_notes'),
    flightPatterns: get('flight_patterns'),
    resolution: get('resolution'),
    actions: get('actions'),
    summary: get('summary'),
    drillsAssigned: s.drills
      .filter((d) => d.metric === 'drill_assigned')
      .map((d) => d.text ?? '')
      .filter((t) => t.trim() !== ''),
  }
}

export function serializeCoachingForm(data: CoachingFormData): DrillResult[] {
  const out: DrillResult[] = []
  for (const { metric, label, key } of FIELD_KEYS) {
    const text = (data[key] as string).trim()
    if (text) {
      out.push({
        drillDefId: COACHING_DRILL_ID,
        metric,
        label,
        value: 0,
        text,
      })
    }
  }
  for (const drill of data.drillsAssigned) {
    const text = drill.trim()
    if (text) {
      out.push({
        drillDefId: COACHING_DRILL_ID,
        metric: 'drill_assigned',
        label: 'Drill assigned',
        value: 0,
        text,
      })
    }
  }
  return out
}

type CoachingFormProps = {
  mode: 'new' | 'edit'
  saving: boolean
  initial?: CoachingFormData
  previousSession?: Session | null
  onBack: () => void
  onSubmit: (data: CoachingFormData) => void
}

export function CoachingForm({
  mode,
  saving,
  initial,
  previousSession,
  onBack,
  onSubmit,
}: CoachingFormProps) {
  const [data, setData] = useState<CoachingFormData>(
    initial ?? emptyCoachingForm(),
  )

  const set = <K extends keyof CoachingFormData>(
    key: K,
    value: CoachingFormData[K],
  ) => setData((d) => ({ ...d, [key]: value }))

  const setDrill = (index: number, value: string) =>
    setData((d) => {
      const next = [...d.drillsAssigned]
      next[index] = value
      return { ...d, drillsAssigned: next }
    })

  const addDrill = () =>
    setData((d) => ({ ...d, drillsAssigned: [...d.drillsAssigned, ''] }))

  const removeDrill = (index: number) =>
    setData((d) => ({
      ...d,
      drillsAssigned: d.drillsAssigned.filter((_, i) => i !== index),
    }))

  const submit = () => {
    if (saving) return
    onSubmit(data)
  }

  const heading = mode === 'edit' ? 'Coaching — Edit' : 'Coaching'

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 px-5 pb-24 pt-3">
      <header className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onBack}
          className="tap -ml-2 self-start px-2 text-sm text-ink-400 active:text-ink-200"
        >
          ← Back
        </button>
        <h1 className="text-xl font-semibold">{heading}</h1>
      </header>

      {mode === 'new' && previousSession && (
        <PreviousLessonCard session={previousSession} />
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
          Lesson
        </h2>

        <DateStripPicker
          value={data.startedAt}
          onChange={(iso) => set('startedAt', iso)}
        />

        <Field label="Lesson title">
          <input
            type="text"
            value={data.lessonTitle}
            onChange={(e) => set('lessonTitle', e.target.value)}
            placeholder="e.g. Swing Evaluation-90"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Coach">
            <input
              type="text"
              value={data.coach}
              onChange={(e) => set('coach', e.target.value)}
              placeholder="Optional"
              className={inputCls}
            />
          </Field>
          <Field label="Location">
            <input
              type="text"
              value={data.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Optional"
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
          Before lesson
        </h2>
        <Field label="Prep notes">
          <textarea
            value={data.prepNotes}
            onChange={(e) => set('prepNotes', e.target.value)}
            rows={3}
            placeholder="What to bring up, focus areas, questions"
            className={textareaCls}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
          After lesson
        </h2>
        <Field label="Flight patterns observed">
          <textarea
            value={data.flightPatterns}
            onChange={(e) => set('flightPatterns', e.target.value)}
            rows={3}
            placeholder="Optional"
            className={textareaCls}
          />
        </Field>
        <Field label="Resolution suggested">
          <textarea
            value={data.resolution}
            onChange={(e) => set('resolution', e.target.value)}
            rows={3}
            placeholder="Optional"
            className={textareaCls}
          />
        </Field>
        <Field label="Actions for improvement">
          <textarea
            value={data.actions}
            onChange={(e) => set('actions', e.target.value)}
            rows={3}
            placeholder="Optional"
            className={textareaCls}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
          Drills assigned
        </h2>
        {data.drillsAssigned.length === 0 ? (
          <p className="text-sm text-ink-400">No drills assigned yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.drillsAssigned.map((drill, i) => (
              <li key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={drill}
                  onChange={(e) => setDrill(i, e.target.value)}
                  placeholder="Drill name"
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => removeDrill(i)}
                  aria-label="Remove drill"
                  className="tap rounded-xl bg-ink-800 px-3 py-3 text-sm text-ink-400 active:bg-ink-700 active:text-ink-200"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={addDrill}
          className="tap self-start rounded-xl border border-ink-700 px-4 py-2 text-sm text-ink-200 active:bg-ink-900"
        >
          + Add drill
        </button>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
          Summary
        </h2>
        <Field label="Session summary">
          <textarea
            value={data.summary}
            onChange={(e) => set('summary', e.target.value)}
            rows={4}
            placeholder="Takeaways, what to practice between now and next lesson"
            className={textareaCls}
          />
        </Field>
      </section>

      <button
        type="button"
        onClick={submit}
        disabled={saving}
        className="tap mt-2 w-full rounded-2xl bg-accent-500 py-4 text-base font-semibold text-ink-950 active:opacity-80 disabled:opacity-50"
      >
        {saving ? 'Saving…' : mode === 'edit' ? 'Update' : 'Save'}
      </button>
    </div>
  )
}

type CoachingListProps = {
  sessions: Session[]
  onBack: () => void
  onAdd: () => void
  onView: (id: string) => void
}

export function CoachingList({
  sessions,
  onBack,
  onAdd,
  onView,
}: CoachingListProps) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 px-5 pb-24 pt-3">
      <header className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onBack}
          className="tap -ml-2 self-start px-2 text-sm text-ink-400 active:text-ink-200"
        >
          ← Home
        </button>
        <h1 className="text-xl font-semibold">Coaching</h1>
      </header>

      <button
        type="button"
        onClick={onAdd}
        className="tap w-full rounded-2xl bg-accent-500 py-4 text-base font-semibold text-ink-950 active:opacity-80"
      >
        Add session +
      </button>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
          Past sessions
        </h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-ink-400">No coaching sessions yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sessions.map((s) => (
              <CoachingHistoryCard
                key={s.id}
                session={s}
                onOpen={() => onView(s.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function CoachingHistoryCard({
  session,
  onOpen,
}: {
  session: Session
  onOpen: () => void
}) {
  const get = (m: string) =>
    session.drills.find((d) => d.metric === m)?.text ?? ''
  const title = get('lesson_title') || 'Lesson'
  const coach = get('coach')
  const summary = get('summary') || get('prep_notes')
  const date = new Date(session.startedAt)

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="tap flex w-full flex-col gap-2 rounded-xl bg-ink-900 p-4 text-left active:bg-ink-800"
      >
        <div className="flex items-center justify-between text-xs text-ink-400">
          <span>{formatDate(date)}</span>
          <span className="tabular-nums">{formatTime(date)}</span>
        </div>
        <div className="text-sm font-semibold text-ink-100">{title}</div>
        {coach && <div className="text-xs text-ink-400">{coach}</div>}
        {summary && (
          <div className="line-clamp-2 text-sm text-ink-300">{summary}</div>
        )}
      </button>
    </li>
  )
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

type CoachingViewProps = {
  session: Session
  onBack: () => void
}

export function CoachingView({ session, onBack }: CoachingViewProps) {
  const get = (m: string) =>
    session.drills.find((d) => d.metric === m)?.text ?? ''
  const drills = session.drills
    .filter((d) => d.metric === 'drill_assigned')
    .map((d) => d.text ?? '')
    .filter((t) => t.trim() !== '')

  const title = get('lesson_title')
  const coach = get('coach')
  const location = get('location')
  const prep = get('prep_notes')
  const flight = get('flight_patterns')
  const resolution = get('resolution')
  const actions = get('actions')
  const summary = get('summary')

  const date = new Date(session.startedAt)
  const meta = [
    formatDate(date),
    formatTime(date),
    coach,
    location,
  ].filter(Boolean)

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 px-5 pb-24 pt-3">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onBack}
          className="tap -ml-2 self-start px-2 text-sm text-ink-400 active:text-ink-200"
        >
          ← Coaching
        </button>
        <h1 className="text-xl font-semibold">{title || 'Lesson'}</h1>
        {meta.length > 0 && (
          <div className="text-xs text-ink-400">{meta.join(' · ')}</div>
        )}
      </header>

      <ViewSection label="Prep notes" text={prep} />
      <ViewSection label="Flight patterns observed" text={flight} />
      <ViewSection label="Resolution suggested" text={resolution} />
      <ViewSection label="Actions for improvement" text={actions} />

      {drills.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
            Drills assigned
          </h2>
          <ul className="list-disc pl-5 text-sm text-ink-200">
            {drills.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </section>
      )}

      <ViewSection label="Summary" text={summary} />

      {meta.length === 0 &&
        !prep &&
        !flight &&
        !resolution &&
        !actions &&
        drills.length === 0 &&
        !summary && (
          <p className="text-sm text-ink-400">This lesson has no notes yet.</p>
        )}
    </div>
  )
}

function ViewSection({ label, text }: { label: string; text: string }) {
  if (!text) return null
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </h2>
      <p className="whitespace-pre-wrap text-sm text-ink-200">{text}</p>
    </section>
  )
}

function PreviousLessonCard({ session }: { session: Session }) {
  const get = (m: string) =>
    session.drills.find((d) => d.metric === m)?.text ?? ''
  const title = get('lesson_title')
  const summary = get('summary')
  const actions = get('actions')
  const drills = session.drills
    .filter((d) => d.metric === 'drill_assigned')
    .map((d) => d.text ?? '')
    .filter((t) => t.trim() !== '')

  if (!summary && !actions && drills.length === 0) return null

  const date = new Date(session.startedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  return (
    <section className="rounded-2xl border border-ink-700 bg-ink-900 p-4">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-ink-400">
        <span>Last lesson · {date}</span>
        {title && <span className="normal-case tracking-normal text-ink-300">{title}</span>}
      </div>
      {summary && (
        <PreviousField label="Summary" text={summary} />
      )}
      {actions && (
        <PreviousField label="Actions" text={actions} />
      )}
      {drills.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Drills
          </div>
          <ul className="mt-1 list-disc pl-5 text-sm text-ink-200">
            {drills.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function PreviousField({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-3 first:mt-0">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </div>
      <p className="mt-1 whitespace-pre-wrap text-sm text-ink-200">{text}</p>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col text-sm font-semibold uppercase tracking-wide text-ink-400">
      {label}
      {children}
    </label>
  )
}

const inputCls =
  'mt-1 w-full rounded-xl bg-ink-800 p-3 text-sm font-normal normal-case tracking-normal text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500'

const textareaCls =
  'mt-1 w-full resize-none rounded-xl bg-ink-800 p-3 text-sm font-normal normal-case tracking-normal text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500'
