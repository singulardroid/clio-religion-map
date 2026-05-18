Status: ready-for-agent

## Parent

.scratch/religion-map-phase-2/PRD.md

## What to build

Editorial interactions in local dev only; published build read-only. In development: add comments, apply/remove issue tags (enum taxonomy), drag nodes updating overlay positions, export/download updated `event-overlays.json` for git commit. In production build: show comment counts, open-issue badges, and shared positions; disable all write controls.

Issue lifecycle: `resolved` boolean; open issues drive badges and filter; resolved remain in JSON.

Deliver end-to-end:
- Dev vs prod flag (`import.meta.env.DEV` or explicit `READ_ONLY`)
- Overlay state updates and export path documented in README editorial section

## Acceptance criteria

- [ ] Local dev: add comment and issue tag on an event, export overlay, file contains changes
- [ ] Production build: same overlay visible, no edit controls rendered
- [ ] Open-issue filter in toolbar shows only events with unresolved issues
- [ ] Drag in dev updates `position` in exported overlay
- [ ] Resolved issues do not show open-issue badge

## Blocked by

- `.scratch/religion-map-phase-2/issues/05-editorial-overlay-merge.md`
- `.scratch/religion-map-phase-2/issues/07-i18n-ui-locale-switcher.md`
