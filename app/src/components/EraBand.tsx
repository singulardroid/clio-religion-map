import React from 'react'
import type { ChartLayoutEra } from '../chartLayout'
import { canvasHeightForSpec, timeToXForSpec } from '../chartLayout'
import { useChartLayout } from '../ChartLayoutContext'
import { useI18n } from '../i18n'
import { displayEraName, theme } from '../theme'

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
  const { locale } = useI18n()
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
        opacity: 0.46,
        pointerEvents: 'none',
        borderRight: `1px solid ${theme.line}`,
      }}
    >
      <span
        style={{
          position: 'sticky',
          top: 8,
          display: 'block',
          padding: '5px 10px',
          fontSize: 11,
          fontWeight: 700,
          color: 'rgba(30,41,59,0.50)',
          whiteSpace: 'nowrap',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginTop: 50000,
        }}
      >
        {displayEraName(era.name, locale)}
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
