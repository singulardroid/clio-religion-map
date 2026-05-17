Status: ready-for-agent

## Parent

.scratch/religion-map/PRD.md

## What to build

Scaffold the `app/` single-page application with Vite + React + React Flow. At this stage the app renders the structural chrome of the map — era bands and territory lanes — using hardcoded fixture data. No real event nodes are wired in yet; that comes in issue #07.

Deliver:
- `app/package.json` with dependencies: `react`, `react-dom`, `reactflow`, dev deps: `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`
- `app/src/App.tsx` — root component, sets up `<ReactFlow>` with a blank canvas
- `app/src/layout.ts` — exports two pure functions:
  - `timeToX(yearFrom: number, yearTo: number): number` — maps a year (negative = BCE) to a canvas X coordinate
  - `territoryToY(territory: string): number` — maps a territory name to a canvas Y coordinate; unknown territories fall back to a default zone
- `app/src/components/EraBand.tsx` — renders a colored background rectangle for one era, positioned using `timeToX()`
- `app/src/components/TerritoryLane.tsx` — renders a left-edge label for one territory row, positioned using `territoryToY()`
- `app/src/config.ts` — exports `ERAS` array (name, yearFrom, yearTo, color) and `TERRITORIES` array (name, order) matching the board layout from issue #02

The app must be runnable with `npm run dev` from the `app/` directory and show the era bands and territory labels on a blank canvas.

## Acceptance criteria

- [ ] `npm run dev` starts the SPA without errors
- [ ] Era bands are rendered as colored background panels in correct chronological order left to right
- [ ] Territory lane labels are visible on the left edge in correct top-to-bottom order
- [ ] `timeToX()` has unit tests covering: a deep BCE year, year 0, a CE year, and a year exactly on an era boundary
- [ ] `territoryToY()` has unit tests covering: all nine known territories and one unknown territory (should return fallback Y)

## Blocked by

None — can start immediately
