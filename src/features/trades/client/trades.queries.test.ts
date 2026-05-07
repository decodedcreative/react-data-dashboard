import { describe, expect, it, vi } from 'vitest';
import { getTradeById } from './trades.queries';

describe('getTradeById', () => {
  it('returns undefined for 404 responses', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Trade not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(getTradeById('missing')).resolves.toBeUndefined();

    fetchSpy.mockRestore();
  });
});

