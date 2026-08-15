'use client';

import { Button } from '@jigsaw-ds/design-system/button';
import { useQuery } from '@tanstack/react-query';
import { getTrades, tradesKeys } from '@features/trades/client/trades.queries';
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

  if (gridIsLoading) return <div>Loading trades...</div>;

  // A failed refetch keeps the last known rows, so only fall back to the error
  // state when there is nothing left to show.
  if (!gridTrades?.length) {
    return gridError ? <div>Failed to load trades</div> : <div>No trades found</div>;
  }

  return (
    <div className={gridTradesClassNames.component}>
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
      <div className={gridTradesClassNames.grid}>
        <DataGrid<Trade>
          rowData={gridTrades}
          columnDefs={gridColumnDefs}
          components={{ gridSymbolLinkCell: GridSymbolLinkCell }}
          getRowId={gridTradeRowId}
        />
      </div>
    </div>
  );
};

GridTrades.displayName = 'RDDB_Grid_Trades';
