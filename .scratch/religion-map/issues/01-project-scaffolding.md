Status: ready-for-agent

## Parent

.scratch/religion-map/PRD.md

## What to build

Set up the full project directory structure so all subsequent work has a consistent home. This includes dependency manifests, git ignore rules, a workspace copy of the plan, and all empty directories that later scripts and the SPA expect to exist.

Specifically:
- `requirements.txt` with `lxml` and `requests`
- `.gitignore` ignoring `data/`, `app/node_modules/`, `app/src/data/events.json`
- `PLAN.md` at the workspace root — a copy of the full plan including all grilling decisions
- Empty directories: `scripts/`, `data/vol1/chapters/`, `app/`, `.scratch/religion-map/issues/`, `.scratch/religion-map/vol1/`
- Initialize `.scratch/religion-map/concept-registry.json` with an empty `{ "concepts": {} }` structure
- Initialize `.scratch/religion-map/miro-items.json` with an empty `{ "items": [] }` structure

## Acceptance criteria

- [ ] `requirements.txt` exists and lists `lxml` and `requests`
- [ ] `.gitignore` ignores generated data directories and node_modules
- [ ] `PLAN.md` exists at the workspace root with the full plan content
- [ ] All expected directories exist
- [ ] `concept-registry.json` exists and is valid JSON with an empty `concepts` object
- [ ] `miro-items.json` exists and is valid JSON with an empty `items` array

## Blocked by

None — can start immediately
