import type { ReligionEvent } from './types'
import { CANVAS_YEAR_START, CANVAS_YEAR_END } from './config'

export function primaryTimelineYear(ev: ReligionEvent): number | null {
  const s = ev.seshat?.year_from
  if (s != null) return s
  if (typeof ev.year_from === 'number') return ev.year_from
  return null
}

export function midpointYear(yearStart: number, yearEnd: number): number {
  return Math.round((yearStart + yearEnd) / 2)
}

export function clampYearToRange(
  year: number | null,
  yearStart: number,
  yearEnd: number,
): number {
  if (year == null) return midpointYear(yearStart, yearEnd)
  return Math.max(yearStart, Math.min(yearEnd, year))
}

/** Clamp to absolute chart bounds (whole human timeline). */
export function clampYearGlobal(year: number | null): number {
  return clampYearToRange(year, CANVAS_YEAR_START, CANVAS_YEAR_END)
}
