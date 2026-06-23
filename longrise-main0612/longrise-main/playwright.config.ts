import { defineConfig, devices } from '@playwright/test';

const frontendUrl = process.env.E2E_FRONTEND_URL || 'http://localhost:5173';
const shouldStartLocalServices = !process.env.E2E_FRONTEND_URL;

export default defineConfig({
  testDir: '.',
  testMatch: ['test-simple.spec.ts', 'tests/e2e/**/*.spec.ts'],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: frontendUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 1100 },
  },
  webServer: shouldStartLocalServices
    ? {
        command: './restart-all-services.sh --bf --wait 1',
        url: frontendUrl,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
