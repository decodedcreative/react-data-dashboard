'use client';

import {
  AllCommunityModule,
  ModuleRegistry,
  provideGlobalGridOptions,
} from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useGetClassNames } from '@hooks/use-get-class-names';
import classNames, { defaultContainerStyle } from './data-grid.styles';
import type { DataGridProps } from './data-grid.types';

const baselineGridOptions: GridOptions = {
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

ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions(baselineGridOptions, 'deep');

export const DataGrid = <TData = unknown,>(props: DataGridProps<TData>) => {
  const dataGridClassNames = useGetClassNames(classNames);
  const { containerStyle, ...rest } = props;

  return (
    <AgGridReact<TData>
      {...rest}
      className={dataGridClassNames.component}
      containerStyle={{
        ...defaultContainerStyle,
        ...containerStyle,
      }}
    />
  );
};

DataGrid.displayName = 'RDDB_Data_Grid';
