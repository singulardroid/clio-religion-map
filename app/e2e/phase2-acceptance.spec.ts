/**
 * Phase 2 acceptance — `.scratch/religion-map-phase-2/issues/01`–`11`.
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import type { TestInfo } from '@playwright/test'
import { test, expect } from '@playwright/test'

import {
  compileEventsReadable,
  loadCompiledEvents,
  type CompiledEvent,
} from './helpers/events-data'
import { fitMapViewport, focusEventNode } from './helpers/nav'
import {
  compileScriptPath,
  exportIssuesScriptPath,
  loadPhase2FixtureChapter,
  loadPhase2FixtureOverlay,
  parseEpubScriptPath,
} from './helpers/phase2-fixtures'
import {
  phase2FixtureEpubInputs,
  phase2FixturesDir,
  repoRoot,
  scratchPhase2IssuesDir,
} from './helpers/repo-paths'

function annotatePhase2(testInfo: TestInfo, issueNo: number) {
  const md = fs
    .readdirSync(scratchPhase2IssuesDir)
    .filter((name) => name.endsWith('.md'))
    .find((name) => name.startsWith(`${String(issueNo).padStart(2, '0')}-`))

  testInfo.annotations.push({
    type: 'scratch-issue',
    description: md
      ? `.scratch/religion-map-phase-2/issues/${md}`
      : String(issueNo),
  })
}

function pick(events: CompiledEvent[], pred: (e: CompiledEvent) => boolean) {
  const e = events.find(pred)
  expect(e, 'fixture event in compiled bundle').toBeTruthy()
  return e!
}

test.beforeAll(() => {
  expect(
    compileEventsReadable(),
    'missing app/src/data/events.json — run `python3 scripts/compile_events.py --strict-en`',
  ).toBe(true)
})

test.describe('Phase 2 issue #01 — locales schema', () => {
  test('compiled events include locales.ru blocks', async ({}, testInfo) => {
    annotatePhase2(testInfo, 1)
    const events = loadCompiledEvents()
    const withLocales = events.filter(
      (e) => e && typeof (e as { locales?: unknown }).locales === 'object',
    )
    expect(withLocales.length).toBeGreaterThan(100)
  })
})

test.describe('Phase 2 issue #02 — parse_epub', () => {
  test('parse_epub succeeds on fixture EPUB', async ({}, testInfo) => {
    annotatePhase2(testInfo, 2)
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clio-epub-out-'))
    execSync(
      `python3 ${parseEpubScriptPath()} --inputs ${JSON.stringify(phase2FixtureEpubInputs)} --out-dir ${JSON.stringify(outDir)}`,
      { cwd: repoRoot, encoding: 'utf8' },
    )
    expect(fs.existsSync(path.join(outDir, 'vol1-fulltext.json'))).toBe(true)
  })
})

test.describe('Phase 2 issue #03 — EN alignment display', () => {
  test('EN locale shows English statement from fixture chapter', async ({ page }, testInfo) => {
    annotatePhase2(testInfo, 3)
    const fixture = loadPhase2FixtureChapter()
    const enStmt = fixture.events[0].locales?.en?.statement ?? ''

    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('clio-lang', 'en'))
    await page.reload()
    await fitMapViewport(page)
    await focusEventNode(page, 'phase2-en-complete')

    const node = page.locator('[data-event-concept-id="phase2-en-complete"]')
    await expect(node).toBeVisible({ timeout: 90_000 })
    await expect(node).toContainText(enStmt.slice(0, 24))
  })
})

test.describe('Phase 2 issue #04 — strict EN compile', () => {
  test('strict-en compile fails when EN incomplete in isolated fixture dir', async ({}, testInfo) => {
    annotatePhase2(testInfo, 4)
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'clio-compile-'))
    const volDir = path.join(tmp, 'vol99')
    fs.mkdirSync(volDir)
    const strictFailDir = path.join(repoRoot, 'tests', 'fixtures', 'phase2-strict-fail')
    fs.copyFileSync(
      path.join(strictFailDir, 'ch99b-events.json'),
      path.join(volDir, 'ch99b-events.json'),
    )
    const overlay = path.join(tmp, 'overlay.json')
    fs.writeFileSync(overlay, JSON.stringify({ by_concept_id: {} }))

    let failed = false
    try {
      execSync(
        `python3 ${compileScriptPath()} --strict-en --vol-dirs ${volDir} --overlay ${overlay} --out ${path.join(tmp, 'out.json')}`,
        { cwd: repoRoot, encoding: 'utf8', stdio: 'ignore' },
      )
    } catch {
      failed = true
    }
    expect(failed).toBe(true)
  })

  test('main strict-en bundle includes phase2 complete fixture node', async ({ page }, testInfo) => {
    annotatePhase2(testInfo, 4)
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('clio-lang', 'en'))
    await page.reload()
    await fitMapViewport(page)
    await expect(page.locator('[data-event-concept-id="phase2-en-complete"]')).toHaveCount(1)
  })
})

test.describe('Phase 2 issue #05 — editorial overlay merge', () => {
  test('overlay fixture defines position for phase2-en-complete', async ({}, testInfo) => {
    annotatePhase2(testInfo, 5)
    const overlay = loadPhase2FixtureOverlay()
    const pos = (overlay.by_concept_id['phase2-en-complete'] as { position?: { x: number } })
      ?.position
    expect(pos?.x).toBe(42)
  })
})

test.describe('Phase 2 issue #06 — toolbar merge', () => {
  test('filter panel lives inside top-right map toolbar', async ({ page }, testInfo) => {
    annotatePhase2(testInfo, 6)
    await page.goto('/')
    const toolbar = page.getByTestId('map-toolbar')
    const filter = page.getByTestId('filter-panel')
    await expect(toolbar).toBeVisible()
    await expect(filter).toBeVisible()

    const tb = await toolbar.boundingBox()
    const fb = await filter.boundingBox()
    expect(tb).toBeTruthy()
    expect(fb).toBeTruthy()
    expect(fb!.x).toBeGreaterThan(tb!.x)
    expect(tb!.y).toBeLessThan(80)
  })
})

test.describe('Phase 2 issue #07 — i18n UI', () => {
  test('default UI English; RU switch updates chrome labels', async ({ page }, testInfo) => {
    annotatePhase2(testInfo, 7)
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('clio-lang'))
    await page.reload()

    await expect(page.getByTestId('lang-switcher')).toHaveValue('en')
    await expect(page.getByTestId('filter-panel')).toContainText('Filters')

    await page.getByTestId('lang-switcher').selectOption('ru')
    await expect(page.getByTestId('filter-panel')).toContainText('Фильтры')
  })
})

test.describe('Phase 2 issue #08 — editorial dev write', () => {
  test('dev mode exposes comment input and issue tags @dev', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-prod', 'dev server only')
    annotatePhase2(testInfo, 8)

    await page.goto('/')
    await fitMapViewport(page)
    await focusEventNode(page, 'phase2-en-complete')
    await page
      .locator('[data-event-concept-id="phase2-en-complete"][data-testid="event-node"]')
      .click()

    await expect(page.getByTestId('editorial-comment-input').first()).toBeVisible()
    await expect(page.getByTestId('issue-tag-needs_source_check').first()).toBeVisible()
  })
})

test.describe('Phase 2 issue #08 — editorial prod read-only', () => {
  test('prod build hides write controls @prod', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-prod', 'preview build only')
    annotatePhase2(testInfo, 8)

    await page.goto('/')
    await fitMapViewport(page)
    await focusEventNode(page, 'phase2-en-complete')
    await page
      .locator('[data-event-concept-id="phase2-en-complete"][data-testid="event-node"]')
      .click()

    await expect(page.getByTestId('editorial-comment-input')).toHaveCount(0)
    await expect(page.getByTestId('export-overlay')).toHaveCount(0)
  })
})

test.describe('Phase 2 issue #09 — export issues script', () => {
  test('export_issues_for_review writes bundle with open issues', async ({}, testInfo) => {
    annotatePhase2(testInfo, 9)
    const out = path.join(os.tmpdir(), `issues-review-${Date.now()}.json`)
    execSync(
      `python3 ${exportIssuesScriptPath()} --overlay ${JSON.stringify(phase2FixturesDir + '/event-overlays.json')} --out ${JSON.stringify(out)}`,
      { cwd: repoRoot, encoding: 'utf8' },
    )
    const data = JSON.parse(fs.readFileSync(out, 'utf8')) as {
      records: Array<{ concept_id: string }>
    }
    expect(data.records.some((r) => r.concept_id === 'phase2-en-complete')).toBe(true)
  })
})

test.describe('Phase 2 issue #10 — graph highlight', () => {
  test('context menu highlight dims non-selected nodes', async ({ page }, testInfo) => {
    annotatePhase2(testInfo, 10)
    const events = loadCompiledEvents()
    const withConn = pick(events, (e) => (e.connections?.length ?? 0) > 0)

    await page.goto('/')
    await fitMapViewport(page)
    await focusEventNode(page, withConn.concept_id)

    const node = page.locator(`.react-flow__node[data-id="${withConn.concept_id}"]`).first()
    await node.click({ button: 'right' })
    await page.getByTestId('context-menu-highlight-connected').click()
    await expect(page.getByTestId('highlight-panel')).toBeVisible()
    await page.getByTestId('highlight-depth').evaluate((el) => {
      ;(el as HTMLInputElement).value = '2'
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await expect(page.getByTestId('highlight-panel')).toContainText(/\d+/)
    const dimmed = page.locator('.react-flow__node[style*="opacity: 0.22"]')
    await expect(dimmed.first()).toBeVisible({ timeout: 15_000 })

    await page.getByTestId('clear-highlight').click()
    await expect(page.getByTestId('highlight-panel')).toHaveCount(0)
  })
})

test.describe('Phase 2 issue #11 — compact flow view', () => {
  test('compact modal opens and back preserves highlight', async ({ page }, testInfo) => {
    annotatePhase2(testInfo, 11)
    const events = loadCompiledEvents()
    const root = pick(events, (e) => (e.connections?.length ?? 0) > 0)

    await page.goto('/')
    await fitMapViewport(page)
    await focusEventNode(page, root.concept_id)

    await page
      .locator(`.react-flow__node[data-id="${root.concept_id}"]`)
      .first()
      .click({ button: 'right' })
    await page.getByTestId('context-menu-highlight-connected').click()

    await expect(page.getByTestId('highlight-panel')).toBeVisible()
    await page.getByTestId('make-compact-view').click()
    const compact = page.getByTestId('compact-flow')
    await expect(compact).toBeVisible()

    const box = await compact.boundingBox()
    const vp = page.viewportSize()
    expect(box).toBeTruthy()
    expect(vp).toBeTruthy()
    expect(box!.width).toBeLessThanOrEqual((vp?.width ?? 0) + 4)
    expect(box!.height).toBeLessThanOrEqual((vp?.height ?? 0) + 4)

    await page.getByRole('button', { name: /back to map/i }).click()
    await expect(compact).toHaveCount(0)
    await expect(page.getByTestId('highlight-panel')).toBeVisible()
  })
})
