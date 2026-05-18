Status: ready-for-agent

## Parent

.scratch/religion-map-phase-2/PRD.md

## What to build

Populate `locales.en` on every event by aligning English EPUB text to existing `concept_id` records. Use Russian `quote` and `source_ref` only as hints to locate passages—not as input to machine translation. Verbatim English from the original books goes into `statement`, `quote`, `period`, `religion`, `source_ref`, and related fields.

Deliver end-to-end:
- Alignment script (and/or documented agent batch workflow) that writes `locales.en` on chapter JSON
- Gap report listing `concept_id` values with missing or low-confidence EN fills
- Recompiled `events.json` containing bilingual records
- **HITL:** maintainer reviews agent/script output before marking this slice done (no auto-merge without human sign-off on the diff)

## Acceptance criteria

- [ ] Alignment script runs against all volumes and updates chapter JSON in place (or writes reviewable output)
- [ ] No Russian text copied into `locales.en` as a default strategy
- [ ] Gap report emitted for unmatched or empty EN fields
- [ ] Sample events manually spot-checked: EN quote matches English EPUB passage
- [ ] pytest with fixture excerpts asserts join logic for at least one matched `concept_id`

## Blocked by

- `.scratch/religion-map-phase-2/issues/01-locales-schema-migration.md`
- `.scratch/religion-map-phase-2/issues/02-epub-parser.md`
