export interface TickModel {
  year: number
  screenX: number
}

export interface RulerPointers {
  left: TickModel | null
  right: TickModel | null
}

export function ticksForSpan(yearStart: number, yearEnd: number, maxTicks = 14): number[] {
  if (!Number.isFinite(yearStart) || !Number.isFinite(yearEnd)) return []
  const lo = Math.min(yearStart, yearEnd)
  const hi = Math.max(yearStart, yearEnd)
  if (!(hi > lo)) return [Math.round(lo)]

  const span = hi - lo
  const rough = span / Math.max(maxTicks - 1, 2)

  /** Round rough to magnitude {1,2,5}. */
  const log10 = Math.log10(Math.max(rough, 1e-6))
  const exp = Math.floor(log10)
  const fra = rough / Math.pow(10, exp)
  let niceFrac = 1
  if (fra <= 1) niceFrac = 1
  else if (fra <= 2) niceFrac = 2
  else if (fra <= 5) niceFrac = 5
  else niceFrac = 10

  let step = niceFrac * Math.pow(10, exp)
  if (!Number.isFinite(step) || step <= 0) step = span

  const ticks: number[] = []
  const start = Math.floor(lo / step) * step
  for (let y = start; y <= hi + step * 0.01; y += step) ticks.push(Math.round(y))
  ticks.push(lo, hi)

  return [...new Set(ticks)].sort((a, b) => a - b).filter((y) => y >= lo && y <= hi)
}

export function visibleTickModels(ticks: TickModel[], rulerWidth: number): TickModel[] {
  return ticks.filter((tick) => tick.screenX >= -100 && tick.screenX <= rulerWidth + 100)
}

export function offscreenTickPointers(ticks: TickModel[], rulerWidth: number): RulerPointers {
  const visible = ticks.some((tick) => tick.screenX >= 0 && tick.screenX <= rulerWidth)
  if (visible) return { left: null, right: null }

  const left = ticks
    .filter((tick) => tick.screenX < 0)
    .sort((a, b) => b.screenX - a.screenX)[0] ?? null
  const right = ticks
    .filter((tick) => tick.screenX > rulerWidth)
    .sort((a, b) => a.screenX - b.screenX)[0] ?? null

  return { left, right }
}
