export type LocaleCode = 'en' | 'ru'

export interface SeshatStub {
  nga_name: string | null
  polity_name: string | null
  year_from: number | null
  year_to: number | null
  mapping_confidence: 'low' | 'medium' | 'high'
  nga_id: string | null
  polity_id: string | null
  religion_id: string | null
  enriched: boolean
}

export interface LocalizedConnectionLabel {
  en?: string
  ru?: string
}

export interface Connection {
  target_concept_id: string
  label: string | LocalizedConnectionLabel
}

export interface Reference {
  num: number
  text: string
}

export interface EventLocaleFields {
  statement?: string
  description?: string
  name?: string
  quote?: string
  period?: string
  religion?: string
  source_ref?: string
  chapter_title?: string
  precise_location?: string
  era?: string
}

export interface EventLocales {
  en?: EventLocaleFields
  ru?: EventLocaleFields
}

export type IssueTagId =
  | 'missing_time'
  | 'missing_description'
  | 'wrong_time'
  | 'wrong_band'
  | 'wrong_connection'
  | 'needs_source_check'
  | 'duplicate_concept'

export interface EditorialIssue {
  tag: IssueTagId
  note?: string
  created_at: string
  resolved: boolean
}

export interface EventComment {
  id: string
  created_at: string
  author?: string
  body: string
}

export interface EditorialOverlay {
  position?: { x: number; y: number }
  comments: EventComment[]
  issues: EditorialIssue[]
}

export interface ReligionEvent {
  concept_id: string
  territory: string
  locales?: EventLocales
  /** Flattened fields for active locale (compile may also leave legacy top-level) */
  statement?: string
  description?: string
  name?: string
  period?: string
  era?: string
  religion?: string
  precise_location?: string
  quote?: string
  source_ref?: string
  is_first_occurrence?: boolean
  first_occurrence_type?: 'explicit' | 'implicit'
  is_dead_end?: boolean
  connections?: Connection[]
  references?: Array<Reference | string>
  seshat?: SeshatStub
  year_from?: number | null
  year_to?: number | null
  volume?: number
  chapter_num?: number | null
  chapter_title?: string | null | ''
  editorial?: EditorialOverlay
  _active_locale?: LocaleCode
}
