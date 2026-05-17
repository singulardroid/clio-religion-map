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

export interface Connection {
  target_concept_id: string
  label: string
}

export interface Reference {
  num: number
  text: string
}

export interface ReligionEvent {
  concept_id: string
  territory: string
  precise_location?: string
  /** Primary heading (concept map / enrichment pipeline) */
  statement?: string
  /** Fallback body text (volume import pipeline) */
  description?: string
  name?: string
  period?: string
  era?: string
  religion?: string
  is_first_occurrence?: boolean
  first_occurrence_type?: 'explicit' | 'implicit'
  quote?: string
  source_ref?: string
  is_dead_end?: boolean
  /** Graph edges — absent on some imported volume records */
  connections?: Connection[]
  /** Structured notes or plain strings depending on pipeline */
  references?: Array<Reference | string>
  /** Omitted until Seshat mapping is run for this event */
  seshat?: SeshatStub
  /** Raw chronology from volume import when seshat is absent */
  year_from?: number | null
  year_to?: number | null
  // injected by compile_events.py
  volume?: number
  chapter_num?: number | null
  chapter_title?: string | null | ''
}
