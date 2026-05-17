import { describe, it, expect } from 'vitest'
import { timeToX, territoryToY } from './layout'
import {
  CANVAS_YEAR_START,
  CANVAS_YEAR_END,
  LANE_LABEL_WIDTH,
  LANE_HEIGHT,
  TERRITORIES,
  ERAS,
} from './config'

describe('timeToX', () => {
  it('maps the earliest canvas year to the left edge', () => {
    expect(timeToX(CANVAS_YEAR_START)).toBeCloseTo(LANE_LABEL_WIDTH)
  })

  it('maps the latest canvas year to the right edge (sum of all era widths)', () => {
    const totalWidth = ERAS.reduce((sum, era) => sum + era.widthPx, 0)
    expect(timeToX(CANVAS_YEAR_END)).toBeCloseTo(LANE_LABEL_WIDTH + totalWidth)
  })

  it('maps year 0 to a position within the canvas', () => {
    const x = timeToX(0)
    const totalWidth = ERAS.reduce((sum, era) => sum + era.widthPx, 0)
    expect(x).toBeGreaterThan(LANE_LABEL_WIDTH)
    expect(x).toBeLessThan(LANE_LABEL_WIDTH + totalWidth)
  })

  it('returns a larger X for a more recent year', () => {
    expect(timeToX(-500)).toBeGreaterThan(timeToX(-5000))
  })

  it('maps a year exactly on an era boundary monotonically', () => {
    expect(timeToX(-10000)).toBeLessThan(timeToX(-3500))
  })
})

describe('territoryToY', () => {
  it('returns the correct Y for each known territory', () => {
    TERRITORIES.forEach((t) => {
      const y = territoryToY(t.name)
      expect(y).toBe(t.order * LANE_HEIGHT + LANE_HEIGHT / 2)
    })
  })

  it('returns a fallback Y for an unknown territory', () => {
    const knownMax = (TERRITORIES.length - 1) * LANE_HEIGHT + LANE_HEIGHT / 2
    const fallback = territoryToY('Неизвестная территория')
    expect(fallback).toBeGreaterThan(knownMax)
  })

  it('returns distinct Y values for different territories', () => {
    const y1 = territoryToY('Месопотамия')
    const y2 = territoryToY('Египет')
    expect(y1).not.toBe(y2)
  })
})
