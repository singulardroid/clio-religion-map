import React from 'react'
import type { ChartLayoutEra } from '../chartLayout'
import { canvasHeightForSpec, timeToXForSpec } from '../chartLayout'
import { useChartLayout } from '../ChartLayoutContext'

interface EraBandProps {
  era: ChartLayoutEra
  isFirst: boolean
  isLast: boolean
}

/**
 * Compressed era stripe for the autosized chronology slice (see chartLayout.spec).
 */
export function EraBand({ era, isFirst, isLast }: EraBandProps) {
  const spec = useChartLayout()
  let x = timeToXForSpec(era.yearFrom, spec)
  let width = timeToXForSpec(era.yearTo, spec) - x

  if (isFirst) {
    const originalX = x
    x = -50000
    width += originalX - x
  }
  if (isLast) {
    width += 50000
  }

  const height = canvasHeightForSpec(spec) + 50000

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: -50000,
        width,
        height: height + 100000,
        backgroundColor: era.color,
        opacity: 0.6,
        pointerEvents: 'none',
        borderRight: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <span
        style={{
          position: 'sticky',
          top: 8,
          display: 'block',
          padding: '4px 8px',
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(0,0,0,0.45)',
          whiteSpace: 'nowrap',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginTop: 50000,
        }}
      >
        {era.name}
      </span>
    </div>
  )
}

export function EraBands() {
  const spec = useChartLayout()
  return (
    <>
      {spec.eras.map((era, i) => (
        <EraBand
          key={`${era.name}-${era.yearFrom}-${era.yearTo}`}
          era={era}
          isFirst={i === 0}
          isLast={i === spec.eras.length - 1}
        />
      ))}
    </>
  )
}
