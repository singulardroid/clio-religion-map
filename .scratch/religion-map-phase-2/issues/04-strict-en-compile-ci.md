Status: ready-for-agent

## Parent

.scratch/religion-map-phase-2/PRD.md

## What to build

Enforce English completeness before publish. Extend the event compiler with `--strict-en`: exit non-zero if any event lacks required `locales.en` fields (statement or description, quote, source_ref—define the required set in compiler docs). Wire GitHub Actions deploy workflow to run strict compile so incomplete English never reaches GitHub Pages.

Deliver end-to-end:
- Strict compile flag with clear error messages per `concept_id`
- CI updated on `main` deploy path
- SPA: default locale `en`; hide events missing required active-locale fields (no cross-locale fallback)

## Acceptance criteria

- [ ] `compile_events.py --strict-en` fails when a fixture event has empty `locales.en.quote`
- [ ] `compile_events.py --strict-en` succeeds when all events are EN-complete
- [ ] Deploy workflow runs strict compile before `npm run build`
- [ ] SPA with `clio-lang=en` does not render nodes with incomplete English
- [ ] pytest for strict-en behavior

## Blocked by

- `.scratch/religion-map-phase-2/issues/03-en-align-locales.md`
