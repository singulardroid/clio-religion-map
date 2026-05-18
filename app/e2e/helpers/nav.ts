import type { Page } from '@playwright/test'

type E2eWindow = Window & { __e2eFocusNode?: (nodeId: string) => void }

/** Fit viewport so the whole graph lands inside the Chromium window. */
export async function fitMapViewport(page: Page): Promise<void> {
  await page.getByTestId('toolbar-fit-view').click()
  await page.waitForTimeout(350)
}

/** Zoom viewport to frame a single concept node (wired from `FlowCanvas`). */
export async function focusEventNode(page: Page, conceptId: string): Promise<void> {
  await page.evaluate((id) => {
    ;(window as E2eWindow).__e2eFocusNode?.(id)
  }, conceptId)
  await page.waitForTimeout(450)
}

export async function setMapViewport(
  page: Page,
  viewport: { x: number; y: number; zoom: number },
): Promise<void> {
  await page.evaluate((nextViewport) => {
    ;(
      window as E2eWindow & {
        __e2eSetViewport?: (viewport: { x: number; y: number; zoom: number }) => void
      }
    ).__e2eSetViewport?.(nextViewport)
  }, viewport)
  await page.waitForTimeout(250)
}
