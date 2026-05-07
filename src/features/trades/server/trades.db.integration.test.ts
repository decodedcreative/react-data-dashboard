import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@lib/db/prisma';
import { getTradeByIdFromDb, getTradesFromDb } from './trades.db';

const integrationIds = ['TRD-INT-001', 'TRD-INT-002'] as const;

describe('trades.db integration', () => {
  beforeAll(async () => {
    await prisma.trade.deleteMany({ where: { id: { in: [...integrationIds] } } });

    await prisma.trade.createMany({
      data: [
        {
          id: integrationIds[0],
          symbol: 'MSFT',
          side: 'buy',
          quantity: 10,
          price: 412.33,
          status: 'filled',
          trader: 'Integration Test',
          executedAt: new Date('2026-05-01T09:00:00Z'),
        },
        {
          id: integrationIds[1],
          symbol: 'NVDA',
          side: 'sell',
          quantity: 5,
          price: 901.15,
          status: 'pending',
          trader: 'Integration Test',
          executedAt: new Date('2026-05-01T10:00:00Z'),
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.trade.deleteMany({ where: { id: { in: [...integrationIds] } } });
  });

  it('returns a single trade by id from the database', async () => {
    const trade = await getTradeByIdFromDb(integrationIds[0]);

    expect(trade).toBeDefined();
    expect(trade?.id).toBe(integrationIds[0]);
    expect(trade?.symbol).toBe('MSFT');
  });

  it('returns undefined for unknown trade id', async () => {
    await expect(getTradeByIdFromDb('TRD-INT-MISSING')).resolves.toBeUndefined();
  });

  it('returns trades including integration records in descending executedAt order', async () => {
    const trades = await getTradesFromDb();
    const integrationTrades = trades.filter((trade) => integrationIds.includes(trade.id as (typeof integrationIds)[number]));

    expect(integrationTrades).toHaveLength(2);
    expect(integrationTrades.map((trade) => trade.id)).toEqual(['TRD-INT-002', 'TRD-INT-001']);
  });
});

