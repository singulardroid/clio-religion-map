# Issue #14: Location Markers and Map Links

## Status
`ready-for-agent`

## Summary
The user requested a prominent marking of the territory on each card so that if a card is dragged around the board, its geographic origin is unmistakably clear. Furthermore, the user wants exact geographic mapping (via Google Maps and the Seshat DB) available when clicking the card.

## User story
> As a researcher, when I drag an event node around the canvas, I want its territory and precise location permanently visible on the card so I never forget where it belongs. Furthermore, when I expand the node, I want to click links to explore that exact location on a real map (Google Maps) and in the Seshat Databank.

## Acceptance criteria
- [x] Schema updated: `precise_location` added to `types.ts`, `PLAN.md`, and `PRD.md`.
- [x] Event extraction rules updated to capture specific cities or archaeological sites into `precise_location` if mentioned.
- [x] Node Component updated: `app/src/components/EventNode.tsx` has a fixed header bar at the top displaying `{territory} — {precise_location}`.
- [x] Node Component updated: expanded view includes a "Локация" section with a Google Maps search link and a Seshat DB link.
- [ ] Existing events backfilled: A script parses all current `chXX-events.json` files and uses an LLM to populate `precise_location` for events that specify them in their Russian quotes.

## Dependencies
- Blocks: None
- Depends on: None (Applies retroactively to extracted events and proactively to future extractions).

## Files changed
- `app/src/types.ts`
- `PLAN.md`
- `PRD.md`
- `app/src/components/EventNode.tsx`
- `.scratch/religion-map/issues/14-location-markers.md`
