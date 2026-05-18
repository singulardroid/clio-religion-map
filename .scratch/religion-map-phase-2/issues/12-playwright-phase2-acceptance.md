Status: ready-for-agent

## Parent

.scratch/religion-map-phase-2/PRD.md

## What to build

Automated acceptance for **all** Phase 2 issues (`01`–`11`) using Playwright, integrated into CI so `main` cannot deploy when E2E fails.

Deliver end-to-end:

- New spec `app/e2e/phase2-acceptance.spec.ts` with one `test.describe` per Phase 2 issue, annotations pointing at `.scratch/religion-map-phase-2/issues/NN-*.md`
- Helpers: extend `repo-paths` for Phase 2 scratch paths; add `phase2-fixtures` (minimal bilingual events + overlay committed under `tests/fixtures/phase2/` or compiled via documented pre-step)
- Playwright **projects**: default dev server for write paths; second project `chromium-prod` running preview build with `VITE_EDITORIAL_READONLY=true` for read-only assertions
- GitHub Actions workflow `test.yml` (or equivalent): `compile_events` → vitest → `npm run test:e2e`; wire `deploy-pages.yml` `build` job to `needs: test`
- `data-testid` contract documented in this issue for toolbar, i18n, highlight, compact view, editorial controls

Per-issue coverage summary:

| Issue | E2E focus |
|-------|-----------|
| 01 | SPA renders migrated `locales.ru` content |
| 02 | CLI `parse_epub` succeeds on fixture (subprocess in test) |
| 03 | English `statement` visible when locale EN (fixture data) |
| 04 | `--strict-en` compile fails/succeeds; SPA hides EN-incomplete nodes |
| 05 | Overlay position applied to graph |
| 06 | Filters in top-right toolbar only |
| 07 | Language switcher EN default + RU switch + strict hide |
| 08 | Dev: write comment/tag; Prod: read-only, no inputs |
| 09 | `export_issues_for_review.py` produces valid bundle (subprocess) |
| 10 | Context menu highlight + dim + clear |
| 11 | Compact view modal + back preserves highlight |

Use `test.fixme` only until the feature under test exists; remove fixme in the same PR that completes the feature issue.

## Acceptance criteria

- [ ] `cd app && npm run test:e2e` runs phase2 spec green on `main` with documented compile + fixture setup
- [ ] Each issue file `01`–`11` has at least one non-skipped test in `phase2-acceptance.spec.ts` when that issue is marked done
- [ ] CI workflow runs E2E on pull requests and pushes to `main`
- [ ] Pages deploy workflow does not run build if E2E job failed
- [ ] README Testing section mentions `npm run test:e2e` and fixture/compile prerequisites for Phase 2

## Blocked by

None for harness scaffolding — can start immediately (use `fixme` for unimplemented features)

Per-test enablement blocked by the corresponding feature issue (01–11)
