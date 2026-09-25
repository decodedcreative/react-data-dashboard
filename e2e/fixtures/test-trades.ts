/**
 * Test fixture trade rows.
 *
 * These rows exist solely so e2e tests have deterministic data to render
 * and navigate. They are inserted into the DB by `e2e/global-setup.ts`
 * before Playwright runs, and mocked by `e2e/visual-stability.ts` for
 * client-side request interception.
 *
 * **Not** intended as dev data — running `npm run sync:trades` against a
 * paper Alpaca account is the source of real trades for local development.
 *
 * The `source: 'seed'` value signals "test fixture" provenance in the DB.
 * `npm run sync:trades` only ever writes `source: 'alpaca'` rows, so seed
 * fixtures and synced data coexist without collisions.
 */

export interface TestTrade {
  id: string;
  source: 'seed';
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: 'filled' | 'pending' | 'cancelled';
  trader: string;
  executedAt: Date | null;
}

export const TEST_TRADES: readonly TestTrade[] = [
  {
    id: 'TRD-001',
    source: 'seed',
    symbol: 'AAPL',
    side: 'buy',
    quantity: 120,
    price: 184.52,
    status: 'filled',
    trader: 'James Howell',
    executedAt: new Date('2026-04-24T10:15:00Z'),
  },
  {
    id: 'TRD-002',
    source: 'seed',
    symbol: 'TSLA',
    side: 'sell',
    quantity: 50,
    price: 171.25,
    status: 'pending',
    trader: 'Sarah Khan',
    executedAt: null,
  },
] as const;

/**
 * Same data as TEST_TRADES but shaped to match the JSON-serialised shape
 * returned by `/api/trades` — used by `e2e/visual-stability.ts` for
 * `page.route()` interception.
 */
export const TEST_TRADES_API_SHAPE = TEST_TRADES.map((t) => ({
  id: t.id,
  symbol: t.symbol,
  side: t.side,
  quantity: t.quantity,
  price: t.price,
  status: t.status,
  trader: t.trader,
  executedAt: t.executedAt === null ? null : t.executedAt.toISOString(),
}));

export const TEST_TRADE_TRD_001 = TEST_TRADES_API_SHAPE[0];
