Status: ready-for-agent

# Map Layout Controls PRD

## Problem Statement

Researchers use the religion map as a spatial timeline: time runs horizontally, cultural regions run vertically, and directed influence arrows explain relationships between concepts. At some zoom/pan positions, the horizontal ruler can lose all visible marks, leaving the researcher unsure which timeframe they are browsing. Dense or expanded nodes can overlap, and the current auto-alignment does not account for expanded card height or arrow readability. The map also lacks global expand/collapse controls, visible volume provenance on cards, and an efficient way to select and temporarily align a group of nodes without moving them out of their geography lane.

## Solution

Add timeline context pointers, global expansion controls, expansion-safe auto-alignment, volume badges, and selected-node alignment controls. The result should preserve the core map contract: chronology remains the primary horizontal anchor, territory lanes remain stable vertical geography, and manual dragging remains the persistent way to edit positions. Auto Align should create enough vertical space that any visible node can be opened without overlapping neighbors, while selected-node Auto Align should be temporary and constrained within each node's existing territory lane.

## User Stories

1. As a researcher, I want the bottom timeline ruler to show nearby offscreen marks when no marks are visible, so that I can understand the timeframe I am browsing.
2. As a researcher, I want the nearest left offscreen ruler mark to appear at the left side of the ruler, so that I know the earlier boundary of my current timeframe.
3. As a researcher, I want the nearest right offscreen ruler mark to appear at the right side of the ruler, so that I know the later boundary of my current timeframe.
4. As a researcher, I want normal visible timeline ticks to behave as they do now, so that zoomed-out overview mode stays uncluttered.
5. As a researcher, I want floating timeline pointers to use ruler ticks rather than event dates, so that they describe the scale rather than data density.
6. As a researcher, I want an Expand All button, so that I can inspect all quotes, references, locations, and source metadata at once.
7. As a researcher, I want a Collapse All button, so that I can quickly return to compact cards.
8. As a researcher, I want individual card expansion to stay session-only, so that reloading the map does not unexpectedly reopen a huge view.
9. As a researcher, I want single-card expansion to avoid automatic reflow, so that clicking a card does not move the map under me.
10. As a researcher, I want Auto Align to be the explicit operation that reorganizes node positions, so that layout changes are intentional.
11. As a researcher, I want Auto Align to account for fully expanded cards, so that opening nodes after alignment does not create overlaps.
12. As a researcher, I want Auto Align to reserve expanded space for every visible node, so that I can safely open any card after alignment.
13. As a researcher, I want Auto Align to keep nodes inside their territory lanes, so that geography remains trustworthy.
14. As a researcher, I want Auto Align to preserve chronological placement as the main horizontal anchor, so that the map continues to read as a timeline.
15. As a researcher, I want Auto Align to reduce arrow intersections where practical, so that influence relationships are easier to follow.
16. As a researcher, I want arrow-intersection reduction to be deterministic, so that repeated Auto Align actions do not produce surprising random layouts.
17. As a researcher, I want the map to avoid a heavy new layout engine unless needed, so that existing timeline/geography behavior remains stable.
18. As a researcher, I want each node to show a subtle volume badge, so that I can see whether a concept came from volume I, II, or III.
19. As a researcher, I want volume styling to be secondary to territory, period, issue, and first-occurrence signals, so that provenance does not dominate the card.
20. As a researcher, I want volume differentiation to use subtle tinting, so that the map remains readable while still conveying provenance.
21. As a researcher, I want to select multiple nodes, so that I can work with clusters of related concepts.
22. As a researcher, I want selected nodes to move together when dragged, so that I can reposition local clusters efficiently.
23. As a researcher, I want manual group dragging to persist like existing manual node dragging, so that intentional layout edits survive refresh/export.
24. As a researcher, I want to right-click selected nodes and choose Auto-align selected, so that I can quickly tidy a local cluster.
25. As a researcher, I want selected-node Auto Align to be temporary, so that exploratory cleanup does not alter persisted editorial positions.
26. As a researcher, I want selected-node Auto Align to keep every node in its existing geography lane, so that auto-layout never silently changes geography.
27. As a researcher, I want selected-node Auto Align to handle multi-territory selections by aligning each lane group independently, so that mixed selections are useful without breaking lane boundaries.
28. As a researcher, I want the selected-node context menu to retain existing highlight actions, so that graph exploration is not regressed.
29. As a maintainer, I want expansion state to live above individual node cards, so that toolbar actions and layout calculations share a single source of truth.
30. As a maintainer, I want timeline pointer logic to be testable without rendering the full map, so that ruler behavior can be verified reliably.
31. As a maintainer, I want layout sizing and row assignment to be testable in isolation, so that overlap prevention does not depend only on browser tests.
32. As a maintainer, I want Playwright acceptance tests for the new controls, so that browser-visible map behavior stays covered.

## Implementation Decisions

- Move node expansion state out of each card and into the map canvas state. Node data should carry whether the card is expanded and a callback for toggling it.
- Expand All and Collapse All are toolbar actions. They affect only the current session and current visible event set.
- Individual expansion does not trigger automatic reflow. Auto Align is the explicit operation that recalculates positions.
- Auto Align reserves expanded-height space for every visible node, even if the node is currently collapsed.
- Layout remains lane-preserving. Nodes should not be assigned to another territory by automatic operations.
- Chronological position remains the primary horizontal anchor. Layout may adjust stack rows and vertical placement to prevent overlaps and reduce edge crossings.
- Edge crossing reduction should start as a deterministic heuristic inside the existing layout module. No graph-layout dependency should be introduced in the first implementation pass.
- Selected-node Auto Align is temporary and should not write to persisted node positions or exported editorial overlays.
- Manual node dragging and group dragging remain persistent layout edits.
- Multi-territory selected-node Auto Align aligns each territory group independently inside its own lane.
- Timeline floating pointers use nearest offscreen ruler tick marks, not nearest event dates.
- Volume provenance should be rendered as a small volume badge plus subtle tint. It should remain visually secondary to first-occurrence, issue, territory, and period signals.
- The most important deep modules are: ruler tick/pointer calculation, expansion-aware lane packing, and selected-node lane-constrained distribution.

## Testing Decisions

- Good tests should assert observable behavior: labels appear or disappear on the ruler, toolbar controls expand/collapse cards, Auto Align prevents overlaps after expansion, volume provenance is visible, and selected-node alignment respects lane bounds.
- Add unit tests for timeline pointer calculation so the nearest-left and nearest-right ruler ticks are deterministic.
- Add unit tests for expansion-aware lane packing and lane-constrained selected distribution.
- Extend existing Playwright acceptance tests to cover the full browser path through the map toolbar, card expansion, timeline ruler, and selected-node context menu.
- Use existing Playwright map tests as prior art for test IDs, viewport fitting, card expansion checks, and toolbar controls.

## Out of Scope

- Persisting expanded/collapsed state across refreshes.
- Persisting selected-node Auto Align results.
- Replacing the existing map with a full force-directed or external graph-layout engine.
- Automatically changing a node's geography lane.
- Using event dates as the timeline pointer source.
- Redesigning the entire node card visual language.
- Fixing factual data quality, Seshat enrichment, or chronology errors unrelated to layout behavior.

## Further Notes

The plan was stress-tested with the `grill-me` skill. The key resolved tradeoff is that Auto Align should favor an expansion-safe, potentially taller map over a denser layout that overlaps after users open cards.
