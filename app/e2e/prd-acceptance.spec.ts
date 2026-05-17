/**
 * Browser-visible acceptance derived from `.scratch/religion-map/PRD.md`.
 */

import fs from 'node:fs'

import type { TestInfo } from '@playwright/test'
import { test, expect } from '@playwright/test'

import { compileEventsReadable, loadCompiledEvents } from './helpers/events-data'
import { fitMapViewport, focusEventNode } from './helpers/nav'
import { scratchPrd } from './helpers/repo-paths'

function annotatePrd(testInfo: TestInfo, storyNumbers: number[]) {
  testInfo.annotations.push({
    type: 'prd-story',
    description: storyNumbers.map((s) => `US-${s}`).join(', '),
  })
}

test.describe('PRD file presence', () => {
  test('PRD markdown exists beside issues', () => {
    expect(fs.existsSync(scratchPrd)).toBe(true)
  })
})

test.describe('PRD user stories mapped to SPA', () => {
  test.beforeAll(() => {
    expect(compileEventsReadable(), 'missing compiled events bundle').toBe(true)
  })

  test('US6/US19 researcher reads period + русский текст on cards', async ({ page }, testInfo) => {
    annotatePrd(testInfo, [6, 19])

    await page.goto('/')
    await fitMapViewport(page)

    await expect(page.getByTestId('map-status')).toContainText('Лет')

    const sample = loadCompiledEvents().find((ev) => !!ev.period)!

    const node = page.locator(`[data-event-concept-id="${sample.concept_id}"]`)
    await focusEventNode(page, sample.concept_id)

    await expect(node).toBeVisible({ timeout: 90_000 })

    await expect(node).toContainText(sample.period!.normalize('NFC').slice(0, Math.min(24, sample.period!.length)))
  })

  test('US12 draggable host nodes wired through React Flow', async ({ page }, testInfo) => {
    annotatePrd(testInfo, [12])

    await page.goto('/')
    await fitMapViewport(page)

    const host = page.locator('[data-testid="event-node"]').first().locator(
      'xpath=ancestor::div[contains(@class,"react-flow__node")][1]',
    )

    await expect(host).toBeVisible({ timeout: 90_000 })
    await expect(host).toHaveAttribute('data-id', /.+/)
  })

  test('US8/US20 first-accent + expandable Seshat hint', async ({ page }, testInfo) => {
    annotatePrd(testInfo, [8, 20])

    interface EnrichedEv {
      concept_id: string
      seshat?: { nga_name?: string }
    }

    await page.goto('/')
    await fitMapViewport(page)

    await expect(page.locator('[data-first-occurrence="true"]').first()).toBeVisible({
      timeout: 90_000,
    })

    const enriched = loadCompiledEvents() as EnrichedEv[]

    const sample = enriched.find((e) => !!e.seshat?.nga_name)!

    await focusEventNode(page, sample.concept_id)

    const node = page.locator(`[data-event-concept-id="${sample.concept_id}"]`)

    await expect(node).toBeVisible({ timeout: 90_000 })

    await node.click({ force: true })

    await expect(node.getByRole('link', { name: /Seshat/ })).toBeVisible()

    await node.click({ force: true })
  })

  test('US9 swimlanes hinted via фильтры + status lane counts', async ({ page }, testInfo) => {
    annotatePrd(testInfo, [9])

    await page.goto('/')
    await fitMapViewport(page)

    await expect(page.getByTestId('filter-panel')).toContainText('Регион')

    await expect(page.getByTestId('map-status')).toContainText('дорожки')

  })

})

test.describe.skip('PRD backlog — visual / MCP (explicitly queued)', () => {

  test('US10/US18 era-band pixel snapshot backlog', ({}, testInfo) => {
    annotatePrd(testInfo, [10, 18])

  })

  test('US17 Miro bookkeeping exporter backlog', ({}, testInfo) => {
    annotatePrd(testInfo, [17])

  })

})
