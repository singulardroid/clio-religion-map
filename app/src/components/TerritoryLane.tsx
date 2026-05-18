import React from 'react'
import { LANE_LABEL_WIDTH } from '../config'
import { canvasHeightForSpec } from '../chartLayout'
import { useChartLayout } from '../ChartLayoutContext'
import { useViewport } from 'reactflow'
import { useI18n } from '../i18n'
import { displayTerritoryName, theme } from '../theme'

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
            backgroundColor: 'rgba(30,41,59,0.08)',
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
          backgroundColor: 'rgba(30,41,59,0.08)',
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
  const { locale } = useI18n()
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
              background:
                displayIdx === 0
                  ? 'linear-gradient(90deg, rgba(255,255,255,0.96), rgba(255,255,255,0.84))'
                  : 'linear-gradient(90deg, rgba(255,255,255,0.88), rgba(255,255,255,0.72))',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              borderRight: `1px solid ${theme.line}`,
              borderBottom: displayIdx === maxIdx ? 'none' : `1px solid ${theme.line}`,
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
                fontWeight: 700,
                color: theme.ink,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {displayTerritoryName(t.name, locale)}
            </div>
          </div>
        )
      })}
    </>
  )
}
