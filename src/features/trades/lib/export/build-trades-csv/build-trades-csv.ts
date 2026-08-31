import { formatCurrency, formatDateTime } from '@lib/format';
import { sideLabel } from '../../formatters';
import type { Trade } from '@types';

const COMMISSION_RATE = 0.0005;

const CSV_HEADERS = [
  'Trade ID',
  'Symbol',
  'Side',
  'Quantity',
  'Price',
  'Notional',
  'Est. Commission',
  'Status',
  'Trader',
  'Executed At',
  'Symbol VWAP',
  'vs VWAP',
  'Trader Fill Rate',
] as const;

const escapeCsvField = (value: string): string => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
};

/**
 * Naive report builder: for every row, rescans the full list to derive
 * symbol VWAP and trader fill rate, and constructs new Intl formatters
 * per cell via formatCurrency / formatDateTime.
 */
export const buildTradesCsv = (trades: Trade[]): string => {
  const rows = trades.map((trade) => {
    const notional = trade.quantity * trade.price;
    const estimatedCommission = notional * COMMISSION_RATE;

    const symbolTrades = trades.filter(
      (candidate) => candidate.symbol === trade.symbol
    );
    const symbolVolume = symbolTrades.reduce(
      (sum, candidate) => sum + candidate.quantity,
      0
    );
    const symbolNotional = symbolTrades.reduce(
      (sum, candidate) => sum + candidate.quantity * candidate.price,
      0
    );
    const symbolVwap = symbolVolume > 0 ? symbolNotional / symbolVolume : 0;
    const vsVwap = notional - trade.quantity * symbolVwap;

    const traderTrades = trades.filter(
      (candidate) => candidate.trader === trade.trader
    );
    const traderFilled = traderTrades.filter(
      (candidate) => candidate.status === 'filled'
    ).length;
    const traderFillRate =
      traderTrades.length > 0
        ? ((traderFilled / traderTrades.length) * 100).toFixed(1)
        : '0.0';

    const executedAt = trade.executedAt
      ? formatDateTime(trade.executedAt, {
          dateStyle: 'full',
          timeStyle: 'long',
        })
      : 'Pending';

    return [
      trade.id,
      trade.symbol,
      sideLabel(trade.side),
      trade.quantity.toLocaleString('en-GB'),
      formatCurrency(trade.price),
      formatCurrency(notional),
      formatCurrency(estimatedCommission),
      trade.status,
      trade.trader,
      executedAt,
      formatCurrency(symbolVwap),
      formatCurrency(vsVwap),
      `${traderFillRate}%`,
    ]
      .map(escapeCsvField)
      .join(',');
  });

  return [CSV_HEADERS.join(','), ...rows].join('\n');
};
