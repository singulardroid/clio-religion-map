import React from 'react'
import { useViewport } from 'reactflow'
import { EraBands } from './EraBand'
import { TerritoryLines, TerritoryLabels } from './TerritoryLane'

export function BackgroundLayers() {
  const { x, y, zoom } = useViewport()

  return (
    <>
      {/* Fully transformed background: Eras and Lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <EraBands />
        <TerritoryLines />
      </div>

      {/* Fixed left, but vertically synced labels */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <TerritoryLabels />
      </div>
    </>
  )
}
