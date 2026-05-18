import React from 'react'
import { useViewport } from 'reactflow'
import { LANE_LABEL_WIDTH } from '../config'
import { timeToXForSpec } from '../chartLayout'
import { useChartLayout } from '../ChartLayoutContext'
import { useI18n } from '../i18n'
import { formatYear, theme } from '../theme'
import { offscreenTickPointers, ticksForSpan, visibleTickModels } from '../timelineRuler'

export function TimelineRuler() {
  const { x, zoom } = useViewport()
  const spec = useChartLayout()
  const { locale } = useI18n()
  const ticks = ticksForSpan(spec.yearStart, spec.yearEnd)
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1400
  const rulerWidth = Math.max(0, winW - LANE_LABEL_WIDTH)
  const tickModels = ticks.map((year) => {
    const naturalCanvasX = timeToXForSpec(year, spec)
    const transformedX = x + naturalCanvasX * zoom
    return { year, screenX: transformedX - LANE_LABEL_WIDTH }
  })
  const visibleTicks = visibleTickModels(tickModels, rulerWidth)
  const pointers = offscreenTickPointers(tickModels, rulerWidth)

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
      {visibleTicks.map(({ year, screenX }) => {
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
      {pointers.left && (
        <FloatingTick side="left" label={`← ${formatYear(pointers.left.year, locale)}`} />
      )}
      {pointers.right && (
        <FloatingTick side="right" label={`${formatYear(pointers.right.year, locale)} →`} />
      )}
    </div>
  )
}

function FloatingTick({ side, label }: { side: 'left' | 'right'; label: string }) {
  return (
    <div
      data-testid={`timeline-offscreen-${side}`}
      style={{
        position: 'absolute',
        [side]: 8,
        bottom: 4,
        padding: '2px 7px',
        borderRadius: 999,
        background: 'rgba(15,23,42,0.82)',
        color: '#fff',
        fontSize: 10,
        fontWeight: 800,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  )
}
