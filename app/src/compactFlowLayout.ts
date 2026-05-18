export interface LayeredNode {
  id: string
  layer: number
}

/**
 * Assign layers: root at 0, upstream negative, downstream positive.
 */
export function assignCompactLayers(
  rootId: string,
  nodeIds: Set<string>,
  children: Map<string, string[]>,
  parents: Map<string, string[]>,
): Map<string, number> {
  const layers = new Map<string, number>()
  layers.set(rootId, 0)

  const upQ: Array<{ id: string; layer: number }> = [{ id: rootId, layer: 0 }]
  while (upQ.length) {
    const { id, layer } = upQ.shift()!
    for (const p of parents.get(id) ?? []) {
      if (!nodeIds.has(p)) continue
      const next = layer - 1
      if (!layers.has(p) || layers.get(p)! > next) {
        layers.set(p, next)
        upQ.push({ id: p, layer: next })
      }
    }
  }

  const downQ: Array<{ id: string; layer: number }> = [{ id: rootId, layer: 0 }]
  while (downQ.length) {
    const { id, layer } = downQ.shift()!
    for (const c of children.get(id) ?? []) {
      if (!nodeIds.has(c)) continue
      const next = layer + 1
      if (!layers.has(c) || layers.get(c)! < next) {
        layers.set(c, next)
        downQ.push({ id: c, layer: next })
      }
    }
  }

  for (const id of nodeIds) {
    if (!layers.has(id)) layers.set(id, 0)
  }
  return layers
}

export function layerToX(layer: number, columnWidth: number, originX: number): number {
  return originX + layer * columnWidth
}
