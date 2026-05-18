import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Fetch Chromium locally after npm install. CI skips this — workflows run
 * `playwright install chromium --with-deps` separately (Linux deps).
 */
if (process.env.CI === 'true') {
  process.exit(0)
}

try {
  // Headless CI uses chromium_headless_shell; installing only “chromium” can leave shell missing (macOS/GitHub UX).
  execSync('npx playwright install chromium chromium-headless-shell', {
    stdio: 'inherit',
    cwd: appDir,
  })
} catch {
  process.stderr.write(
    'Playwright browser install skipped or failed — run `npm run test:e2e:install`, then retry e2e.\n',
  )
  process.exit(0)
}
