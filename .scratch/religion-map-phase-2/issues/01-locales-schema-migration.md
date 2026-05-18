Status: ready-for-agent

## Parent

.scratch/religion-map-phase-2/PRD.md

## What to build

Migrate all chapter event records from flat Russian strings to the multilingual `locales` shape: stable top-level fields (`concept_id`, territory key, chronology, flags, connections) plus `locales.ru` and empty `locales.en` objects for localizable text. Connection labels become `{ en, ru }` objects (Russian text copied into `ru`; `en` may be empty until alignment).

Deliver end-to-end:
- One-off migration script runnable on all `vol*/ch*-events.json` files
- TypeScript types updated so the SPA and compiler understand `locales`
- Event compiler emits a valid bundle; SPA continues to render events using `locales.ru` (same visible behavior as today for Russian text)
- pytest on migration fixture; compile smoke test passes

```json
{
  "concept_id": "example-id",
  "territory": "europe",
  "locales": {
    "en": {},
    "ru": { "statement": "...", "quote": "...", "period": "...", "source_ref": "..." }
  }
}
```

## Acceptance criteria

- [ ] Migration script converts a legacy chapter fixture to valid `locales` records without data loss in Russian fields
- [ ] All committed chapter files in `.scratch/religion-map/` are migrated
- [ ] `compile_events.py` produces `events.json` the SPA can load
- [ ] SPA displays event cards using `locales.ru` content (behavior unchanged for researchers until English is filled)
- [ ] pytest covers migrator; existing or new compile test passes

## Blocked by

None — can start immediately
