import { describe, expect, it } from 'vitest'

import { offscreenTickPointers, ticksForSpan, visibleTickModels } from './timelineRuler'

describe('ticksForSpan', () => {
  it('returns stable nice ticks plus endpoints', () => {
    expect(ticksForSpan(-1200, -200, 6)).toEqual([-1200, -1000, -800, -600, -400, -200])
  })
})

describe('offscreenTickPointers', () => {
  it('returns nearest offscreen ticks when none are visible', () => {
    const ticks = [
      { year: -1000, screenX: -80 },
      { year: -500, screenX: 520 },
    ]

    expect(offscreenTickPointers(ticks, 420)).toEqual({
      left: { year: -1000, screenX: -80 },
      right: { year: -500, screenX: 520 },
    })
  })

  it('returns no pointers once a tick is visible', () => {
    const ticks = [
      { year: -1000, screenX: -80 },
      { year: -500, screenX: 220 },
      { year: 0, screenX: 520 },
    ]

    expect(offscreenTickPointers(ticks, 420)).toEqual({ left: null, right: null })
  })
})

describe('visibleTickModels', () => {
  it('keeps only ticks near the current ruler viewport', () => {
    const ticks = [
      { year: -1000, screenX: -160 },
      { year: -500, screenX: -80 },
      { year: 0, screenX: 200 },
      { year: 500, screenX: 580 },
    ]

    expect(visibleTickModels(ticks, 420).map((t) => t.year)).toEqual([-500, 0])
  })
})
