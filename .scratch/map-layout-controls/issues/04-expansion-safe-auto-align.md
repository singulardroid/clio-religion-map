Status: ready-for-agent

# Expansion-safe Auto Align

## Parent

.scratch/map-layout-controls/PRD.md

## What to build

Make Auto Align compute positions with enough vertical space for every visible node to be expanded later without overlapping its neighbors. Layout must preserve geography lanes and keep chronological position as the primary horizontal anchor.

## Acceptance criteria

- [ ] Auto Align reserves expanded-height space for every currently visible node, even if nodes are collapsed.
- [ ] After Auto Align, expanding any visible node does not overlap another node in the same territory lane.
- [ ] Auto Align keeps each node in its original territory lane.
- [ ] Auto Align preserves chronological horizontal placement as the main anchor.
- [ ] Existing manual drag persistence remains unchanged.
- [ ] Unit coverage verifies expansion-aware row assignment.
- [ ] Playwright coverage verifies no overlap after Auto Align and expansion.

## Blocked by

- .scratch/map-layout-controls/issues/02-global-expansion-controls.md
