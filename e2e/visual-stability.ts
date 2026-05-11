import type { Page } from '@playwright/test';

/**
 * Visual-test stability primitives.
 *
 * Goal: make Playwright captures deterministic so Chromatic only flags meaningful
 * UI changes. See e2e/README.md for the full conventions.
 *
 * Everything here is applied automatically to every test via the `stablePageSetup`
 * fixture in `fixtures.ts`. Tests do not need to call these helpers directly,
 * except for `waitForPageSettled` which is wired into page-object `goto()` methods.
 */

/**
 * Fixed timestamp injected as the browser's "now" before navigation.
 *
 * Chosen to sit just after the latest seeded `executedAt` (2026-04-24T10:15:00Z)
 * so any future relative-time formatting (e.g. "n minutes ago") stays in the
 * positive direction. Stays inside business hours in UTC to match the app's
 * `DISPLAY_LOCALE` / `DISPLAY_TIME_ZONE` formatting.
 */
export const FROZEN_NOW = new Date('2026-05-11T09:00:00Z');

/**
 * Canonical mock data for `/api/trades`.
 *
 * MUST stay in sync with `prisma/seed.mjs` because the trades and trade-detail
 * pages are SSR — the server-side `getTradesFromDb()` call hits the real DB and
 * bypasses `page.route()`. This mock is a belt-and-braces guard for any client
 * refetch (React Query revalidation, focus refetch, etc.) so the snapshot
 * doesn't drift if the stale-time or fetching strategy changes.
 */
export const MOCK_TRADES = [
  {
    id: 'TRD-001',
    symbol: 'AAPL',
    side: 'buy',
    quantity: 120,
    price: 184.52,
    status: 'filled',
    trader: 'James Howell',
    executedAt: '2026-04-24T10:15:00.000Z',
  },
  {
    id: 'TRD-002',
    symbol: 'TSLA',
    side: 'sell',
    quantity: 50,
    price: 171.25,
    status: 'pending',
    trader: 'Sarah Khan',
    executedAt: null,
  },
] as const;

export const MOCK_TRADE_TRD_001 = MOCK_TRADES[0];

/**
 * CSS injected via `addInitScript` to neutralise animations and transitions
 * before any framework paint. Covers Tailwind transitions and AG Grid's
 * `animateRows: true` row transitions.
 */
const ANIMATION_KILL_CSS = `
  *, *::before, *::after {
    animation-duration: 0ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0ms !important;
    transition-delay: 0ms !important;
    scroll-behavior: auto !important;
  }
  .ag-row, .ag-cell {
    transition: none !important;
  }
`;

/**
 * Apply all stability primitives to the page. Called automatically by the
 * `stablePageSetup` fixture before any `goto()`.
 *
 * Order matters:
 * 1. Clock freeze must happen before navigation so `Date.now()` reads in
 *    bootstrap code see the fixed time.
 * 2. Route handlers must be registered before navigation so the first request
 *    is intercepted. The specific `/api/trades/*` pattern is registered
 *    before the broader `/api/trades` pattern — Playwright matches routes
 *    in registration order.
 * 3. The animation-kill style tag is injected via `addInitScript` so it
 *    applies before any framework paint or AG Grid mount transition.
 */
export async function setupVisualStability(page: Page): Promise<void> {
  await page.clock.install({ time: FROZEN_NOW });

  // More-specific pattern first.
  await page.route('**/api/trades/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_TRADE_TRD_001),
    });
  });

  await page.route('**/api/trades', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_TRADES),
    });
  });

  await page.addInitScript((css) => {
    const inject = () => {
      const style = document.createElement('style');
      style.setAttribute('data-visual-stability', 'true');
      style.textContent = css;
      document.head.appendChild(style);
    };
    if (document.head) {
      inject();
    } else {
      document.addEventListener('DOMContentLoaded', inject, { once: true });
    }
  }, ANIMATION_KILL_CSS);
}

export interface WaitForPageSettledOptions {
  /**
   * When true (default), wait for the AG Grid root wrapper to be visible.
   * Set to false for pages that do not render the trades grid (home, about,
   * 404, etc.).
   */
  hasGrid?: boolean;
}

/**
 * Wait until the page has finished loading and AG Grid has rendered, then
 * apply a short buffer for paint settle.
 *
 * Called inside page-object `goto()` and navigation helpers so every snapshot
 * is taken against a fully-settled page.
 */
export async function waitForPageSettled(
  page: Page,
  { hasGrid = false }: WaitForPageSettledOptions = {}
): Promise<void> {
  await page.waitForLoadState('networkidle');

  if (hasGrid) {
    await page.locator('.ag-root-wrapper').waitFor({ state: 'visible' });
    await page.locator('.ag-row').first().waitFor({ state: 'visible' });
  }

  // Small buffer for any final CSS paint/layout settle that `networkidle`
  // does not cover. AG Grid mutates the DOM after mount and we have no
  // deterministic "grid finished rendering" signal exposed by the library.
  // Remove if a better signal is introduced.
  await page.waitForTimeout(100);
}
