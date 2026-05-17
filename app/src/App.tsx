import React, { useMemo, useCallback, useState, useEffect, type CSSProperties } from 'react'
import ReactFlow, {
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  NodeChange,
  applyNodeChanges,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { BackgroundLayers } from './components/BackgroundLayers'
import { TimelineRuler } from './components/TimelineRuler'
import { EventNode } from './components/EventNode'
import type { ReligionEvent } from './types'
import { TERRITORIES } from './config'
import rawEvents from './data/events.json'
import { buildGraph, refineChartSpecForEvents } from './graph'
import { loadPositions, savePositions, clearPositions } from './persistence'
import { ChartLayoutProvider } from './ChartLayoutContext'

const events = rawEvents as ReligionEvent[]
const nodeTypes = { eventNode: EventNode }

const filterSelectSx: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  padding: '6px 28px 6px 8px',
  fontSize: 13,
  fontFamily: 'inherit',
  borderRadius: 6,
  border: '1px solid rgba(0,0,0,0.2)',
  backgroundColor: '#f8f9fa',
  color: '#222',
  cursor: 'pointer',
}

// ─── inner canvas ─────────────────────────────────────────────────────────────

function FlowCanvas() {
  const { fitView } = useReactFlow()
  const [volFilter, setVolFilter] = useState<'all' | 1 | 2 | 3>('all')
  const [terrFilter, setTerrFilter] = useState<string>('all')
  const [firstOnly, setFirstOnly] = useState(false)

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (volFilter !== 'all' && e.volume !== volFilter) return false
      if (terrFilter !== 'all' && (e.territory ?? '') !== terrFilter) return false
      if (firstOnly && e.is_first_occurrence !== true) return false
      return true
    })
  }, [volFilter, terrFilter, firstOnly])

  /** Horizontally scales to event years; lanes = only territories in this filtered set (+ height for stacking). */
  const chartLayoutSpec = useMemo(() => refineChartSpecForEvents(filteredEvents), [filteredEvents])

  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    const g = buildGraph(filteredEvents, chartLayoutSpec, {}, false)
    setNodes(g.nodes)
    setEdges(g.edges)
    const t = window.setTimeout(() => fitView({ padding: 0.12, duration: 350 }), 45)
    return () => window.clearTimeout(t)
  }, [filteredEvents, chartLayoutSpec, fitView, setNodes, setEdges])

  // Persist positions after every drag (only for currently visible nodes)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updated = applyNodeChanges(changes, nodes)
      setNodes(updated)
      const hasDragStop = changes.some((c) => c.type === 'position' && !c.dragging)
      if (hasDragStop) {
        const prev = loadPositions()
        const merged: Record<string, { x: number; y: number }> = { ...prev }
        for (const n of updated) merged[n.id] = n.position
        savePositions(merged)
      }
    },
    [nodes, setNodes],
  )

  // Reset: clear saved positions, recompute auto-layout for filtered set
  const handleReset = useCallback(() => {
    clearPositions()
    const { nodes: fresh, edges: freshEdges } = buildGraph(filteredEvents, chartLayoutSpec, {}, false)
    setNodes(fresh)
    setEdges(freshEdges)
    setTimeout(() => fitView({ padding: 0.12, duration: 400 }), 50)
  }, [filteredEvents, chartLayoutSpec, fitView, setNodes, setEdges])

  const handleFit = useCallback(() => {
    fitView({ padding: 0.12, duration: 400 })
  }, [fitView])

  /** Playwright: center a React Flow node in the viewport (global fit leaves wide graphs edge-clipped). */
  useEffect(() => {
    const w = window as Window & { __e2eFocusNode?: (nodeId: string) => void }
    w.__e2eFocusNode = (nodeId: string) => {
      fitView({
        nodes: [{ id: nodeId }],
        padding: 0.35,
        duration: 400,
        minZoom: 0.06,
        maxZoom: 2.25,
      })
    }
    return () => {
      delete w.__e2eFocusNode
    }
  }, [fitView])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <ChartLayoutProvider spec={chartLayoutSpec}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          minZoom={0.04}
          maxZoom={3}
          fitView={false}
          style={{ background: 'transparent' }}
          edgesFocusable
          edgesUpdatable={false}
        >
          <BackgroundLayers />
          <Controls />
          <MiniMap
            zoomable
            pannable
            nodeColor={(n) => {
              const ev = (n.data as { event: ReligionEvent }).event
              return ev?.is_first_occurrence ? '#c0392b' : '#95a5a6'
            }}
          />
          <TimelineRuler />
        </ReactFlow>
      </ChartLayoutProvider>

      {/* Filter bar — grid + minmax(0,1fr) keeps long <option> labels from blowing out width */}
      <div
        data-testid="filter-panel"
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '14px 14px 16px',
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          width: 'min(300px, calc(100vw - 24px))',
          maxWidth: 'min(300px, calc(100vw - 24px))',
          overflow: 'hidden',
          boxSizing: 'border-box',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 13,
          color: '#333',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.06em',
            color: '#5c5c5c',
            textTransform: 'uppercase',
          }}
        >
          Фильтры
        </div>
        <label
          style={{
            display: 'grid',
            gridTemplateColumns: '72px minmax(0, 1fr)',
            gap: '8px',
            alignItems: 'center',
            margin: 0,
            minWidth: 0,
          }}
        >
          <span style={{ fontSize: 12, color: '#666' }}>Том</span>
          <div style={{ minWidth: 0, width: '100%' }}>
            <select
              value={volFilter}
              aria-label="Том"
              title="Том книги"
              onChange={(e) =>
                setVolFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2 | 3))
              }
              style={filterSelectSx}
            >
              <option value="all">Все</option>
              <option value="1">Том I</option>
              <option value="2">Том II</option>
              <option value="3">Том III</option>
            </select>
          </div>
        </label>

        <label
          style={{
            display: 'grid',
            gridTemplateColumns: '72px minmax(0, 1fr)',
            gap: '8px',
            alignItems: 'center',
            margin: 0,
            minWidth: 0,
          }}
        >
          <span style={{ fontSize: 12, color: '#666' }}>Регион</span>
          <div style={{ minWidth: 0, width: '100%' }}>
            <select
              value={terrFilter}
              aria-label="Регион на карте"
              title="Выбор территориальной дорожки"
              onChange={(e) => setTerrFilter(e.target.value)}
              style={filterSelectSx}
            >
              <option value="all">Все дорожки</option>
              {TERRITORIES.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            margin: '2px 0 0',
            cursor: 'pointer',
            paddingLeft: 80,
          }}
        >
          <input
            type="checkbox"
            checked={firstOnly}
            onChange={(e) => setFirstOnly(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#2980b9', flexShrink: 0 }}
          />
          <span style={{ fontSize: 13, lineHeight: 1.35, color: '#333' }}>
            Только «впервые»
          </span>
        </label>
        <p
          style={{
            margin: '4px 0 0',
            paddingTop: 10,
            borderTop: '1px solid rgba(0,0,0,0.06)',
            fontSize: 11,
            color: '#777',
            lineHeight: 1.45,
          }}
        >
          Часовая шкала и число дорожек подстраиваются под выбранные события (года и регионы).
          После перетаскивания координаты объединяются с сохранёнными в браузере.
        </p>
      </div>

      {/* Toolbar */}
      <div
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          display: 'flex',
          gap: 8,
          zIndex: 200,
        }}
      >
        <ToolbarButton
          dataTestId="toolbar-fit-view"
          onClick={handleFit}
          title="Вписать все узлы в экран"
        >
          ⛶ Вписать
        </ToolbarButton>
        <ToolbarButton
          dataTestId="toolbar-reset-layout"
          onClick={handleReset}
          title="Сбросить позиции и применить авторазмещение"
        >
          ⟳ Авторасстановка
        </ToolbarButton>
      </div>

      {/* Status bar */}
      <div
        data-testid="map-status"
        style={{
          position: 'fixed',
          bottom: 12,
          right: 12,
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          padding: '4px 12px',
          borderRadius: 4,
          fontSize: 12,
          zIndex: 100,
          pointerEvents: 'none',
        }}
      >
        Лет{' '}
        {chartLayoutSpec.yearStart <= 0
          ? `${Math.abs(chartLayoutSpec.yearStart).toLocaleString()} до н.э.`
          : `${chartLayoutSpec.yearStart.toLocaleString()} н.э.`}
        —
        {chartLayoutSpec.yearEnd <= 0
          ? `${Math.abs(chartLayoutSpec.yearEnd).toLocaleString()} до н.э.`
          : `${chartLayoutSpec.yearEnd.toLocaleString()} н.э.`}
        , дорожки {chartLayoutSpec.territories.length}, высота дорожки {chartLayoutSpec.laneHeightPx}px · событий{' '}
        {filteredEvents.length} из {events.length} · клик — сведения · перетаскивание сохраняется
      </div>
    </div>
  )
}

function ToolbarButton({
  onClick,
  title,
  children,
  dataTestId,
}: {
  onClick: () => void
  title?: string
  children: React.ReactNode
  dataTestId?: string
}) {
  return (
    <button
      type="button"
      data-testid={dataTestId}
      onClick={onClick}
      title={title}
      style={{
        padding: '6px 14px',
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid rgba(0,0,0,0.15)',
        borderRadius: 5,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        color: '#333',
      }}
    >
      {children}
    </button>
  )
}

// ─── error boundary ───────────────────────────────────────────────────────────

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', color: '#c0392b' }}>
          <h2>Runtime error</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </ErrorBoundary>
  )
}
