import type { Connection, EventLocaleFields, LocaleCode, ReligionEvent } from './types'

const DISPLAY_KEYS: (keyof EventLocaleFields)[] = ['statement', 'description', 'quote']

export function ensureEventLocales(event: ReligionEvent): ReligionEvent {
  if (event.locales?.ru || event.locales?.en) return event
  const ru: EventLocaleFields = {}
  for (const k of [
    'statement',
    'description',
    'name',
    'quote',
    'period',
    'religion',
    'source_ref',
    'chapter_title',
    'precise_location',
    'era',
  ] as const) {
    const v = event[k]
    if (typeof v === 'string' && v.trim()) ru[k] = v
  }
  return { ...event, locales: { ru, en: {} } }
}

export function localeBlock(event: ReligionEvent, code: LocaleCode): EventLocaleFields {
  const e = ensureEventLocales(event)
  return e.locales?.[code] ?? {}
}

export function localeDisplayComplete(
  block: EventLocaleFields,
  sourceBlock: EventLocaleFields,
): boolean {
  if (!block.statement && !block.description && !block.quote) return false
  if ((sourceBlock.statement || sourceBlock.description) && !block.statement && !block.description) {
    return false
  }
  if ((sourceBlock.quote ?? '').trim() && !(block.quote ?? '').trim()) return false
  if ((sourceBlock.source_ref ?? '').trim() && !(block.source_ref ?? '').trim()) return false
  return true
}

export function isCompleteForLocale(event: ReligionEvent, code: LocaleCode): boolean {
  const block = localeBlock(event, code)
  const hasDisplay = DISPLAY_KEYS.some((k) => (block[k] ?? '').toString().trim())
  if (!hasDisplay) return false
  return localeDisplayComplete(block, block)
}

export function connectionLabel(conn: Connection, code: LocaleCode): string {
  const lab = conn.label
  if (typeof lab === 'string') return lab
  return (lab[code] ?? lab.en ?? lab.ru ?? '').trim()
}

export function resolveEventForLocale(event: ReligionEvent, code: LocaleCode): ReligionEvent {
  const block = localeBlock(event, code)
  const flat: ReligionEvent = {
    ...event,
    statement: block.statement ?? event.statement,
    description: block.description ?? event.description,
    name: block.name ?? event.name,
    quote: block.quote ?? event.quote,
    period: block.period ?? event.period,
    religion: block.religion ?? event.religion,
    source_ref: block.source_ref ?? event.source_ref,
    chapter_title: block.chapter_title ?? event.chapter_title,
    precise_location: block.precise_location ?? event.precise_location,
    era: block.era ?? event.era,
    connections: (event.connections ?? []).map((c) => ({
      ...c,
      label: connectionLabel(c, code),
    })),
    _active_locale: code,
  }
  return flat
}

export function filterEventsForLocale(events: ReligionEvent[], code: LocaleCode): ReligionEvent[] {
  return events.filter((e) => isCompleteForLocale(e, code)).map((e) => resolveEventForLocale(e, code))
}

export function openIssueCount(event: ReligionEvent): number {
  return (event.editorial?.issues ?? []).filter((i) => !i.resolved).length
}
