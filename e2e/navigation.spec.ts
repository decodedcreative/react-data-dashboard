import { takeNamedChromaticSnapshot } from './chromatic-helpers';
import { expect, test } from './fixtures';

test.describe('global navigation', () => {
  test('shows nav links and active route on home', async ({ homePage, appShellPage }) => {
    await homePage.goto();

    await expect(appShellPage.homeNavLink).toHaveAttribute('aria-current', 'page');
    await expect(appShellPage.tradesNavLink).not.toHaveAttribute('aria-current', 'page');
    await expect(appShellPage.aboutNavLink).not.toHaveAttribute('aria-current', 'page');
  });

  test('updates active route on trades and about pages', async (
    { aboutPage, appShellPage, tradesPage },
    testInfo,
  ) => {
    await tradesPage.goto();
    await expect(appShellPage.tradesNavLink).toHaveAttribute('aria-current', 'page');

    await aboutPage.goto();
    await expect(aboutPage.heading).toBeVisible();
    await expect(aboutPage.page.getByRole('main').getByRole('link', { name: 'Trades' })).toBeVisible();
    await expect(appShellPage.aboutNavLink).toHaveAttribute('aria-current', 'page');

    await takeNamedChromaticSnapshot(aboutPage.page, 'about-page', testInfo);
  });
});
