'use client';

import { useEffect, useState } from 'react';
import { Button } from '@jigsaw-ds/design-system/button';
import { SearchField } from '@jigsaw-ds/design-system/search-field';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTrades, tradesKeys } from '@features/trades/client/trades.queries';
import { TradesMetrics } from '@features/trades/components/trades-metrics';
import {
  buildTradesCsv,
  downloadCsv,
  tradesCsvFilename,
} from '@features/trades/lib/export';
import { useGetClassNames } from '@hooks/use-get-class-names';
import { DataGrid } from '@shared/components/data-grid';
import type { DataGridGetRowId } from '@shared/components/data-grid';
import type { Trade } from '@types';
import { gridColumnDefs } from './column-defs';
import { GridSymbolLinkCell } from './symbol-link-cell';
import classNames from './trades.grid.styles';

export type GridTradesProps = {
  initialTrades?: Trade[];
};

const GRID_STALE_AFTER_PREFETCH_MS = 60_000;

const gridTradeRowId: DataGridGetRowId<Trade> = (params) => params.data.id;

export const GridTrades = ({ initialTrades }: GridTradesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: gridTrades,
    isLoading: gridIsLoading,
    error: gridError,
    isFetching: gridIsFetching,
    refetch: gridRefetch,
  } = useQuery({
    queryKey: tradesKeys.all,
    queryFn: getTrades,
    ...(initialTrades !== undefined
      ? { initialData: initialTrades, staleTime: GRID_STALE_AFTER_PREFETCH_MS }
      : {}),
  });

  const gridTradesClassNames = useGetClassNames(classNames);

  // Naive simulated real-time market updates:
  // Randomly modifies price & quantity on 25 random trades every 35ms (~28 ticks/sec),
  // allocating a brand new copy of the full trades array in React Query cache on each tick.
  useEffect(() => {
    if (!isLiveFeedActive) return;

    const intervalId = setInterval(() => {
      queryClient.setQueryData<Trade[]>(tradesKeys.all, (prev) => {
        if (!prev?.length) return prev;
        const next = [...prev];
        for (let i = 0; i < 25; i++) {
          const randomIndex = Math.floor(Math.random() * next.length);
          const trade = next[randomIndex];
          if (trade) {
            const priceDelta = (Math.random() - 0.5) * 3;
            const updatedPrice = Math.max(
              1,
              +(trade.price + priceDelta).toFixed(2)
            );
            const updatedQty = Math.max(
              10,
              trade.quantity + Math.floor((Math.random() - 0.5) * 30)
            );
            next[randomIndex] = {
              ...trade,
              price: updatedPrice,
              quantity: updatedQty,
            };
          }
        }
        return next;
      });
    }, 35);

    return () => clearInterval(intervalId);
  }, [isLiveFeedActive, queryClient]);

  if (gridIsLoading) return <div>Loading trades...</div>;

  // A failed refetch keeps the last known rows, so only fall back to the error
  // state when there is nothing left to show.
  if (!gridTrades?.length) {
    return gridError ? (
      <div>Failed to load trades</div>
    ) : (
      <div>No trades found</div>
    );
  }

  // Naive filter implementation on every render / keystroke
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const displayedTrades = normalizedSearch
    ? gridTrades.filter(
        (t) =>
          t.symbol.toLowerCase().includes(normalizedSearch) ||
          t.trader.toLowerCase().includes(normalizedSearch) ||
          t.id.toLowerCase().includes(normalizedSearch) ||
          t.status.toLowerCase().includes(normalizedSearch)
      )
    : gridTrades;

  // Naive: format every filtered row (including O(n²) VWAP / fill-rate scans)
  // synchronously on the main thread. React cannot paint or handle input until
  // the Blob is ready.
  const handleExportCsv = () => {
    const csv = buildTradesCsv(displayedTrades);
    downloadCsv(tradesCsvFilename(), csv);
  };

  return (
    <div className={gridTradesClassNames.component}>
      <TradesMetrics trades={displayedTrades} />

      {gridError ? (
        <div role="status" className={gridTradesClassNames.staleWarning}>
          <span>Couldn&rsquo;t refresh trades. Showing last known data.</span>
          <Button
            variant="outline"
            size="sm"
            onPress={() => void gridRefetch()}
            isDisabled={gridIsFetching}
          >
            {gridIsFetching ? 'Retrying...' : 'Retry'}
          </Button>
        </div>
      ) : null}

      <div className={gridTradesClassNames.toolbar}>
        <div className={gridTradesClassNames.searchWrapper}>
          <SearchField
            aria-label="Filter trades"
            placeholder="Search symbol, trader, status..."
            value={searchTerm}
            onChange={setSearchTerm}
            size="sm"
          />
        </div>

        <div className={gridTradesClassNames.controlsGroup}>
          <Button variant="outline" size="sm" onPress={handleExportCsv}>
            Export CSV
          </Button>
          {isLiveFeedActive ? (
            <span className={gridTradesClassNames.liveIndicator}>
              <span className={gridTradesClassNames.liveDot} />
              Streaming 25 updates / 35ms
            </span>
          ) : null}
          <Button
            variant={isLiveFeedActive ? 'primary' : 'outline'}
            size="sm"
            onPress={() => setIsLiveFeedActive((prev) => !prev)}
          >
            {isLiveFeedActive ? 'Stop Live Feed' : 'Start Live Feed'}
          </Button>
        </div>
      </div>

      <div className={gridTradesClassNames.grid}>
        <DataGrid<Trade>
          rowData={displayedTrades}
          columnDefs={gridColumnDefs}
          components={{ gridSymbolLinkCell: GridSymbolLinkCell }}
          getRowId={gridTradeRowId}
        />
      </div>
    </div>
  );
};

GridTrades.displayName = 'RDDB_Grid_Trades';
