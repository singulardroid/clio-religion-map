Status: ready-for-agent

# Multi-select, group drag persistence, and temporary selected Auto Align

## Parent

.scratch/map-layout-controls/PRD.md

## What to build

Support selecting multiple nodes, moving selected nodes together, and right-clicking a selected group to temporarily auto-align the selection. Manual group dragging should persist positions like existing single-node dragging. Selected Auto Align should be temporary and constrained by each node's current territory lane.

## Acceptance criteria

- [ ] Users can select multiple nodes through React Flow selection behavior.
- [ ] Dragging selected nodes moves the selected group together.
- [ ] Manual group drag persists every moved node through the existing position persistence path.
- [ ] Right-clicking a selected node offers an Auto-align selected action without removing existing highlight actions.
- [ ] Auto-align selected distributes selected nodes within their current territory lanes.
- [ ] If selected nodes span multiple territories, each territory group is aligned independently.
- [ ] Auto-align selected does not write persisted positions or editorial overlay positions.
- [ ] Playwright coverage verifies selected-node alignment stays inside lane bounds.

## Blocked by

- .scratch/map-layout-controls/issues/04-expansion-safe-auto-align.md
