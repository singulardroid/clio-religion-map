import { describe, it, expect } from 'vitest'
import fixtures from './data/events.json'
import type { ReligionEvent } from './types'
import {
  EXPANDED_NODE_HEIGHT,
  autoAlignSelectedNodes,
  buildGraph,
  primaryTimelineYear,
  refineChartSpecForEvents,
} from './graph'
import { clampYearGlobal } from './timeline'
import { CANVAS_YEAR_START, CANVAS_YEAR_END, NODE_PAD_X, NODE_WIDTH } from './config'

const events = fixtures as ReligionEvent[]

describe('buildGraph (fixtures)', () => {
  it('does not throw on full events.json and produces one node per event', () => {
    const spec = refineChartSpecForEvents(events)
    expect(() => buildGraph(events, spec, {}, false)).not.toThrow()
    const { nodes } = buildGraph(events, spec, {}, false)
    expect(nodes.length).toBe(events.length)
  })

  it('computes edges only for known targets', () => {
    const spec = refineChartSpecForEvents(events)
    const { edges } = buildGraph(events, spec, {}, false)
    for (const e of edges) {
      expect(events.some((x) => x.concept_id === e.source)).toBe(true)
      expect(events.some((x) => x.concept_id === e.target)).toBe(true)
    }
  })

  it('uses the nearest node sides for edge handles', () => {
    const localEvents: ReligionEvent[] = [
      {
        concept_id: 'left',
        territory: 'T',
        year_from: 0,
        connections: [{ target_concept_id: 'right', label: 'x' }],
      },
      {
        concept_id: 'right',
        territory: 'T',
        year_from: 100,
        connections: [],
      },
      {
        concept_id: 'top',
        territory: 'T',
        year_from: 0,
        connections: [{ target_concept_id: 'bottom', label: 'x' }],
      },
      {
        concept_id: 'bottom',
        territory: 'T',
        year_from: 0,
        connections: [],
      },
    ]
    const spec = refineChartSpecForEvents(localEvents)
    const { edges } = buildGraph(
      localEvents,
      spec,
      {
        left: { x: 0, y: 0 },
        right: { x: 800, y: 0 },
        top: { x: 0, y: 0 },
        bottom: { x: 0, y: 600 },
      },
      true,
    )
    const horizontal = edges.find((e) => e.source === 'left')!
    expect(horizontal.sourceHandle).toBe('source-right')
    expect(horizontal.targetHandle).toBe('target-left')

    const vertical = edges.find((e) => e.source === 'top')!
    expect(vertical.sourceHandle).toBe('source-bottom')
    expect(vertical.targetHandle).toBe('target-top')
  })

  it('can reserve expanded space for all nodes during auto layout', () => {
    const localEvents: ReligionEvent[] = [
      { concept_id: 'a', territory: 'Греция', year_from: -800, connections: [] },
      { concept_id: 'b', territory: 'Греция', year_from: -800, connections: [] },
      { concept_id: 'c', territory: 'Греция', year_from: -800, connections: [] },
    ]
    const spec = refineChartSpecForEvents(localEvents, { reserveExpandedSpace: true })
    const { nodes } = buildGraph(localEvents, spec, {}, false, { reserveExpandedSpace: true })

    const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x)
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i]!
        const b = sorted[j]!
        const xOverlaps =
          a.position.x < b.position.x + NODE_WIDTH + NODE_PAD_X &&
          a.position.x + NODE_WIDTH + NODE_PAD_X > b.position.x
        const yOverlaps =
          a.position.y < b.position.y + EXPANDED_NODE_HEIGHT &&
          a.position.y + EXPANDED_NODE_HEIGHT > b.position.y
        expect(xOverlaps && yOverlaps).toBe(false)
      }
    }
  })

  it('lays out the full graph without expanded-card rectangle overlaps', () => {
    const spec = refineChartSpecForEvents(events, { reserveExpandedSpace: true })
    const { nodes } = buildGraph(events, spec, {}, false, {
      reserveExpandedSpace: true,
      applyEditorialPositions: false,
    })

    const rects = nodes.map((node) => ({
      id: node.id,
      left: node.position.x,
      right: node.position.x + NODE_WIDTH,
      top: node.position.y,
      bottom: node.position.y + EXPANDED_NODE_HEIGHT,
    }))

    const overlaps: string[] = []
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i]!
        const b = rects[j]!
        const xOverlaps = a.left < b.right + NODE_PAD_X && a.right + NODE_PAD_X > b.left
        const yOverlaps = a.top < b.bottom && a.bottom > b.top
        if (xOverlaps && yOverlaps) overlaps.push(`${a.id} overlaps ${b.id}`)
      }
    }

    expect(overlaps).toEqual([])
  })
})

describe('primaryTimelineYear', () => {
  it('uses seshat year when defined', () => {
    expect(
      primaryTimelineYear({
        concept_id: 'x',
        territory: 'Египет',
        seshat: {
          nga_name: null,
          polity_name: null,
          year_from: -3000,
          year_to: -2900,
          mapping_confidence: 'medium',
          nga_id: null,
          polity_id: null,
          religion_id: null,
          enriched: false,
        },
      }),
    ).toBe(-3000)
  })

  it('falls back to top-level year_from when seshat is missing', () => {
    expect(
      primaryTimelineYear({
        concept_id: 'y',
        territory: 'Китай',
        year_from: -4000,
      }),
    ).toBe(-4000)
  })
})

describe('clampYearGlobal', () => {
  it('returns canvas midpoint when chronology is unknown', () => {
    expect(clampYearGlobal(null)).toBe(Math.round((CANVAS_YEAR_START + CANVAS_YEAR_END) / 2))
  })
})

describe('autoAlignSelectedNodes', () => {
  it('distributes selected nodes within their original lane groups only', () => {
    const localEvents: ReligionEvent[] = [
      { concept_id: 'g1', territory: 'Греция', year_from: -800, connections: [] },
      { concept_id: 'g2', territory: 'Греция', year_from: -790, connections: [] },
      { concept_id: 'i1', territory: 'Индия', year_from: -780, connections: [] },
    ]
    const spec = refineChartSpecForEvents(localEvents)
    const { nodes } = buildGraph(localEvents, spec, {}, false)

    const aligned = autoAlignSelectedNodes(nodes, spec, new Set(['g1', 'g2', 'i1']))
    const byId = new Map(aligned.map((n) => [n.id, n]))

    expect(byId.get('g1')!.position.y).toBe(byId.get('g2')!.position.y)
    expect(byId.get('g1')!.position.y).not.toBe(byId.get('i1')!.position.y)
    expect(byId.get('g1')!.position.x).toBeLessThan(byId.get('g2')!.position.x)
  })
})
