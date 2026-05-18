import type { ReligionEvent } from './types'

export type HighlightDirection = 'down' | 'up' | 'both'

export interface HighlightOptions {
  direction: HighlightDirection
  maxDepth: number
  includeSiblings: boolean
}

export interface GraphIndexes {
  children: Map<string, string[]>
  parents: Map<string, string[]>
}

export function buildGraphIndexes(events: ReligionEvent[]): GraphIndexes {
  const ids = new Set(events.map((e) => e.concept_id))
  const children = new Map<string, string[]>()
  const parents = new Map<string, string[]>()

  for (const e of events) {
    children.set(e.concept_id, [])
    parents.set(e.concept_id, [])
  }

  for (const e of events) {
    for (const c of e.connections ?? []) {
      const t = c.target_concept_id
      if (!ids.has(t)) continue
      children.get(e.concept_id)!.push(t)
      parents.get(t)!.push(e.concept_id)
    }
  }
  return { children, parents }
}

function siblingsFor(
  nodeId: string,
  parents: Map<string, string[]>,
  children: Map<string, string[]>,
  direction: HighlightDirection,
): string[] {
  const sibs = new Set<string>()
  if (direction === 'down' || direction === 'both') {
    for (const p of parents.get(nodeId) ?? []) {
      for (const c of children.get(p) ?? []) {
        if (c !== nodeId) sibs.add(c)
      }
    }
  }
  if (direction === 'up' || direction === 'both') {
    for (const c of children.get(nodeId) ?? []) {
      for (const p of parents.get(c) ?? []) {
        if (p !== nodeId) sibs.add(p)
      }
    }
  }
  return [...sibs]
}

function bfs(
  start: string,
  adj: Map<string, string[]>,
  maxDepth: number,
): Set<string> {
  const seen = new Set<string>([start])
  let frontier = [start]
  for (let d = 0; d < maxDepth; d++) {
    const next: string[] = []
    for (const id of frontier) {
      for (const n of adj.get(id) ?? []) {
        if (!seen.has(n)) {
          seen.add(n)
          next.push(n)
        }
      }
    }
    frontier = next
    if (!frontier.length) break
  }
  return seen
}

export function collectGraphHighlight(
  rootId: string,
  events: ReligionEvent[],
  options: HighlightOptions,
): Set<string> {
  const { direction, maxDepth, includeSiblings } = options
  const { children, parents } = buildGraphIndexes(events)
  if (!events.some((e) => e.concept_id === rootId)) return new Set()

  const out = new Set<string>([rootId])

  if (direction === 'down' || direction === 'both') {
    for (const id of bfs(rootId, children, maxDepth)) out.add(id)
  }
  if (direction === 'up' || direction === 'both') {
    for (const id of bfs(rootId, parents, maxDepth)) out.add(id)
  }

  if (includeSiblings) {
    const snap = [...out]
    for (const id of snap) {
      for (const s of siblingsFor(id, parents, children, direction)) out.add(s)
    }
  }

  return out
}
