import type { Trade } from '@types';
import type { DataGridColumnDef } from '@shared/components/data-grid';
import {
  formatTradeExecutedAt,
  formatTradePriceUsd,
  sideLabel,
} from '@features/trades/lib';

export const gridColumnDefs: DataGridColumnDef<Trade>[] = [
  { field: 'id', headerName: 'ID', maxWidth: 130, flex: 0 },
  {
    field: 'symbol',
    headerName: 'Symbol',
    cellRenderer: 'gridSymbolLinkCell',
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'side',
    headerName: 'Side',
    valueFormatter: ({ value }) =>
      value === 'buy' || value === 'sell' ? sideLabel(value) : '',
    maxWidth: 100,
    flex: 0,
  },
  {
    field: 'quantity',
    headerName: 'Qty',
    type: 'numericColumn',
    maxWidth: 110,
    flex: 0,
  },
  {
    field: 'price',
    headerName: 'Price',
    valueFormatter: formatTradePriceUsd,
    type: 'numericColumn',
    minWidth: 115,
  },
  {
    field: 'status',
    headerName: 'Status',
    maxWidth: 125,
    flex: 0,
  },
  { field: 'trader', headerName: 'Trader', minWidth: 130 },
  {
    field: 'executedAt',
    headerName: 'Executed',
    valueFormatter: formatTradeExecutedAt,
    minWidth: 170,
    flex: 1.5,
  },
];
