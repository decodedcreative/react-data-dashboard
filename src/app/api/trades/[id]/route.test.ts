import { describe, expect, it, vi } from 'vitest';
import { GET } from './route';

vi.mock('@features/trades/server/trades.db', () => ({
  getTradeByIdFromDb: vi.fn(),
}));

import { getTradeByIdFromDb } from '@features/trades/server/trades.db';

describe('GET /api/trades/[id]', () => {
  it('returns 404 when trade is not found', async () => {
    vi.mocked(getTradeByIdFromDb).mockResolvedValue(undefined);

    const response = await GET(new Request('http://localhost/api/trades/missing'), {
      params: Promise.resolve({ id: 'missing' }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Trade not found' });
  });
});

