import type { Locator, Page } from '@playwright/test';

export class AppShellPage {
  readonly page: Page;
  readonly mainNav: Locator;
  readonly homeNavLink: Locator;
  readonly tradesNavLink: Locator;
  readonly aboutNavLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainNav = page.getByRole('navigation', { name: 'Main' });
    this.homeNavLink = this.mainNav.getByRole('link', { name: 'Home', exact: true });
    this.tradesNavLink = this.mainNav.getByRole('link', { name: 'Trades', exact: true });
    this.aboutNavLink = this.mainNav.getByRole('link', { name: 'About', exact: true });
  }
}
