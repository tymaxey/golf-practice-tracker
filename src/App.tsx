import { useEffect, useState } from 'react'
import { Toast } from '@/components/Toast'
import { ACTIVE_PLAN_FOR_DISCIPLINE } from '@/config/plans'
import { clearAll, createSession, getSession, listSessions, updateSession } from '@/db'
import { markdownSession } from '@/export/format'
import { copyText } from '@/export/share'
import { Drill } from '@/screens/Drill'
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
import type { Session } from '@/types/model'

type Step = 'drill0' | 'drill1' | 'drill2' | 'review'

type Screen =
  | { kind: 'home' }
  | { kind: 'settings' }
  | { kind: 'flow'; step: Step; mode: 'new'; editingId?: undefined }
  | { kind: 'flow'; step: 'review'; mode: 'edit'; editingId: string }

export default function App() {
  const plan = ACTIVE_PLAN_FOR_DISCIPLINE('putting')
  const phase = plan?.phases[0]
  const drills = phase?.protocol.drills ?? []

  const [sessions, setSessions] = useState<Session[]>([])
  const [screen, setScreen] = useState<Screen>({ kind: 'home' })
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    listSessions().then(setSessions)
  }, [])

  if (!plan || !phase || drills.length === 0) {
    return (
      <div className="p-6 text-red-400">
        No active putting plan found. Check src/config/plans.
      </div>
    )
  }

  const startNew = () => {
    setDraft(emptyDraft(drills))
    setScreen({ kind: 'flow', step: 'drill0', mode: 'new' })
  }

  const openEdit = async (id: string) => {
    const s = await getSession(id)
    if (!s) return
    setDraft(hydrateDraft(s, drills))
    setScreen({ kind: 'flow', step: 'review', mode: 'edit', editingId: id })
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
    if (!draft || saving) return
    setSaving(true)
    try {
      const drillResults = serializeDraft(draft, drills)
      if (screen.kind === 'flow' && screen.mode === 'edit') {
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

  return (
    <>
      {screen.kind === 'home' && (
        <Home
          planName={plan.name}
          sessions={sessions}
          onStart={startNew}
          onOpenSession={openEdit}
          onOpenSettings={() => setScreen({ kind: 'settings' })}
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

      {screen.kind === 'flow' && screen.mode === 'new' && draft && (
        <FlowNew
          step={screen.step}
          drills={drills}
          draft={draft}
          saving={saving}
          onValue={updateValue}
          onNotes={updateNotes}
          onCancel={cancelDraft}
          onStep={(step) =>
            setScreen({ kind: 'flow', step, mode: 'new' })
          }
          onSave={handleSave}
        />
      )}

      {screen.kind === 'flow' && screen.mode === 'edit' && draft && (
        <Review
          drills={drills}
          draft={draft}
          onChange={updateValue}
          onNotesChange={updateNotes}
          onBack={goHome}
          backLabel="Back"
          onSave={handleSave}
          saving={saving}
          mode="edit"
          onExport={handleExportEditing}
        />
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}

type FlowNewProps = {
  step: Step
  drills: import('@/types/model').DrillDef[]
  draft: Draft
  saving: boolean
  onValue: (key: string, v: MetricValue) => void
  onNotes: (notes: string) => void
  onCancel: () => void
  onStep: (step: Step) => void
  onSave: () => void
}

function FlowNew({
  step,
  drills,
  draft,
  saving,
  onValue,
  onNotes,
  onCancel,
  onStep,
  onSave,
}: FlowNewProps) {
  const totalSteps = drills.length + 1
  const order: Step[] = ['drill0', 'drill1', 'drill2', 'review']

  if (step === 'review') {
    return (
      <Review
        drills={drills}
        draft={draft}
        onChange={onValue}
        onNotesChange={onNotes}
        onBack={() => onStep('drill2')}
        backLabel={drills[drills.length - 1]?.name ?? 'Back'}
        onSave={onSave}
        saving={saving}
        mode="new"
      />
    )
  }

  const idx = order.indexOf(step)
  const drill = drills[idx]
  if (!drill) return null

  const prevStep = order[idx - 1]
  const nextStep = order[idx + 1]
  const prevDrill = idx > 0 ? drills[idx - 1] : null

  return (
    <Drill
      drill={drill}
      values={draft.values}
      onChange={onValue}
      step={{ current: idx + 1, total: totalSteps }}
      onBack={prevStep ? () => onStep(prevStep) : onCancel}
      backLabel={prevDrill ? prevDrill.name : 'Cancel'}
      onNext={() => onStep(nextStep!)}
      nextLabel={nextStep === 'review' ? 'Review' : 'Next'}
    />
  )
}
