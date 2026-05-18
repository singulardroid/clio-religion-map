Status: ready-for-agent

# Deterministic edge-crossing reduction

## Parent

.scratch/map-layout-controls/PRD.md

## What to build

Improve Auto Align with a deterministic, lane-preserving heuristic that reduces influence-arrow intersections where practical. The heuristic should work inside the existing layout model and should not introduce a full graph-layout dependency in this first pass.

## Acceptance criteria

- [ ] Auto Align remains deterministic for the same visible event set and expansion state.
- [ ] The heuristic keeps every node inside its existing territory lane.
- [ ] Chronological horizontal placement remains the primary anchor.
- [ ] Layout chooses stack rows with edge readability in mind where choices are otherwise equivalent.
- [ ] The implementation does not introduce a new graph-layout library dependency.
- [ ] Unit coverage verifies deterministic layout output for a fixture with crossing-prone edges.

## Blocked by

- .scratch/map-layout-controls/issues/04-expansion-safe-auto-align.md
