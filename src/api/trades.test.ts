import { afterEach, describe, expect, it, vi } from 'vitest';
import { getTradeById, getTrades } from './trades';

afterEach(() => {
  vi.useRealTimers();
});

describe('getTradeById', () => {
  it('returns the trade when id matches', async () => {
    const trade = await getTradeById('TRD-001');
    expect(trade).toBeDefined();
    expect(trade?.symbol).toBe('AAPL');
    expect(trade?.id).toBe('TRD-001');
  });

  it('returns undefined when id is unknown', async () => {
    expect(await getTradeById('unknown')).toBeUndefined();
  });
});

describe('getTrades', () => {
  it('returns a copy of seeded trades after delay', async () => {
    vi.useFakeTimers();
    const promise = getTrades();
    await vi.advanceTimersByTimeAsync(600);
    const list = await promise;

    expect(list).toHaveLength(2);
    expect(list.map((t) => t.symbol)).toEqual(['AAPL', 'TSLA']);

    list[0]!.symbol = 'mutated';
    const promise2 = getTrades();
    await vi.advanceTimersByTimeAsync(600);
    const again = await promise2;
    expect(again[0]!.symbol).toBe('AAPL');
  });
});
