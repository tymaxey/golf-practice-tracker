# Practice Tracker — Build Brief

**Owner:** Ty
**Status:** M3 landed; M4 next
**Version:** v0.5 (2026-04-28)
**Repo:** https://github.com/tymaxey/golf-practice-tracker (private)

---

## 1. Purpose

Personal mobile app for capturing structured golf practice data across multiple disciplines. Designed for fast single-thumb entry on iPhone or iPad. Output feeds an existing chat-based coaching workflow via markdown export.

Personal-use tool. No multi-user, no auth, no analytics, no sharing. Privacy and simplicity are explicit priorities.

## 2. Hard rules

These are not negotiable.

- **Speed:** full Phase 1 putting protocol entry must complete in under 30 seconds of input time. If the app is slower than a paper log, it has failed.
- **Privacy:** all data local. No backend, no third-party analytics, no telemetry. Audit dependencies.
- **Offline-first:** must work fully offline once installed. No external CDN calls at runtime.
- **No silent failures:** every state transition has user feedback.

## 3. Scope

### In scope (v1)

- Putting discipline only (one plan: Break 80 — Putting Phase 1, three drill blocks)
- Multiple sessions per day
- Post-save session edit
- Last-7 history list, sparkline trends on 3 key metrics
- Habit-tracker calendar view (contribution-graph style) across disciplines
- Markdown export (single session + date range), CSV export
- Settings page: export all, export single, clear all data (with confirmation)
- PWA install + offline support
- Discipline / Plan / Phase as first-class data model so chipping/simulator/range slot in later without refactor

### Out of scope (v1, reserved for v2+)

- Chipping, simulator, range disciplines (data model supports them; no UI/plans yet)
- Garmin R10 CSV import
- Image attachments (strike pattern photos)
- Cross-discipline dashboard
- Multi-device sync, cloud backup, push notifications, Apple Watch
- Light/dark mode toggle (system default only)
- Localization (English only)
- In-app drill builder

## 4. User context

- Single user (owner)
- Primary device: iPhone, portrait, single-thumb
- Secondary: iPad
- Use environment: home office, between meetings
- Session shape: 15 min practice + ≤30 sec data entry, daily target

## 5. Tech stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS, custom components (no shadcn — bundle size + minimal primitive set)
- **Storage:** Dexie.js over IndexedDB for sessions; localStorage for prefs only
- **PWA:** vite-plugin-pwa (Workbox under the hood)
- **Hosting:** Vercel (free tier)
- **Repo:** private GitHub repo (to be created)

## 6. Data model

```ts
type Discipline = {
  id: string                      // 'putting' | 'chipping' | 'simulator' | 'range'
  name: string
  icon: string
}

type Plan = {
  id: string
  disciplineId: string
  name: string                    // 'Break 80 — Putting Phase 1'
  phases: Phase[]
  isActive: boolean
}

type Phase = {
  id: string
  planId: string
  name: string
  order: number
  protocol: ProtocolDef
}

type ProtocolDef = {
  drills: DrillDef[]
}

type DrillDef = {
  id: string
  type: 'face_control' | 'distance_control' | 'pressure_random' | string
  name: string
  durationMin: number
  metrics: MetricDef[]
}

type MetricDef = {
  key: string                     // 'gate_5ft_clean'
  label: string                   // 'Gate drill (5 ft) clean throughs'
  inputType: 'counter' | 'success_total' | 'tap_buttons' | 'numeric'
  min?: number
  max?: number
}

type Session = {
  id: string                      // uuid
  startedAt: string               // ISO, local-time intent
  endedAt: string | null
  disciplineId: string
  planId: string
  phaseId: string
  notes: string
  drills: DrillResult[]
  attachments: Attachment[]       // empty in v1; structure reserved
}

type DrillResult = {
  drillDefId: string
  metric: string                  // matches MetricDef.key
  label: string
  value: number
  denominator?: number
  unit?: string
}

type Attachment = {
  id: string
  type: 'image' | 'csv' | string
  blob: Blob | null
  ref?: string
  metadata: Record<string, unknown>
}
```

Plans, phases, and drill defs are seeded from JSON-config-in-repo at `src/config/plans/`. Adding a new plan = new file + restart. No user-facing drill builder.

## 7. Putting Phase 1 protocol (seed data)

### Drill A — Face Control Block (5 min)

| metric key | label | input | range |
|---|---|---|---|
| gate_5ft_clean | Gate drill (5 ft) — clean throughs | counter | 0–10 |
| consec_3ft_streak | Consecutive 3-ft makes — longest streak | counter | 0–N |
| makes_5ft | 5-ft makes / attempts | success_total | 0–N |

### Drill B — Distance Control Block (5 min)

| metric key | label | input | range |
|---|---|---|---|
| ladder_within_6 | Ladder drill (3/6/9 ft) — within 6" | success_total | 0–N |
| random_within_6 | Random distances — within 6" | success_total | 0–N |

### Drill C — Pressure / Random Block (5 min)

| metric key | label | input | scoring |
|---|---|---|---|
| pressure_taps | Per-attempt result | tap_buttons (good / near / bad) | good +1, near 0, bad −1 |
| pressure_score | Cumulative score | derived | sum of taps |
| pressure_distribution | Counts per outcome | derived | tally |

## 8. UX requirements

- Portrait-first, single-thumb
- Tap targets ≥ 44×44 pt
- Counters / steppers for numbers, never raw text input
- Numeric keypad only when text input is unavoidable
- **Home screen:** today's session status (active / not started / completed) → start CTA → last 3 sessions with key metrics → habit heatmap below
- **In-session:** one drill per screen, all inputs visible without scrolling on iPhone 14+
- **Review screen:** edit-on-tap fields + notes textarea + Save CTA
- Save confirmation: toast + return home with today marked complete
- Post-save edits: open a saved session from history, tap fields to edit
- iPad: more horizontal space; never require landscape

## 9. Markdown export format

### Single session

```markdown
## Putting Session Log

**Date:** 2026-04-28
**Duration:** 14m 32s
**Headline:** 5-ft 70% · Ladder 73% · Pressure +6
**Notes:** Felt locked in. ER2 + Tour 5.0 grip rolling.

### Face Control Block
- Gate drill (5 ft): 8 / 10 clean throughs
- Consecutive 3-ft makes: 14 (best streak)
- 5-ft make rate: 7 / 10 (70%)

### Distance Control Block
- Ladder drill (3/6/9 ft): 11 / 15 within 6 inches (73%)
- Random distances: 7 / 12 within 6 inches (58%)

### Pressure/Random Block
- Cumulative score: +6
- Distribution: good 8 | near 4 | bad 2
```

`Duration` is computed from `endedAt - startedAt`, not hardcoded.

### Range export

```markdown
## Putting Sessions — 2026-04-22 to 2026-04-28

| Date | 5-ft % | Ladder % | Pressure score |
|---|---|---|---|
| 04-22 | 60% | 67% | +3 |
| ... |

---

[single-session block]

---

[single-session block]
```

### CSV export

One row per drill result. Columns:

`session_id, started_at, discipline_id, plan_id, phase_id, drill_def_id, metric, value, denominator, unit, notes`

## 10. Milestones

| Milestone | Scope | Validation |
|---|---|---|
| M1 — Foundation | Discipline/Plan/Phase model, Dexie wired, seed putting plan, single-drill save flow | Save & reload one Face Control drill scoped to putting/Phase 1 |
| M2 — Full putting protocol | All 3 drill blocks, session save flow, post-save edit | Save full putting session in <30s |
| M3 — History & habits | Last-7 list, sparkline trends, calendar heatmap across disciplines | Week of data shows trends + heatmap |
| M4 — Export & settings | Markdown single + range, CSV, settings page | Pastes cleanly into chat |
| M5 — PWA polish | Manifest, service worker, offline test, install | Installs on iOS, works in airplane mode |

Each milestone is independently demoable.

## 11. Acceptance criteria (v1 ship gate)

- Full Phase 1 putting protocol entry under 30 seconds (timed test)
- Installs to iOS home screen via Safari, works offline
- 30 days of daily use without data loss
- Markdown export pastes into chat with zero cleanup
- First load <2s on LTE; subsequent loads <500ms
- Lighthouse PWA score ≥ 90
- Zero external network requests after first load (DevTools verified)

## 12. Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-04-28 | Stack: React + Vite + Tailwind + Dexie + Vercel | Smallest viable PWA stack with mature offline tooling |
| 2026-04-28 | Custom Tailwind components, not shadcn | Tiny primitive set; bundle size matters for LTE first-load |
| 2026-04-28 | JSON-config-in-repo for plans/phases/drills | Adding a plan ≠ refactor; user-facing builder still out of scope |
| 2026-04-28 | Multi-discipline data model from v1 | Chipping, simulator, range coming; refactor cost too high if deferred |
| 2026-04-28 | Multiple sessions per day allowed | Practice cadence is irregular; some days zero, some days many |
| 2026-04-28 | Post-save edits allowed | Daily logs always need typo fixes |
| 2026-04-28 | Local time in export, no TZ tagging | Single user, no travel scope for v1 |
| 2026-04-28 | Hosting: Vercel | Friction-free deploy for Vite SPA |
| 2026-04-28 | Repo: private GitHub, to be created | — |
| 2026-04-28 | TypeScript across the app | Brief's data model is already TS; matches stack norms |
| 2026-04-28 | Plans/phases/drills as static TS imports, not Dexie | Adding a plan = new file + restart, per §6; sessions are the only Dexie table |
| 2026-04-28 | Tailwind v3 over v4 | Plugin ecosystem maturity; bundle size equivalent |
| 2026-04-28 | M1 landed: scaffold, types, Dexie sessions store, Putting Phase 1 seed (full 3 drills), Face Control save/reload UI | Validation: saved session persists across page reload (verified in dev) |
| 2026-04-28 | M2 landed: per-drill paging (Home → A → B → C → Review), NumberPad for capped ranges (≤12), TapButtons (good/near/bad + undo), generic MetricInput renderer, post-save edit | Validation: full putting session entry in 26.6s at 250ms/tap + 500ms screen pauses (under 30s gate) |
| 2026-04-28 | Pressure drill persists 4 derived rows: pressure_score, pressure_good, pressure_near, pressure_bad (no raw tap sequence) | DrillResult.value is `number`; distribution can't fit one row, and §9 export only needs counts + score |
| 2026-04-28 | Session draft is in-memory only (lost on refresh); Cancel from Drill A confirms before discard | Personal-use scope; persistence-during-flow is overkill for a 30-second entry |
| 2026-04-28 | M3 landed: derive.ts (5-ft / ladder / pressure extractors + headlineSummary + day-bucketing), Sparkline (inline SVG), TrendsCard (last-7 sessions), HeatmapCard (90-day, count-graded, discipline-aware aggregation), Home expanded to 7 recent | Validation: seeded 14-day arc shows trends + filled heatmap on iPhone-mobile preview |
| 2026-04-28 | History lives on Home (no new route, no tab strip); sparklines key on last-N **sessions**, heatmap on last-N **days** | Single-screen mobile-first; performance-over-reps and habit-over-days are separate questions and shouldn't fight for the same axis |
| 2026-04-28 | Heatmap is count-graded (0/1/2/3+), discipline-aware internally, single-color UI today | Honors multi-discipline data-model rule without shipping unused per-discipline color split |
| 2026-04-28 | Heatmap window: rolling 90 days, 13 weeks × 7 days | 365-day grid doesn't fit portrait at 375pt; 30 too sparse to read as a habit |

## 13. Open items

- **vite-plugin-pwa transitive advisory** — `serialize-javascript` (high) reaches the dep tree via `vite-plugin-pwa → workbox-build → @rollup/plugin-terser`. Build-time only, no runtime exposure. Revisit before M5 / first deploy: check for an upstream `vite-plugin-pwa` release that pins the fix, or pin via overrides.
- **esbuild dev-server advisory (moderate)** — dev-only request-bypass. Not in production bundle. Track for fix in next vite minor.
