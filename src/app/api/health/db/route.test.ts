import { beforeEach, describe, expect, it, vi } from 'vitest';

const queryMock = vi.fn();

vi.mock('@lib/server/db', () => ({
  getDbPool: () => ({
    query: queryMock,
  }),
}));

import { GET } from './route';

describe('GET /api/health/db', () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it('returns ok=true when database query succeeds', async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(queryMock).toHaveBeenCalledWith('select 1');
  });

  it('returns 500 when database query fails', async () => {
    queryMock.mockRejectedValueOnce(new Error('db unavailable'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ ok: false, error: 'db unavailable' });
  });
});
