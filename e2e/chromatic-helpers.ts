import { takeSnapshot as chromaticTakeSnapshot } from '@chromatic-com/playwright';
import type { Page } from '@playwright/test';

/**
 * Chromatic's `takeSnapshot` is typed against its bundled Playwright peer. At compile
 * time TypeScript can see another copy of Playwright types, so we intentionally accept
 * `unknown` here and defer to Chromatic's runtime expectation.
 */
export async function takeNamedChromaticSnapshot(
  page: Page,
  snapshotName: string,
  testInfo: unknown,
) {
  await chromaticTakeSnapshot(
    page as never,
    snapshotName,
    testInfo as never,
  );
}
