# Clio — Religion Map

Interactive timeline map of religious ideas from Mircea Eliade's *History of Religious Ideas*, built with React and React Flow. Events are placed on territory lanes and era bands; you can pan, zoom, expand nodes, and drag cards to rearrange the layout.

## Live site

**https://singulardroid.github.io/clio-religion-map/**

Every push to `main` rebuilds the app and redeploys to this URL via GitHub Actions.

If Pages is not enabled yet: open the repository on GitHub → **Settings** → **Pages** → **Build and deployment** → set **Source** to **GitHub Actions**, then re-run the **Deploy GitHub Pages** workflow or push to `main`.

## Local development

From the repository root:

```bash
# 1. Generate app/src/data/events.json from chapter files (required before build)
python3 scripts/compile_events.py
# If your shell is already in app/: npm run compile:events

# 2. Install and run the SPA
cd app
npm ci
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

Production build locally:

```bash
python3 scripts/compile_events.py
cd app && npm ci && npm run build && npm run preview
```

## Data pipeline

- Chapter event JSON lives under [`.scratch/religion-map/`](.scratch/religion-map/) (`vol*/ch*-events.json`).
- [`scripts/compile_events.py`](scripts/compile_events.py) merges chapters into [`app/src/data/events.json`](app/src/data/events.json) (gitignored; generated in CI and locally).
- Optional: [`scripts/enrich_from_seshat.py`](scripts/enrich_from_seshat.py) for Seshat API enrichment.
- Source books in `inputs/` are not committed (see [`.gitignore`](.gitignore)).

### Source-grounded research workflow

The source-grounded knowledge graph starts from the official English Eliade EPUBs, then layers Russian evidence from the official Russian FB2/EPUB files after English assertions and relations are verified.

```bash
# Verify private source inventory without generating caches
python3 scripts/parse_epub.py --inputs inputs --inventory

# Generate English legacy fulltext plus multilingual source caches
python3 scripts/parse_epub.py --inputs inputs \
  --out-dir data/en-epub \
  --source-cache-dir data/source-cache \
  --inventory-out data/source-cache/inventory.json
```

The cache files under `data/source-cache/{en,ru}/` include source hashes, volume metadata, full normalized text, and section offsets for later quote/provenance checks. English remains the canonical extraction source; Russian fields should only be populated from matched Russian source passages.

Generate candidate English idea assertions and a first relation-taxonomy review artifact:

```bash
python3 scripts/extract_idea_graph.py \
  --source-cache-dir data/source-cache \
  --out data/source-kg/idea-graph-candidates.json

python3 scripts/normalize_relation_taxonomy.py \
  --graph data/source-kg/idea-graph-candidates.json \
  --out data/source-kg/idea-graph-taxonomy.json
```

These outputs are review artifacts, not final app data. The extractor keeps raw verb phrases and exact English quote provenance; the taxonomy pass collapses observed verb synonyms into compact candidate relation types while preserving the raw evidence.

Agent and domain notes: [AGENTS.md](AGENTS.md), [docs/agents/](docs/agents/).

## Editorial workflow (end-to-end)

Curation and issue review use git-backed overlays. The published site is **read-only** for editorial data (no write API or tokens on GitHub Pages).

1. **Curate locally** — Run `npm run dev`, tag issues, add comments, drag nodes; save to [`data/editorial/event-overlays.json`](data/editorial/event-overlays.json) and commit.
2. **Export for agent** — `python3 scripts/export_issues_for_review.py` → `issues-review.json` with every open issue plus EN/RU text, refs, and paths into `inputs/`.
3. **Agent run** — Feed that bundle to a Cursor agent (or similar); it checks sources and proposes fixes (nothing auto-merged).
4. **You merge** — Update chapter JSON / overlay, mark issues resolved, commit.
5. **Deploy** — CI compiles and publishes; the live site shows overlays but stays read-only for editorial data.

## Tests

Run these from **`clio-religion-map`** (repository root). If you already `cd app`, omit the `cd app` line and compile with **`npm run compile:events`** instead of Python from the wrong directory.

```bash
# Repo root — merge chapter JSON → app bundle (requires strict EN completeness)
python3 scripts/compile_events.py --strict-en

cd app && npm ci
npm test -- --run
npm run test:e2e

# Already inside app/ and need to rebuild data?
npm run compile:events

# Python smoke tests — from app/ folder:
npm run test:pytest
# or from repo root: pytest tests/

# If browsers are missing/corrupted: npm run test:e2e:install (or rely on npm ci postinstall + pretest:e2e)
```

Phase 2 browser tests live in [`app/e2e/phase2-acceptance.spec.ts`](app/e2e/phase2-acceptance.spec.ts). The `chromium-prod` project builds with `VITE_EDITORIAL_READONLY=true` and asserts read-only editorial UI (`@prod` tests).

CI runs [`.github/workflows/test.yml`](.github/workflows/test.yml) on pull requests and `main`; GitHub Pages deploy waits for that job to pass.

## License

Private / research use unless otherwise noted.
