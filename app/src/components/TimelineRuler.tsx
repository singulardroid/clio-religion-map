import React from 'react'
import { useViewport } from 'reactflow'
import { LANE_LABEL_WIDTH } from '../config'
import { timeToXForSpec } from '../chartLayout'
import { useChartLayout } from '../ChartLayoutContext'
import { useI18n } from '../i18n'
import { formatYear, theme } from '../theme'

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
  const { locale } = useI18n()
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
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: `1px solid ${theme.line}`,
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
                fontWeight: 700,
                color: theme.muted,
                marginBottom: 2,
                whiteSpace: 'nowrap',
                transform: 'translateX(-50%)',
              }}
            >
              {formatYear(year, locale)}
            </div>
            <div style={{ width: 1, height: 7, backgroundColor: 'rgba(100,116,139,0.65)' }} />
          </div>
        )
      })}
    </div>
  )
}
