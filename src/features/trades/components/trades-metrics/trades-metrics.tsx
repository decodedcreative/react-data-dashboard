'use client';

import type { Trade } from '@types';
import { formatCurrency } from '@lib/format';
import { useGetClassNames } from '@hooks/use-get-class-names';
import classNames from './trades-metrics.styles';

export type TradesMetricsProps = {
  trades: Trade[];
};

export const TradesMetrics = ({ trades }: TradesMetricsProps) => {
  const styles = useGetClassNames(classNames);

  // Naive unmemoized calculations performed on each render over the full array:
  const totalTrades = trades.length;
  const totalVolume = trades.reduce((sum, trade) => sum + trade.quantity, 0);
  const totalValue = trades.reduce(
    (sum, trade) => sum + trade.quantity * trade.price,
    0
  );
  const filledTrades = trades.filter(
    (trade) => trade.status === 'filled'
  ).length;
  const fillRate =
    totalTrades > 0 ? ((filledTrades / totalTrades) * 100).toFixed(1) : '0';

  // Buy vs. Sell volume distribution
  const buyVolume = trades
    .filter((trade) => trade.side === 'buy')
    .reduce((sum, trade) => sum + trade.quantity, 0);
  const buyShare =
    totalVolume > 0 ? ((buyVolume / totalVolume) * 100).toFixed(0) : '0';

  // Volume-Weighted Average Price (VWAP) calculation across symbols
  const symbolStats: Record<string, { volume: number; value: number }> = {};
  for (const trade of trades) {
    const stat = symbolStats[trade.symbol] ?? { volume: 0, value: 0 };
    stat.volume += trade.quantity;
    stat.value += trade.quantity * trade.price;
    symbolStats[trade.symbol] = stat;
  }

  // Top symbol by traded notional volume
  let topSymbol = '-';
  let topSymbolValue = 0;
  for (const [sym, stat] of Object.entries(symbolStats)) {
    if (stat.value > topSymbolValue) {
      topSymbolValue = stat.value;
      topSymbol = sym;
    }
  }

  // Price variance / standard deviation across all executions
  const meanPrice =
    totalTrades > 0
      ? trades.reduce((sum, t) => sum + t.price, 0) / totalTrades
      : 0;
  const variance =
    totalTrades > 0
      ? trades.reduce((sum, t) => sum + Math.pow(t.price - meanPrice, 2), 0) /
        totalTrades
      : 0;
  const stdDevPrice = Math.sqrt(variance);

  return (
    <div className={styles.container} aria-label="Trade Metrics">
      <div className={styles.card}>
        <div className={styles.label}>Total Trades</div>
        <div className={styles.value} data-testid="metric-total-trades">
          {totalTrades.toLocaleString()}
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.label}>Total Volume</div>
        <div className={styles.value} data-testid="metric-total-volume">
          {totalVolume.toLocaleString()} shares
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.label}>Total Value</div>
        <div className={styles.value} data-testid="metric-total-value">
          {formatCurrency(totalValue)}
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.label}>Fill Rate</div>
        <div className={styles.value} data-testid="metric-fill-rate">
          {fillRate}%
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.label}>Buy / Sell Bias</div>
        <div className={styles.value} data-testid="metric-buy-bias">
          {buyShare}% Buy
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.label}>Top Symbol / Volatility</div>
        <div className={styles.value} data-testid="metric-top-symbol">
          {topSymbol} (±${stdDevPrice.toFixed(1)})
        </div>
      </div>
    </div>
  );
};

TradesMetrics.displayName = 'RDDB_Trades_Metrics';
