Status: ready-for-agent

## Parent

.scratch/religion-map/PRD.md

## What to build

Implement the custom `InfluenceEdge` React Flow edge component for connections between event nodes.

Each edge represents an explicit Eliade-stated ideational influence. The edge should:
- Render as an animated dotted line (CSS `stroke-dasharray` with a flow animation)
- Display a center label containing the `label` text from `connections[].label` (the specific concept transferred)
- Be non-interactive (not selectable or deletable by the user — these edges are data-driven)

Wire the custom edge type into `App.tsx` so all connections from `events.json` use `InfluenceEdge`.

## Acceptance criteria

- [ ] Edges between connected nodes render as animated dotted lines
- [ ] Each edge displays its `label` text centered on the edge path
- [ ] Labels are readable at the default zoom level
- [ ] Edges render correctly when source and target nodes are in different territory lanes (cross-lane edges)
- [ ] The component renders without errors when `label` is an empty string

## Blocked by

- `.scratch/religion-map/issues/07-event-compiler-spa-data.md`
