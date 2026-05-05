import { expect, test } from './fixtures';

test.describe('global navigation', () => {
  test('shows nav links and active route on home', async ({ homePage, appShellPage }) => {
    await homePage.goto();

    await expect(appShellPage.homeNavLink).toHaveAttribute('aria-current', 'page');
    await expect(appShellPage.tradesNavLink).not.toHaveAttribute('aria-current', 'page');
    await expect(appShellPage.aboutNavLink).not.toHaveAttribute('aria-current', 'page');
  });

  test('updates active route on trades and about pages', async ({ appShellPage, tradesPage }) => {
    await tradesPage.goto();
    await expect(appShellPage.tradesNavLink).toHaveAttribute('aria-current', 'page');

    await appShellPage.page.goto('/about');
    await expect(appShellPage.aboutNavLink).toHaveAttribute('aria-current', 'page');
  });
});
