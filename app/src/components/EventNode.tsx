import React, { useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import type { ReligionEvent } from '../types'

interface EventNodeData {
  event: ReligionEvent
  eraColor: string
  laneRow?: number
}

export function EventNode({ data }: NodeProps<EventNodeData>) {
  const { event, eraColor } = data
  const [expanded, setExpanded] = useState(false)

  const borderColor = event.is_first_occurrence ? '#e67e22' : '#7f8c8d'

  return (
    <div
      data-testid="event-node"
      data-event-concept-id={event.concept_id}
      data-first-occurrence={event.is_first_occurrence === true ? 'true' : 'false'}
      data-dead-end={event.is_dead_end === true ? 'true' : 'false'}
      onClick={() => setExpanded((v) => !v)}
      style={{
        width: 260,
        background: eraColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 6,
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Territory Header Bar */}
      <div
        style={{
          background: 'rgba(255,255,255,0.85)',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          padding: '4px 10px',
          fontSize: 10,
          fontWeight: 700,
          color: 'rgba(0,0,0,0.65)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {event.territory}
        {event.precise_location ? ` — ${event.precise_location}` : ''}
      </div>

      <div style={{ padding: '8px 10px' }}>
        {/* First-occurrence badge */}
        {event.is_first_occurrence && (
          <span
            style={{
              position: 'absolute',
              top: 24,
              right: 6,
              background: '#e67e22',
              color: '#fff',
              fontSize: 9,
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: 3,
              letterSpacing: 0.5,
            }}
          >
            ВПЕРВЫЕ
          </span>
        )}

        {/* Period */}
        <div style={{ color: '#555', fontWeight: 600, marginBottom: 2, fontSize: 10 }}>
          {event.period ?? '—'}
        </div>

        {/* Statement / body */}
        <div style={{ fontWeight: 700, fontSize: 11.5, lineHeight: 1.35, marginBottom: 4 }}>
          {event.statement ?? event.description ?? event.name ?? '—'}
        </div>

        {/* Tags row */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Tag color="#27ae60">{event.religion ?? '—'}</Tag>
          {event.is_dead_end && <Tag color="#c0392b">Тупик</Tag>}
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div
            style={{
              marginTop: 8,
              borderTop: '1px solid rgba(0,0,0,0.1)',
              paddingTop: 6,
              fontSize: 10.5,
              color: '#333',
            }}
          >
            <em style={{ display: 'block', marginBottom: 4, color: '#555' }}>
              {event.quote ? `«${event.quote}»` : null}
            </em>
            {event.source_ref ? <div style={{ color: '#777' }}>{event.source_ref}</div> : null}
            
            {/* Map Links */}
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.precise_location || event.territory)}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: '#3498db', textDecoration: 'none', fontWeight: 600, fontSize: 10 }}
              >
                📍 Google Maps
              </a>
              {event.seshat?.nga_name && (
                <a 
                  href="https://seshat-db.com/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: '#9b59b6', textDecoration: 'none', fontWeight: 600, fontSize: 10 }}
                  title={event.seshat.polity_name ? `Polity: ${event.seshat.polity_name}` : 'NGA Match'}
                >
                  🏛️ Seshat: {event.seshat.nga_name}{' '}
                  {event.seshat.polity_name && `(${event.seshat.polity_name})`}
                </a>
              )}
            </div>

            {(event.connections?.length ?? 0) > 0 && (
              <div style={{ marginTop: 6 }}>
                <strong>Связи:</strong>
                <ul style={{ margin: '2px 0 0 14px', padding: 0 }}>
                  {(event.connections ?? []).map((c) => (
                    <li key={c.target_concept_id} style={{ fontSize: 10 }}>
                      → {c.target_concept_id}: {c.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {event.references && event.references.length > 0 && (
            <div style={{ marginTop: 6, borderTop: '1px dashed rgba(0,0,0,0.12)', paddingTop: 5 }}>
              <strong style={{ fontSize: 10 }}>Литература:</strong>
              <ol style={{ margin: '3px 0 0 14px', padding: 0 }}>
                {event.references.map((ref, idx) =>
                  typeof ref === 'string' ? (
                    <li
                      key={`rf-${idx}`}
                      style={{
                        fontSize: 9.5,
                        color: '#444',
                        lineHeight: 1.4,
                        marginBottom: 2,
                        fontFamily: 'Georgia, serif',
                      }}
                    >
                      {ref}
                    </li>
                  ) : (
                    <li
                      key={`rf-${ref.num}-${idx}`}
                      value={ref.num}
                      style={{
                        fontSize: 9.5,
                        color: '#444',
                        lineHeight: 1.4,
                        marginBottom: 2,
                        fontFamily: 'Georgia, serif',
                      }}
                      dangerouslySetInnerHTML={{ __html: ref.text }}
                    />
                  ),
                )}
              </ol>
            </div>
          )}
        </div>
      )}
      </div>

      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  )
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      style={{
        background: color + '22',
        color,
        border: `1px solid ${color}55`,
        borderRadius: 3,
        padding: '0 5px',
        fontSize: 9,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
