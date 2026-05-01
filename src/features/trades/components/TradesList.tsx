'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getTrades } from '@api';
import type { Trade } from '@types';
import { sideLabel } from '@/utils';

type TradesListProps = {
  initialTrades?: Trade[];
};

// SSR `initialData` is stale-by-default (`staleTime` 0) → extra refetch on mount without this window.
const STALE_AFTER_PREFETCH_MS = 60_000;

export function TradesList({ initialTrades }: TradesListProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['trades'],
    queryFn: getTrades,
    ...(initialTrades !== undefined
      ? { initialData: initialTrades, staleTime: STALE_AFTER_PREFETCH_MS }
      : {}),
  });

  if (isLoading) return <div>Loading trades...</div>;
  if (error) return <div>Failed to load trades</div>;

  return (
    <main>
      <header>
        <h1>Trades</h1>
        <button type="button" onClick={() => void refetch()}>
          Refresh trades
        </button>
      </header>

      <ul>
        {data?.map((trade) => (
          <li key={trade.id}>
            <Link href={`/trades/${trade.id}`}>{trade.symbol}</Link>
            {' — '}
            {sideLabel(trade.side)} — {trade.quantity}
          </li>
        ))}
      </ul>
    </main>
  );
}
