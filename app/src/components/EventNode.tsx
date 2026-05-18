import React, { useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

import { useEditorial } from '../EditorialContext'
import { ISSUE_TAG_IDS } from '../editorial'
import { useI18n } from '../i18n'
import { openIssueCount, resolveEventForLocale } from '../locale'
import type { LocaleCode, ReligionEvent } from '../types'
import { displayTerritoryName, theme } from '../theme'

interface EventNodeData {
  event: ReligionEvent
  eraColor: string
  laneRow?: number
  expanded?: boolean
  onToggleExpanded?: (conceptId: string) => void
}

export function EventNode({ data }: NodeProps<EventNodeData>) {
  const { event, eraColor } = data
  const expanded = data.expanded === true
  const [showOther, setShowOther] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const { locale, t } = useI18n()
  const editorial = useEditorial()

  const borderColor = event.is_first_occurrence ? theme.gold : 'rgba(100,116,139,0.55)'
  const issuesOpen = openIssueCount(event)
  const otherLocale: LocaleCode = locale === 'en' ? 'ru' : 'en'
  const otherResolved = resolveEventForLocale(event, otherLocale)
  const volumeTone = volumeToneFor(event.volume)
  const volumeLabel = volumeLabelFor(event.volume)

  return (
    <div
      data-testid="event-node"
      data-event-concept-id={event.concept_id}
      data-first-occurrence={event.is_first_occurrence === true ? 'true' : 'false'}
      data-dead-end={event.is_dead_end === true ? 'true' : 'false'}
      onClick={() => data.onToggleExpanded?.(event.concept_id)}
      style={{
        width: 268,
        background: `linear-gradient(180deg, ${volumeTone.top}, ${volumeTone.bottom}), ${eraColor}`,
        border: `1px solid ${issuesOpen ? theme.issue : borderColor}`,
        borderLeft: `4px solid ${issuesOpen ? theme.issue : borderColor}`,
        borderRadius: 16,
        cursor: 'pointer',
        boxShadow: '0 16px 36px rgba(15,23,42,0.16)',
        position: 'relative',
        overflow: 'hidden',
        color: theme.ink,
        fontFamily: theme.font,
      }}
    >
      {issuesOpen > 0 && (
        <span
          data-testid="open-issue-badge"
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            background: theme.issue,
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
            padding: '1px 5px',
            borderRadius: 3,
          }}
        >
          {issuesOpen}
        </span>
      )}
      {volumeLabel && (
        <span
          data-testid="volume-badge"
          style={{
            position: 'absolute',
            right: 8,
            bottom: 6,
            background: volumeTone.badge,
            color: '#fff',
            fontSize: 9,
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: 999,
            zIndex: 2,
            boxShadow: '0 4px 10px rgba(15,23,42,0.14)',
          }}
        >
          {volumeLabel}
        </span>
      )}

      <div
        style={{
          background: 'rgba(248,250,252,0.84)',
          borderBottom: `1px solid ${theme.line}`,
          padding: '6px 12px',
          fontSize: 10,
          fontWeight: 800,
          color: theme.muted,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {displayTerritoryName(event.territory, locale)}
        {event.precise_location ? ` — ${event.precise_location}` : ''}
      </div>

      <div style={{ padding: '10px 12px 12px' }}>
        {event.is_first_occurrence && (
          <span
            style={{
              position: 'absolute',
              top: 24,
              right: 6,
              background: theme.gold,
              color: '#fff',
              fontSize: 9,
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: 3,
            }}
          >
            {locale === 'ru' ? 'ВПЕРВЫЕ' : 'FIRST'}
          </span>
        )}

        <div style={{ color: theme.muted, fontWeight: 700, marginBottom: 4, fontSize: 10 }}>
          {event.period ?? '—'}
        </div>

        <div style={{ fontWeight: 750, fontSize: 12, lineHeight: 1.38, marginBottom: 8 }}>
          {event.statement ?? event.description ?? event.name ?? '—'}
        </div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Tag color="#27ae60">{event.religion ?? '—'}</Tag>
          {event.is_dead_end && <Tag color="#c0392b">Dead end</Tag>}
        </div>

        {expanded && (
          <div
            style={{
              marginTop: 8,
              borderTop: `1px solid ${theme.line}`,
              paddingTop: 8,
              fontSize: 10.5,
              color: theme.ink,
            }}
          >
            <em style={{ display: 'block', marginBottom: 4, color: '#555' }}>
              {event.quote ? `«${event.quote}»` : null}
            </em>
            {event.source_ref ? <div style={{ color: theme.muted }}>{event.source_ref}</div> : null}

            <div style={{ marginTop: 8 }}>
              <strong>{locale === 'ru' ? 'Локация:' : 'Location:'}</strong>{' '}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  event.precise_location || event.territory || '',
                )}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Google Maps
              </a>
            </div>

            {event.seshat?.nga_name && (
              <div style={{ marginTop: 6 }}>
                <strong>Seshat NGA:</strong>{' '}
                <a
                  href={`https://seshat-db.com/core/ngas/${encodeURIComponent(
                    event.seshat.nga_id || event.seshat.nga_name,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Seshat {event.seshat.nga_name}
                </a>
              </div>
            )}

            {Array.isArray(event.references) && event.references.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <strong>{locale === 'ru' ? 'Литература:' : 'Bibliography:'}</strong>
                <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
                  {event.references.map((ref, idx) => {
                    const text =
                      typeof ref === 'string'
                        ? ref
                        : `${ref.num ? `${ref.num}. ` : ''}${ref.text ?? ''}`
                    return (
                      <li key={idx} style={{ marginBottom: 3 }}>
                        {text}
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}

            <button
              type="button"
              data-testid="show-other-languages"
              onClick={(e) => {
                e.stopPropagation()
                setShowOther((v) => !v)
              }}
              style={{
                marginTop: 6,
                fontSize: 10,
                border: 'none',
                background: 'transparent',
                color: theme.accent,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {t('showOtherLanguages')}
            </button>

            {showOther && (
              <div
                data-testid="other-locale-block"
                style={{
                  marginTop: 6,
                  padding: 6,
                  background: theme.accentSoft,
                  borderRadius: 12,
                }}
              >
                <strong style={{ fontSize: 10 }}>{otherLocale.toUpperCase()}</strong>
                <div style={{ fontSize: 10, marginTop: 4 }}>
                  {otherResolved.statement ?? otherResolved.description ?? '—'}
                </div>
                {otherResolved.quote && (
                  <em style={{ fontSize: 9.5, display: 'block', marginTop: 4 }}>
                    «{otherResolved.quote}»
                  </em>
                )}
              </div>
            )}

            {(event.editorial?.comments?.length ?? 0) > 0 && (
              <div style={{ marginTop: 8 }}>
                <strong>{t('comments')}</strong>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {event.editorial!.comments.map((c) => (
                    <li key={c.id} style={{ fontSize: 10, marginBottom: 4 }}>
                      {c.body}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!editorial.readonly && (
              <div style={{ marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
                <textarea
                  data-testid="editorial-comment-input"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder={t('addComment')}
                  style={{ width: '100%', minHeight: 48, fontSize: 10 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!commentDraft.trim()) return
                    editorial.onAddComment(event.concept_id, commentDraft.trim())
                    setCommentDraft('')
                  }}
                  style={{ marginTop: 4, fontSize: 10 }}
                >
                  {t('addComment')}
                </button>
                <div style={{ marginTop: 8 }}>
                  <strong>{t('issueTags')}</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    {ISSUE_TAG_IDS.map((tag) => {
                      const active = (event.editorial?.issues ?? []).some(
                        (i) => i.tag === tag && !i.resolved,
                      )
                      return (
                        <button
                          key={tag}
                          type="button"
                          data-testid={`issue-tag-${tag}`}
                          onClick={() => editorial.onToggleIssue(event.concept_id, tag)}
                          style={{
                            fontSize: 9,
                            padding: '2px 6px',
                            borderRadius: 4,
                            border: '1px solid #999',
                            background: active ? theme.issue : '#fff',
                            color: active ? '#fff' : theme.ink,
                            cursor: 'pointer',
                          }}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="export-overlay"
                  onClick={() => editorial.onExportOverlay()}
                  style={{ marginTop: 8, fontSize: 10 }}
                >
                  {t('exportOverlay')}
                </button>
              </div>
            )}

            {(event.connections?.length ?? 0) > 0 && (
              <div style={{ marginTop: 6 }}>
                <strong>Links:</strong>
                <ul style={{ margin: '2px 0 0 14px', padding: 0 }}>
                  {(event.connections ?? []).map((c) => (
                    <li key={c.target_concept_id} style={{ fontSize: 10 }}>
                      → {c.target_concept_id}: {typeof c.label === 'string' ? c.label : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <Handle id="target-left" type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle id="target-right" type="target" position={Position.Right} style={{ opacity: 0 }} />
      <Handle id="target-top" type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle id="target-bottom" type="target" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle id="source-left" type="source" position={Position.Left} style={{ opacity: 0 }} />
      <Handle id="source-right" type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle id="source-top" type="source" position={Position.Top} style={{ opacity: 0 }} />
      <Handle id="source-bottom" type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  )
}

function volumeLabelFor(volume: number | undefined): string | null {
  if (volume === 1) return 'Vol I'
  if (volume === 2) return 'Vol II'
  if (volume === 3) return 'Vol III'
  return null
}

function volumeToneFor(volume: number | undefined): { top: string; bottom: string; badge: string } {
  if (volume === 1) {
    return {
      top: 'rgba(255,251,235,0.98)',
      bottom: 'rgba(255,247,237,0.92)',
      badge: '#b45309',
    }
  }
  if (volume === 2) {
    return {
      top: 'rgba(239,246,255,0.98)',
      bottom: 'rgba(219,234,254,0.88)',
      badge: '#2563eb',
    }
  }
  if (volume === 3) {
    return {
      top: 'rgba(240,253,244,0.98)',
      bottom: 'rgba(220,252,231,0.88)',
      badge: '#16a34a',
    }
  }
  return {
    top: 'rgba(255,255,255,0.96)',
    bottom: 'rgba(255,255,255,0.90)',
    badge: theme.muted,
  }
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
