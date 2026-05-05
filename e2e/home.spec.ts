import { takeNamedChromaticSnapshot } from './chromatic-helpers';
import { expect, test } from './fixtures';

test.describe('home page', () => {
  test('CTA navigates to trades page', async ({ homePage, tradesPage }, testInfo) => {
    await homePage.goto();

    await expect(homePage.heading).toBeVisible();

    await takeNamedChromaticSnapshot(
      homePage.page,
      'home-page-before-trade-cta',
      testInfo,
    );

    await homePage.viewTradesLink.waitFor({ state: 'visible' });
    await Promise.all([
      homePage.page.waitForURL('**/trades'),
      homePage.viewTradesLink.click(),
    ]);

    await expect(homePage.page).toHaveURL(/\/trades$/);
    await expect(tradesPage.heading).toBeVisible();
  });
});
