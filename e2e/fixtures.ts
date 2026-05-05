import { test as base } from '@playwright/test';
import { AppShellPage } from './pages/app-shell.page';
import { HomePage } from './pages/home.page';
import { TradeDetailPage } from './pages/trade-detail.page';
import { TradesPage } from './pages/trades.page';

type Fixtures = {
  appShellPage: AppShellPage;
  homePage: HomePage;
  tradesPage: TradesPage;
  tradeDetailPage: TradeDetailPage;
};

export const test = base.extend<Fixtures>({
  appShellPage: async ({ page }, runFixture) => {
    await runFixture(new AppShellPage(page));
  },
  homePage: async ({ page }, runFixture) => {
    await runFixture(new HomePage(page));
  },
  tradesPage: async ({ page }, runFixture) => {
    await runFixture(new TradesPage(page));
  },
  tradeDetailPage: async ({ page }, runFixture) => {
    await runFixture(new TradeDetailPage(page));
  },
});

export { expect } from '@playwright/test';
