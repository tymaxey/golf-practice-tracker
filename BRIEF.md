# Practice Tracker — Build Brief

**Owner:** Ty
**Status:** M5 landed; six disciplines wired (Putting/Chipping/Simulator/Workout/Golf/Coaching); v1 ship gate met
**Version:** v0.10 (2026-04-28)
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

- Five active disciplines on the Home picker:
  - Putting (3 drills, full metric flow)
  - Chipping (2 drills, full metric flow)
  - Simulator R10 (4 drills, full metric flow)
  - Workout (sub-picker: GolfForever / Run / Mobility — quick-log, no metrics)
  - Golf (sub-picker: Live / Practice — free-form: course, holes, score, notes; excluded from habit heatmap)
- Multiple sessions per day
- Post-save session edit
- Last-7 history list, sparkline trends on 3 key metrics
- Habit-tracker calendar view (contribution-graph style) across disciplines
- Markdown export (single session + date range), CSV export
- Settings page: export all, export single, clear all data (with confirmation)
- PWA install + offline support
- Discipline / Plan / Phase as first-class data model so chipping/simulator/range slot in later without refactor

### Out of scope (v1, reserved for v2+)

- Range discipline (data model supports it; no plan yet)
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
  text?: string                   // optional free-form text (e.g., golf course name)
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

## 7a. Chipping Phase 1 protocol (seed data)

Maintenance plan for park sessions (~30 min, 1–2× weekly). All metrics use `success_total` for fast entry.

### Drill A — Distance Control (15 min)

| metric key | label | input | range |
|---|---|---|---|
| chip_within_3ft | Chips within 3 ft / attempts | success_total | 0–N |
| chip_within_6ft | Chips within 6 ft / attempts | success_total | 0–N |

### Drill B — Lie Variety (10 min)

| metric key | label | input | range |
|---|---|---|---|
| chip_lie_acceptable | Acceptable outcomes / attempts | success_total | 0–N |

## 7b. Simulator (R10) Phase 1 protocol (seed data)

Garage R10 sessions. Drill keys are prefixed `sim_` to avoid collisions.

### Drill A — Setup Verification (5 min)

| metric key | label | input | range |
|---|---|---|---|
| setup_photos_taken | Photos taken (face-on + DTL) | counter | 0–2 |
| lead_hand_knuckles | Lead hand knuckles visible (target ~3) | counter | 0–3 |

### Drill B — Smart Ball Warm-up (10 min)

| metric key | label | input | range |
|---|---|---|---|
| smart_ball_reps | Reps with ball held | counter | 0–N |
| connection_feel | Connection feel (1=lost, 5=locked in) | counter | 1–5 |

### Drill C — 7-iron Face Control Block (25 min)

| metric key | label | input | range |
|---|---|---|---|
| sim_7i_balls_hit | 7-iron balls hit | counter | 0–N |
| sim_7i_face_angle_avg | 7i face angle avg (° — + open / − closed) | numeric | — |
| sim_7i_face_angle_sd | 7i face angle SD (°) | numeric | — |
| sim_7i_smash_avg | 7i smash factor avg | numeric | — |

### Drill D — Multi-Club Face Check (optional, 10 min)

Phase-2 dry-run; not all R10 sessions hit this block.

| metric key | label | input | range |
|---|---|---|---|
| sim_driver_face_avg | Driver face angle avg (°) | numeric | — |
| sim_driver_smash_avg | Driver smash avg | numeric | — |
| sim_4h_face_avg | 4H face angle avg (°) | numeric | — |
| sim_wedge_face_avg | Wedge face angle avg (°) | numeric | — |

## 7c. Workout (placeholder, no metrics)

Quick-log surface for cross-training. Tapping the Workout button on Home opens a sub-picker with three options; tapping any option immediately creates a session and returns Home. The chosen option name is stored in `session.notes` so Recent reads "Workout · Run" etc. No drills, no metrics, no per-option tracking yet.

| drill id | label | input | persistence |
|---|---|---|---|
| workout-golfforever | GolfForever | (none) | session.notes = "GolfForever", drills = [] |
| workout-run | Run | (none) | session.notes = "Run", drills = [] |
| workout-mobility | Mobility | (none) | session.notes = "Mobility", drills = [] |

Workout sessions appear in the heatmap (cross-training is part of the habit) and are uneditable from Recent (tap is a no-op).

## 7d. Golf (Live / Practice, free-form)

Round-logging surface, separate from practice. Tapping Golf opens a sub-picker (Live | Practice). Tapping a mode opens a single-screen form:

| field | input | persistence |
|---|---|---|
| Course | text | DrillResult `{ metric: 'course', text }` (only if non-empty) |
| Holes played | numeric | DrillResult `{ metric: 'holes', value }` (only if non-empty) |
| Score | numeric | DrillResult `{ metric: 'score', value }` (only if non-empty) |
| Notes | textarea | session.notes |

All fields optional; submit always allowed. `drillDefId` distinguishes Live (`golf-live`) from Practice (`golf-practice`). Recent renders e.g. "Live · Pebble Beach · 18h · 87" via a golf-specific summary path in `derive.ts`. **Golf sessions are excluded from the habit heatmap** — playing isn't practicing — but they do count toward the today-session badge. Like Workout, golf sessions are uneditable from Recent.

## 8. UX requirements

- Portrait-first, single-thumb
- Tap targets ≥ 44×44 pt
- Counters / steppers for numbers, never raw text input
- Numeric keypad only when text input is unavoidable
- **Global header:** logo on the left (taps return Home, with discard-confirm if a session draft is in progress), settings gear on the right (Home only). Rendered above every screen.
- **Home screen:** today-session count → stack of green-outlined discipline buttons (one per active plan) → trends → recent sessions → habit heatmap. Discipline buttons are visually identical (no implied "primary" action).
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
| M5 — PWA polish | Manifest, service worker, offline test, install | Installs on iOS, works in airplane mode (locally validated; real-device install pending) |

Each milestone is independently demoable.

## 11. Acceptance criteria (v1 ship gate)

- Full Phase 1 putting protocol entry under 30 seconds (timed test)
- Installs to iOS home screen via Safari, works offline
- 30 days of daily use without data loss
- Markdown export pastes into chat with zero cleanup
- First load <2s on LTE; subsequent loads <500ms
- Lighthouse Performance ≥ 90, Best-Practices ≥ 90, and Chrome DevTools "Installable" passes (PWA category was retired in Lighthouse 12; install requirements verified by hand: manifest with maskable icon, registered SW, apple-touch-icon, theme-color)
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
| 2026-04-28 | M4 landed: derive helpers (`pressureDistribution`, `formatDuration`, `exportHeadline`), `src/export/format.ts` (markdown single + range, CSV), `src/export/share.ts` (clipboard / Web Share / download fallback), Settings screen with range picker + single-session picker + clear-all confirm, gear icon on Home, Copy-markdown action on Review (edit) | Validation: Last-7 export of 9 sessions paste-clean per §9, CSV 76-row export with quoted fields, empty-range disables Copy button, clear-all dual-confirm |
| 2026-04-28 | Markdown export uses percentages in headline (`5-ft 70%`); recent-session card on Home keeps raw fractions (`5-ft 7/10`) | Coaching-chat target is human-readable; on-device card is a quick at-a-glance scan and fractions pack better |
| 2026-04-28 | Range presets `Last 7 / Last 30 / This month`; `Custom range` reveals two `<input type="date">` fields | 95% of share-with-coach flows are recent-window; native iOS date pickers are heavy and only worth the friction when needed |
| 2026-04-28 | Markdown → clipboard always; CSV → `navigator.share` with `File` if supported, else `<a download>` blob fallback | §11 "pastes cleanly into chat" maps directly to clipboard for markdown; CSV is a file, share-sheet gives the cleanest iOS-PWA UX when available |
| 2026-04-28 | Empty-range UX: status line + disabled Copy/CSV buttons (no toast, no silent empty export) | Honors §2 "no silent failures" without being noisy on a state the user is already looking at |
| 2026-04-28 | Single-session export entry points: Settings → "Pick a session" + Review (edit-mode) → "Copy markdown". Recent-session card on Home stays read-only | Long-press / swipe affordances are invisible; explicit buttons in two existing surfaces are discoverable |
| 2026-04-28 | Range markdown: one summary-table row per session (not per day), with `MM-DD` date column | Multiple sessions per day is a first-class case (§3); collapsing to days hides per-session detail the user may want |
| 2026-04-28 | M5 landed: manifest icons (svg + 192/512/512-maskable), `apple-touch-icon`, `mobile-web-app-capable` meta, `apple-mobile-web-app-title`, `navigator.storage.persist()` at startup, `serialize-javascript` pinned via npm `overrides` | Validation: prod-preview build emits 10 precache entries, SW intercepts (transferSize 0 on reload), zero external requests, Lighthouse Performance 100 / Best-Practices 100, no console warnings |
| 2026-04-28 | Icon: text-based lowercase "p" mark, accent-500 (`#22c55e`) glyph on ink-950 (`#0a0a0a`) bg, single SVG source rendered to PNG via `rsvg-convert` (Homebrew librsvg, build-time only); same source serves both `any` and `maskable` purposes — glyph bbox sits inside the maskable safe zone | Single SVG file is the source of truth; PNGs are committed under `public/`; no npm dep added; honors §2 "no external CDN" |
| 2026-04-28 | Splash screens: skipped — accept iOS launch white-flash | 8+ device-size matrix not worth single-user polish; revisit in v1.1 only if it grates |
| 2026-04-28 | Install-prompt UX: passive (Safari share-sheet → Add to Home Screen). No banner, no hint card | Single-user, owner knows the iOS gesture; prompt UI is dead code |
| 2026-04-28 | Workbox: trust `generateSW` defaults — precache all build output + `NavigationRoute` fallback to `index.html` | Pure-static app, no external; no `globPatterns` override needed |
| 2026-04-28 | `navigator.storage.persist()` called once at app startup (best-effort) | iOS only grants persistence post-install; the call is cheap and serves §11 "30 days without data loss" by guarding IndexedDB against storage-pressure eviction |
| 2026-04-28 | §11 acceptance criterion "Lighthouse PWA score ≥ 90" revised — PWA category retired in Lighthouse 12 (Sept 2024) | Replaced with Performance ≥ 90 + Best-Practices ≥ 90 + Chrome DevTools "Installable" check; install requirements verified by hand. Device-install + airplane-mode test remains the truth gate |
| 2026-04-28 | `serialize-javascript` advisory closed via `overrides: { serialize-javascript: ^7.0.5 }` in package.json | Avoids the suggested vite-plugin-pwa downgrade (semver-major back to 0.19.x); 6→7 bump only drops Node <14 support, API unchanged. Build verified clean post-pin |
| 2026-04-28 | Vercel deploy not part of M5 — local prod-preview is the v1 ship gate validated locally | LTE first-load timing is the only criterion that needs a real URL; deployable any time without further code changes |
| 2026-04-28 | Multi-discipline UI shipped: Home renders one button per active plan, App flow is variable-length (`{kind:'drill'; index} \| {kind:'review'}`), recent-session cards are discipline-labeled. Chipping Phase 1 (2 drills) + Simulator R10 Phase 1 (4 drills) plans seeded | Multi-discipline data model has been load-bearing since M1; deferring the UI any longer means park-chipping and R10 sessions go unlogged. Putting button keeps accent-500; others are ink-900 to preserve "primary action" hierarchy |
| 2026-04-28 | `headlineSummary` (and `TrendsCard`) remain putting-only for now; chipping/simulator sessions show generic `"N metrics"` in Recent and don't appear in Trends | Per-discipline summary extractors are a real design problem (which metric is the headline for chipping? for R10?), not a mechanical add. Defer until enough chipping/sim sessions exist to know what to surface |
| 2026-04-28 | Global app header (logo + conditional gear) hoisted into `App.tsx`, rendered above every routed screen. Logo is a button: returns Home, with `confirm("Discard this session?")` if a flow-new draft is in progress; from edit/settings/picker screens it just navigates Home | Per-screen logos drift; one bar guarantees the user always has a route Home and a single mental model. Confirm path matches existing Drill cancel-button behavior |
| 2026-04-28 | Discipline buttons all share one style (green outline, ink-950 fill, no "primary" highlight); "Phase I" sub-label removed entirely after a brief experiment | Five disciplines on one screen need parity, not hierarchy — picking is the user's job. Sub-label was redundant once each plan only has one active phase |
| 2026-04-28 | Workout discipline added: sub-picker pattern (Home → Workout → 3 quick-log buttons → save & home). Each option creates a session with `drills: []` and `notes: optionName`; no metric tracking yet | Cross-training was going unlogged because the standard drill-stepper flow was too heavy. Sub-picker is a 2-tap entry. Three buttons (vs one) preserve which workout was done in `notes` so Recent reads "Workout · Run" |
| 2026-04-28 | Golf discipline added: custom Live/Practice form (course / holes / score / notes, all optional); `DrillResult.text?: string` extension to store course names alongside numeric metrics; sessions excluded from habit heatmap; `headlineSummary` special-cased to render "Live · Pebble Beach · 18h · 87" | Rounds aren't practice — heatmap exclusion enforces the semantic split. Free-form fields bypass the metric-stepper entirely; the model extension (`text`) keeps storage structured rather than stuffing course into `notes`. CSV/markdown exports of golf sessions intentionally not yet wired |
| 2026-04-28 | `headlineSummary` fallback expanded: empty-drills sessions render `session.notes \|\| "Logged"` instead of `"0 metrics"` | Workout sessions have `drills: []` by design and were rendering as "0 metrics" — confusing. The notes field carries the actionable label for these placeholder disciplines |
| 2026-04-28 | Workout and Golf sessions are uneditable: tapping their card in Recent is a no-op. `openEdit` early-returns for both `disciplineId`s | No structured drill flow to re-enter; allowing edit would require a second custom form path. Defer until edit demand actually surfaces |
| 2026-04-28 | Coaching discipline added: GOLFTEC lesson notes container with custom form (lesson title / coach / location / prep notes / flight patterns / resolution / actions / drills assigned / summary). Single record progressively filled across pre- and post-lesson moments. Drills assigned stored as `N` rows of `metric: 'drill_assigned'` with `text`. Excluded from heatmap (lessons aren't practice); counts toward today badge. **Editable from Recent** (unique among free-form disciplines) so post-lesson sections can be filled in after the lesson. Pre-session form shows last lesson's summary + actions + drills at the top for review | Lesson notes need persistence between coaching sessions and a tight loop with practice; the prep-review card collapses the "find last session in another app" step. Edit support is required because the use case is by definition multi-touch (prep → save → return after lesson → fill post-fields). Multiple drill rows over a single newline-joined string preserves structure for future surfacing in practice flows |
| 2026-04-28 | Coaching button on Home opens a list screen (green "Add session +" CTA + cards for past sessions) rather than jumping straight into the new-session form. Tapping a card opens a read-only `CoachingView`. Save returns to the list. Recent on Home still routes to edit | The list is the natural archive UX — past lessons are reference material, not data to re-enter. Keeping Recent → edit preserves the post-lesson fill-in path; the list adds a discoverable browse path without breaking it |

## 13. Open items

- **esbuild dev-server advisory (moderate)** — dev-only request-bypass (`<=0.24.2`). Not in production bundle. Fix requires vite@8 (semver-major). Single-user dev environment, network-trusted; deferred indefinitely.
- **vite path-traversal in `.map` handling (moderate)** — dev-only, same scope and same vite@8 fix path as above. Deferred with esbuild.
- **Golf + Workout in CSV/markdown exports** — `src/export/format.ts` doesn't emit the new `DrillResult.text` column, so course names won't roundtrip through CSV. Markdown export's per-block renderers are putting-only; golf/workout sessions render via the generic path which prints `course: 0` for the text-bearing row. Wire up when sharing rounds with the coach actually matters.
- **Per-discipline trends** — `TrendsCard` and `headlineSummary` headline-extractors are still putting-only (5-ft / Ladder / Pressure). Chipping/Simulator/Workout/Golf/Coaching show generic fallbacks in Recent and are absent from Trends. Defer until enough non-putting sessions exist to know what to surface.
- **Coaching in CSV/markdown exports** — same gap as Golf/Workout. Coaching's text-bearing rows (lesson_title, summary, etc.) won't roundtrip cleanly through the putting-shaped exporters. Wire alongside Golf when sharing lesson notes externally matters.
