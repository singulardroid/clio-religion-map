import React from 'react'
import { useViewport } from 'reactflow'
import { LANE_LABEL_WIDTH } from '../config'
import { timeToXForSpec } from '../chartLayout'
import { useChartLayout } from '../ChartLayoutContext'

function formatTick(y: number): string {
  if (y === 0) return '1 н.э.'
  return y < 0 ? `${Math.abs(y)} до н.э.` : `${y} н.э.`
}

function ticksForSpan(yearStart: number, yearEnd: number, maxTicks = 14): number[] {
  if (!Number.isFinite(yearStart) || !Number.isFinite(yearEnd)) return []
  let lo = Math.min(yearStart, yearEnd)
  let hi = Math.max(yearStart, yearEnd)
  if (!(hi > lo)) return [Math.round(lo)]

  const span = hi - lo
  const rough = span / Math.max(maxTicks - 1, 2)

  /** Round rough to magnitude {1,2,5} */
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

  const uniqSorted = [...new Set(ticks)].sort((a, b) => a - b)
  return uniqSorted.filter((y) => y >= lo && y <= hi)
}

export function TimelineRuler() {
  const { x, zoom } = useViewport()
  const spec = useChartLayout()
  const ticks = ticksForSpan(spec.yearStart, spec.yearEnd)
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1400

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: LANE_LABEL_WIDTH,
        right: 0,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderTop: '1px solid rgba(0,0,0,0.1)',
        zIndex: 50,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {ticks.map((year) => {
        const naturalCanvasX = timeToXForSpec(year, spec)
        const transformedX = x + naturalCanvasX * zoom
        const screenX = transformedX - LANE_LABEL_WIDTH

        if (screenX < -100 || screenX > winW + 100) return null

        return (
          <div
            key={year}
            style={{
              position: 'absolute',
              left: screenX,
              bottom: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#666',
                marginBottom: 2,
                whiteSpace: 'nowrap',
                transform: 'translateX(-50%)',
              }}
            >
              {formatTick(year)}
            </div>
            <div style={{ width: 1, height: 6, backgroundColor: '#999' }} />
          </div>
        )
      })}
    </div>
  )
}
