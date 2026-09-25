import type { Locator, Page } from '@playwright/test';
import { waitForPageSettled } from '../visual-stability';

export class TradesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly aaplLink: Locator;
  readonly tslaText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Trades' });
    // Extra seed rows reuse AAPL/TSLA, so pin locators to the canonical trade ids.
    this.aaplLink = page
      .getByRole('row', { name: /TRD-001\b/ })
      .getByRole('link', { name: 'AAPL' });
    this.tslaText = page
      .getByRole('row', { name: /TRD-002\b/ })
      .getByText('TSLA', { exact: true });
  }

  async goto() {
    await this.page.goto('/trades');
    await waitForPageSettled(this.page, { hasGrid: true });
  }

  async openAaplTrade() {
    await this.aaplLink.waitFor({ state: 'visible' });
    await Promise.all([
      this.page.waitForURL('**/trades/TRD-001'),
      this.aaplLink.click(),
    ]);
    await waitForPageSettled(this.page);
  }
}
