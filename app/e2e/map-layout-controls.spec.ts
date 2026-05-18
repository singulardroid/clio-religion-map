/**
 * Acceptance checks for `.scratch/map-layout-controls`.
 */

import { test, expect } from '@playwright/test'

import { compileEventsReadable, loadVisibleEvents } from './helpers/events-data'
import { fitMapViewport, focusEventNode, setMapViewport } from './helpers/nav'

test.describe('Map layout controls PRD', () => {
  test.beforeAll(() => {
    expect(compileEventsReadable()).toBe(true)
  })

  test('timeline shows nearest offscreen pointers when ruler ticks are out of view', async ({ page }) => {
    await page.goto('/')
    await page.locator('.react-flow__pane').waitFor({ timeout: 90_000 })
    await setMapViewport(page, { x: -25000, y: 0, zoom: 3 })

    await expect(page.getByTestId('timeline-offscreen-left')).toBeVisible()
    await expect(page.getByTestId('timeline-offscreen-right')).toBeVisible()
  })

  test('Expand All and Collapse All control visible event cards', async ({ page }) => {
    const sample = loadVisibleEvents('en').find((ev) => !!ev.quote)!

    await page.goto('/')
    await fitMapViewport(page)
    await focusEventNode(page, sample.concept_id)

    const node = page.locator(`[data-event-concept-id="${sample.concept_id}"]`)
    await expect(node.locator('em')).toHaveCount(0)

    await page.getByTestId('toolbar-expand-all').click()
    await expect(node.locator('em')).toContainText(sample.quote!.slice(0, 24))

    await page.getByTestId('toolbar-collapse-all').click()
    await expect(node.locator('em')).toHaveCount(0)
  })

  test('cards show subtle volume provenance', async ({ page }) => {
    const sample = loadVisibleEvents('en').find((ev) => ev.volume === 1)!

    await page.goto('/')
    await fitMapViewport(page)
    await focusEventNode(page, sample.concept_id)

    const node = page.locator(`[data-event-concept-id="${sample.concept_id}"]`)
    await expect(node.getByTestId('volume-badge')).toHaveText('Vol I')
  })

  test('Auto layout is safe to expand after running', async ({ page }) => {
    const sample = loadVisibleEvents('en').find((ev) => !!ev.quote)!

    await page.goto('/')
    await fitMapViewport(page)
    await page.getByTestId('toolbar-reset-layout').click()
    await focusEventNode(page, sample.concept_id)

    const node = page.locator(`[data-event-concept-id="${sample.concept_id}"]`)
    await node.click({ force: true })
    await expect(node.locator('em')).toBeVisible()
  })
})
