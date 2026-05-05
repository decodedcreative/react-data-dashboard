import type { Trade } from '@types';
import type { DataGridValueFormatterParams } from '@shared/components/data-grid';

export const formatTradePriceUsd = (
  p: DataGridValueFormatterParams<Trade>
): string => {
  if (p.value == null || typeof p.value !== 'number') return '';

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(p.value);
};

export const formatTradeExecutedAt = (
  p: DataGridValueFormatterParams<Trade>
): string => {
  const raw = p.value;
  if (typeof raw !== 'string' || raw.length === 0) return '';

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
