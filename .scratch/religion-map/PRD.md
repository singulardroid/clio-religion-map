Status: ready-for-agent

# PRD: Clio Religion Map

## Problem Statement

A researcher studying the history of religion wants to understand how religious ideas originated, evolved, and transformed across different geographies and time periods — from prehistoric shamanism tens of thousands of years ago through to the Reformation. The primary source material is Mircea Eliade's three-volume "A History of Religious Ideas" (in Russian). This work contains a dense, non-linear account of religious history spanning dozens of civilizations and thousands of years.

There is currently no visual artifact that makes this evolution legible at a glance. Reading the books produces knowledge but not a map. The researcher needs a navigable, zoomable diagram that shows what appeared where and when, what influenced what, and which ideas were dead ends versus seeds of something larger.

## Solution

Build an automated pipeline that reads Eliade's three volumes chapter by chapter, extracts structured religious events (each with a time period, geographic territory, main statement, and source quote), maintains a cross-volume registry of concepts seen so far, and renders all extracted events as an interactive 2D map. The map uses time as the horizontal axis (oldest left, newest right) and cultural-geographic region as the vertical axis. Connections between nodes show explicitly stated ideational influence, labeled with the concept that was transferred.

The primary visualization is a single-page React application with draggable nodes. A Miro board is used for quick dirty validation of layout logic before the SPA is built out. A Seshat Global History Databank compatibility layer is baked into every extracted event so that geography and time period can later be resolved to authoritative polity and NGA identifiers from the Seshat API.

## User Stories

1. As a researcher, I want each chapter of Eliade's books parsed automatically so that I do not have to manually copy and paste text.
2. As a researcher, I want every important religious concept, ritual, or belief extracted from each chapter as a structured event so that nothing significant is missed.
3. As a researcher, I want events that appear for the first time in the reading sequence flagged as first occurrences, whether Eliade states it explicitly or the concept simply has not been seen before, so that I can track the origins of ideas.
4. As a researcher, I want explicit ideational transformations ("A becomes B", "tradition X inherits concept Y from Z") captured as directed connections between events so that the flow of religious thought is visible.
5. As a researcher, I want dead-end ideas — concepts that originated but never flowed into later traditions — still represented on the map so that the full picture is shown, not just surviving lineages.
6. As a researcher, I want each event node to display its time period, religion or tradition, and a main statement on its surface so that I can read the map without clicking into every node.
7. As a researcher, I want clicking a node to reveal the original Russian quote from Eliade, the volume/chapter/section reference, and the full bibliographic details of any external sources cited in that passage (with original reference numbers from the book) so that I can verify any claim in both the source text and the primary literature Eliade relied on.
8. As a researcher, I want a gold or amber visual accent on first-occurrence nodes and a dashed border on dead-end nodes so that I can distinguish these categories at a glance.
9. As a researcher, I want the map organized with cultural-region swimlanes on the vertical axis (Mesopotamia, Egypt, Iran/Persia, India, Greece, Israel/Canaan, Rome, Arabia, etc.) so that geographic patterns are immediately visible.
10. As a researcher, I want era bands as colored background panels on the horizontal axis (Палеолит, Неолит, Ранняя бронза, Поздняя бронза, Осевое время, Эллинистический период) so that temporal patterns are immediately visible without reading individual dates.
11. As a researcher, I want each connection arrow labeled with a short description of the specific concept transferred so that I can understand not just that influence happened but what was actually borrowed.
12. As a researcher, I want nodes to be draggable and have their positions persist across page reloads so that I can arrange the map to my preferred layout without it resetting.
13. As a researcher, I want a concept registry that spans all three volumes so that a concept introduced in Volume 1 is never re-flagged as a first occurrence in Volume 2 or 3.
14. As a researcher, I want each extracted event to contain Seshat-compatible stub fields (NGA name, integer year range, mapping confidence) so that the data can later be enriched with authoritative Seshat polity and religion identifiers.
15. As a researcher, I want a separate enrichment script that queries the Seshat API and resolves stub fields to actual NGA, polity, and religion IDs so that the dataset becomes interoperable with the Seshat Global History Databank.
16. As a researcher, I want a Miro board to be populated with events after each chapter as a quick validation step so that layout problems are caught early before investing in the full SPA.
17. As a researcher, I want all Miro items created by the pipeline tracked in a local file so that I can roll back and re-publish from scratch without destroying anything else on the board.
18. As a researcher, I want the SPA to compile its data from a single aggregated JSON file that is regenerated after each chapter so that I can watch the map grow incrementally.
19. As a researcher, I want all text — statements, quotes, territory names — to remain in Russian so that the output is faithful to the source language.
20. As a researcher, I want each node to display its Seshat NGA name even before full enrichment so that geographic alignment with Seshat is visible during review.

## Implementation Decisions

### Modules

**1. FB2 Parser**
Parses the `.fb2` XML format and extracts chapters as plain-text files. Each chapter is written to a numbered text file. Outputs a chapter index showing number, title, and word count for review. Dependency: `lxml`.

Also extracts the `<body name="notes">` bibliography section and writes it to `data/vol{N}/chapters/refs.json` as a flat mapping of reference id to full bibliographic text (e.g. `{"n_12": "Lévy-Bruhl L. ..."}` ). This file is shared across all chapters in the same volume.

**2. Chapter Analyzer (agent loop)**
For each chapter text file, the agent reads the chapter, reads the current concept registry, extracts all qualifying events, and writes a per-chapter event JSON file. After writing, it updates the concept registry. Then it immediately triggers Miro publishing and event compilation.

Extraction rules:
- An event qualifies if it has a named time period AND a named territory.
- Explicit firsts: Eliade uses language like "впервые", "зарождается", "возникает", or describes a transformation ("A превращается в B").
- Implicit firsts: the concept key is absent from the concept registry at the time of reading.
- If the text mentions a specific archaeological site, city, or precise region (e.g., 'Чжоу-Коу-Тянь', 'Чатал-Хююк'), extract it to `precise_location`. Otherwise, omit the field.
- For each event, identify `[N]` reference markers that appear in the cited passage. Look up the matching entries in `data/vol{N}/chapters/refs.json` and populate the event's `references` array with `{num: N, text: "full bibliographic text"}`. Reference numbers are kept identical to the book's original numbering.
- Dead-end nodes: included and flagged; no outgoing connections.
- All text stays in Russian.

**3. Concept Registry**
A single JSON file persisting across all three volumes. Keyed by `concept_id` (a stable slug). Updated after each chapter. Used at extraction time to determine implicit first occurrences. Never reset between volumes.

**4. Event JSON Schema**
The grilling session produced the following canonical schema (trimmed to decision-rich parts):

```json
{
  "concept_id": "burial-ritual-paleolithic",
  "period": "40 000–10 000 до н.э.",
  "era": "Палеолит",
  "territory": "Европа",
  "precise_location": "Чатал-Хююк",
  "religion": "Доисторические верования",
  "statement": "...",
  "is_first_occurrence": true,
  "first_occurrence_type": "explicit | implicit",
  "quote": "«оригинальная цитата из Элиаде...»",
  "source_ref": "Том 1, Глава 1, §3",
  "is_dead_end": false,
  "connections": [
    { "target_concept_id": "...", "label": "..." }
  ],
  "references": [
    { "num": 12, "text": "Lévy-Bruhl L. La Mythologie primitive. Paris, 1935." }
  ],
  "seshat": {
    "nga_name": "...",
    "year_from": -40000,
    "year_to": -10000,
    "mapping_confidence": "low | medium | high",
    "nga_id": null,
    "polity_id": null,
    "religion_id": null,
    "enriched": false
  }
}
```

**5. Miro Publisher (validation layer)**
Uses the Miro MCP to create a master event table and era-framed flowchart diagrams on board `uXjVHSThVzc=`. Runs after each chapter. All created item IDs are stored locally for rollback. A reset script deletes only agent-created items, leaving the rest of the board intact.

**6. Event Compiler**
A script that aggregates all per-chapter event JSON files into a single flat JSON consumed by the SPA. Re-run after each chapter.

**7. React Flow SPA (primary visualization)**
Built with Vite + React + React Flow. Reads the compiled events JSON. Renders:
- Era band background panels (horizontal, X-axis)
- Territory lane labels (vertical, Y-axis, left edge)
- Custom `EventNode` components positioned by `timeToX()` / `territoryToY()` pure layout functions
- Custom `InfluenceEdge` components with center labels
- Node positions persist via `localStorage`

Node visual states: default (normal), first-occurrence (gold accent), dead-end (dashed border). Click expands to show: original Russian quote, volume/chapter/section reference, outgoing concept connections, a "Литература" section listing all bibliographic sources cited in the passage with original book reference numbers, and Seshat fields.

**8. Seshat Enricher**
A script that reads all event JSON files, queries the Seshat REST API for each unenriched event, and resolves `nga_id`, `polity_id`, and `religion_id`. Idempotent — skips events already marked `enriched: true`. Uses:
- `GET /api/core/ngas/` — match territory to NGA
- `GET /api/core/nga-polity-relations/` — find polity active in that NGA during that year range
- `GET /api/core/polities/` and `GET /api/general/polity-durations/` — polity details
- `GET /api/core/religions/` — religion master list

## Testing Decisions

Good tests verify observable behavior through public interfaces, not implementation details.

**Modules to test:**
- **FB2 Parser:** given a sample `.fb2` XML fixture, assert that the correct number of chapters is extracted, that chapter titles are preserved, and that text content is non-empty.
- **`timeToX()` layout function:** given a year, assert it returns a pixel X value within the expected era band range. Edge cases: year 0, very large negative years, year at era band boundaries.
- **`territoryToY()` layout function:** given a territory name, assert it returns the correct Y range. Unknown territories should return a default fallback zone.
- **Event compiler:** given a set of chapter JSON fixture files, assert the compiled output is a flat array with the correct total event count and no duplicate `concept_id` entries.
- **Seshat enricher:** given mock HTTP responses (no live API calls in tests), assert that NGA, polity, and religion IDs are correctly written back into the event JSON, and that already-enriched events are skipped.

Prior art for integration-style tests: none yet in this repo (greenfield). Tests should be written with `pytest` for the Python scripts and `vitest` for the SPA.

## Out of Scope

- Volumes 2 and 3 of Eliade (processed using the same pipeline after Volume 1 is validated, but not in this PRD).
- User authentication or multi-user collaboration on the SPA.
- A backend server or database — the SPA is a static app reading a local JSON file.
- Automatic geographic map rendering (the territory lanes are cultural labels, not a cartographic map).
- Automatic layout optimization (node positions are computed by simple linear functions; manual drag-to-adjust covers the rest).
- Editing events directly in the SPA (the source of truth is the JSON files).
- Full Seshat enrichment being complete before the SPA is useful — the SPA works without enrichment, Seshat fields are bonus data.

## Further Notes

- The Miro board is at `https://miro.com/app/board/uXjVHSThVzc=/`.
- The Seshat API base URL is `https://seshat-db.com/api/`.
- The concept registry must never be deleted between volumes; it is the continuity mechanism for the entire three-volume arc.
- Territory lane order (top to bottom) should be roughly geographic north-to-south or chronological-importance order; the default proposed is: Доисторический/Глобальный, Месопотамия, Египет, Иран/Персия, Индия, Греция, Израиль/Ханаан, Рим, Аравия.
- New territory lanes are added dynamically as chapters introduce territories not in the initial list.
