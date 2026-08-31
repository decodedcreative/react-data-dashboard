import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDateTime } from '@lib/format';
import type { Trade } from '@types';
import { buildTradesCsv } from './build-trades-csv';

const mockTrades: Trade[] = [
  {
    id: 'TRD-001',
    symbol: 'AAPL',
    side: 'buy',
    quantity: 100,
    price: 100,
    status: 'filled',
    trader: 'Howell, James',
    executedAt: '2026-04-24T10:15:00Z',
  },
  {
    id: 'TRD-002',
    symbol: 'AAPL',
    side: 'sell',
    quantity: 100,
    price: 200,
    status: 'pending',
    trader: 'Sarah Khan',
    executedAt: null,
  },
];

describe('buildTradesCsv', () => {
  it('builds a header row and formatted trade rows', () => {
    const csv = buildTradesCsv(mockTrades);
    const [header, firstRow, secondRow] = csv.split('\n');

    expect(header).toBe(
      'Trade ID,Symbol,Side,Quantity,Price,Notional,Est. Commission,Status,Trader,Executed At,Symbol VWAP,vs VWAP,Trader Fill Rate'
    );

    const executed = formatDateTime(mockTrades[0]!.executedAt, {
      dateStyle: 'full',
      timeStyle: 'long',
    });

    // VWAP = (100*100 + 100*200) / 200 = 150
    expect(firstRow).toContain('TRD-001');
    expect(firstRow).toContain('AAPL');
    expect(firstRow).toContain('Buy');
    expect(firstRow).toContain(formatCurrency(100));
    expect(firstRow).toContain(formatCurrency(10_000));
    expect(firstRow).toContain(formatCurrency(5));
    expect(firstRow).toContain('"Howell, James"');
    expect(firstRow).toContain(executed);
    expect(firstRow).toContain(formatCurrency(150));
    expect(firstRow).toContain(formatCurrency(-5_000));
    expect(firstRow).toContain('100.0%');

    expect(secondRow).toContain('TRD-002');
    expect(secondRow).toContain('Sell');
    expect(secondRow).toContain('Pending');
    expect(secondRow).toContain('0.0%');
  });

  it('returns only headers when there are no trades', () => {
    expect(buildTradesCsv([])).toBe(
      'Trade ID,Symbol,Side,Quantity,Price,Notional,Est. Commission,Status,Trader,Executed At,Symbol VWAP,vs VWAP,Trader Fill Rate'
    );
  });
});
