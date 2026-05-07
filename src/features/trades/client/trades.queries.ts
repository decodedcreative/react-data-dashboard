import type { Trade } from '@types';
import { ApiClientError, apiFetch } from '@lib/api/client';
import { TradeSchema } from '@features/trades/schemas/trade';

export const tradesKeys = {
  all: ['trades'] as const,
  detail: (id: string) => ['trades', id] as const,
};

export function getTrades(): Promise<Trade[]> {
  return apiFetch('/api/trades', (payload) => TradeSchema.array().parse(payload));
}

export function getTradeById(id: string): Promise<Trade | undefined> {
  return apiFetch(`/api/trades/${id}`, (payload) => TradeSchema.parse(payload)).catch((error) => {
    if (isApiClientError(error) && error.status === 404) return undefined;
    throw error;
  });
}

function isApiClientError(error: unknown): error is ApiClientError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
  );
}

