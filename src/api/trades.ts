import type { Trade } from '@types';

const tradesSeed: Trade[] = [
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

async function delay(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export async function getTrades(): Promise<Trade[]> {
  await delay();
  return tradesSeed.map((t) => ({ ...t }));
}

/** Single-trade lookup — no artificial delay so detail navigation stays snappy. */
export async function getTradeById(id: string): Promise<Trade | undefined> {
  return tradesSeed.find((t) => t.id === id);
}
