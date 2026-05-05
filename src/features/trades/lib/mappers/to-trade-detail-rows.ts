import { z } from 'zod';
import { sideLabel } from '../formatters';

const tradeForDetailRowsSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  side: z.enum(['buy', 'sell']),
  quantity: z.number(),
  price: z.number(),
  status: z.enum(['filled', 'pending', 'cancelled']),
  trader: z.string(),
  executedAt: z.string().datetime(),
});

export type TradeDetailRow = {
  label: string;
  value: string | number;
};

export const toTradeDetailRows = (input: unknown): TradeDetailRow[] => {
  const trade = tradeForDetailRowsSchema.parse(input);
  const executed = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(trade.executedAt));

  return [
    { label: 'Side', value: sideLabel(trade.side) },
    { label: 'Quantity', value: trade.quantity },
    { label: 'Price', value: trade.price.toFixed(2) },
    { label: 'Status', value: trade.status },
    { label: 'Trader', value: trade.trader },
    { label: 'Executed', value: executed },
  ];
};
