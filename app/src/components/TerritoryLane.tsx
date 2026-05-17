import React from 'react'
import { LANE_LABEL_WIDTH } from '../config'
import { canvasHeightForSpec } from '../chartLayout'
import { useChartLayout } from '../ChartLayoutContext'
import { useViewport } from 'reactflow'

/**
 * Horizontal dividers synced to the compact lane list for the filtered view.
 */
export function TerritoryLines() {
  const spec = useChartLayout()
  const { laneHeightPx, territories } = spec
  const heightFull = canvasHeightForSpec(spec)

  return (
    <>
      {territories.map((t, displayIdx) => (
        <div
          key={`line-${displayIdx}-${t.name}`}
          style={{
            position: 'absolute',
            left: -50000,
            top: displayIdx * laneHeightPx,
            width: 100000,
            height: 1,
            backgroundColor: 'rgba(0,0,0,0.07)',
            pointerEvents: 'none',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: -50000,
          top: heightFull,
          width: 100000,
          height: 1,
          backgroundColor: 'rgba(0,0,0,0.07)',
          pointerEvents: 'none',
        }}
      />
    </>
  )
}

/**
 * Left gutter labels anchored to lane rows defined by autosized lane height.
 */
export function TerritoryLabels() {
  const spec = useChartLayout()
  const { y, zoom } = useViewport()
  const { laneHeightPx, territories } = spec
  const maxIdx = territories.length - 1

  return (
    <>
      {territories.map((t, displayIdx) => {
        const originalTop = displayIdx * laneHeightPx * zoom + y
        const originalBottom = originalTop + laneHeightPx * zoom

        let top = originalTop
        let bottom = originalBottom
        let boxHeight = laneHeightPx * zoom

        if (displayIdx === 0) {
          top = -50000
          boxHeight = originalBottom - top
        } else if (displayIdx === maxIdx) {
          bottom = originalTop + 50000
          boxHeight = bottom - top
        }

        const winH = typeof window !== 'undefined' ? window.innerHeight : 1000
        if (bottom < 0 || top > winH) return null

        const visibleTop = Math.max(0, top)
        const visibleBottom = Math.min(winH, bottom)
        const visibleHeight = visibleBottom - visibleTop
        const visibleCenter = visibleTop + visibleHeight / 2
        const desiredScreenY = visibleCenter - (laneHeightPx * zoom) / 2
        const textTop = desiredScreenY - top

        return (
          <div
            key={`label-${displayIdx}-${t.name}`}
            style={{
              position: 'absolute',
              left: 0,
              top,
              width: LANE_LABEL_WIDTH,
              height: boxHeight,
              backgroundColor: displayIdx === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
              borderRight: '2px solid rgba(0,0,0,0.1)',
              borderBottom: displayIdx === maxIdx ? 'none' : '1px solid rgba(0,0,0,0.05)',
              pointerEvents: 'none',
              zIndex: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: textTop,
                left: 0,
                width: '100%',
                height: laneHeightPx * zoom,
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                fontSize: Math.max(10, Math.min(14, 14 * zoom)),
                fontWeight: 600,
                color: 'rgba(0,0,0,0.55)',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {t.name}
            </div>
          </div>
        )
      })}
    </>
  )
}
