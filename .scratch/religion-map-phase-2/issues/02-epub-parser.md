Status: ready-for-agent

## Parent

.scratch/religion-map-phase-2/PRD.md

## What to build

Add an English EPUB ingest path for the three volumes in `inputs/` (*A History of Religious Ideas*, Volumes 1–3). Extract chapter-level plain text (or structured sections) suitable for search and alignment—sibling to the existing FB2 parser, not a translation pipeline.

Deliver end-to-end:
- CLI script to parse each EPUB and write searchable chapter text artifacts
- Documented invocation from repo root
- pytest with a small EPUB or HTML fixture (no dependency on full copyrighted books in CI if avoided via fixture)

## Acceptance criteria

- [ ] Running the parser on local `inputs/` EPUBs produces non-empty chapter text for each volume
- [ ] Output structure is stable enough for the EN aligner to reference (volume, chapter index, text body)
- [ ] pytest validates parse of a minimal fixture
- [ ] README or script `--help` explains usage

## Blocked by

None — can start immediately
