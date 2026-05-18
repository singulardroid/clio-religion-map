import type { CSSProperties } from 'react'

import { useI18n } from '../i18n'
import type { HighlightDirection } from '../graphHighlight'
import { controlButton, glassPanel, theme } from '../theme'

export function HighlightPanel({
  active,
  direction,
  depth,
  includeSiblings,
  count,
  onDepthChange,
  onClear,
  onCompact,
}: {
  active: boolean
  direction: HighlightDirection | null
  depth: number
  includeSiblings: boolean
  count: number
  onDepthChange: (d: number) => void
  onClear: () => void
  onCompact: () => void
}) {
  const { t } = useI18n()
  if (!active) return null

  return (
    <div
      data-testid="highlight-panel"
      style={{
        position: 'fixed',
        top: 100,
        right: 12,
        width: 200,
        zIndex: 199,
        padding: 14,
        ...glassPanel,
        borderRadius: 18,
        fontSize: 12,
        color: theme.ink,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{t('highlightPanel')}</div>
      <div style={{ marginBottom: 6 }}>
        {direction ?? '—'} · {t('depth')} {depth}
      </div>
      <div style={{ marginBottom: 8 }}>
        {count} {t('nodesHighlighted')}
        {includeSiblings ? ' · siblings' : ''}
      </div>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <span>{t('depth')}</span>
        <input
          type="range"
          min={1}
          max={10}
          value={depth}
          data-testid="highlight-depth"
          onChange={(e) => onDepthChange(Number(e.target.value))}
        />
        <span>{depth}</span>
      </label>
      <button
        type="button"
        data-testid="make-compact-view"
        disabled={count === 0}
        onClick={onCompact}
        style={btnPrimary}
      >
        {t('makeCompactView')}
      </button>
      <button type="button" data-testid="clear-highlight" onClick={onClear} style={btnSecondary}>
        {t('clearHighlight')}
      </button>
    </div>
  )
}

const btnPrimary: CSSProperties = {
  display: 'block',
  width: '100%',
  marginBottom: 6,
  padding: '8px 10px',
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  borderRadius: 999,
  background: theme.accent,
  color: '#fff',
}

const btnSecondary: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '6px 10px',
  cursor: 'pointer',
  ...controlButton,
}

