'use client';

import {
  ClientSideRowModelModule,
  ModuleRegistry,
  NumberFilterModule,
  PaginationModule,
  TextFilterModule,
  provideGlobalGridOptions,
  themeQuartz,
} from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';

/**
 * Quartz via Theming API, wired to app Tailwind token CSS variables.
 * Tune tokens in the app theme — this stays the grid's single theme entry.
 */
export const dataGridTheme = themeQuartz.withParams({
  backgroundColor: 'var(--color-white)',
  foregroundColor: 'var(--color-neutral-900)',
  borderColor: 'var(--color-neutral-200)',
  headerBackgroundColor: 'var(--color-neutral-50)',
  headerTextColor: 'var(--color-neutral-900)',
  selectedRowBackgroundColor:
    'color-mix(in srgb, var(--color-blue-500) 14%, transparent)',
  rowHoverColor: 'color-mix(in srgb, var(--color-neutral-900) 6%, transparent)',
  fontFamily: 'var(--font-sans)',
});

const gridBaselineOptions: GridOptions = {
  theme: dataGridTheme,
  animateRows: true,
  pagination: true,
  paginationPageSize: 10,
  paginationPageSizeSelector: false,
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 88,
  },
};

let hasInitializedGrid = false;

export const initDataGrid = () => {
  if (hasInitializedGrid) return;

  ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    PaginationModule,
    TextFilterModule,
    NumberFilterModule,
  ]);
  provideGlobalGridOptions(gridBaselineOptions, 'deep');

  hasInitializedGrid = true;
};

initDataGrid();
