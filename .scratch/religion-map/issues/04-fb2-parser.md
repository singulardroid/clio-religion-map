Status: ready-for-agent

## Parent

.scratch/religion-map/PRD.md

## What to build

Write `scripts/parse_fb2.py` — a Python script that parses the `.fb2` XML source files and extracts chapters as plain-text files.

The `.fb2` format is standard XML. Each top-level `<section>` element inside `<body>` represents a chapter and has a `<title>` child. The script should:
- Accept a path to a `.fb2` file as a command-line argument (default: `inputs/01_...fb2`)
- Extract each `<section>` with its `<title>` text and body text (stripping XML tags, preserving paragraph breaks)
- Write one file per chapter: `data/vol1/chapters/ch01.txt`, `ch02.txt`, …, zero-padded to two digits
- Print a chapter index to stdout: chapter number, title, word count
- Handle nested `<section>` elements gracefully (treat sub-sections as part of the parent chapter)

Dependency: `lxml` (already in `requirements.txt` from issue #01).

## Acceptance criteria

- [ ] `python scripts/parse_fb2.py inputs/01_История_веры_и_религиозных_идей_Том_1_От_каменного_века_до_элевсинских.fb2` runs without errors
- [ ] Output files `data/vol1/chapters/ch01.txt` … `chNN.txt` are created, one per chapter
- [ ] Each chapter file contains readable Russian text, not XML tags
- [ ] The chapter index is printed to stdout showing number, title, and word count for each chapter
- [ ] A pytest test with a small inline `.fb2` XML fixture asserts correct chapter count and title extraction

## Blocked by

- `.scratch/religion-map/issues/01-project-scaffolding.md`
