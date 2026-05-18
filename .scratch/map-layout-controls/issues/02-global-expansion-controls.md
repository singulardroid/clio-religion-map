Status: ready-for-agent

# Global expansion controls and centralized expansion state

## Parent

.scratch/map-layout-controls/PRD.md

## What to build

Move card expansion state out of individual node cards and into the map canvas, then add Expand All and Collapse All toolbar actions. Individual clicks should still expand/collapse a card, but expansion state should remain session-only and should not trigger automatic reflow.

## Acceptance criteria

- [ ] Individual card clicks still toggle that card's expanded details.
- [ ] Expand All expands all currently visible nodes.
- [ ] Collapse All collapses all currently visible nodes.
- [ ] Expansion state is not persisted to localStorage or exported as editorial overlay data.
- [ ] Expanding/collapsing a single card does not automatically re-layout the map.
- [ ] Existing card links, comments, issue controls, and graph highlight context actions still work.
- [ ] Playwright coverage verifies Expand All and Collapse All through the toolbar.

## Blocked by

None - can start immediately
