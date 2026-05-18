/**
 * Acceptance checks mapped to `.scratch/religion-map/issues/*.md` (SPA-visible scope).
 */

import fs from 'node:fs'

import type { Page, TestInfo } from '@playwright/test'
import { test, expect } from '@playwright/test'

import {
  POSITION_STORAGE_KEY,
  loadVisibleEvents,
  countRenderableEdges,
  compileEventsReadable,
  type CompiledEvent,
} from './helpers/events-data'
import { fitMapViewport, focusEventNode } from './helpers/nav'
import { scratchIssuesDir } from './helpers/repo-paths'

function annotateIssue(testInfo: TestInfo, issueNo: number) {
  const md = fs
    .readdirSync(scratchIssuesDir)
    .filter((name) => name.endsWith('.md'))
    .find((name) => name.startsWith(`${String(issueNo).padStart(2, '0')}-`))

  testInfo.annotations.push({
    type: 'scratch-issue',
    description: md ? `.scratch/religion-map/issues/${md}` : String(issueNo),
  })
}

function pick(events: CompiledEvent[], pred: (e: CompiledEvent) => boolean): CompiledEvent | undefined {
  return events.find(pred)
}

async function useRussian(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('clio-lang', 'ru'))
  await page.reload()
}

/** Issues primarily delivered outside React/Vite (Python, MCP, notebooks). */
test.describe('Issues #01, #02, #04, #05, #06, #11 — tooling / MCP / pytest arena', () => {
  for (const n of [1, 2, 4, 5, 6, 11]) {
    test(`issue ${String(n).padStart(2, '0')} placeholder`, ({}, testInfo) => {
      annotateIssue(testInfo, n)
      testInfo.skip(true, 'Not part of SPA browser suite — tracked in markdown + other runners')
    })
  }
})

test.describe('Issue #03 — SPA scaffold', () => {
  test('map chrome loads', async ({ page }, testInfo) => {
    annotateIssue(testInfo, 3)
    await page.goto('/')

    await expect(page.getByTestId('filter-panel')).toBeVisible()
    await expect(page.locator('.react-flow')).toBeVisible()
    await expect(page.locator('.react-flow__viewport')).toBeAttached()

    await page.getByTestId('toolbar-fit-view').click()

  })

})

test.describe('Issue #07 — Compiled events + graph topology', () => {
  test.beforeAll(() => {
    expect(
      compileEventsReadable(),
      'missing app/src/data/events.json — run `python3 scripts/compile_events.py`',
    ).toBe(true)
  })

  test('node cardinality matches SPA import', async ({ page }, testInfo) => {
    annotateIssue(testInfo, 7)
    const events = loadVisibleEvents('ru')

    await useRussian(page)
    await fitMapViewport(page)

    await expect(page.locator('[data-testid="event-node"]').first()).toBeVisible({ timeout: 90_000 })
    await expect(page.locator('[data-testid="event-node"]')).toHaveCount(events.length)

  })

  test('edges match compilable intra-graph refs', async ({ page }, testInfo) => {
    annotateIssue(testInfo, 7)

    const events = loadVisibleEvents('ru')

    const edges = countRenderableEdges(events)

    await useRussian(page)
    await fitMapViewport(page)
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 90_000 })
    await expect(page.locator('.react-flow__edge')).toHaveCount(edges)

    if (edges > 0) {
      await expect(page.locator('.react-flow__edge-text').first()).toBeVisible()

    }

  })

})

test.describe('Issue #08 — EventNode UX', () => {
  test.beforeAll(() => {
    expect(compileEventsReadable()).toBe(true)
  })

  test('surface copy matches JSON statement/description excerpt', async ({ page }, testInfo) => {
    annotateIssue(testInfo, 8)

    const events = loadVisibleEvents('ru')
    const sample = pick(events, (e) => !!(e.statement ?? e.description))!

    await useRussian(page)
    await fitMapViewport(page)

    const slot = page.locator(`[data-event-concept-id="${sample.concept_id}"]`)
    await focusEventNode(page, sample.concept_id)

    await expect(slot).toBeVisible({ timeout: 90_000 })
    const chunk = (sample.statement ?? sample.description)!.normalize('NFC').slice(10, 46)
    await expect(slot).toContainText(chunk)

  })

  test('first-appearance badge рус.', async ({ page }, testInfo) => {
    annotateIssue(testInfo, 8)

    await useRussian(page)
    await fitMapViewport(page)

    await expect(page.locator('[data-first-occurrence="true"]').first()).toContainText('ВПЕРВЫЕ')

  })

  test('click expands quote + томовая строка источника', async ({ page }, testInfo) => {
    annotateIssue(testInfo, 8)

    const events = loadVisibleEvents('ru')
    const sample = pick(events, (e) => !!e.quote && !!e.source_ref)!

    await useRussian(page)
    await fitMapViewport(page)
    await focusEventNode(page, sample.concept_id)

    const node = page.locator(`[data-event-concept-id="${sample.concept_id}"]`)

    await expect(node).toBeVisible({ timeout: 90_000 })

    await expect(node.locator('em')).toHaveCount(0)
    await node.click({ force: true })

    await expect(node.locator('em')).toContainText(sample.quote!.slice(0, 42))
    await expect(node.getByText(sample.source_ref!, { exact: true })).toBeVisible()

    await node.click({ force: true })

    await expect(node.locator('em')).toHaveCount(0)
  })

})

test.describe('Issue #09 — Influence edges labelled', () => {
  test.beforeAll(() => {
    expect(compileEventsReadable()).toBe(true)

  })

  test('edges carry readable labels', async ({ page }, testInfo) => {

    annotateIssue(testInfo, 9)

    const events = loadVisibleEvents('ru')

    const edges = countRenderableEdges(events)

    await useRussian(page)
    await fitMapViewport(page)

    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 90_000 })

    await expect(page.locator('.react-flow__edge')).toHaveCount(edges)

    if (edges > 0) {
      await expect(page.locator('.react-flow__edge-text').first()).toHaveText(/.+/u)
      testInfo.annotations.push({
        type: 'note',

        description:
          'InfluenceEdge (animated dashed) still TODO — SPA uses labelled smoothstep edges today.',
      })
    }

  })

})

test.describe('Issue #10 — drag persistence primitives', () => {
  test.beforeAll(() => {
    expect(compileEventsReadable()).toBe(true)

  })

  test('drag writes POSITION_STORAGE blob; Авторасстановка clears storage', async ({
    page,
  }, testInfo) => {
    annotateIssue(testInfo, 10)

    await useRussian(page)
    await fitMapViewport(page)
    await page.evaluate((key) => localStorage.removeItem(key), POSITION_STORAGE_KEY)

    const inner = page.locator('[data-testid="event-node"]').first()

    await inner.waitFor({ timeout: 90_000 })
    const conceptId = (await inner.getAttribute('data-event-concept-id'))!
    await focusEventNode(page, conceptId)

    /** React Flow host div */

    const host = inner.locator('xpath=ancestor::div[contains(@class,"react-flow__node")][1]')
    const pane = page.locator('.react-flow__pane').first()
    await pane.waitFor({ timeout: 10_000 })

    await host.dragTo(pane, {
      force: true,
      targetPosition: { x: 360, y: 240 },
      sourcePosition: { x: 40, y: 24 },
    })

    await expect
      .poll(async () => {
        const raw = await page.evaluate((key) => localStorage.getItem(key), POSITION_STORAGE_KEY)
        const parsed =
          raw && raw.length ? (JSON.parse(raw) as Record<string, { x: number | null; y?: number | null }>) : {}
        return parsed[conceptId]?.x ?? null
      })
      .not.toBeNull()

    await page.getByTestId('toolbar-reset-layout').click()

    await page.waitForTimeout(380)

    const cleared = await page.evaluate((key) => localStorage.getItem(key), POSITION_STORAGE_KEY)

    expect(cleared).toBeNull()

  })

  test('reload should restore persisted layout', ({}, testInfo) => {

    annotateIssue(testInfo, 10)
    testInfo.fixme(true, 'Autosizing graph currently ignores persisted coordinates.')

  })

})

test.describe('Issue #12 — Seshat link', () => {
  test.beforeAll(() => {
    expect(compileEventsReadable()).toBe(true)

  })

  test('expanded card lists Seshat anchor when enriched', async ({ page }, testInfo) => {
    annotateIssue(testInfo, 12)

    type Ev = CompiledEvent & { seshat?: { nga_name?: string } }

    const sample = pick(loadVisibleEvents('ru') as Ev[], (e) => !!e.seshat?.nga_name)!

    await useRussian(page)
    await fitMapViewport(page)
    await focusEventNode(page, sample.concept_id)
    const node = page.locator(`[data-event-concept-id="${sample.concept_id}"]`)

    await expect(node).toBeVisible({ timeout: 90_000 })

    await node.click({ force: true })
    await expect(node.getByRole('link', { name: /Seshat/ })).toBeVisible()

    await node.click({ force: true })

  })

})

test.describe('Issue #13 — Литература', () => {

  test.beforeAll(() => {
    expect(compileEventsReadable()).toBe(true)

  })

  test('expanded ordered list cites references section', async ({ page }, testInfo) => {

    annotateIssue(testInfo, 13)

    const sample = pick(
      loadVisibleEvents('ru'),
      (e) => Array.isArray(e.references) && e.references.length > 2,

    )!

    await useRussian(page)
    await fitMapViewport(page)
    await focusEventNode(page, sample.concept_id)

    const node = page.locator(`[data-event-concept-id="${sample.concept_id}"]`)

    await expect(node).toBeVisible({ timeout: 90_000 })

    await node.click({ force: true })
    await expect(node.getByText('Литература:', { exact: true })).toBeVisible()

    await expect(node.locator('ol li').first()).toBeVisible()

    await node.click({ force: true })
    await expect(node.getByText('Литература:', { exact: true })).toHaveCount(0)

  })

})

test.describe('Issue #14 — Territory header / Google Maps deeplink', () => {

  test.beforeAll(() => {
    expect(compileEventsReadable()).toBe(true)

  })

  test('header shows territory vs precise locality', async ({ page }, testInfo) => {
    annotateIssue(testInfo, 14)

    const sample = pick(
      loadVisibleEvents('ru'),
      (e) => !!e.territory && !!e.precise_location,

    )!

    await useRussian(page)
    await fitMapViewport(page)
    await focusEventNode(page, sample.concept_id)

    const node = page.locator(`[data-event-concept-id="${sample.concept_id}"]`)

    await expect(node).toBeVisible({ timeout: 90_000 })

    await expect(node).toContainText(sample.territory!)
    await expect(node).toContainText(sample.precise_location!)

  })

  test('Google Maps href surfaced when expanded', async ({ page }, testInfo) => {
    annotateIssue(testInfo, 14)

    const sample = pick(loadVisibleEvents('ru'), (e) => !!e.territory)!
    await useRussian(page)
    await fitMapViewport(page)
    await focusEventNode(page, sample.concept_id)

    const node = page.locator(`[data-event-concept-id="${sample.concept_id}"]`)

    await expect(node).toBeVisible({ timeout: 90_000 })

    await node.click({ force: true })

    await expect(node.getByRole('link', { name: /Google Maps/ })).toHaveAttribute(
      'href',
      /google\.com\/maps/,

    )

    await node.click({ force: true })

  })

})
