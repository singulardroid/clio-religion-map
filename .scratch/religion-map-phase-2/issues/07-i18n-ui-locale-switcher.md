Status: ready-for-agent

## Parent

.scratch/religion-map-phase-2/PRD.md

## What to build

Full UI internationalization with English default. Locale JSON files for UI chrome (`en`, `ru`). Toolbar language switcher persisted in `localStorage` (`clio-lang`, default `en`). Event cards read `locales[activeLocale]` with strict rules (no fallback across locales). Territory and era display names resolved via stable keys + locale files.

Per-event **Show in other languages** toggle on expanded card reveals secondary locale blocks (e.g. Russian while UI is English).

Deliver end-to-end:
- Switcher changes UI strings and event primary text together
- vitest for locale resolver: incomplete active locale → event excluded from graph

## Acceptance criteria

- [ ] App opens in English UI and English event text when EN fields are complete
- [ ] Switching to Russian shows `locales.ru` for events complete in Russian
- [ ] Events incomplete in active locale are hidden, not backfilled from the other locale
- [ ] Expanded node toggle shows secondary locale without changing global language
- [ ] vitest covers resolver strict behavior

## Blocked by

- `.scratch/religion-map-phase-2/issues/04-strict-en-compile-ci.md`
