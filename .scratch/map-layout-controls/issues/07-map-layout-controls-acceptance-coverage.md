Status: ready-for-agent

# Map layout controls acceptance coverage

## Parent

.scratch/map-layout-controls/PRD.md

## What to build

Add browser acceptance coverage for the completed map layout controls so regressions in timeline context, expansion controls, Auto Align behavior, volume provenance, and selected-node alignment are caught end to end.

## Acceptance criteria

- [ ] Playwright verifies timeline offscreen pointers appear only when no tick mark is visible.
- [ ] Playwright verifies Expand All and Collapse All change visible node details.
- [ ] Playwright verifies Auto Align prevents overlap after opening nodes.
- [ ] Playwright verifies volume badges render for cards with volume metadata.
- [ ] Playwright verifies selected Auto Align keeps selected nodes inside their territory lanes.
- [ ] The full E2E suite passes with the new coverage.
- [ ] Typecheck and unit tests pass alongside E2E coverage.

## Blocked by

- .scratch/map-layout-controls/issues/01-timeline-offscreen-ruler-pointers.md
- .scratch/map-layout-controls/issues/02-global-expansion-controls.md
- .scratch/map-layout-controls/issues/03-volume-provenance-styling.md
- .scratch/map-layout-controls/issues/04-expansion-safe-auto-align.md
- .scratch/map-layout-controls/issues/05-deterministic-edge-crossing-reduction.md
- .scratch/map-layout-controls/issues/06-multi-select-temporary-auto-align.md
