export type Trade = {
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    price: number;
    status: 'filled' | 'pending' | 'cancelled';
    trader: string;
    executedAt: string;
  };