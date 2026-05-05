'use client';

import Link from 'next/link';
import type { Trade } from '@types';
import type { DataGridCellRendererProps } from '@shared/components/data-grid';

export const GridSymbolLinkCell = (
  props: DataGridCellRendererProps<Trade, string>
) => {
  const trade = props.data;
  if (!trade) return null;

  return <Link href={`/trades/${trade.id}`}>{trade.symbol}</Link>;
};

GridSymbolLinkCell.displayName = 'RDDB_Grid_Symbol_Link_Cell';
