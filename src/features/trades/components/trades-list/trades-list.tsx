'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getTrades } from '@api';
import { useGetClassNames } from '@hooks/useGetClassNames';
import { sideLabel } from '@features/trades/lib';
import type { Trade } from '@types';
import classNames from './trades-list.styles';

export type TradesListProps = {
  initialTrades?: Trade[];
};

const STALE_AFTER_PREFETCH_MS = 60_000;

export const TradesList = ({ initialTrades }: TradesListProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trades'],
    queryFn: getTrades,
    ...(initialTrades !== undefined
      ? { initialData: initialTrades, staleTime: STALE_AFTER_PREFETCH_MS }
      : {}),
  });

  const tradesListClassNames = useGetClassNames(classNames);

  if (isLoading) return <div>Loading trades...</div>;
  if (error) return <div>Failed to load trades</div>;

  return (
    <ul className={tradesListClassNames.list}>
      {data?.map((trade) => (
        <li key={trade.id} className={tradesListClassNames.listItem}>
          <Link href={`/trades/${trade.id}`} className={tradesListClassNames.symbolLink}>
            {trade.symbol}
          </Link>
          {' — '}
          {sideLabel(trade.side)} — {trade.quantity}
        </li>
      ))}
    </ul>
  );
}

TradesList.displayName = 'TradesList';
