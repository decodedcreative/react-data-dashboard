import { expect, test as chromaticTestBase } from '@chromatic-com/playwright';
import { AppShellPage } from './pages/app-shell.page';
import { AboutPage } from './pages/about.page';
import { HomePage } from './pages/home.page';
import { TradeDetailPage } from './pages/trade-detail.page';
import { TradesPage } from './pages/trades.page';

type Fixtures = {
  appShellPage: AppShellPage;
  aboutPage: AboutPage;
  homePage: HomePage;
  tradesPage: TradesPage;
  tradeDetailPage: TradeDetailPage;
};

export const test = chromaticTestBase.extend<Fixtures>({
  appShellPage: async ({ page }, runFixture) => {
    await runFixture(new AppShellPage(page as never));
  },
  aboutPage: async ({ page }, runFixture) => {
    await runFixture(new AboutPage(page as never));
  },
  homePage: async ({ page }, runFixture) => {
    await runFixture(new HomePage(page as never));
  },
  tradesPage: async ({ page }, runFixture) => {
    await runFixture(new TradesPage(page as never));
  },
  tradeDetailPage: async ({ page }, runFixture) => {
    await runFixture(new TradeDetailPage(page as never));
  },
});

export { expect };
