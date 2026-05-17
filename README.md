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
- Source FB2 books in `inputs/` are not committed (see [`.gitignore`](.gitignore)).

Agent and domain notes: [AGENTS.md](AGENTS.md), [docs/agents/](docs/agents/).

## Tests

```bash
cd app && npm test -- --run
pytest tests/
```

## License

Private / research use unless otherwise noted.
