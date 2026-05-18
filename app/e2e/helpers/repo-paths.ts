import path from 'node:path'
import { fileURLToPath } from 'node:url'

const helpersDir = path.dirname(fileURLToPath(import.meta.url))

/** `/app` */
export const appDir = path.join(helpersDir, '..', '..')

/** Monorepo root (`clio-religion-map/`) */
export const repoRoot = path.join(appDir, '..')

export const scratchReligionMap = path.join(repoRoot, '.scratch', 'religion-map')
export const scratchPrd = path.join(scratchReligionMap, 'PRD.md')
export const scratchIssuesDir = path.join(scratchReligionMap, 'issues')

export const scratchPhase2 = path.join(repoRoot, '.scratch', 'religion-map-phase-2')
export const scratchPhase2Prd = path.join(scratchPhase2, 'PRD.md')
export const scratchPhase2IssuesDir = path.join(scratchPhase2, 'issues')

export const phase2FixturesDir = path.join(repoRoot, 'tests', 'fixtures', 'phase2')
export const phase2FixtureChapter = path.join(phase2FixturesDir, 'ch99-phase2-events.json')
export const phase2FixtureOverlay = path.join(phase2FixturesDir, 'event-overlays.json')
export const phase2FixtureEpubInputs = phase2FixturesDir
