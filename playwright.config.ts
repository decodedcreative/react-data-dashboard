import { defineConfig, devices } from '@playwright/test';

const parsedPort = Number(process.env.PORT);
const port =
  Number.isFinite(parsedPort) && parsedPort > 0 ? Math.trunc(parsedPort) : 3000;
const explicitBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = explicitBaseURL ?? `http://localhost:${port}`;
const useExternalBaseURL = Boolean(explicitBaseURL);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Visual stability — keep these in sync with the app's display locale/timezone
    // (`DISPLAY_LOCALE` / `DISPLAY_TIME_ZONE` in src/features/trades/lib/formatters).
    viewport: { width: 1280, height: 720 },
    colorScheme: 'light',
    locale: 'en-GB',
    timezoneId: 'UTC',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          // Reduce cross-platform font rendering variation (Linux CI vs macOS dev).
          // Not a complete fix — a bundled web font is the long-term solution.
          args: [
            '--font-render-hinting=none',
            '--disable-font-subpixel-positioning',
            '--disable-lcd-text',
          ],
        },
      },
    },
  ],
  ...(useExternalBaseURL
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
});
