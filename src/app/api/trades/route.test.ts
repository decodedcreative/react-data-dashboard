import { describe, expect, it, vi } from 'vitest';
import type { Trade } from '@types';
import { GET } from './route';

vi.mock('@features/trades/server/trades.db', () => ({
  getTradesFromDb: vi.fn(),
}));

import { getTradesFromDb } from '@features/trades/server/trades.db';

describe('GET /api/trades', () => {
  it('returns trades from the database', async () => {
    const trades: Trade[] = [
      {
        id: 'TRD-001',
        symbol: 'AAPL',
        side: 'buy',
        quantity: 120,
        price: 184.52,
        status: 'filled',
        trader: 'James Howell',
        executedAt: '2026-04-24T10:15:00.000Z',
      },
    ];
    vi.mocked(getTradesFromDb).mockResolvedValue(trades);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(trades);
  });

  it('returns 500 when fetching trades fails', async () => {
    vi.mocked(getTradesFromDb).mockRejectedValue(new Error('db down'));

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to fetch trades' });
  });
});

