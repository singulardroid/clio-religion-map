import { describe, it, expect } from 'vitest'
import fixtures from './data/events.json'
import type { ReligionEvent } from './types'
import { buildGraph, primaryTimelineYear, refineChartSpecForEvents } from './graph'
import { clampYearGlobal } from './timeline'
import { CANVAS_YEAR_START, CANVAS_YEAR_END } from './config'

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
