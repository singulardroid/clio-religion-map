import {
  ERAS,
  TERRITORIES,
  CANVAS_YEAR_START,
  CANVAS_YEAR_END,
  LANE_HEIGHT,
  LANE_LABEL_WIDTH,
  NODE_HEIGHT,
  type Territory,
  type Era,
} from './config'
import type { ReligionEvent } from './types'
import { primaryTimelineYear } from './timeline'

/** Compressed era slices across the visible year span (pixel widths allocated per slice). */
export type ChartLayoutEra = {
  name: string
  yearFrom: number
  yearTo: number
  color: string
  widthPx: number
}

export type ChartLayoutSpec = {
  yearStart: number
  yearEnd: number
  territories: Territory[]
  laneHeightPx: number
  eras: ChartLayoutEra[]
  laneLabelWidth: number
  /** Sum of compressed era widths (chart content horizontal extent). */
  contentWidthPx: number
}

const MIN_CONTENT_WIDTH = 3200
const MAX_CONTENT_WIDTH = 56000
const MIN_LANE_HEIGHT = 340
const MAX_LANE_HEIGHT = 24000
const LANE_BOTTOM_PAD = 40

/** Match lane key (same heuristics used before dynamic layout). */
export function territoryCanonicalIndex(territory: string): number {
  const match = TERRITORIES.find(
    (t) =>
      territory.toLowerCase().includes(t.name.split(' ')[0].toLowerCase()) ||
      t.name.toLowerCase().includes(territory.split(' ')[0].toLowerCase()),
  )
  return match ? match.order : TERRITORIES.length
}

function territoryDescriptorAtCanonical(ci: number): Territory {
  if (ci >= 0 && ci < TERRITORIES.length) return TERRITORIES[ci]!
  return { name: 'Другое', order: TERRITORIES.length }
}

/** Lanes sorted top→bottom, only rows that occur in events. */
export function territoryRowsFromEvents(events: { territory?: string }[]): Territory[] {
  const used = new Set<number>()
  for (const ev of events) used.add(territoryCanonicalIndex(ev.territory ?? ''))
  const primary = [...used].filter((c) => c < TERRITORIES.length).sort((a, b) => a - b)
  const rows = primary.map((c) => territoryDescriptorAtCanonical(c))
  if (used.has(TERRITORIES.length)) rows.push(territoryDescriptorAtCanonical(TERRITORIES.length))
  return rows.length ? rows : [...TERRITORIES]
}

export function displayRowIndex(spec: ChartLayoutSpec, territory: string): number {
  const target = territoryCanonicalIndex(territory)
  let i = spec.territories.findIndex((t) => t.order === target)
  if (i >= 0) return i
  const fallback = spec.territories.findIndex((t) => t.order === TERRITORIES.length)
  return fallback >= 0 ? fallback : 0
}

/** Total canvas height in flow space (lanes only). */
export function canvasHeightForSpec(spec: ChartLayoutSpec): number {
  return spec.territories.length * spec.laneHeightPx
}

/** Sum of compressed era widths. */
export function contentWidthPx(eras: ChartLayoutEra[]): number {
  return eras.reduce((s, e) => s + e.widthPx, 0)
}

/** Calendar year bounds for autosizing axes (with symmetric padding inside global limits). */
export function yearExtentForEvents(events: ReligionEvent[]): {
  min: number
  max: number
} {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (const ev of events) {
    const y0 = primaryTimelineYear(ev)
    const yLo = typeof y0 === 'number' ? y0 : typeof ev.year_from === 'number' ? ev.year_from : null
    const yHi =
      typeof ev.year_to === 'number'
        ? ev.year_to
        : typeof yLo === 'number'
          ? yLo
          : null
    if (typeof yLo === 'number') {
      min = Math.min(min, yLo)
      max = Math.max(max, ...(typeof yHi === 'number' ? [yLo, yHi] : [yLo]))
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: CANVAS_YEAR_START, max: CANVAS_YEAR_END }
  }

  let span = max - min
  if (!(span > 1)) span = 800

  /** ~5–10% slack: wide spans get proportionally thinner padding ratio. */
  const padRatio = clamp((8000 / (span + 5000)) * 0.12, 0.03, 0.08)
  const pad = Math.max(120, span * padRatio)

  return {
    min: Math.max(CANVAS_YEAR_START, Math.floor(min - pad)),
    max: Math.min(CANVAS_YEAR_END, Math.ceil(max + pad)),
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/**
 * Map global ERAs onto [yearStart,yearEnd]; widths scale with clipped chronological span then
 * renormalize to keep the timeline readable across deep prehistory ↔ recent eras.
 */
export function compressedErasForSpan(yearStart: number, yearEnd: number): ChartLayoutEra[] {
  const clipped: ChartLayoutEra[] = []

  const pushClip = (era: Era) => {
    const yf = Math.max(era.yearFrom, yearStart)
    const yt = Math.min(era.yearTo, yearEnd)
    if (yf >= yt) return
    const fullSpan = era.yearTo - era.yearFrom || 1
    const clipSpan = yt - yf
    clipped.push({
      name: era.name,
      yearFrom: Math.floor(yf),
      yearTo: Math.ceil(yt),
      color: era.color,
      /** Pre-normalization weight */
      widthPx: era.widthPx * (clipSpan / fullSpan),
    })
  }

  for (const e of ERAS) pushClip(e)

  if (!clipped.length) {
    clipped.push({
      name: 'Период',
      yearFrom: Math.floor(yearStart),
      color: '#ebebeb',
      yearTo: Math.ceil(yearEnd),
      widthPx: 4000,
    })
  }

  const globalYears = CANVAS_YEAR_END - CANVAS_YEAR_START
  const sliceYears = Math.max(1, yearEnd - yearStart)
  const spanRatio = sliceYears / (globalYears > 1 ? globalYears : sliceYears)

  /** Log-compressed horizontal budget: narrow slices stay legible without forcing huge canvases for “all history”. */
  const targetRaw =
    MIN_CONTENT_WIDTH + (MAX_CONTENT_WIDTH - MIN_CONTENT_WIDTH) * Math.pow(spanRatio, 0.72)
  const targetWidth = clamp(
    targetRaw,
    clamp(5600 / Math.pow(sliceYears / 45000 + 1, 0.85), MIN_CONTENT_WIDTH, MAX_CONTENT_WIDTH),
    MAX_CONTENT_WIDTH,
  )

  const weightSum = clipped.reduce((s, e) => s + Math.max(e.widthPx, 1), 0) || 1
  let scale = targetWidth / weightSum
  for (const e of clipped) {
    e.widthPx = Math.max(80, e.widthPx * scale)
  }

  /** Second pass: keep total roughly on targetWidth after integer rounding. */
  let sumPost = clipped.reduce((s, e) => s + e.widthPx, 0)
  const scale2 = targetWidth / sumPost
  for (const e of clipped) {
    e.widthPx = Math.max(60, Math.round(e.widthPx * scale2))
  }

  return clipped
}

export function timeToXForSpec(year: number, spec: ChartLayoutSpec): number {
  let cursor = spec.laneLabelWidth

  const firstYf = spec.eras[0]?.yearFrom ?? spec.yearStart
  const lastYt = spec.eras[spec.eras.length - 1]?.yearTo ?? spec.yearEnd

  const leftPad = spec.laneLabelWidth
  if (year <= firstYf) return cursor - Math.min(leftPad * 2, Math.max(leftPad + 380, cursor * 0.15))

  for (const era of spec.eras) {
    const span = Math.max(1, era.yearTo - era.yearFrom)
    if (year <= era.yearTo) {
      const frac = (year - era.yearFrom) / span
      return cursor + clamp(frac, 0, 1) * era.widthPx
    }
    cursor += era.widthPx
  }

  const last = spec.eras[spec.eras.length - 1]!
  const rate = last.widthPx / Math.max(1, last.yearTo - last.yearFrom)
  return cursor + clamp(year - lastYt, 0, Number.MAX_SAFE_INTEGER) * rate * 0.08
}

export function laneTopPx(displayRowIndex: number, spec: ChartLayoutSpec): number {
  return displayRowIndex * spec.laneHeightPx
}

/** Initial chart spec derived only from visible events (place + chronology lanes). */
export function buildChartLayoutSpec(events: ReligionEvent[]): ChartLayoutSpec {
  if (!events.length) {
    const era = compressedErasForSpan(CANVAS_YEAR_START, CANVAS_YEAR_END)
    const cw = contentWidthPx(era)
    return {
      yearStart: CANVAS_YEAR_START,
      yearEnd: CANVAS_YEAR_END,
      territories: [...TERRITORIES],
      laneHeightPx: LANE_HEIGHT,
      eras: era,
      laneLabelWidth: LANE_LABEL_WIDTH,
      contentWidthPx: cw,
    }
  }

  const extent = yearExtentForEvents(events)
  const eras = compressedErasForSpan(extent.min, extent.max)
  const rows = territoryRowsFromEvents(events)
  const cw = contentWidthPx(eras)

  return {
    yearStart: extent.min,
    yearEnd: extent.max,
    territories: rows,
    laneHeightPx: LANE_HEIGHT,
    eras,
    laneLabelWidth: LANE_LABEL_WIDTH,
    contentWidthPx: cw,
  }
}

/**
 * Minimal uniform lane height that fits stacked cards for the current XY placement.
 * Rows are keyed by laneRow carried on node.data.
 */
export function uniformLaneHeightToFitStacks(
  nodes: Array<{ position: { y: number }; data?: { laneRow?: number }; height?: number }>,
  currentLaneHeight: number,
): number {
  if (!nodes.length) return Math.max(currentLaneHeight, MIN_LANE_HEIGHT)

  type Agg = { minY: number; maxBottom: number }
  const byRow = new Map<number, Agg>()

  for (const n of nodes) {
    const row = typeof n.data?.laneRow === 'number' ? n.data.laneRow : 0
    const top = n.position.y
    const bottom = top + (n.height ?? NODE_HEIGHT)
    let a = byRow.get(row)
    if (!a) {
      a = { minY: top, maxBottom: bottom }
      byRow.set(row, a)
    } else {
      a.minY = Math.min(a.minY, top)
      a.maxBottom = Math.max(a.maxBottom, bottom)
    }
  }

  let tallest = MIN_LANE_HEIGHT

  for (const [row, stats] of byRow) {
    const laneTop = row * currentLaneHeight
    const spread =
      stats.maxBottom - laneTop <= 0 ? currentLaneHeight : stats.maxBottom - laneTop + LANE_BOTTOM_PAD
    tallest = Math.max(tallest, spread)
  }

  return clamp(Math.max(tallest, currentLaneHeight), MIN_LANE_HEIGHT, MAX_LANE_HEIGHT)
}


