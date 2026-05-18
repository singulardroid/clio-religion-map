import type { EditorialIssue, EditorialOverlay, EventComment, IssueTagId, ReligionEvent } from './types'

export const ISSUE_TAG_IDS: IssueTagId[] = [
  'missing_time',
  'missing_description',
  'wrong_time',
  'wrong_band',
  'wrong_connection',
  'needs_source_check',
  'duplicate_concept',
]

export type OverlayFile = {
  by_concept_id: Record<string, EditorialOverlay>
}

export function overlayFromEvents(events: ReligionEvent[]): OverlayFile {
  const by_concept_id: Record<string, EditorialOverlay> = {}
  for (const e of events) {
    const ed = e.editorial
    if (!ed) continue
    if (
      ed.position ||
      (ed.comments?.length ?? 0) > 0 ||
      (ed.issues?.length ?? 0) > 0
    ) {
      by_concept_id[e.concept_id] = {
        position: ed.position,
        comments: ed.comments ?? [],
        issues: ed.issues ?? [],
      }
    }
  }
  return { by_concept_id }
}

export function downloadOverlayJson(overlay: OverlayFile, filename = 'event-overlays.json') {
  const blob = new Blob([JSON.stringify(overlay, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function newComment(body: string, author?: string): EventComment {
  return {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    author,
    body,
  }
}

export function newIssue(tag: IssueTagId, note?: string): EditorialIssue {
  return {
    tag,
    note,
    created_at: new Date().toISOString(),
    resolved: false,
  }
}
