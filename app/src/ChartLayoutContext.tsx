import React, { createContext, useContext } from 'react'
import type { ChartLayoutSpec } from './chartLayout'
import { buildChartLayoutSpec } from './chartLayout'

const ChartLayoutContext = createContext<ChartLayoutSpec | null>(null)

export function ChartLayoutProvider({
  spec,
  children,
}: {
  spec: ChartLayoutSpec
  children: React.ReactNode
}) {
  return <ChartLayoutContext.Provider value={spec}>{children}</ChartLayoutContext.Provider>
}

export function useChartLayout(): ChartLayoutSpec {
  const v = useContext(ChartLayoutContext)
  return v ?? buildChartLayoutSpec([])
}
