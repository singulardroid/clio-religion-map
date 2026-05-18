Status: ready-for-agent

## Parent

.scratch/religion-map-phase-2/PRD.md

## What to build

**Make compact view** for the active highlight: full-screen modal rendering only the highlighted subgraph as a layered left-to-right flow (Sankey-inspired). **Root in the center column**; upstream layers to the left; downstream to the right; unused side collapses for one-direction highlights. `fitView` on mount to fit one viewport. Read-only layout; click node for same detail content as main map. **Back to map** / Esc closes modal without clearing highlight on the main canvas.

Deliver end-to-end:
- Layout module assigning layer indices from highlight state
- Modal UI wired from right panel button (enabled only when highlight active)
- vitest on layer assignment (root center, upstream negative, downstream positive)

## Acceptance criteria

- [ ] With 10+ highlighted nodes, compact view fits on one screen without manual pan
- [ ] Root node appears in center column for “connected” highlight
- [ ] Exiting compact view preserves highlight on main map
- [ ] Node click in compact view shows event detail (English strict rules apply)
- [ ] vitest covers layer assignment for up-only, down-only, and both

## Blocked by

- `.scratch/religion-map-phase-2/issues/10-graph-highlight-context-menu.md`
