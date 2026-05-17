Status: ready-for-agent

## Parent

.scratch/religion-map/PRD.md

## What to build

Write `scripts/enrich_from_seshat.py` — a Python script that queries the Seshat Global History Databank REST API (`https://seshat-db.com/api/`) to resolve stub fields in all event JSON files into authoritative identifiers.

For each event where `seshat.enriched == false`:
1. **NGA lookup** — `GET /api/core/ngas/` filtered by name; store `nga_id` if a match is found
2. **Polity lookup** — `GET /api/core/nga-polity-relations/` filtered by `nga_id`; find the polity whose duration overlaps `[year_from, year_to]`; store `polity_id` and `polity_name`
3. **Religion lookup** — `GET /api/core/religions/` filtered by name; store `religion_id` if a match is found
4. Set `seshat.enriched = true` and write the updated event JSON back to disk

The script must be idempotent: re-running it skips events already marked `enriched: true`. All API calls use plain `requests` with no authentication (Seshat public API). Network errors and 404s are logged as warnings, not crashes — the event is left with `enriched: false` and retried on the next run.

Also update `scripts/compile_events.py` to include the enriched Seshat fields in the compiled `events.json` so the SPA can display polity names and IDs.

## Acceptance criteria

- [ ] `python scripts/enrich_from_seshat.py` runs without crashing on network errors or unmatched entities
- [ ] Events with a clear NGA match (e.g., "Месопотамия" → Mesopotamia NGA) have `nga_id` populated
- [ ] Events with a clear polity overlap have `polity_id` and `polity_name` populated
- [ ] All successfully enriched events have `seshat.enriched: true`
- [ ] Re-running the script does not overwrite already-enriched events
- [ ] A pytest test with mocked HTTP responses asserts that NGA, polity, and religion IDs are correctly written back, and that already-enriched events are skipped
- [ ] The SPA `EventNode` detail panel shows polity name when available (replacing the previous "—" placeholder)

## Blocked by

- `.scratch/religion-map/issues/11-full-vol1-analysis.md`
