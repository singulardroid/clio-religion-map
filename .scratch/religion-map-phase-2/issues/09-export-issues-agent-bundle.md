Status: ready-for-agent

## Parent

.scratch/religion-map-phase-2/PRD.md

## What to build

CLI script `export_issues_for_review.py` that bundles every **open** editorial issue into a single JSON artifact for local Cursor/agent review. Each entry includes `concept_id`, tag, note, timestamps, bilingual quotes and refs, volume/chapter, connection targets, and paths hinting at FB2/EPUB inputs under `inputs/`.

No auto-apply of agent output (Phase 3). README editorial workflow already describes the handoff; ensure script output filename and location match that doc.

## Acceptance criteria

- [ ] Script runs from repo root and writes `issues-review.json` (or documented path under `data/editorial/`)
- [ ] Output includes only `resolved: false` issues
- [ ] Each record has enough context for source verification without opening the SPA
- [ ] pytest with fixture overlay + events asserts bundle shape and filtering

## Blocked by

- `.scratch/religion-map-phase-2/issues/08-editorial-dev-write-prod-readonly.md`
