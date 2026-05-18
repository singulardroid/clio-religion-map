import type { CSSProperties, ReactNode } from 'react'

import { useI18n } from '../i18n'
import { TERRITORIES } from '../config'
import type { LocaleCode } from '../types'
import { controlButton, displayTerritoryName, glassPanel, theme } from '../theme'

const filterSelectSx: CSSProperties = {
  maxWidth: 140,
  minWidth: 0,
  boxSizing: 'border-box',
  padding: '7px 30px 7px 10px',
  fontSize: 13,
  fontFamily: 'inherit',
  borderRadius: 999,
  border: `1px solid ${theme.line}`,
  backgroundColor: 'rgba(255,255,255,0.82)',
  color: theme.ink,
  cursor: 'pointer',
  outline: 'none',
}

const labelCaps: CSSProperties = {
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: '0.06em',
  color: theme.muted,
  textTransform: 'uppercase',
}

const rowLabel: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  margin: 0,
}

const rowKey: CSSProperties = { fontSize: 12, color: theme.muted, minWidth: 52 }

export function MapToolbar({
  volFilter,
  setVolFilter,
  terrFilter,
  setTerrFilter,
  firstOnly,
  setFirstOnly,
  openIssuesOnly,
  setOpenIssuesOnly,
  onFit,
  onReset,
  showOpenIssuesFilter,
  mapStatusOpen,
  onToggleMapStatus,
}: {
  volFilter: 'all' | 1 | 2 | 3
  setVolFilter: (v: 'all' | 1 | 2 | 3) => void
  terrFilter: string
  setTerrFilter: (v: string) => void
  firstOnly: boolean
  setFirstOnly: (v: boolean) => void
  openIssuesOnly: boolean
  setOpenIssuesOnly: (v: boolean) => void
  onFit: () => void
  onReset: () => void
  showOpenIssuesFilter: boolean
  mapStatusOpen: boolean
  onToggleMapStatus: () => void
}) {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      data-testid="map-toolbar"
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        zIndex: 200,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        maxWidth: 'min(920px, calc(100vw - 24px))',
        padding: '12px 14px',
        ...glassPanel,
        borderRadius: 22,
        fontFamily: theme.font,
        fontSize: 13,
        color: theme.ink,
      }}
    >
      <div
        data-testid="filter-panel"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}
      >
        <span style={labelCaps}>{t('filters')}</span>
        <label style={rowLabel}>
          <span style={rowKey}>{t('volume')}</span>
          <select
            value={volFilter}
            aria-label={t('volume')}
            onChange={(e) =>
              setVolFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2 | 3))
            }
            style={filterSelectSx}
          >
            <option value="all">{t('all')}</option>
            <option value="1">I</option>
            <option value="2">II</option>
            <option value="3">III</option>
          </select>
        </label>
        <label style={rowLabel}>
          <span style={rowKey}>{t('region')}</span>
          <select
            value={terrFilter}
            aria-label={t('region')}
            onChange={(e) => setTerrFilter(e.target.value)}
            style={filterSelectSx}
          >
            <option value="all">{t('allLanes')}</option>
            {TERRITORIES.map((ter) => (
              <option key={ter.name} value={ter.name}>
                {displayTerritoryName(ter.name, locale)}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={firstOnly}
            onChange={(e) => setFirstOnly(e.target.checked)}
          />
          <span style={{ fontSize: 12 }}>{t('firstOnly')}</span>
        </label>
        {showOpenIssuesFilter && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              data-testid="filter-open-issues"
              checked={openIssuesOnly}
              onChange={(e) => setOpenIssuesOnly(e.target.checked)}
            />
            <span style={{ fontSize: 12 }}>{t('openIssuesOnly')}</span>
          </label>
        )}
      </div>

      <div style={{ width: 1, alignSelf: 'stretch', background: theme.line }} />

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        <span>{t('language')}</span>
        <select
          data-testid="lang-switcher"
          value={locale}
          onChange={(e) => setLocale(e.target.value as LocaleCode)}
          style={{ ...filterSelectSx, maxWidth: 72 }}
        >
          <option value="en">EN</option>
          <option value="ru">RU</option>
        </select>
      </label>

      <ToolbarButton dataTestId="toolbar-fit-view" onClick={onFit} title={t('fitView')}>
        ⛶ {t('fitView')}
      </ToolbarButton>
      <ToolbarButton dataTestId="toolbar-reset-layout" onClick={onReset} title={t('resetLayout')}>
        ⟳ {t('resetLayout')}
      </ToolbarButton>

      <button
        type="button"
        data-testid="toolbar-help"
        title={t('mapStatusTooltip')}
        aria-expanded={mapStatusOpen}
        aria-controls="map-status-popover"
        onClick={(e) => {
          e.stopPropagation()
          onToggleMapStatus()
        }}
        style={{
          ...controlButton,
          width: 24,
          height: 24,
          borderRadius: '50%',
          cursor: 'pointer',
          fontWeight: 400,
          fontSize: 11,
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontStyle: 'italic',
          lineHeight: 1,
          padding: 0,
          color: theme.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        i
      </button>
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
  children: ReactNode
  dataTestId?: string
}) {
  return (
    <button
      type="button"
      data-testid={dataTestId}
      onClick={onClick}
      title={title}
      style={{
        ...controlButton,
        padding: '7px 14px',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  )
}
