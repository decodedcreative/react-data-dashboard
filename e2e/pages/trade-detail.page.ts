import type { Locator, Page } from '@playwright/test';

export class TradeDetailPage {
  readonly page: Page;
  readonly aaplHeading: Locator;
  readonly tradeIdLabel: Locator;
  readonly tradeIdValue: Locator;

  constructor(page: Page) {
    this.page = page;
    this.aaplHeading = page.getByRole('heading', { name: 'AAPL' });
    this.tradeIdLabel = page.getByText('Trade ID');
    this.tradeIdValue = page.getByText('TRD-001');
  }

  async gotoMissingTrade() {
    return this.page.goto('/trades/TRD-999');
  }
}
