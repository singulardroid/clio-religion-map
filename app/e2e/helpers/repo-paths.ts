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
