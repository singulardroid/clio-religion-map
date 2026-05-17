# Issue #13: Bibliographic References in Event Nodes

## Status
`ready-for-agent`

## Summary
Eliade's text contains inline bibliographic reference markers like `[12]`, which point to a full
bibliography section in each volume. When clicking an event node on the map, the expanded detail
panel should display the original reference number(s) cited in the relevant passage together with
their full bibliographic text, exactly as numbered in the book.

## User story
> As a researcher reading the religion map, when I expand an event node I want to see which
> external sources Eliade cited in that passage, with the original reference numbers and full
> bibliographic details, so I can trace claims back to primary literature.

## Acceptance criteria
- [ ] `scripts/parse_fb2.py` extracts the `<body name="notes">` bibliography and saves it to
      `data/vol{N}/chapters/refs.json` as `{"n_1": "full text", "n_12": "full text", ...}`
- [ ] `refs.json` is generated automatically each time `parse_fb2.py` runs (volume-level, shared
      across all chapters of that volume)
- [ ] Each event in `ch*.json` may carry an optional `"references"` array:
      `[{"num": 12, "text": "Lévy-Bruhl L. ..."}]`
      where `num` matches the original book reference number
- [ ] `app/src/types.ts` exports a `Reference` interface and `ReligionEvent.references` is typed
      as `Reference[] | undefined`
- [ ] `app/src/components/EventNode.tsx` renders a "Литература" section in the expanded view when
      `event.references` is non-empty, listing each entry as `[N] full text` in the original order
- [ ] Events without references display normally (the field is optional, no migration required)
- [ ] `ch01-events.json` is re-analysed with references populated (see Issue #11)

## Implementation notes

### refs.json location
`data/vol{N}/chapters/refs.json` — one file per volume, written by `parse_fb2.py`.

### How the LLM extraction agent uses refs.json
During chapter analysis (Issue #05 / #11), the agent:
1. Receives both the chapter `.txt` (which preserves `[N]` inline markers) and `refs.json`
2. For each extracted event, identifies `[N]` markers that appear in the cited passage
3. Looks up the matching entries in `refs.json` and writes them into `references`

### Numbering
Reference numbers are kept identical to the book's original numbering. No remapping is done.

### Reference text format in refs.json
Each entry's text as stored in `refs.json` begins with the reference number followed by the
bibliographic text (e.g. `"5 Karl Narr. Approaches to the Social Life..."`). When populating an
event's `references` array, the agent should strip the leading number prefix and store only the
bibliographic text in `text`, while `num` holds the integer.

## Dependencies
- Depends on: Issue #04 (FB2 parser) — **completed**
- Blocks: Issue #11 (full Vol. 1 analysis re-run with references)
- Related: Issue #07 (compile_events.py passes `references` through transparently — no change needed)

## Files changed
- `scripts/parse_fb2.py` — added `extract_notes()`, updated `main()` to save `refs.json`
- `data/vol1/chapters/refs.json` — generated (814 entries for Vol. 1)
- `app/src/types.ts` — added `Reference` interface, `references?` field on `ReligionEvent`
- `app/src/components/EventNode.tsx` — renders "Литература" section in expanded node view
