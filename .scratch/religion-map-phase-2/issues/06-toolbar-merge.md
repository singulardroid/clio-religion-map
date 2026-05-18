Status: ready-for-agent

## Parent

.scratch/religion-map-phase-2/PRD.md

## What to build

Relocate the filter panel from the top-left into a single top-right toolbar cluster alongside existing layout actions (fit view / auto-layout). Preserve filter behavior: volume, territory, first-occurrence-only. Shorten or collapse helper text (e.g. `?` tooltip) so the map gains canvas space.

Deliver end-to-end:
- Extracted toolbar component
- Filters and buttons reachable in one top-right area
- Playwright/E2E selectors updated if needed; filter `data-testid` preserved or documented

## Acceptance criteria

- [ ] No filter UI remains fixed top-left
- [ ] Volume, region, and first-only filters work identically to before
- [ ] Layout action buttons remain in the same toolbar cluster
- [ ] E2E or manual checklist: filters still narrow visible nodes correctly

## Blocked by

None — can start immediately
