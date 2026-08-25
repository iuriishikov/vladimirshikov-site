import { defineConfig, devices } from '@playwright/test'

const IS_CI = Boolean(process.env.CI)
const PORT = Number(process.env.PORT ?? 3000)
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${String(PORT)}`

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,

  // A stray `test.only` must never silently shrink the CI suite.
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  // Locally Playwright's own default (half the cores) is the right answer, so
  // the key is omitted rather than set to undefined.
  ...(IS_CI && { workers: '50%' }),

  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: IS_CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']]
    : [['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-testid',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 15'] } },
  ],

  // CI runs the production server so e2e exercises the artefact that ships.
  webServer: {
    command: IS_CI ? 'pnpm start' : 'pnpm dev',
    url: `${BASE_URL}/api/health`,
    reuseExistingServer: !IS_CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
