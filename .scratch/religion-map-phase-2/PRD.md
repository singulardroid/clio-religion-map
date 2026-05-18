Status: ready-for-agent

# PRD: Religion Map — Phase 2 (Multilingual, Editorial, Graph Exploration)

## Problem Statement

The religion map SPA is live and useful for navigating Eliade-derived events on a timeline, but it is still essentially a single-locale (Russian) research prototype. Researchers who read Eliade in English cannot use the map as a primary tool. There is no structured way to record curation problems (wrong dates, missing quotes, bad connections), discuss specific events, or share a canonical layout. Exploring influence chains on the full map is tedious: there is no way to highlight upstream/downstream neighborhoods by depth or to see a subgraph on one screen in a flow-diagram form.

The maintainer needs a production-quality data model (English as the original language, Russian as a secondary locale), git-backed editorial metadata, a secure publish workflow, and graph exploration tools—without introducing a backend server on GitHub Pages.

## Solution

Deliver Phase 2 in two milestones. **Milestone 0** migrates all chapter event records to a scalable multilingual schema, ingests verbatim English text from the three English EPUBs in `inputs/` (aligned to existing `concept_id` keys via local agent/scripts), and enforces a strict compile gate so only EN-complete events ship. **Milestone 1** upgrades the SPA: merged top-right toolbar, locale switcher (default English), editorial overlays (comments, issue tags, shared node positions) editable in local dev only and read-only on the published site, persistent graph highlighting with depth and direction controls, and a compact Sankey-style subgraph view that fits one viewport.

Editorial changes persist in a single committed overlay file merged at compile time. Open issues export to a JSON bundle for local Cursor/agent review against FB2/EPUB sources; fixes merge back via git, not auto-apply.

## User Stories

### Multilingual data and publishing

1. As an English-reading researcher, I want the map to open in English by default, so that I can use it without switching languages.
2. As a Russian-reading researcher, I want to switch the UI and event text to Russian, so that I can work in my preferred language.
3. As a maintainer, I want each event stored once with all localizable fields under per-locale blocks (`en`, `ru`), so that adding another language later does not require restructuring the database.
4. As a maintainer, I want English event text sourced from the original English books (EPUB), not machine-translated from Russian, so that quotations stay faithful to Eliade's original wording.
5. As a maintainer, I want a local agent/script pipeline to parse English EPUBs and populate `locales.en` aligned by `concept_id`, so that I do not manually copy hundreds of passages by hand.
6. As a maintainer, I want the compile step to fail if any event lacks required English fields before deploy, so that the public site never shows incomplete English content.
7. As a researcher, I want events with missing text in my active locale hidden—not silently filled from another language—so that I am not misled by fallback content.
8. As a researcher, I want a per-event control to reveal other languages (e.g. Russian) while reading an English card, so that I can compare wording against the Russian extraction.
9. As a maintainer, I want territory and era labels localized via stable keys, so that lane names read correctly in each UI language.

### Editorial overlay and security

10. As a maintainer, I want comments on individual events stored in git, so that notes survive across machines and appear for all visitors after deploy.
11. As a maintainer, I want to tag events with curation issues (missing time, wrong band, wrong connection, etc.), so that problems are traceable and searchable.
12. As a maintainer, I want resolved issues kept in JSON for audit but only open issues highlighted on the map by default, so that I can see what still needs work without losing history.
13. As a maintainer, I want open issues not to block publishing, so that I can ship map improvements while curation continues.
14. As a maintainer, I want to edit comments, tags, and node positions only in local development, so that the attack surface on the public site stays minimal.
15. As a visitor on the published site, I want to see comments, issue badges, and the shared layout, but not edit them, so that the site stays read-only and secure.
16. As a maintainer, I want node positions stored in the editorial overlay (not browser localStorage), so that the curated layout is shared for everyone.
17. As a maintainer, I want to export all open issues to a single JSON bundle with bilingual quotes and paths to source books, so that I can hand the bundle to a Cursor agent for source checking.
18. As a maintainer, I want agent-proposed fixes reviewed and committed manually, so that no LLM change reaches the canonical data without human approval.

### Toolbar and layout UX

19. As a researcher, I want volume, region, and first-occurrence filters in the same top-right toolbar as layout actions, so that the map canvas is not covered by a left panel.
20. As a researcher, I want filter behavior unchanged from today, so that I do not relearn how filtering works.
21. As a researcher, I want brief help text available without a tall instructions column, so that more of the map is visible.

### Graph highlight and compact view

22. As a researcher, I want to right-click an event and highlight connected nodes to a chosen depth, so that I can focus on an ideational neighborhood.
23. As a researcher, I want separate actions to highlight downstream only, upstream only, or both directions, so that I can control the shape of the selection.
24. As a researcher, I want sibling nodes (same parent) included when highlighting, so that parallel branches from the same source are visible together.
25. As a researcher, I want the highlight to persist on the map until I clear it, so that I can pan and zoom without losing context.
26. As a researcher, I want non-highlighted nodes and edges dimmed, so that the subgraph stands out visually.
27. As a researcher, I want a right-side panel showing highlight mode, depth, and count, so that I know what is selected.
28. As a researcher, I want to open a compact flow view of the current highlight that fits on one screen, so that I can see the whole subgraph like a Sankey diagram without panning the main map.
29. As a researcher, I want the compact view to place the root event in the center with upstream left and downstream right, so that influence direction is intuitive.
30. As a researcher, I want returning from compact view to restore the same highlight on the main map, so that I can continue exploration seamlessly.
31. As a researcher, I want to click a node in compact view for the same detail content as on the main map, so that reading quotes does not require switching modes.

### Pipeline and CI

32. As a maintainer, I want chapter JSON and editorial overlay merged at compile time, so that the SPA loads one coherent bundle.
33. As a maintainer, I want CI to run strict English validation before GitHub Pages deploy, so that incomplete data never reaches production.
34. As a maintainer, I want the editorial workflow documented in the README, so that future contributors know how to curate and deploy.

## Implementation Decisions

### Milestone 0 — Data prep (build first)

**Locale migration module**
- One-off migrator wraps legacy flat Russian strings into `locales.ru` on each chapter event; initializes empty `locales.en` objects.
- Stable fields remain top-level: `concept_id`, territory key, volume/chapter metadata, chronology, flags, `connections`, Seshat stubs.
- Localizable fields move under `locales.<code>`: statement, description, quote, period, religion, source_ref, chapter_title, precise_location.
- Connection labels become localized objects `{ en, ru }`.

```json
{
  "concept_id": "fire-domestication-paleolithic",
  "territory": "europe",
  "locales": {
    "en": { "statement": "...", "quote": "...", "period": "...", "source_ref": "..." },
    "ru": { "statement": "...", "quote": "...", "period": "...", "source_ref": "..." }
  },
  "connections": [
    { "target_concept_id": "...", "label": { "en": "influences", "ru": "влияет на" } }
  ]
}
```

**EPUB ingest module**
- Parses the three English EPUBs in `inputs/` (Volumes 1–3) into searchable chapter text (new parser sibling to the existing FB2 parser).
- Does not machine-translate Russian; output is used for alignment and excerpt extraction only.

**English alignment module**
- Joins EPUB excerpts to existing events by `concept_id`, using Russian `quote` / `source_ref` as alignment hints.
- Writes verbatim English into `locales.en`.
- Logs gaps for human review.

**Event compiler (extended)**
- Merges all chapter files plus `data/editorial/event-overlays.json` by `concept_id`.
- Validates multilingual schema.
- `--strict-en` mode: fails if required English fields are missing on any event intended for publish.
- Applies overlay `position` overrides to compiled graph positions.

**Editorial overlay file**
- Single file keyed by `concept_id`: optional `position`, `comments[]`, `issues[]`.
- Comments: id, created_at, optional author, body.
- Issues: tag (enum), optional note, created_at, resolved boolean.

Issue tag enum (initial): `missing_time`, `missing_description`, `wrong_time`, `wrong_band`, `wrong_connection`, `needs_source_check`, `duplicate_concept`.

**Issue export script**
- Reads overlay + merged events; emits `issues-review.json` with open issues, bilingual text, bibliographic refs, volume/chapter, connection ids, and paths to `inputs/` books for agent consumption.

### Milestone 1 — SPA and tools (after Milestone 0 green)

**Map toolbar module**
- Extracts filter controls and existing actions (fit/reset layout) into one top-right cluster.
- Removes top-left filter panel; preserves filter behavior and E2E test ids where possible.

**Internationalization module**
- `LocaleCode = 'en' | 'ru'` (extensible union).
- UI strings in locale JSON files; default `en` in localStorage.
- Event display reads `locales[activeLocale]`; strict mode hides events with incomplete active locale.
- Global language switcher in toolbar; per-event “Show in other languages” toggle on expanded card.
- Production build disables editorial writes; development build enables them.

**Editorial UI module**
- Local dev: add comments, apply/remove issue tags, drag nodes → update in-memory overlay → save/export to overlay file.
- Published site: render badges and comments read-only.

**Graph highlight module (pure, testable)**
- `collectGraphHighlight(rootId, graph, { direction: 'down' | 'up' | 'both', maxDepth, includeSiblings })` returns node id set.
- Context menu: Highlight connected (both), Highlight downstream, Highlight upstream, each with depth 1–10; Include siblings (default on); Clear.
- Persists last depth in localStorage; dim non-members on main React Flow canvas.

**Compact flow view module**
- Opens full-screen modal from active highlight.
- Layered layout: root center column, upstream columns left, downstream columns right.
- Renders subgraph only; `fitView` to one screen; read-only positions; Back to map preserves highlight.
- Implementation may use React Flow compact node types or dagre/SVG ribbons; choice left to implementer.

### Modules to build or modify (summary)

| Module | Role |
|--------|------|
| Locale migrator | RU legacy → `locales` schema |
| EPUB parser | English book text extraction |
| EN aligner | Fill `locales.en` by `concept_id` |
| Event compiler | Merge chapters + overlay; strict EN gate |
| Issue exporter | Agent review bundle |
| Map toolbar | Unified top-right controls |
| i18n layer | UI + event locale resolution |
| Editorial store | Overlay load/save/export |
| Graph highlight | Traversal + UI state |
| Compact flow view | Sankey-style subgraph layout |

## Testing Decisions

Good tests assert observable behavior through public interfaces—compiled output shape, traversal results, locale resolution—not internal React state.

**Modules to test (recommended):**

| Module | Test type | Behavior asserted |
|--------|-----------|-------------------|
| Graph highlight | Vitest (extend `graph.test.ts` pattern) | BFS up/down/both, depth limit, sibling inclusion, empty graph |
| Event compiler | pytest | Merges overlay positions; strict-en fails on missing fields; no duplicate `concept_id` |
| Locale migrator | pytest | Legacy chapter fixture → valid `locales.ru` + empty `locales.en` |
| EN aligner | pytest (fixture EPUB excerpts) | Writes `locales.en` for matched concepts; reports unmatched |
| Locale picker / resolver | Vitest | Active `en` hides incomplete events; `ru` mode strict; no cross-locale fallback |
| Compact layout | Vitest | Layer assignment: root center, upstream negative offset, downstream positive |

**Prior art:** `app/src/graph.test.ts`, `app/src/layout.test.ts`, pytest under `tests/` for Python scripts.

**Playwright (required):** Issue **#12** adds `app/e2e/phase2-acceptance.spec.ts` mapping automated checks to issues **#01–#11**, dual dev/prod Playwright projects, minimal fixtures (no full EPUB in CI), and CI `test.yml` gating deploy. Each feature issue stays red until its describe block is green.

**Not in Playwright:** LLM agent review execution; pixel-perfect Sankey screenshots; full copyrighted EPUB text in CI.

## Out of Scope

- Backend server, database, or authenticated multi-user editing on the published site.
- GitHub API or PAT-based save from the browser.
- Machine translation from Russian to English as a default fill strategy.
- Automatic application of agent-suggested patches without human review (`apply_review_suggestions` deferred to Phase 3).
- Additional locales beyond `en` and `ru` in Phase 2 (schema must support them later).
- Replacing the main timeline map with compact view; compact view is a modal derived from highlight only.
- Blocking publish when open curation issues exist.
- Re-processing Miro validation boards (unchanged from Phase 1).

## Further Notes

- English EPUBs: `A History of Religious Ideas, Volume {1,2,3}` in `inputs/` (gitignored with FB2 sources).
- Phase 1 PRD user story “all text stays in Russian” is superseded for Phase 2: English is canonical; Russian is secondary.
- Implementation order: Milestone 0 (schema, EPUB, align, strict compile, seed overlay) → Milestone 1 items 1–7 as in the locked plan.
- Editorial workflow is documented in the repository README under “Editorial workflow (end-to-end)”.
- Parent project PRD: `.scratch/religion-map/PRD.md` (Phase 1 pipeline and visualization).
