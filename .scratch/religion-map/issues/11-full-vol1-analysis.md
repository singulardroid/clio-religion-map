Status: ready-for-agent

## Parent

.scratch/religion-map/PRD.md

## What to build

This is a HITL (human-in-the-loop) slice. The agent processes the remaining chapters of Volume 1 (ch02 through chN) using the same per-chapter loop established in issue #05.

For each chapter, in order:
1. Read the chapter text file
2. Read the current `concept-registry.json`
3. Extract all qualifying events → write `chNN-events.json`
4. Update `concept-registry.json` with new concept IDs
5. Run `scripts/compile_events.py` → update `app/src/data/events.json`
6. Push new events to Miro (nodes, edges, table rows) → update `miro-items.json`

The same extraction rules from issue #05 apply throughout. The concept registry must be read fresh before each chapter to correctly identify implicit first occurrences.

Pause after every 3 chapters for a brief sanity check: verify that the concept registry is growing sensibly, that no concept IDs are colliding, and that the Miro board is not becoming unreadable.

## Acceptance criteria

- [ ] All Vol. 1 chapters have a corresponding `chNN-events.json` file in `.scratch/religion-map/vol1/`
- [ ] `concept-registry.json` contains no duplicate concept IDs
- [ ] Every event in every chapter file passes the same schema validation as issue #05 (all required fields present, `seshat.year_from`/`year_to` are integers)
- [ ] The compiled `events.json` contains events from all chapters with no duplicates
- [ ] The Miro board shows nodes from all chapters in the correct era band and territory lane positions
- [ ] No concept introduced in an earlier chapter is marked `is_first_occurrence: true` again in a later chapter

## Blocked by

- `.scratch/religion-map/issues/05-chapter-1-analysis.md` (validated)
- `.scratch/religion-map/issues/06-miro-chapter-push.md`
- `.scratch/religion-map/issues/07-event-compiler-spa-data.md`
