import {
  CANVAS_YEAR_START,
  CANVAS_YEAR_END,
  LANE_HEIGHT,
  LANE_LABEL_WIDTH,
  TERRITORIES,
  ERAS,
} from './config'

/**
 * Maps a calendar year (negative = BCE) to a canvas X coordinate (pixels).
 * Uses a non-linear scale defined by the widths of each era in config.ERAS.
 */
export function timeToX(year: number): number {
  let x = LANE_LABEL_WIDTH
  
  // Snap to start if older than the first era
  if (year < ERAS[0].yearFrom) {
    return x
  }

  for (const era of ERAS) {
    const eraSpan = era.yearTo - era.yearFrom
    
    if (year <= era.yearTo) {
      // The year falls within this era, interpolate
      const fraction = (year - era.yearFrom) / eraSpan
      return x + fraction * era.widthPx
    }
    
    // The year is after this era, so add its full width
    x += era.widthPx
  }
  
  // If year > CANVAS_YEAR_END, it just falls off the right
  return x
}

/**
 * Maps a territory name to the vertical center Y of its lane (pixels).
 * Unknown territories fall back to a dedicated "Другое" zone below all known lanes.
 */
export function territoryToY(territory: string): number {
  const match = TERRITORIES.find(
    (t) => territory.toLowerCase().includes(t.name.split(' ')[0].toLowerCase()) || t.name.toLowerCase().includes(territory.split(' ')[0].toLowerCase()),
  )
  const order = match ? match.order : TERRITORIES.length
  return order * LANE_HEIGHT + LANE_HEIGHT / 2
}

/**
 * Returns the total canvas height in pixels.
 */
export function canvasHeight(): number {
  return (TERRITORIES.length + 1) * LANE_HEIGHT // +1 for the overflow "Другое" lane
}
