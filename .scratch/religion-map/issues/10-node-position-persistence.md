Status: ready-for-agent

## Parent

.scratch/religion-map/PRD.md

## What to build

Persist node drag positions across page reloads using `localStorage`.

When a user drags a node to a new position, save its position to `localStorage` under the key `clio-node-positions`, keyed by `concept_id`. On page load, override the computed `timeToX` / `territoryToY` default position with the saved position if one exists.

Provide a "Reset layout" button (or keyboard shortcut) that clears the `localStorage` entry and re-applies the default computed positions for all nodes.

## Acceptance criteria

- [ ] Dragging a node and reloading the page shows the node at the dragged position, not the default computed position
- [ ] Nodes without a saved position use the default computed position
- [ ] The reset mechanism restores all nodes to their default computed positions
- [ ] Position data is stored under a stable `localStorage` key (`clio-node-positions`)
- [ ] Adding a new chapter (new nodes) does not break or clear saved positions for existing nodes

## Blocked by

- `.scratch/religion-map/issues/08-eventnode-design.md`
