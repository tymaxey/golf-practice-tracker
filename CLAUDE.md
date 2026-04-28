# Practice Tracker

Personal PWA for capturing golf practice data. Single user (Ty), iPhone-first, fully local, no auth, no telemetry.

**Canonical source of truth:** [BRIEF.md](./BRIEF.md). Read it before making architectural changes.

## Hard rules (always apply)

- All data local. No backend, no analytics, no telemetry. Audit every dependency.
- Offline-first. No external CDN calls at runtime.
- 30-second rule: full Phase 1 putting session entry must complete in ≤30s of input time.
- Multi-discipline data model is permanent. Do not collapse it back to a putting-only schema.

## Stack

React + Vite, Tailwind (custom components), Dexie/IndexedDB, vite-plugin-pwa, deployed to Vercel.

## Updating the brief

`BRIEF.md` is the living spec. As decisions land:

- Append a row to the Decisions log at the bottom.
- Revise affected sections in place.
- Bump the version + date in the header.

Keep this file (`CLAUDE.md`) terse — it is the entry point, not the spec.
