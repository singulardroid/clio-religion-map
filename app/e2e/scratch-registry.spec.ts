import fs from 'node:fs'

import { test, expect } from '@playwright/test'

import { scratchIssuesDir, scratchPrd } from './helpers/repo-paths'

/**
 * Every PRD/issue artifact under `.scratch/religion-map/` must stay on disk
 * so the Playwright suite remains aligned with tracked product intent.
 *
 * Paths mirror `docs/agents/issue-tracker.md`.
 */
test.describe('Scratch artifact registry (.scratch/religion-map)', () => {
  test('PRD.md exists', () => {
    expect(fs.existsSync(scratchPrd)).toBe(true)
  })

  test('every numbered issue markdown is present', () => {
    expect(fs.existsSync(scratchIssuesDir)).toBe(true)
    const md = fs
      .readdirSync(scratchIssuesDir)
      .filter((n) => n.endsWith('.md'))
      .sort()

    expect(md.length).toBeGreaterThanOrEqual(13)
    for (let n = 1; n <= 14; n++) {
      const prefix = `${n.toString().padStart(2, '0')}-`
      expect(
        md.some((f) => f.startsWith(prefix)),
        `missing issue file for #${n} (expected prefix ${prefix})`,
      ).toBe(true)
    }

    for (const f of md) {
      expect(/^(\d{2})-[a-z0-9._-]+\.md$/i.test(f), `unexpected issue filename shape: ${f}`).toBe(
        true,
      )
    }
  })
})
