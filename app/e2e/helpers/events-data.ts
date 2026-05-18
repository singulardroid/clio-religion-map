import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Compiled SPA payload.
 * Keep POSITION_STORAGE_KEY in sync with `app/src/persistence.ts`.
 */
export const POSITION_STORAGE_KEY = 'clio-node-positions-v5-chart-autosize'

export type CompiledEvent = {
  concept_id: string
  territory?: string
  precise_location?: string
  is_first_occurrence?: boolean
  is_dead_end?: boolean
  period?: string
  statement?: string
  description?: string
  name?: string
  quote?: string
  source_ref?: string
  references?: unknown[]
  connections?: Array<{ target_concept_id: string; label?: string }>
  locales?: Record<string, Record<string, string>>
  seshat?: { nga_name?: string | null }
}

const helpersDir = path.dirname(fileURLToPath(import.meta.url))
const eventsPath = path.join(helpersDir, '..', '..', 'src', 'data', 'events.json')

export function loadCompiledEventsPath(): string {
  return eventsPath
}

export function loadCompiledEvents(): CompiledEvent[] {
  const raw = fs.readFileSync(eventsPath, 'utf8')
  return JSON.parse(raw) as CompiledEvent[]
}

export type LocaleCode = 'en' | 'ru'

function localeBlock(event: CompiledEvent, code: LocaleCode): Record<string, string> {
  return event.locales?.[code] ?? {}
}

function localeComplete(event: CompiledEvent, code: LocaleCode): boolean {
  const block = localeBlock(event, code)
  if (!block.statement && !block.description && !block.quote) return false
  if ((block.statement || block.description) && !block.statement && !block.description) return false
  if (block.quote && !block.quote) return false
  if (block.source_ref && !block.source_ref) return false
  return true
}

export function resolveCompiledEventForLocale(
  event: CompiledEvent,
  code: LocaleCode,
): CompiledEvent {
  const block = localeBlock(event, code)
  return {
    ...event,
    period: block.period ?? event.period,
    statement: block.statement ?? event.statement,
    description: block.description ?? event.description,
    name: block.name ?? event.name,
    quote: block.quote ?? event.quote,
    source_ref: block.source_ref ?? event.source_ref,
    precise_location: block.precise_location ?? event.precise_location,
    connections: (event.connections ?? []).map((conn) => {
      const label = conn.label
      if (!label || typeof label === 'string') return conn
      return { ...conn, label: label[code] ?? label.en ?? label.ru ?? '' }
    }),
  }
}

export function loadVisibleEvents(code: LocaleCode = 'en'): CompiledEvent[] {
  return loadCompiledEvents()
    .filter((event) => localeComplete(event, code))
    .map((event) => resolveCompiledEventForLocale(event, code))
}

/** Edges emitted by SPA when both endpoints exist (same logic as compile graph). */
export function countRenderableEdges(events: CompiledEvent[]): number {
  const ids = new Set(events.map((e) => e.concept_id))
  let n = 0
  for (const e of events) {
    for (const c of e.connections ?? []) {
      if (ids.has(c.target_concept_id)) n++
    }
  }
  return n
}

export function compileEventsReadable(): boolean {
  return fs.existsSync(eventsPath)
}
