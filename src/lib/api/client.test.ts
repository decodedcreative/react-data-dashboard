import { describe, expect, it, vi } from 'vitest';
import { apiFetch } from './client';

describe('apiFetch', () => {
  it('uses text fallback when JSON error parsing fails', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: vi.fn().mockResolvedValue('Database unavailable'),
    } as unknown as Response);

    try {
      await expect(apiFetch('/api/trades', (payload) => payload)).rejects.toMatchObject({
        message: 'Database unavailable',
        status: 500,
      });
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

