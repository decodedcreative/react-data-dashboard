import type {
  ColDef,
  ValueFormatterParams,
  GridOptions,
  GetRowIdParams,
} from 'ag-grid-community';
import type { AgGridReactProps, CustomCellRendererProps } from 'ag-grid-react';

export type DataGridProps<TData = unknown> = Omit<
  AgGridReactProps<TData>,
  'className' | 'containerStyle'
>;

export type DataGridColumnDef<TData = unknown, TValue = unknown> = ColDef<
  TData,
  TValue
>;

export type DataGridValueFormatterParams<TData = unknown, TValue = unknown> =
  ValueFormatterParams<TData, TValue>;

export type DataGridCellRendererProps<
  TData = unknown,
  TValue = unknown,
  TContext = unknown,
> = CustomCellRendererProps<TData, TValue, TContext>;

export type DataGridDefaultOptions<TData = unknown> = Partial<GridOptions<TData>>;

export type DataGridGetRowId<TData> = (params: GetRowIdParams<TData>) => string;
