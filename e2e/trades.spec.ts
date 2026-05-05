import { takeNamedChromaticSnapshot } from './chromatic-helpers';
import { expect, test } from './fixtures';

test.describe('trades page', () => {
  test('loads core seeded data', async ({ tradesPage }) => {
    await tradesPage.goto();

    await expect(tradesPage.heading).toBeVisible();
    await expect(tradesPage.aaplLink).toBeVisible();
    await expect(tradesPage.tslaText).toBeVisible();
    await expect(tradesPage.aaplLink).toHaveAttribute('href', '/trades/TRD-001');
  });

  test('navigates from list to detail and back', async (
    { tradesPage, tradeDetailPage },
    testInfo,
  ) => {
    await tradesPage.goto();
    await tradesPage.openAaplTrade();

    await expect(tradesPage.page).toHaveURL('/trades/TRD-001');
    await expect(tradeDetailPage.aaplHeading).toBeVisible();
    await expect(tradeDetailPage.tradeIdLabel).toBeVisible();
    await expect(tradeDetailPage.tradeIdValue).toBeVisible();

    await takeNamedChromaticSnapshot(tradesPage.page, 'trade-detail-TRD-001', testInfo);

    await tradesPage.backToTradesLink.click();
    await expect(tradesPage.page).toHaveURL('/trades');
  });

  test('shows not-found page for unknown trade id', async ({ tradeDetailPage }) => {
    const response = await tradeDetailPage.gotoMissingTrade();

    expect(response?.status()).toBe(404);
    await expect(tradeDetailPage.page.getByText('This page could not be found.')).toBeVisible();
  });
});
