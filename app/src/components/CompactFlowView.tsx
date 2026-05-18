import { useEffect, useMemo } from 'react'
import ReactFlow, { Background, Controls, useReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'

import { assignCompactLayers, layerToX } from '../compactFlowLayout'
import { buildGraphIndexes } from '../graphHighlight'
import { useI18n } from '../i18n'
import type { ReligionEvent } from '../types'
import { EventNode } from './EventNode'

const nodeTypes = { eventNode: EventNode }
const COLUMN_W = 280
const ROW_H = 100

function FitOnMount() {
  const { fitView } = useReactFlow()
  useEffect(() => {
    const t = window.setTimeout(() => fitView({ padding: 0.08, maxZoom: 1, duration: 300 }), 40)
    return () => window.clearTimeout(t)
  }, [fitView])
  return null
}

export function CompactFlowView({
  rootId,
  highlightIds,
  events,
  onClose,
}: {
  rootId: string
  highlightIds: Set<string>
  events: ReligionEvent[]
  onClose: () => void
}) {
  const { t } = useI18n()
  const subset = useMemo(
    () => events.filter((e) => highlightIds.has(e.concept_id)),
    [events, highlightIds],
  )

  const { nodes, edges } = useMemo(() => {
    const { children, parents } = buildGraphIndexes(subset)
    const layers = assignCompactLayers(rootId, highlightIds, children, parents)
    const minLayer = Math.min(...[...layers.values()])
    const originX = 80 - minLayer * COLUMN_W

    const byLayer = new Map<number, string[]>()
    for (const e of subset) {
      const layer = layers.get(e.concept_id) ?? 0
      const list = byLayer.get(layer) ?? []
      list.push(e.concept_id)
      byLayer.set(layer, list)
    }
    const rowIndex = new Map<string, number>()
    for (const ids of byLayer.values()) {
      ids.forEach((id, row) => rowIndex.set(id, row))
    }

    const nodes = subset.map((event) => {
      const layer = layers.get(event.concept_id) ?? 0
      const row = rowIndex.get(event.concept_id) ?? 0
      return {
        id: event.concept_id,
        type: 'eventNode',
        position: {
          x: layerToX(layer, COLUMN_W, originX),
          y: 40 + row * ROW_H,
        },
        data: { event, eraColor: '#e8e8e8', laneRow: 0 },
        draggable: false,
      }
    })

    const ids = new Set(subset.map((e) => e.concept_id))
    const edges = []
    for (const e of subset) {
      for (const c of e.connections ?? []) {
        if (ids.has(c.target_concept_id) && ids.has(e.concept_id)) {
          const lab = typeof c.label === 'string' ? c.label : ''
          edges.push({
            id: `${e.concept_id}→${c.target_concept_id}`,
            source: e.concept_id,
            target: c.target_concept_id,
            label: lab,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#c0392b', strokeWidth: 2 },
          })
        }
      }
    }
    return { nodes, edges }
  }, [subset, rootId, highlightIds])

  return (
    <div
      data-testid="compact-flow"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'rgba(248,249,250,0.98)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 510,
          display: 'flex',
          gap: 8,
        }}
      >
        <button type="button" onClick={onClose} style={{ padding: '8px 14px', fontWeight: 600 }}>
          ← {t('backToMap')}
        </button>
      </div>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView={false} minZoom={0.05}>
        <FitOnMount />
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
