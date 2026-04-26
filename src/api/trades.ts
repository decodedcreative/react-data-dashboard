import type { Trade } from '@types';

const trades: Trade[] = [
  {
    id: 'TRD-001',
    symbol: 'AAPL',
    side: 'buy',
    quantity: 120,
    price: 184.52,
    status: 'filled',
    trader: 'James Howell',
    executedAt: '2026-04-24T10:15:00Z',
  },
  {
    id: 'TRD-002',
    symbol: 'TSLA',
    side: 'sell',
    quantity: 50,
    price: 171.25,
    status: 'pending',
    trader: 'Sarah Khan',
    executedAt: '2026-04-24T11:05:00Z',
  },
];

export async function getTrades(): Promise<Trade[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return trades;
}