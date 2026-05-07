import { describe, expect, it } from 'vitest';
import type { Trade } from '@types';
import { toTradeDetailRows } from './to-trade-detail-rows';

const mockTrade: Trade = {
  id: 'TRD-001',
  symbol: 'AAPL',
  side: 'buy',
  quantity: 120,
  price: 184.52,
  status: 'filled',
  trader: 'James Howell',
  executedAt: '2026-04-24T10:15:00Z',
};

describe('toTradeDetailRows', () => {
  it('maps trade to display rows', () => {
    const rows = toTradeDetailRows(mockTrade);
    const expectedExecuted = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(mockTrade.executedAt));

    expect(rows[0]).toEqual({ label: 'Side', value: 'Buy' });
    expect(rows[1]).toEqual({ label: 'Quantity', value: 120 });
    expect(rows[2]).toEqual({ label: 'Price', value: '184.52' });
    expect(rows[3]).toEqual({ label: 'Status', value: 'filled' });
    expect(rows[4]).toEqual({ label: 'Trader', value: 'James Howell' });
    expect(rows[5]).toEqual({ label: 'Executed', value: expectedExecuted });
  });

  it('throws for invalid trade input', () => {
    expect(() => toTradeDetailRows({ ...mockTrade, executedAt: 'invalid' })).toThrow();
  });
});

