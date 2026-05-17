Status: ready-for-agent

## Parent

.scratch/religion-map/PRD.md

## What to build

This is a HITL (human-in-the-loop) slice. The agent reads `data/vol1/chapters/ch01.txt`, reasons over the Russian text, and produces the first structured event file.

The agent must:
1. Read `.scratch/religion-map/concept-registry.json` (initialized as empty in issue #01)
2. Read `data/vol1/chapters/ch01.txt` fully
3. Extract all qualifying events using the rules below
4. Write `.scratch/religion-map/vol1/ch01-events.json`
5. Update `.scratch/religion-map/concept-registry.json` with any new concept IDs seen

**Extraction rules:**
- An event qualifies if it has a named time period AND a named territory
- Capture if Eliade explicitly states "впервые", "зарождается", "возникает", "A превращается в B", or equivalent
- Capture if the concept key is absent from the concept registry at the time of reading (implicit first occurrence)
- `first_occurrence_type`: `"explicit"` if Eliade states it, `"implicit"` if registry-derived
- Dead-end events (no known outgoing influence) are included with `"is_dead_end": true`
- All text (statement, quote) stays in Russian
- `seshat.year_from` and `seshat.year_to` are integer years (negative = BCE)
- `seshat.mapping_confidence`: `"high"` if Eliade names a specific polity, `"medium"` if region is clear, `"low"` if only a broad era is known

The event schema is defined in the PRD (`.scratch/religion-map/PRD.md`, Implementation Decisions §4).

## Acceptance criteria

- [ ] `.scratch/religion-map/vol1/ch01-events.json` exists and is valid JSON
- [ ] Every event has `concept_id`, `period`, `era`, `territory`, `religion`, `statement`, `quote`, `source_ref`, `is_first_occurrence`, `first_occurrence_type`, `is_dead_end`, `connections`, and a `seshat` object
- [ ] `concept-registry.json` has been updated with all concept IDs from ch01
- [ ] At least one event is marked `is_first_occurrence: true`
- [ ] The `seshat.year_from` and `seshat.year_to` fields are integers, not strings

## Blocked by

- `.scratch/religion-map/issues/04-fb2-parser.md`
