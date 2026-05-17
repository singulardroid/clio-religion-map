Status: ready-for-agent

## Parent

.scratch/religion-map/PRD.md

## What to build

Two deliverables in one slice:

**A. Miro chapter push**
After ch01-events.json is ready, push its events to the Miro board (`uXjVHSThVzc=`) as nodes and edges:
- Each event becomes a node placed at the correct era band (X) and territory lane (Y) intersection
- Node surface text: `[period] · [religion]` on line 1, `[statement]` on line 2, `★ Первое появление` on line 3 if `is_first_occurrence: true`
- First-occurrence nodes get a gold/amber visual accent
- Dead-end nodes get a dashed border
- Each connection in `connections[]` becomes an arrow from source node to target node, with `label` as the arrow text
- Each event row is also added to the master event table
- All created Miro item IDs (nodes, edges, table rows) are appended to `.scratch/religion-map/miro-items.json`

**B. Reset script**
Write `scripts/reset_miro.py` — reads `.scratch/religion-map/miro-items.json`, deletes all listed Miro items via the Miro API, then clears `miro-items.json` back to `{ "items": [] }`. Leaves all other board content untouched.

## Acceptance criteria

- [ ] After running, ch01 event nodes are visible on the Miro board in the correct era band column and territory lane row
- [ ] First-occurrence nodes have a distinct gold/amber visual treatment
- [ ] Dead-end nodes have a dashed border
- [ ] Connection arrows are visible between nodes where `connections[]` is non-empty, each with the correct label
- [ ] All created item IDs are recorded in `miro-items.json`
- [ ] `python scripts/reset_miro.py` deletes all items in `miro-items.json` from the board and resets the file
- [ ] Running the push script twice does not create duplicate nodes (idempotent via concept_id check against existing items)

## Blocked by

- `.scratch/religion-map/issues/05-chapter-1-analysis.md`
- `.scratch/religion-map/issues/02-miro-board-initialization.md`
