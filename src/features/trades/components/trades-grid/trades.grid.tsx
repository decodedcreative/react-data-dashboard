'use client';

import { useQuery } from '@tanstack/react-query';
import { getTrades } from '@api';
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
  const { data: gridTrades, isLoading: gridIsLoading, error: gridError } = useQuery({
    queryKey: ['trades'],
    queryFn: getTrades,
    ...(initialTrades !== undefined
      ? { initialData: initialTrades, staleTime: GRID_STALE_AFTER_PREFETCH_MS }
      : {}),
  });

  const gridTradesClassNames = useGetClassNames(classNames);

  if (gridIsLoading) return <div>Loading trades...</div>;
  if (gridError) return <div>Failed to load trades</div>;
  if (!gridTrades?.length) return <div>No trades found</div>;

  return (
    <div className={gridTradesClassNames.grid}>
      <DataGrid<Trade>
        rowData={gridTrades}
        columnDefs={gridColumnDefs}
        components={{ gridSymbolLinkCell: GridSymbolLinkCell }}
        getRowId={gridTradeRowId}
      />
    </div>
  );
};

GridTrades.displayName = 'RDDB_Grid_Trades';
