'use client';

import { AgGridReact } from 'ag-grid-react';
import { useGetClassNames } from '@hooks/use-get-class-names';
import './data-grid.setup';
import classNames, { defaultContainerStyle } from './data-grid.styles';
import type { DataGridProps } from './data-grid.types';

export const DataGrid = <TData = unknown,>(props: DataGridProps<TData>) => {
  const dataGridClassNames = useGetClassNames(classNames);

  return (
    <AgGridReact<TData>
      {...props}
      className={dataGridClassNames.component}
      containerStyle={defaultContainerStyle}
    />
  );
};

DataGrid.displayName = 'RDDB_Data_Grid';
