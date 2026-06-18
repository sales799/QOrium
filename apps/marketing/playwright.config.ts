import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;
const BASE_URL = process.env['PLAYWRIGHT_BASE_URL'] ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: process.env['PLAYWRIGHT_BASE_URL']
    ? undefined
    : {
        command: 'QORIUM_E2E=1 pnpm start',
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env['CI'],
        timeout: 120_000,
      },
});
