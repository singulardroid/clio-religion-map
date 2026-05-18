import { defineConfig, devices } from '@playwright/test'

/**
 * E2E / acceptance for religion-map SPA (Phase 1 + Phase 2 scratch issues).
 */
export default defineConfig({
  timeout: 90_000,
  expect: { timeout: 20_000 },
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /@prod/,
    },
    {
      name: 'chromium-prod',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4173',
      },
      grep: /@prod/,
    },
  ],
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5173',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command:
        'VITE_EDITORIAL_READONLY=true npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        VITE_EDITORIAL_READONLY: 'true',
      },
    },
  ],
})
