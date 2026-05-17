Status: ready-for-agent

## Parent

.scratch/religion-map/PRD.md

## What to build

Implement the custom `EventNode` React Flow node component with full surface display, visual states, and click-to-expand detail panel.

**Surface (always visible):**
- Line 1: `[period] · [religion/tradition]`
- Line 2: `[statement]`
- Line 3 (conditional): `★ Первое появление` — only if `is_first_occurrence: true`

**Visual states:**
- Default: standard card style
- First-occurrence: gold/amber left border or background accent
- Dead-end (`is_dead_end: true`): dashed border

**Expand on click:**
- Toggle an inline detail panel below the surface content
- Detail panel shows:
  - `Источник: [source_ref]`
  - `Цитата: «[quote]»`
  - `Seshat NGA: [seshat.nga_name]` (shown even if `enriched: false`)
  - `Seshat полития: [seshat.polity_name]` (shown as "—" if null)

The node must be draggable (React Flow handles this automatically for custom nodes).

Replace the default placeholder nodes from issue #07 with `EventNode` in `App.tsx`.

## Acceptance criteria

- [ ] All three visual states (default, first-occurrence, dead-end) are visually distinct
- [ ] `★ Первое появление` badge appears only on first-occurrence nodes
- [ ] Clicking a node toggles the detail panel open and closed
- [ ] Detail panel shows source ref, quote, and Seshat NGA name
- [ ] Nodes remain draggable after the custom component is applied
- [ ] Component renders without errors when `seshat.polity_name` is null

## Blocked by

- `.scratch/religion-map/issues/07-event-compiler-spa-data.md`
