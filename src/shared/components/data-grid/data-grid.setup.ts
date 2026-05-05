'use client';

import {
  ClientSideRowModelModule,
  ModuleRegistry,
  NumberFilterModule,
  PaginationModule,
  TextFilterModule,
  provideGlobalGridOptions,
} from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';

const gridBaselineOptions: GridOptions = {
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
