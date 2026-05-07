import { formatDateTime } from '@lib/format';
import { TradeSchema } from '@features/trades/schemas/trade';
import { sideLabel } from '../../formatters';

export type TradeDetailRow = {
  label: string;
  value: string | number;
};

export const toTradeDetailRows = (input: unknown): TradeDetailRow[] => {
  const trade = TradeSchema.parse(input);
  const executed = formatDateTime(trade.executedAt);

  return [
    { label: 'Side', value: sideLabel(trade.side) },
    { label: 'Quantity', value: trade.quantity },
    { label: 'Price', value: trade.price.toFixed(2) },
    { label: 'Status', value: trade.status },
    { label: 'Trader', value: trade.trader },
    { label: 'Executed', value: executed },
  ];
};

