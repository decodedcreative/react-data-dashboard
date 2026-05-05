import { expect, test } from './fixtures';

test.describe('home page', () => {
  test('CTA navigates to trades page', async ({ homePage, tradesPage }) => {
    await homePage.goto();

    await expect(homePage.heading).toBeVisible();

    await homePage.viewTradesLink.waitFor({ state: 'visible' });
    await Promise.all([
      homePage.page.waitForURL('**/trades'),
      homePage.viewTradesLink.click(),
    ]);

    await expect(homePage.page).toHaveURL(/\/trades$/);
    await expect(tradesPage.heading).toBeVisible();
  });
});
