import type { CSSProperties } from 'react'
import type { LocaleCode } from './types'

export const theme = {
  font:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  bg: '#f6f3ee',
  ink: '#1f2937',
  muted: '#64748b',
  panel: 'rgba(255, 255, 255, 0.84)',
  panelStrong: 'rgba(255, 255, 255, 0.94)',
  line: 'rgba(30, 41, 59, 0.12)',
  accent: '#2563eb',
  accentSoft: 'rgba(37, 99, 235, 0.11)',
  gold: '#d97706',
  issue: '#7c3aed',
  shadow: '0 18px 45px rgba(15, 23, 42, 0.13)',
  shadowSoft: '0 8px 24px rgba(15, 23, 42, 0.10)',
}

export const glassPanel: CSSProperties = {
  background: theme.panel,
  border: `1px solid ${theme.line}`,
  boxShadow: theme.shadow,
  backdropFilter: 'blur(18px) saturate(1.15)',
  WebkitBackdropFilter: 'blur(18px) saturate(1.15)',
}

export const controlButton: CSSProperties = {
  border: `1px solid ${theme.line}`,
  background: theme.panelStrong,
  color: theme.ink,
  borderRadius: 999,
  cursor: 'pointer',
  boxShadow: theme.shadowSoft,
}

const TERRITORY_EN: Record<string, string> = {
  'Доисторический / Глобальный': 'Prehistoric / Global',
  Месопотамия: 'Mesopotamia',
  Египет: 'Egypt',
  'Иран / Персия': 'Iran / Persia',
  Индия: 'India',
  Китай: 'China',
  Греция: 'Greece',
  'Израиль / Ханаан': 'Israel / Canaan',
  Рим: 'Rome',
  Аравия: 'Arabia',
  'Кельты / Германцы': 'Celts / Germanic peoples',
  'Евразийская степь': 'Eurasian Steppe',
  'Западная Европа': 'Western Europe',
  Тибет: 'Tibet',
}

const ERA_EN: Record<string, string> = {
  'Древний палеолит': 'Early Paleolithic',
  Палеолит: 'Paleolithic',
  Неолит: 'Neolithic',
  'Ранняя бронза': 'Early Bronze Age',
  'Поздняя бронза': 'Late Bronze Age',
  'Железный век': 'Iron Age',
  'Осевое время': 'Axial Age',
  'Эллинистический период': 'Hellenistic Period',
  'Поздняя античность': 'Late Antiquity',
  'Раннее средневековье': 'Early Middle Ages',
  'Высокое средневековье': 'High Middle Ages',
  'Позднее средневековье': 'Late Middle Ages',
  Реформация: 'Reformation',
  'Новое время': 'Early Modern / Modern',
}

export function displayTerritoryName(name: string, locale: LocaleCode): string {
  return locale === 'en' ? TERRITORY_EN[name] ?? name : name
}

export function displayEraName(name: string, locale: LocaleCode): string {
  return locale === 'en' ? ERA_EN[name] ?? name : name
}

export function formatYear(year: number, locale: LocaleCode): string {
  if (year === 0) return locale === 'ru' ? '1 н.э.' : '1 CE'
  if (year < 0) return locale === 'ru' ? `${Math.abs(year)} до н.э.` : `${Math.abs(year)} BCE`
  return locale === 'ru' ? `${year} н.э.` : `${year} CE`
}
