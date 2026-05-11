import { config as loadEnv } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

// Load .env.local explicitly. Next.js does this automatically but Playwright
// runs outside Next's loader, and our shell export approach broke on env
// values that contain spaces (e.g. ALPACA_TRADER_NAME=James Howell).
loadEnv({ path: '.env.local' });
loadEnv(); // fall back to .env if present

const parsedPort = Number(process.env.PORT);
const port =
  Number.isFinite(parsedPort) && parsedPort > 0 ? Math.trunc(parsedPort) : 3000;
const explicitBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = explicitBaseURL ?? `http://localhost:${port}`;
const useExternalBaseURL = Boolean(explicitBaseURL);

// E2E tests run against the dedicated test DB so they never trample data
// synced into the dev DB. The dev server spawned by Playwright inherits
// this DATABASE_URL override so its SSR fetches hit the same test DB the
// global-setup script seeded. In CI both vars typically point at the same
// Postgres service (there's no dev data to preserve).
const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  testDir: './e2e',
  // Seed deterministic fixture trades into the DB before any spec runs.
  // See e2e/global-setup.ts and e2e/fixtures/test-trades.ts.
  globalSetup: './e2e/global-setup.ts',
  // Exclude non-spec helpers from test discovery.
  testIgnore: ['**/global-setup.ts', '**/fixtures/**'],
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
          // Merge with process.env (Playwright's `env` replaces rather than
          // merges) and override DATABASE_URL so the dev server's SSR
          // fetches hit the test DB seeded by global-setup, not the dev DB
          // that may contain synced Alpaca data.
          env: testDatabaseUrl
            ? { ...process.env, DATABASE_URL: testDatabaseUrl }
            : undefined,
        },
      }),
});
