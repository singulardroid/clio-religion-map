Status: ready-for-agent

## Parent

.scratch/religion-map/PRD.md

## What to build

Two deliverables:

**A. Event compiler script**
Write `scripts/compile_events.py` — reads all `.scratch/religion-map/vol*/chNN-events.json` files in chapter order, flattens all `events[]` arrays into a single list, resolves all `connections[]` references, and writes the result to `app/src/data/events.json`.

Output shape (from the PRD schema):
```json
{
  "events": [ ...all event objects... ],
  "connections": [
    { "source": "concept_id_a", "target": "concept_id_b", "label": "..." }
  ]
}
```

The script is idempotent and safe to re-run after every new chapter.

**B. SPA data wiring**
Update `app/src/App.tsx` to load `events.json` (static import or `fetch`) and pass events to `<ReactFlow>` as nodes, positioned using `timeToX(seshat.year_from)` and `territoryToY(territory)`. Connections become React Flow edges. At this stage nodes can render as plain default React Flow nodes — full `EventNode` styling comes in issue #08.

The app must show real ch01 event nodes on the canvas in the correct positions after this slice.

## Acceptance criteria

- [ ] `python scripts/compile_events.py` produces a valid `app/src/data/events.json`
- [ ] Re-running the script after adding a new chapter appends new events without duplicating existing ones
- [ ] A pytest test with fixture chapter JSON files asserts correct total event count and no duplicate `concept_id` values in the output
- [ ] The SPA shows ch01 nodes on the canvas at the correct X/Y positions (inside the Палеолит era band, in the correct territory lane)
- [ ] React Flow edges are rendered between connected nodes

## Blocked by

- `.scratch/religion-map/issues/05-chapter-1-analysis.md`
- `.scratch/religion-map/issues/03-spa-scaffold.md`
