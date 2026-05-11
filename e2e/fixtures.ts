import { expect, test as chromaticTestBase } from '@chromatic-com/playwright';
import { AppShellPage } from './pages/app-shell.page';
import { AboutPage } from './pages/about.page';
import { HomePage } from './pages/home.page';
import { TradeDetailPage } from './pages/trade-detail.page';
import { TradesPage } from './pages/trades.page';
import { setupVisualStability } from './visual-stability';

type Fixtures = {
  /**
   * Auto-applied fixture that installs the frozen clock, request intercepts,
   * and animation-kill CSS before every test. See e2e/visual-stability.ts.
   *
   * Tests do not need to depend on this fixture explicitly; `auto: true`
   * ensures it runs for every test in the suite.
   */
  stablePageSetup: void;
  appShellPage: AppShellPage;
  aboutPage: AboutPage;
  homePage: HomePage;
  tradesPage: TradesPage;
  tradeDetailPage: TradeDetailPage;
};

export const test = chromaticTestBase.extend<Fixtures>({
  stablePageSetup: [
    async ({ page }, runFixture) => {
      await setupVisualStability(page as never);
      await runFixture();
    },
    { auto: true },
  ],
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
