import { describe, expect, it, vi } from 'vitest';
import { syncTrades, type SyncLogger } from './sync';
import type { MappedTrade, TradeProvider } from './types';

const silentLogger: SyncLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
};

function makeTrade(overrides: Partial<MappedTrade> = {}): MappedTrade {
  return {
    externalId: 'ext-1',
    source: 'alpaca',
    symbol: 'AAPL',
    side: 'buy',
    quantity: '100',
    price: '150.00',
    status: 'filled',
    trader: 'Test',
    executedAt: new Date('2026-05-11T10:00:00Z'),
    ...overrides,
  };
}

function fakeProvider(trades: MappedTrade[]): TradeProvider {
  return {
    name: 'alpaca',
    async *fetchAll() {
      for (const t of trades) yield t;
    },
  };
}

describe('syncTrades', () => {
  it('upserts every trade emitted by the provider', async () => {
    const upsert = vi.fn().mockResolvedValue(undefined);
    const trades = [
      makeTrade({ externalId: 'ext-1' }),
      makeTrade({ externalId: 'ext-2', symbol: 'TSLA' }),
      makeTrade({ externalId: 'ext-3', symbol: 'MSFT' }),
    ];

    const result = await syncTrades({
      provider: fakeProvider(trades),
      prisma: { trade: { upsert } } as never,
      logger: silentLogger,
    });

    expect(result).toEqual({ fetched: 3, upserted: 3, errors: 0 });
    expect(upsert).toHaveBeenCalledTimes(3);
  });

  it('upserts using externalId as the unique key', async () => {
    const upsert = vi.fn().mockResolvedValue(undefined);
    await syncTrades({
      provider: fakeProvider([makeTrade({ externalId: 'ext-42' })]),
      prisma: { trade: { upsert } } as never,
      logger: silentLogger,
    });
    const call = upsert.mock.calls[0][0] as { where: { externalId: string } };
    expect(call.where).toEqual({ externalId: 'ext-42' });
  });

  it('continues past individual upsert failures and counts errors', async () => {
    const upsert = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('bad row'))
      .mockResolvedValueOnce(undefined);

    const result = await syncTrades({
      provider: fakeProvider([
        makeTrade({ externalId: 'a' }),
        makeTrade({ externalId: 'b' }),
        makeTrade({ externalId: 'c' }),
      ]),
      prisma: { trade: { upsert } } as never,
      logger: silentLogger,
    });

    expect(result).toEqual({ fetched: 3, upserted: 2, errors: 1 });
    expect(upsert).toHaveBeenCalledTimes(3);
  });

  it('returns zeros when the provider yields nothing', async () => {
    const upsert = vi.fn();
    const result = await syncTrades({
      provider: fakeProvider([]),
      prisma: { trade: { upsert } } as never,
      logger: silentLogger,
    });
    expect(result).toEqual({ fetched: 0, upserted: 0, errors: 0 });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('is idempotent — second call against same data only updates existing rows', async () => {
    // The orchestrator doesn't distinguish create vs update — Prisma's
    // upsert handles both. This test verifies the where clause stays
    // stable across runs so re-running converges on the same DB state.
    const upsert = vi.fn().mockResolvedValue(undefined);
    const provider = fakeProvider([makeTrade({ externalId: 'stable' })]);

    await syncTrades({
      provider,
      prisma: { trade: { upsert } } as never,
      logger: silentLogger,
    });
    await syncTrades({
      provider: fakeProvider([makeTrade({ externalId: 'stable' })]),
      prisma: { trade: { upsert } } as never,
      logger: silentLogger,
    });

    expect(upsert).toHaveBeenCalledTimes(2);
    const firstWhere = (upsert.mock.calls[0][0] as { where: unknown }).where;
    const secondWhere = (upsert.mock.calls[1][0] as { where: unknown }).where;
    expect(firstWhere).toEqual(secondWhere);
  });
});
