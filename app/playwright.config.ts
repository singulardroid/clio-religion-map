import { defineConfig, devices } from '@playwright/test'

/**
 * E2E / acceptance suite for religion-map SPA vs `.scratch/religion-map/PRD.md` + `/issues/*.md`.
 * Scratch paths are anchored in-repo; tests assert those files stay present.
 */
export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 15_000 },
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
