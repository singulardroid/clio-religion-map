import fs from 'node:fs'

import {
  phase2FixtureChapter,
  phase2FixtureOverlay,
  repoRoot,
} from './repo-paths'

export type Phase2FixtureEvent = {
  concept_id: string
  locales?: {
    en?: { statement?: string; quote?: string }
    ru?: { statement?: string; quote?: string }
  }
}

export function loadPhase2FixtureChapter(): {
  chapter_id: string
  events: Phase2FixtureEvent[]
} {
  return JSON.parse(fs.readFileSync(phase2FixtureChapter, 'utf8')) as {
    chapter_id: string
    events: Phase2FixtureEvent[]
  }
}

export function loadPhase2FixtureOverlay(): { by_concept_id: Record<string, unknown> } {
  return JSON.parse(fs.readFileSync(phase2FixtureOverlay, 'utf8')) as {
    by_concept_id: Record<string, unknown>
  }
}

export function compileScriptPath(): string {
  return `${repoRoot}/scripts/compile_events.py`
}

export function parseEpubScriptPath(): string {
  return `${repoRoot}/scripts/parse_epub.py`
}

export function exportIssuesScriptPath(): string {
  return `${repoRoot}/scripts/export_issues_for_review.py`
}
