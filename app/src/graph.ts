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

export const EXPANDED_NODE_HEIGHT = 520

export interface LayoutOptions {
  reserveExpandedSpace?: boolean
  applyEditorialPositions?: boolean
}

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
export function refineChartSpecForEvents(
  events: ReligionEvent[],
  options: LayoutOptions = {},
): ChartLayoutSpec {
  let spec = buildChartLayoutSpec(events)
  if (!events.length) return spec

  for (let iter = 0; iter < 14; iter++) {
    const prevLh = spec.laneHeightPx
    const packed = packEventNodes(events, spec, options)
    const nextLh = uniformLaneHeightToFitStacks(
      packed.map((node) => ({
        position: node.position,
        data: node.data as { laneRow?: number },
        height: nodeHeightFor(node, options),
      })),
      prevLh,
    )
    spec = {
      ...spec,
      laneHeightPx: nextLh,
      contentWidthPx: contentWidthPx(spec.eras),
    }
    if (Math.abs(nextLh - prevLh) < 18) break
  }

  return spec
}

function packEventNodes(events: ReligionEvent[], spec: ChartLayoutSpec, options: LayoutOptions = {}): Node[] {
  return autoLayout(placeRawNodes(events, spec), spec, options)
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
export function autoLayout(nodes: Node[], spec: ChartLayoutSpec, options: LayoutOptions = {}): Node[] {
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
    const rowOffsets: number[] = []

    for (const node of sorted) {
      const naturalX = node.position.x
      let placed = false

      for (let r = 0; r < rowsRightX.length; r++) {
        const earliestX = rowsRightX[r]! + NODE_PAD_X
        if (naturalX >= earliestX) {
          const rowOffset = rowOffsets[r] ?? 0
          const nodeX = naturalX + rowOffset
          result.push({
            ...node,
            position: {
              x: nodeX,
              y: laneTop + NODE_PAD_Y + r * (nodeHeightFor(node, options) + NODE_PAD_Y),
            },
          })
          rowsRightX[r] = nodeX + NODE_WIDTH
          placed = true
          break
        }
        const requiredOffset = earliestX - naturalX
        if (requiredOffset <= maxHorizontalShiftFor(options)) {
          rowOffsets[r] = Math.max(rowOffsets[r] ?? 0, requiredOffset)
          const nodeX = naturalX + rowOffsets[r]!
          result.push({
            ...node,
            position: {
              x: nodeX,
              y: laneTop + NODE_PAD_Y + r * (nodeHeightFor(node, options) + NODE_PAD_Y),
            },
          })
          rowsRightX[r] = nodeX + NODE_WIDTH
          placed = true
          break
        }
      }

      if (!placed) {
        const r = rowsRightX.length
        rowOffsets.push(0)
        result.push({
          ...node,
          position: {
            x: naturalX,
            y: laneTop + NODE_PAD_Y + r * (nodeHeightFor(node, options) + NODE_PAD_Y),
          },
        })
        rowsRightX.push(naturalX + NODE_WIDTH)
      }
    }
  }

  return result
}

function nodeHeightFor(_node: Node, options: LayoutOptions): number {
  return options.reserveExpandedSpace ? EXPANDED_NODE_HEIGHT : NODE_HEIGHT
}

function maxHorizontalShiftFor(options: LayoutOptions): number {
  return options.reserveExpandedSpace ? NODE_WIDTH * 1.35 : NODE_WIDTH * 0.5
}

export function autoAlignSelectedNodes(nodes: Node[], spec: ChartLayoutSpec, selectedIds: Set<string>): Node[] {
  const selected = nodes.filter((node) => selectedIds.has(node.id))
  if (selected.length === 0) return nodes

  const selectedByLane = new Map<number, Node[]>()
  for (const node of selected) {
    const laneRow =
      typeof (node.data as EventGraphData).laneRow === 'number'
        ? (node.data as EventGraphData).laneRow
        : displayRowIndex(spec, ((node.data as EventGraphData).event?.territory ?? ''))
    const arr = selectedByLane.get(laneRow)
    if (arr) arr.push(node)
    else selectedByLane.set(laneRow, [node])
  }

  const positions = new Map<string, { x: number; y: number }>()
  for (const [laneRow, laneNodes] of selectedByLane) {
    const sorted = [...laneNodes].sort((a, b) => a.position.x - b.position.x)
    const minX = Math.min(...sorted.map((node) => node.position.x))
    const maxX = Math.max(...sorted.map((node) => node.position.x))
    const span = Math.max(maxX - minX, (sorted.length - 1) * (NODE_WIDTH + NODE_PAD_X))
    const step = sorted.length > 1 ? span / (sorted.length - 1) : 0
    const y = laneTopPx(laneRow, spec) + NODE_PAD_Y
    sorted.forEach((node, index) => {
      positions.set(node.id, { x: minX + step * index, y })
    })
  }

  return nodes.map((node) => (positions.has(node.id) ? { ...node, position: positions.get(node.id)! } : node))
}

type NodeSide = 'left' | 'right' | 'top' | 'bottom'

function nearestHandleSides(source: Node, target: Node): { sourceSide: NodeSide; targetSide: NodeSide } {
  const sourceCenter = {
    x: source.position.x + NODE_WIDTH / 2,
    y: source.position.y + NODE_HEIGHT / 2,
  }
  const targetCenter = {
    x: target.position.x + NODE_WIDTH / 2,
    y: target.position.y + NODE_HEIGHT / 2,
  }
  const dx = targetCenter.x - sourceCenter.x
  const dy = targetCenter.y - sourceCenter.y

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceSide: 'right', targetSide: 'left' }
      : { sourceSide: 'left', targetSide: 'right' }
  }
  return dy >= 0
    ? { sourceSide: 'bottom', targetSide: 'top' }
    : { sourceSide: 'top', targetSide: 'bottom' }
}

/**
 * Compose nodes + directed edges. Chart coordinates follow `spec` (autosized to visible events).
 */
export function buildGraph(
  evts: ReligionEvent[],
  spec: ChartLayoutSpec,
  stored: Record<string, { x: number; y: number }>,
  useStored: boolean,
  options: LayoutOptions = {},
): { nodes: Node[]; edges: Edge[] } {
  const byId = new Map<string, ReligionEvent>()
  for (const e of evts) byId.set(e.concept_id, e)

  const nodes = packEventNodes(evts, spec, options)
  if (useStored) {
    for (const n of nodes) {
      const s = stored[n.id]
      if (s) n.position = { ...s }
    }
  } else if (options.applyEditorialPositions !== false) {
    for (const n of nodes) {
      const ed = byId.get(n.id)?.editorial?.position
      if (ed) n.position = { x: ed.x, y: ed.y }
    }
  }

  const nodesById = new Map(nodes.map((node) => [node.id, node]))
  const edges: Edge[] = []
  for (const event of evts) {
    for (const conn of event.connections ?? []) {
      if (byId.has(conn.target_concept_id)) {
        const sourceNode = nodesById.get(event.concept_id)
        const targetNode = nodesById.get(conn.target_concept_id)
        const handles =
          sourceNode && targetNode
            ? nearestHandleSides(sourceNode, targetNode)
            : { sourceSide: 'right' as const, targetSide: 'left' as const }
        const lab =
          typeof conn.label === 'string' ? conn.label : String(conn.label ?? '')
        edges.push({
          id: `${event.concept_id}→${conn.target_concept_id}`,
          source: event.concept_id,
          target: conn.target_concept_id,
          sourceHandle: `source-${handles.sourceSide}`,
          targetHandle: `target-${handles.targetSide}`,
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

