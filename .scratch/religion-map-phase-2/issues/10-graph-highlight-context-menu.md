Status: ready-for-agent

## Parent

.scratch/religion-map-phase-2/PRD.md

## What to build

Persistent graph highlighting from the event map. Right-click context menu on a node:
- **Highlight connected** — depth 1–10, upstream and downstream (+ siblings when enabled)
- **Highlight downstream** — depth 1–10
- **Highlight upstream** — depth 1–10
- **Include siblings** (default on)
- **Clear highlight**

Pure function `collectGraphHighlight(rootId, events, { direction: 'down' | 'up' | 'both', maxDepth, includeSiblings })` with vitest coverage. Main canvas dims non-members; highlighted edges emphasized. Right panel shows mode, depth, sibling flag, node count, Clear, and (disabled until highlight exists) entry to compact view.

Selection persists until Clear, Esc, or filter change replaces graph. Last depth in `localStorage`.

## Acceptance criteria

- [ ] vitest: down/up/both depth limits, sibling inclusion, isolated root
- [ ] Menu applies highlight; pan/zoom keeps dimming until Clear
- [ ] Three direction modes produce different node sets on a fixture graph
- [ ] Only currently filtered visible events participate

## Blocked by

None — can start immediately (i18n menu strings may hardcode English initially if #07 not done)
