Status: ready-for-agent

## Parent

.scratch/religion-map-phase-2/PRD.md

## What to build

Introduce git-backed editorial metadata merged at compile time. Seed `data/editorial/event-overlays.json` as `{ "by_concept_id": {} }`. Each entry may hold `position: { x, y }`, `comments[]`, and `issues[]` (structure only in this slice—UI editing comes later).

Extend compile to join overlay by `concept_id` and apply position overrides to the compiled event graph input. Compiled bundle (or parallel static asset) makes overlay data available to the SPA.

Deliver end-to-end:
- Committed seed overlay file
- Compiler merge + validation
- SPA loads merged positions instead of `localStorage` when overlay provides them (migration path: overlay wins, optional one-time import from localStorage in dev)

## Acceptance criteria

- [ ] `event-overlays.json` exists in repo with valid schema
- [ ] Compile merges overlay positions into output consumed by the graph layout
- [ ] pytest asserts merge: overlay position overrides default layout coordinates for a fixture concept
- [ ] Documented JSON shape for comments and issues arrays (may be empty in this slice)

## Blocked by

- `.scratch/religion-map-phase-2/issues/01-locales-schema-migration.md`
