import type { Locator, Page } from '@playwright/test';

export class TradeDetailPage {
  readonly page: Page;
  readonly aaplHeading: Locator;
  readonly tradeIdLabel: Locator;
  readonly tradeIdValue: Locator;
  readonly backToTradesLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.aaplHeading = page.getByRole('heading', { name: 'AAPL' });
    this.tradeIdLabel = page.getByText('Trade ID');
    this.tradeIdValue = page.getByText('TRD-001');
    this.backToTradesLink = page.getByRole('link', { name: '← Back to trades' });
  }

  async gotoMissingTrade() {
    return this.page.goto('/trades/TRD-999');
  }
}
