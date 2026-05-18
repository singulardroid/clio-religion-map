Status: ready-for-agent

# Timeline offscreen ruler pointers

## Parent

.scratch/map-layout-controls/PRD.md

## What to build

When the bottom timeline ruler has no visible tick marks in the current viewport, show floating left and right pointers for the nearest offscreen ruler ticks. The pointers should describe the timeline scale, not nearby event density, and normal visible tick behavior should remain unchanged when marks are visible.

## Acceptance criteria

- [ ] When no ruler tick labels are visible, the left side of the ruler shows the nearest earlier offscreen tick.
- [ ] When no ruler tick labels are visible, the right side of the ruler shows the nearest later offscreen tick.
- [ ] When one or more ruler tick labels are visible, floating pointers do not duplicate or clutter the ruler.
- [ ] Pointer labels use the same year formatting as ordinary ruler ticks.
- [ ] Unit coverage verifies nearest-left and nearest-right tick selection.
- [ ] Playwright coverage verifies the no-visible-tick pointer behavior in the browser.

## Blocked by

None - can start immediately
