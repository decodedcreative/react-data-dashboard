import type { Locator, Page } from '@playwright/test';

export class TradesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly aaplLink: Locator;
  readonly tslaText: Locator;
  readonly backToTradesLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Trades' });
    this.aaplLink = page.getByRole('link', { name: 'AAPL' });
    this.tslaText = page.getByText('TSLA');
    this.backToTradesLink = page.getByRole('link', { name: '← Back to trades' });
  }

  async goto() {
    await this.page.goto('/trades');
  }

  async openAaplTrade() {
    await this.aaplLink.waitFor({ state: 'visible' });
    await Promise.all([
      this.page.waitForURL('**/trades/TRD-001'),
      this.aaplLink.click(),
    ]);
  }
}
