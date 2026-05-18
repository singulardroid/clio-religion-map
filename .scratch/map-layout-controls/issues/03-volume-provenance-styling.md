Status: ready-for-agent

# Volume provenance styling

## Parent

.scratch/map-layout-controls/PRD.md

## What to build

Add subtle volume provenance to event cards so researchers can quickly see whether a concept came from volume I, II, or III. The visual treatment should be secondary to territory, period, first-occurrence, and issue signals.

## Acceptance criteria

- [ ] Event cards with volume metadata show a small `Vol I`, `Vol II`, or `Vol III` badge.
- [ ] Cards use a subtle volume tint or accent that does not overpower existing semantic badges.
- [ ] Cards without volume metadata remain readable and do not show misleading provenance.
- [ ] Volume filtering behavior remains unchanged.
- [ ] Playwright or component-level coverage verifies badges for visible volume metadata.

## Blocked by

None - can start immediately
