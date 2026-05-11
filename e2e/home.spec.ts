import { takeNamedChromaticSnapshot } from './chromatic-helpers';
import { expect, test } from './fixtures';
import { waitForPageSettled } from './visual-stability';

test.describe('home page', () => {
  test('CTA navigates to trades page', async ({
    homePage,
    tradesPage,
  }, testInfo) => {
    await homePage.goto();

    await expect(homePage.heading).toBeVisible();

    await takeNamedChromaticSnapshot(
      homePage.page,
      'home-page-before-trade-cta',
      testInfo
    );

    await homePage.viewTradesLink.waitFor({ state: 'visible' });
    await Promise.all([
      homePage.page.waitForURL('**/trades'),
      homePage.viewTradesLink.click(),
    ]);

    await expect(homePage.page).toHaveURL(/\/trades$/);
    await expect(tradesPage.heading).toBeVisible();

    // Wait for the trades grid to finish rendering before the test ends —
    // Chromatic takes an implicit snapshot at end-of-test, and AG Grid mounts
    // its rows asynchronously after navigation. Without this wait the snapshot
    // can capture an empty grid body even though the data is present.
    await waitForPageSettled(homePage.page, { hasGrid: true });
  });
});
