import type { Edge, Node } from 'reactflow'
import { MarkerType } from 'reactflow'

import {
  type ChartLayoutSpec,
  buildChartLayoutSpec,
  contentWidthPx,
  displayRowIndex,
  laneTopPx,
  timeToXForSpec,
  uniformLaneHeightToFitStacks,
} from './chartLayout'
import { NODE_WIDTH, NODE_HEIGHT, NODE_PAD_X, NODE_PAD_Y, ERAS } from './config'
import { clampYearToRange, primaryTimelineYear } from './timeline'
import type { ReligionEvent } from './types'

export { primaryTimelineYear } from './timeline'

/** Node data augmented for lane packing */
export interface EventGraphData {
  event: ReligionEvent
  eraColor: string
  laneRow: number
}

export function eraColorForYear(year: number): string {
  const era = ERAS.find((e) => year >= e.yearFrom && year <= e.yearTo)
  return era ? era.color : '#f0f0f0'
}

/**
 * Widens lane height vertically until intra-lane stacking fits the chosen scale.
 */
export function refineChartSpecForEvents(events: ReligionEvent[]): ChartLayoutSpec {
  let spec = buildChartLayoutSpec(events)
  if (!events.length) return spec

  for (let iter = 0; iter < 14; iter++) {
    const prevLh = spec.laneHeightPx
    const packed = packEventNodes(events, spec)
    const nextLh = uniformLaneHeightToFitStacks(packed, prevLh)
    spec = {
      ...spec,
      laneHeightPx: nextLh,
      contentWidthPx: contentWidthPx(spec.eras),
    }
    if (Math.abs(nextLh - prevLh) < 18) break
  }

  return spec
}

function packEventNodes(events: ReligionEvent[], spec: ChartLayoutSpec): Node[] {
  return autoLayout(placeRawNodes(events, spec), spec)
}

function placeRawNodes(events: ReligionEvent[], spec: ChartLayoutSpec): Node[] {
  return events.map((event) => {
    const yr = clampYearToRange(primaryTimelineYear(event), spec.yearStart, spec.yearEnd)
    const naturalX = timeToXForSpec(yr, spec)
    const laneRow = displayRowIndex(spec, event.territory ?? '')

    return {
      id: event.concept_id,
      type: 'eventNode',
      position: { x: naturalX, y: laneTopPx(laneRow, spec) },
      data: {
        event,
        laneRow,
        eraColor: eraColorForYear(yr),
      } satisfies EventGraphData,
      draggable: true,
    }
  })
}

/**
 * Horizontal packing rows within each territory lane (stacked vertically when overlaps).
 */
export function autoLayout(nodes: Node[], spec: ChartLayoutSpec): Node[] {
  const byRow = new Map<number, Node[]>()

  for (const n of nodes) {
    const laneRow =
      typeof (n.data as EventGraphData).laneRow === 'number'
        ? (n.data as EventGraphData).laneRow
        : 0
    const arr = byRow.get(laneRow)
    if (arr) arr.push(n)
    else byRow.set(laneRow, [n])
  }

  const result: Node[] = []
  const rowKeys = [...byRow.keys()].sort((a, b) => a - b)

  for (const laneRow of rowKeys) {
    const laneNodes = byRow.get(laneRow)!
    const laneTop = laneTopPx(laneRow, spec)
    const sorted = [...laneNodes].sort((a, b) => a.position.x - b.position.x)
    const rowsRightX: number[] = []

    for (const node of sorted) {
      const nodeX = node.position.x
      let placed = false

      for (let r = 0; r < rowsRightX.length; r++) {
        if (nodeX > rowsRightX[r]! + NODE_PAD_X) {
          result.push({
            ...node,
            position: {
              x: nodeX,
              y: laneTop + NODE_PAD_Y + r * (NODE_HEIGHT + NODE_PAD_Y),
            },
          })
          rowsRightX[r] = nodeX + NODE_WIDTH
          placed = true
          break
        }
      }

      if (!placed) {
        const r = rowsRightX.length
        result.push({
          ...node,
          position: {
            x: nodeX,
            y: laneTop + NODE_PAD_Y + r * (NODE_HEIGHT + NODE_PAD_Y),
          },
        })
        rowsRightX.push(nodeX + NODE_WIDTH)
      }
    }
  }

  return result
}

/**
 * Compose nodes + directed edges. Chart coordinates follow `spec` (autosized to visible events).
 */
export function buildGraph(
  evts: ReligionEvent[],
  spec: ChartLayoutSpec,
  stored: Record<string, { x: number; y: number }>,
  useStored: boolean,
): { nodes: Node[]; edges: Edge[] } {
  const byId = new Map<string, ReligionEvent>()
  for (const e of evts) byId.set(e.concept_id, e)

  const nodes = packEventNodes(evts, spec)
  if (useStored) {
    for (const n of nodes) {
      const s = stored[n.id]
      if (s) n.position = { ...s }
    }
  } else {
    for (const n of nodes) {
      const ed = byId.get(n.id)?.editorial?.position
      if (ed) n.position = { x: ed.x, y: ed.y }
    }
  }

  const edges: Edge[] = []
  for (const event of evts) {
    for (const conn of event.connections ?? []) {
      if (byId.has(conn.target_concept_id)) {
        const lab =
          typeof conn.label === 'string' ? conn.label : String(conn.label ?? '')
        edges.push({
          id: `${event.concept_id}→${conn.target_concept_id}`,
          source: event.concept_id,
          target: conn.target_concept_id,
          label: lab,
          type: 'smoothstep',
          animated: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: '#c0392b',
          },
          style: { stroke: '#c0392b', strokeWidth: 2 },
          labelStyle: { fontSize: 11, fill: '#333', fontWeight: 600 },
          labelBgStyle: {
            fill: '#fff',
            fillOpacity: 0.92,
            rx: 4,
          },
          labelBgPadding: [6, 4],
        })
      }
    }
  }

  return { nodes, edges }
}

