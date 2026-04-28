import { useEffect, useState } from 'react'
import { Toast } from '@/components/Toast'
import { PLANS, getPlan } from '@/config/plans'
import { clearAll, createSession, getSession, listSessions, updateSession } from '@/db'
import { markdownSession } from '@/export/format'
import { copyText } from '@/export/share'
import { Drill } from '@/screens/Drill'
import { GolfForm, GolfPicker, type GolfFormData } from '@/screens/Golf'
import { Home } from '@/screens/Home'
import { Review } from '@/screens/Review'
import { Settings } from '@/screens/Settings'
import {
  emptyDraft,
  hydrateDraft,
  serializeDraft,
  type Draft,
  type MetricValue,
} from '@/session/draft'
import type { DrillDef, Session } from '@/types/model'

type FlowStep = { kind: 'drill'; index: number } | { kind: 'review' }

type Screen =
  | { kind: 'home' }
  | { kind: 'settings' }
  | { kind: 'workout' }
  | { kind: 'golf-picker' }
  | { kind: 'golf-form'; drillId: 'golf-live' | 'golf-practice' }
  | { kind: 'flow'; planId: string; step: FlowStep; mode: 'new' }
  | {
      kind: 'flow'
      planId: string
      step: { kind: 'review' }
      mode: 'edit'
      editingId: string
    }

const drillsForPlan = (planId: string): DrillDef[] =>
  getPlan(planId)?.phases[0]?.protocol.drills ?? []

export default function App() {
  const activePlans = PLANS.filter((p) => p.isActive)

  const [sessions, setSessions] = useState<Session[]>([])
  const [screen, setScreen] = useState<Screen>({ kind: 'home' })
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    listSessions().then(setSessions)
  }, [])

  if (activePlans.length === 0) {
    return (
      <div className="p-6 text-red-400">
        No active plans found. Check src/config/plans.
      </div>
    )
  }

  const startNew = (planId: string) => {
    if (planId === 'workout') {
      setScreen({ kind: 'workout' })
      return
    }
    if (planId === 'golf') {
      setScreen({ kind: 'golf-picker' })
      return
    }
    const drills = drillsForPlan(planId)
    if (drills.length === 0) return
    setDraft(emptyDraft(drills))
    setScreen({
      kind: 'flow',
      planId,
      step: { kind: 'drill', index: 0 },
      mode: 'new',
    })
  }

  const saveGolf = async (
    drillId: 'golf-live' | 'golf-practice',
    data: GolfFormData,
  ) => {
    if (saving) return
    const plan = getPlan('golf')
    const phase = plan?.phases[0]
    const drill = phase?.protocol.drills.find((d) => d.id === drillId)
    if (!plan || !phase || !drill) return

    setSaving(true)
    try {
      const drillResults = []
      const courseTrim = data.course.trim()
      if (courseTrim) {
        drillResults.push({
          drillDefId: drillId,
          metric: 'course',
          label: 'Course',
          value: 0,
          text: courseTrim,
        })
      }
      const holesNum = data.holes.trim() === '' ? null : Number(data.holes)
      if (holesNum !== null && Number.isFinite(holesNum)) {
        drillResults.push({
          drillDefId: drillId,
          metric: 'holes',
          label: 'Holes',
          value: holesNum,
        })
      }
      const scoreNum = data.score.trim() === '' ? null : Number(data.score)
      if (scoreNum !== null && Number.isFinite(scoreNum)) {
        drillResults.push({
          drillDefId: drillId,
          metric: 'score',
          label: 'Score',
          value: scoreNum,
        })
      }

      const now = new Date().toISOString()
      await createSession({
        startedAt: now,
        endedAt: now,
        disciplineId: plan.disciplineId,
        planId: plan.id,
        phaseId: phase.id,
        notes: data.notes.trim(),
        drills: drillResults,
      })
      setSessions(await listSessions())
      setToast(`Logged ${drill.name}`)
      setScreen({ kind: 'home' })
    } finally {
      setSaving(false)
    }
  }

  const logWorkout = async (optionName: string) => {
    const plan = getPlan('workout')
    const phase = plan?.phases[0]
    if (!plan || !phase) return
    const now = new Date().toISOString()
    await createSession({
      startedAt: now,
      endedAt: now,
      disciplineId: plan.disciplineId,
      planId: plan.id,
      phaseId: phase.id,
      notes: optionName,
      drills: [],
    })
    setSessions(await listSessions())
    setToast(`Logged ${optionName}`)
    setScreen({ kind: 'home' })
  }

  const openEdit = async (id: string) => {
    const s = await getSession(id)
    if (!s) return
    if (s.disciplineId === 'workout' || s.disciplineId === 'golf') return
    const drills = drillsForPlan(s.planId)
    if (drills.length === 0) return
    setDraft(hydrateDraft(s, drills))
    setScreen({
      kind: 'flow',
      planId: s.planId,
      step: { kind: 'review' },
      mode: 'edit',
      editingId: id,
    })
  }

  const goHome = () => {
    setDraft(null)
    setScreen({ kind: 'home' })
  }

  const cancelDraft = () => {
    if (window.confirm('Discard this session?')) goHome()
  }

  const updateValue = (key: string, val: MetricValue) => {
    setDraft((d) =>
      d ? { ...d, values: { ...d.values, [key]: val } } : d,
    )
  }

  const updateNotes = (notes: string) => {
    setDraft((d) => (d ? { ...d, notes } : d))
  }

  const handleExportEditing = async () => {
    if (screen.kind !== 'flow' || screen.mode !== 'edit') return
    const s = await getSession(screen.editingId)
    if (!s) return
    const ok = await copyText(markdownSession(s))
    setToast(ok ? 'Copied session' : 'Copy failed')
  }

  const handleClearAll = async () => {
    await clearAll()
    setSessions([])
  }

  const handleSave = async () => {
    if (!draft || saving || screen.kind !== 'flow') return
    const plan = getPlan(screen.planId)
    const phase = plan?.phases[0]
    const drills = phase?.protocol.drills ?? []
    if (!plan || !phase || drills.length === 0) return

    setSaving(true)
    try {
      const drillResults = serializeDraft(draft, drills)
      if (screen.mode === 'edit') {
        await updateSession(screen.editingId, {
          notes: draft.notes,
          drills: drillResults,
        })
        setToast('Updated')
      } else {
        await createSession({
          startedAt: draft.startedAt,
          endedAt: new Date().toISOString(),
          disciplineId: plan.disciplineId,
          planId: plan.id,
          phaseId: phase.id,
          notes: draft.notes,
          drills: drillResults,
        })
        setToast('Saved')
      }
      setSessions(await listSessions())
      setDraft(null)
      setScreen({ kind: 'home' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogoClick = () => {
    if (screen.kind === 'home') return
    if (screen.kind === 'flow' && screen.mode === 'new') {
      cancelDraft()
      return
    }
    goHome()
  }

  return (
    <>
      <AppHeader
        onLogo={handleLogoClick}
        onSettings={
          screen.kind === 'home'
            ? () => setScreen({ kind: 'settings' })
            : undefined
        }
      />

      {screen.kind === 'home' && (
        <Home
          plans={activePlans}
          sessions={sessions}
          onStart={startNew}
          onOpenSession={openEdit}
        />
      )}

      {screen.kind === 'settings' && (
        <Settings
          sessions={sessions}
          onBack={goHome}
          onClearAll={handleClearAll}
          onToast={(m) => setToast(m)}
        />
      )}

      {screen.kind === 'workout' && (
        <WorkoutPicker
          drills={drillsForPlan('workout')}
          onBack={goHome}
          onPick={logWorkout}
        />
      )}

      {screen.kind === 'golf-picker' && (
        <GolfPicker
          drills={drillsForPlan('golf')}
          onBack={goHome}
          onPick={(drillId) => {
            if (drillId === 'golf-live' || drillId === 'golf-practice') {
              setScreen({ kind: 'golf-form', drillId })
            }
          }}
        />
      )}

      {screen.kind === 'golf-form' && (
        <GolfForm
          mode={screen.drillId === 'golf-live' ? 'live' : 'practice'}
          saving={saving}
          onBack={() => setScreen({ kind: 'golf-picker' })}
          onSubmit={(data) => saveGolf(screen.drillId, data)}
        />
      )}

      {screen.kind === 'flow' && screen.mode === 'new' && draft && (
        <FlowNew
          planId={screen.planId}
          step={screen.step}
          draft={draft}
          saving={saving}
          onValue={updateValue}
          onNotes={updateNotes}
          onCancel={cancelDraft}
          onStep={(step) =>
            setScreen({
              kind: 'flow',
              planId: screen.planId,
              step,
              mode: 'new',
            })
          }
          onSave={handleSave}
        />
      )}

      {screen.kind === 'flow' && screen.mode === 'edit' && draft && (
        <FlowEdit
          planId={screen.planId}
          draft={draft}
          saving={saving}
          onValue={updateValue}
          onNotes={updateNotes}
          onBack={goHome}
          onSave={handleSave}
          onExport={handleExportEditing}
        />
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}

type WorkoutPickerProps = {
  drills: DrillDef[]
  onBack: () => void
  onPick: (optionName: string) => void
}

function WorkoutPicker({ drills, onBack, onPick }: WorkoutPickerProps) {
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
        <h1 className="text-xl font-semibold">Workout</h1>
      </header>

      <section className="flex flex-col gap-3">
        {drills.map((drill) => (
          <button
            key={drill.id}
            type="button"
            onClick={() => onPick(drill.name)}
            className="tap flex w-full flex-col gap-1 rounded-2xl border-2 border-accent-500 px-5 py-4 text-left text-ink-200 active:bg-ink-900"
          >
            <span className="text-base font-semibold">{drill.name}</span>
          </button>
        ))}
      </section>
    </div>
  )
}

type AppHeaderProps = {
  onLogo: () => void
  onSettings?: () => void
}

function AppHeader({ onLogo, onSettings }: AppHeaderProps) {
  return (
    <div className="mx-auto flex max-w-md items-center justify-between px-5 pt-5">
      <button
        type="button"
        onClick={onLogo}
        aria-label="Home"
        className="tap -ml-1 rounded-xl p-1 active:opacity-70"
      >
        <img src="/icon.svg" alt="Practice Tracker" className="h-10 w-10 rounded-lg" />
      </button>
      {onSettings ? (
        <button
          type="button"
          onClick={onSettings}
          aria-label="Settings"
          className="tap -mr-2 rounded-full p-2 text-ink-400 active:bg-ink-800 active:text-ink-200"
        >
          <GearIcon />
        </button>
      ) : (
        <span aria-hidden="true" className="h-10 w-10" />
      )}
    </div>
  )
}

function GearIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

type FlowNewProps = {
  planId: string
  step: FlowStep
  draft: Draft
  saving: boolean
  onValue: (key: string, v: MetricValue) => void
  onNotes: (notes: string) => void
  onCancel: () => void
  onStep: (step: FlowStep) => void
  onSave: () => void
}

function FlowNew({
  planId,
  step,
  draft,
  saving,
  onValue,
  onNotes,
  onCancel,
  onStep,
  onSave,
}: FlowNewProps) {
  const drills = drillsForPlan(planId)
  if (drills.length === 0) return null

  const totalSteps = drills.length + 1

  if (step.kind === 'review') {
    const lastDrill = drills[drills.length - 1]
    return (
      <Review
        drills={drills}
        draft={draft}
        onChange={onValue}
        onNotesChange={onNotes}
        onBack={() =>
          onStep({ kind: 'drill', index: drills.length - 1 })
        }
        backLabel={lastDrill?.name ?? 'Back'}
        onSave={onSave}
        saving={saving}
        mode="new"
      />
    )
  }

  const idx = step.index
  const drill = drills[idx]
  if (!drill) return null

  const prevDrill = idx > 0 ? drills[idx - 1] : null
  const isLast = idx === drills.length - 1

  return (
    <Drill
      drill={drill}
      values={draft.values}
      onChange={onValue}
      step={{ current: idx + 1, total: totalSteps }}
      onBack={
        prevDrill
          ? () => onStep({ kind: 'drill', index: idx - 1 })
          : onCancel
      }
      backLabel={prevDrill ? prevDrill.name : 'Cancel'}
      onNext={() =>
        onStep(
          isLast
            ? { kind: 'review' }
            : { kind: 'drill', index: idx + 1 },
        )
      }
      nextLabel={isLast ? 'Review' : 'Next'}
    />
  )
}

type FlowEditProps = {
  planId: string
  draft: Draft
  saving: boolean
  onValue: (key: string, v: MetricValue) => void
  onNotes: (notes: string) => void
  onBack: () => void
  onSave: () => void
  onExport: () => void
}

function FlowEdit({
  planId,
  draft,
  saving,
  onValue,
  onNotes,
  onBack,
  onSave,
  onExport,
}: FlowEditProps) {
  const drills = drillsForPlan(planId)
  if (drills.length === 0) return null
  return (
    <Review
      drills={drills}
      draft={draft}
      onChange={onValue}
      onNotesChange={onNotes}
      onBack={onBack}
      backLabel="Back"
      onSave={onSave}
      saving={saving}
      mode="edit"
      onExport={onExport}
    />
  )
}
