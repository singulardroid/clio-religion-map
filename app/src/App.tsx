import React, { useMemo, useCallback, useState, useEffect, type MouseEvent } from 'react'
import ReactFlow, {
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  NodeChange,
  Node,
  applyNodeChanges,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { BackgroundLayers } from './components/BackgroundLayers'
import { TimelineRuler } from './components/TimelineRuler'
import { EventNode } from './components/EventNode'
import { MapToolbar } from './components/MapToolbar'
import { HighlightPanel } from './components/HighlightPanel'
import { CompactFlowView } from './components/CompactFlowView'
import { EditorialProvider } from './EditorialContext'
import { EDITORIAL_READONLY } from './i18n'
import { I18nProvider, useI18n } from './i18n'
import type { ReligionEvent } from './types'
import rawEvents from './data/events.json'
import { autoAlignSelectedNodes, buildGraph, refineChartSpecForEvents } from './graph'
import { ChartLayoutProvider } from './ChartLayoutContext'
import { filterEventsForLocale, openIssueCount, resolveEventForLocale } from './locale'
import {
  collectGraphHighlight,
  type HighlightDirection,
} from './graphHighlight'
import { downloadOverlayJson, newComment, newIssue, overlayFromEvents } from './editorial'
import type { IssueTagId } from './types'
import { POSITION_STORAGE_KEY } from './persistence'
import { glassPanel, theme } from './theme'

const sourceEvents = rawEvents as ReligionEvent[]
const nodeTypes = { eventNode: EventNode }

function eventsWithOverlay(
  events: ReligionEvent[],
  overlay: ReturnType<typeof overlayFromEvents>,
): ReligionEvent[] {
  return events.map((e) => {
    const o = overlay.by_concept_id[e.concept_id]
    if (!o) return e
    return {
      ...e,
      editorial: {
        comments: o.comments ?? e.editorial?.comments ?? [],
        issues: o.issues ?? e.editorial?.issues ?? [],
        position: o.position ?? e.editorial?.position,
      },
    }
  })
}

const HIGHLIGHT_DEPTH_KEY = 'clio-highlight-depth'

function storedPositionsFromEvents(evts: ReligionEvent[]) {
  const out: Record<string, { x: number; y: number }> = {}
  for (const e of evts) {
    const p = e.editorial?.position
    if (p) out[e.concept_id] = { x: p.x, y: p.y }
  }
  return out
}

function FlowCanvas() {
  const { fitView, setViewport } = useReactFlow()
  const { locale, t } = useI18n()
  const [volFilter, setVolFilter] = useState<'all' | 1 | 2 | 3>('all')
  const [terrFilter, setTerrFilter] = useState<string>('all')
  const [firstOnly, setFirstOnly] = useState(false)
  const [openIssuesOnly, setOpenIssuesOnly] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [temporaryPositions, setTemporaryPositions] = useState<Record<string, { x: number; y: number }>>({})

  const [overlayState, setOverlayState] = useState(() => overlayFromEvents(sourceEvents))

  const mergedSource = useMemo(
    () => eventsWithOverlay(sourceEvents, overlayState),
    [overlayState],
  )

  const localeEvents = useMemo(
    () => filterEventsForLocale(mergedSource, locale),
    [mergedSource, locale],
  )

  const filteredEvents = useMemo(() => {
    return localeEvents.filter((e) => {
      if (volFilter !== 'all' && e.volume !== volFilter) return false
      if (terrFilter !== 'all' && (e.territory ?? '') !== terrFilter) return false
      if (firstOnly && e.is_first_occurrence !== true) return false
      if (openIssuesOnly && openIssueCount(e) === 0) return false
      return true
    })
  }, [localeEvents, volFilter, terrFilter, firstOnly, openIssuesOnly])

  const chartLayoutSpec = useMemo(() => refineChartSpecForEvents(filteredEvents), [filteredEvents])

  const [highlightRoot, setHighlightRoot] = useState<string | null>(null)
  const [highlightDir, setHighlightDir] = useState<HighlightDirection | null>(null)
  const [highlightDepth, setHighlightDepth] = useState(() => {
    try {
      const v = localStorage.getItem(HIGHLIGHT_DEPTH_KEY)
      return v ? Math.min(10, Math.max(1, Number(v))) : 2
    } catch {
      return 2
    }
  })
  const [includeSiblings, setIncludeSiblings] = useState(true)
  const [compactOpen, setCompactOpen] = useState(false)
  const [mapStatusOpen, setMapStatusOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    nodeId: string
  } | null>(null)

  const highlightSet = useMemo(() => {
    if (!highlightRoot || !highlightDir) return null
    return collectGraphHighlight(highlightRoot, filteredEvents, {
      direction: highlightDir,
      maxDepth: highlightDepth,
      includeSiblings,
    })
  }, [highlightRoot, highlightDir, highlightDepth, includeSiblings, filteredEvents])

  const stored = useMemo(() => storedPositionsFromEvents(filteredEvents), [filteredEvents])

  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    const g = buildGraph(filteredEvents, chartLayoutSpec, stored, true)
    for (const n of g.nodes) {
      const temp = temporaryPositions[n.id]
      if (temp) n.position = { ...temp }
      n.data = {
        ...(n.data as object),
        expanded: expandedIds.has(n.id),
        onToggleExpanded: (conceptId: string) => {
          setExpandedIds((prev) => {
            const next = new Set(prev)
            if (next.has(conceptId)) next.delete(conceptId)
            else next.add(conceptId)
            return next
          })
        },
      }
    }
    const hl = highlightSet
    if (hl) {
      for (const n of g.nodes) {
        const on = hl.has(n.id)
        n.style = {
          ...n.style,
          opacity: on ? 1 : 0.22,
          filter: on ? undefined : 'grayscale(0.6)',
        }
      }
      for (const e of g.edges) {
        const on = hl.has(e.source) && hl.has(e.target)
        e.style = {
          ...e.style,
          stroke: on ? '#e67e22' : '#ccc',
          strokeWidth: on ? 3 : 1,
          opacity: on ? 1 : 0.15,
        }
      }
    }
    setNodes(g.nodes)
    setEdges(g.edges)
  }, [
    filteredEvents,
    chartLayoutSpec,
    stored,
    highlightSet,
    expandedIds,
    temporaryPositions,
    fitView,
    setNodes,
    setEdges,
  ])

  const applyHighlight = useCallback(
    (nodeId: string, direction: HighlightDirection) => {
      setHighlightRoot(nodeId)
      setHighlightDir(direction)
      setContextMenu(null)
      try {
        localStorage.setItem(HIGHLIGHT_DEPTH_KEY, String(highlightDepth))
      } catch {
        /* ignore */
      }
    },
    [highlightDepth],
  )

  const clearHighlight = useCallback(() => {
    setHighlightRoot(null)
    setHighlightDir(null)
    setCompactOpen(false)
  }, [])

  const onNodeContextMenu = useCallback(
    (evt: MouseEvent, node: { id: string }) => {
      evt.preventDefault()
      if (!selectedIds.has(node.id)) setSelectedIds(new Set([node.id]))
      setContextMenu({ x: evt.clientX, y: evt.clientY, nodeId: node.id })
    },
    [selectedIds],
  )

  const persistNodePosition = useCallback((id: string, position: { x: number; y: number }) => {
    try {
      const raw = localStorage.getItem(POSITION_STORAGE_KEY)
      const stored = raw ? (JSON.parse(raw) as Record<string, { x: number; y: number }>) : {}
      stored[id] = { x: position.x, y: position.y }
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(stored))
    } catch {
      /* ignore legacy localStorage compatibility failures */
    }
    setOverlayState((prev) => {
      const entry = { ...(prev.by_concept_id[id] ?? { comments: [], issues: [] }) }
      entry.position = { x: position.x, y: position.y }
      return {
        by_concept_id: { ...prev.by_concept_id, [id]: entry },
      }
    })
  }, [])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (EDITORIAL_READONLY) {
        setNodes((nds) => applyNodeChanges(changes.filter((c) => c.type !== 'position'), nds))
        return
      }
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds)
        for (const c of changes) {
          if (c.type === 'position' && !c.dragging && c.position) {
            persistNodePosition(c.id, c.position)
          }
        }
        return updated
      })
    },
    [persistNodePosition, setNodes],
  )

  const editorialActions = useMemo(
    () => ({
      readonly: EDITORIAL_READONLY,
      onAddComment: (conceptId: string, body: string) => {
        if (EDITORIAL_READONLY) return
        const c = newComment(body)
        setOverlayState((prev) => {
          const entry = { ...(prev.by_concept_id[conceptId] ?? { comments: [], issues: [] }) }
          entry.comments = [...(entry.comments ?? []), c]
          return { by_concept_id: { ...prev.by_concept_id, [conceptId]: entry } }
        })
      },
      onToggleIssue: (conceptId: string, tag: IssueTagId) => {
        if (EDITORIAL_READONLY) return
        setOverlayState((prev) => {
          const entry = { ...(prev.by_concept_id[conceptId] ?? { comments: [], issues: [] }) }
          const issues = [...(entry.issues ?? [])]
          const idx = issues.findIndex((i) => i.tag === tag && !i.resolved)
          if (idx >= 0) {
            issues[idx] = { ...issues[idx], resolved: true }
          } else {
            issues.push(newIssue(tag))
          }
          entry.issues = issues
          return { by_concept_id: { ...prev.by_concept_id, [conceptId]: entry } }
        })
      },
      onExportOverlay: () => downloadOverlayJson(overlayState),
    }),
    [overlayState],
  )

  const handleReset = useCallback(() => {
    try {
      localStorage.removeItem(POSITION_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setTemporaryPositions({})
    const g = buildGraph(filteredEvents, chartLayoutSpec, {}, false, {
      reserveExpandedSpace: true,
      applyEditorialPositions: false,
    })
    setNodes(g.nodes)
    setEdges(g.edges)
    setTimeout(() => fitView({ padding: 0.12, duration: 400 }), 50)
  }, [filteredEvents, chartLayoutSpec, fitView, setNodes, setEdges])

  const handleFit = useCallback(() => {
    fitView({ padding: 0.12, duration: 400 })
  }, [fitView])

  const handleExpandAll = useCallback(() => {
    setExpandedIds(new Set(filteredEvents.map((event) => event.concept_id)))
  }, [filteredEvents])

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set())
  }, [])

  const handleAutoAlignSelected = useCallback(() => {
    const aligned = autoAlignSelectedNodes(nodes, chartLayoutSpec, selectedIds)
    const next: Record<string, { x: number; y: number }> = {}
    for (const node of aligned) {
      if (selectedIds.has(node.id)) next[node.id] = node.position
    }
    setTemporaryPositions((prev) => ({ ...prev, ...next }))
    setNodes(aligned)
    setContextMenu(null)
  }, [chartLayoutSpec, nodes, selectedIds, setNodes])

  useEffect(() => {
    const w = window as Window & {
      __e2eFocusNode?: (nodeId: string) => void
      __e2eSetViewport?: (viewport: { x: number; y: number; zoom: number }) => void
    }
    w.__e2eFocusNode = (nodeId: string) => {
      fitView({
        nodes: [{ id: nodeId }],
        padding: 0.35,
        duration: 400,
        minZoom: 0.06,
        maxZoom: 2.25,
      })
    }
    w.__e2eSetViewport = (viewport: { x: number; y: number; zoom: number }) => {
      setViewport(viewport)
    }
    return () => {
      delete w.__e2eFocusNode
      delete w.__e2eSetViewport
    }
  }, [fitView, setViewport])

  useEffect(() => {
    if (!highlightRoot || !highlightDir) return
    collectGraphHighlight(highlightRoot, filteredEvents, {
      direction: highlightDir,
      maxDepth: highlightDepth,
      includeSiblings,
    })
  }, [highlightDepth, highlightRoot, highlightDir, includeSiblings, filteredEvents])

  return (
    <EditorialProvider value={editorialActions}>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          background:
            'radial-gradient(circle at 20% 0%, rgba(37,99,235,0.10), transparent 34%), radial-gradient(circle at 82% 12%, rgba(217,119,6,0.10), transparent 32%)',
        }}
      >
        <ChartLayoutProvider spec={chartLayoutSpec}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeContextMenu={onNodeContextMenu}
            onSelectionChange={({ nodes: selected }) => {
              setSelectedIds(new Set(selected.map((node) => node.id)))
            }}
            onNodeDragStop={(_, node: Node) => persistNodePosition(node.id, node.position)}
            onPaneClick={() => {
              setContextMenu(null)
              setMapStatusOpen(false)
            }}
            nodesDraggable={!EDITORIAL_READONLY}
            nodesFocusable
            elementsSelectable
            selectNodesOnDrag={false}
            multiSelectionKeyCode={['Meta', 'Shift']}
            minZoom={0.04}
            maxZoom={3}
            fitView={false}
            style={{ background: 'transparent' }}
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

        <MapToolbar
          volFilter={volFilter}
          setVolFilter={setVolFilter}
          terrFilter={terrFilter}
          setTerrFilter={setTerrFilter}
          firstOnly={firstOnly}
          setFirstOnly={setFirstOnly}
          openIssuesOnly={openIssuesOnly}
          setOpenIssuesOnly={setOpenIssuesOnly}
          onFit={handleFit}
          onReset={handleReset}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          showOpenIssuesFilter={!EDITORIAL_READONLY}
          mapStatusOpen={mapStatusOpen}
          onToggleMapStatus={() => setMapStatusOpen((v) => !v)}
        />

        <HighlightPanel
          active={!!highlightSet}
          direction={highlightDir}
          depth={highlightDepth}
          includeSiblings={includeSiblings}
          count={highlightSet?.size ?? 0}
          onDepthChange={(d) => {
            setHighlightDepth(d)
            try {
              localStorage.setItem(HIGHLIGHT_DEPTH_KEY, String(d))
            } catch {
              /* ignore */
            }
          }}
          onClear={clearHighlight}
          onCompact={() => setCompactOpen(true)}
        />

        {contextMenu && (
          <div
            data-testid="node-context-menu"
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 300,
              ...glassPanel,
              borderRadius: 16,
              padding: 8,
              minWidth: 200,
            }}
          >
            <ContextItem
              testId="context-menu-highlight-connected"
              onClick={() => applyHighlight(contextMenu.nodeId, 'both')}
            >
              {t('highlightConnected')}…
            </ContextItem>
            {selectedIds.size > 1 && selectedIds.has(contextMenu.nodeId) && (
              <ContextItem testId="context-menu-auto-align-selected" onClick={handleAutoAlignSelected}>
                Auto-align selected
              </ContextItem>
            )}
            <ContextItem
              testId="context-menu-highlight-downstream"
              onClick={() => applyHighlight(contextMenu.nodeId, 'down')}
            >
              {t('highlightDownstream')}…
            </ContextItem>
            <ContextItem
              testId="context-menu-highlight-upstream"
              onClick={() => applyHighlight(contextMenu.nodeId, 'up')}
            >
              {t('highlightUpstream')}…
            </ContextItem>
            <label style={{ display: 'flex', gap: 6, padding: '6px 10px', fontSize: 12 }}>
              <input
                type="checkbox"
                checked={includeSiblings}
                onChange={(e) => setIncludeSiblings(e.target.checked)}
              />
              {t('includeSiblings')}
            </label>
            <label style={{ display: 'flex', gap: 6, padding: '6px 10px', fontSize: 12 }}>
              <span>{t('depth')}</span>
              <input
                type="number"
                min={1}
                max={10}
                value={highlightDepth}
                onChange={(e) => setHighlightDepth(Number(e.target.value))}
                style={{ width: 48 }}
              />
            </label>
            <ContextItem testId="context-menu-clear" onClick={clearHighlight}>
              {t('clearHighlight')}
            </ContextItem>
          </div>
        )}

        {compactOpen && highlightSet && highlightRoot && (
          <CompactFlowView
            rootId={highlightRoot}
            highlightIds={highlightSet}
            events={filteredEvents}
            onClose={() => setCompactOpen(false)}
          />
        )}

        {mapStatusOpen && (
          <div
            id="map-status-popover"
            data-testid="map-status"
            role="tooltip"
            style={{
              position: 'fixed',
              top: 76,
              right: 12,
              maxWidth: 420,
              ...glassPanel,
              background: 'rgba(15,23,42,0.88)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              lineHeight: 1.45,
              zIndex: 210,
              pointerEvents: 'auto',
            }}
          >
            {t('statusYears')}{' '}
            {chartLayoutSpec.yearStart <= 0
              ? `${Math.abs(chartLayoutSpec.yearStart).toLocaleString()} BCE`
              : `${chartLayoutSpec.yearStart.toLocaleString()} CE`}
            —
            {chartLayoutSpec.yearEnd <= 0
              ? `${Math.abs(chartLayoutSpec.yearEnd).toLocaleString()} BCE`
              : `${chartLayoutSpec.yearEnd.toLocaleString()} CE`}
            , {chartLayoutSpec.territories.length} {t('statusLanes')} · {filteredEvents.length}{' '}
            {t('statusOf')} {localeEvents.length} {t('statusEvents')}
          </div>
        )}
      </div>
    </EditorialProvider>
  )
}

function ContextItem({
  children,
  onClick,
  testId,
}: {
  children: React.ReactNode
  onClick: () => void
  testId?: string
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '8px 10px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: 13,
        color: theme.ink,
        borderRadius: 10,
      }}
    >
      {children}
    </button>
  )
}

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

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>
      </I18nProvider>
    </ErrorBoundary>
  )
}
