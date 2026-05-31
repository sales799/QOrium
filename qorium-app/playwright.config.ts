import { defineConfig, devices } from "@playwright/test";

const apiPort = Number(process.env.QORIUM_E2E_API_PORT ?? 4210);
const webPort = Number(process.env.QORIUM_E2E_WEB_PORT ?? 3210);
const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
const webBaseUrl = `http://127.0.0.1:${webPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: webBaseUrl,
    trace: "on-first-retry"
  },
  webServer: [
    {
      command: `QORIUM_RECRUITER_COOKIE_SECURE=false PORT=${apiPort} pnpm --filter @qorium/api dev`,
      url: `${apiBaseUrl}/health`,
      reuseExistingServer: false,
      timeout: 20_000
    },
    {
      command: `NEXT_PUBLIC_API_BASE_URL=${apiBaseUrl} pnpm --filter @qorium/web exec next dev -H 127.0.0.1 -p ${webPort}`,
      url: `${webBaseUrl}/assessments/new`,
      reuseExistingServer: false,
      timeout: 30_000
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
