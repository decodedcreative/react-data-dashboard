import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getTrades } from '@features/trades/client/trades.queries';
import type { Trade } from '@types';
import { GridTrades } from './trades.grid';

const mockTrades: Trade[] = [
  {
    id: 'TRD-001',
    symbol: 'AAPL',
    side: 'buy',
    quantity: 120,
    price: 184.52,
    status: 'filled',
    trader: 'James Howell',
    executedAt: '2026-04-24T10:15:00Z',
  },
];

vi.mock('@features/trades/client/trades.queries', () => ({
  getTrades: vi.fn(),
  tradesKeys: { all: ['trades'] as const, detail: (id: string) => ['trades', id] as const },
}));

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
};

const renderWithProvider = () => {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <GridTrades />
    </QueryClientProvider>
  );
};

describe('GridTrades', () => {
  beforeEach(() => {
    vi.mocked(getTrades).mockReset();
    vi.mocked(getTrades).mockImplementation(() => Promise.resolve(mockTrades));
  });

  it('renders trades in data grid after data loads', async () => {
    renderWithProvider();
    expect(screen.getByText('Loading trades...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'AAPL' })).toBeInTheDocument();
    });
    expect(screen.getByText('Buy')).toBeInTheDocument();
    expect(screen.queryByText('No trades found')).not.toBeInTheDocument();
    expect(vi.mocked(getTrades)).toHaveBeenCalledTimes(1);
  });

  it('renders an empty-state message when no trades are returned', async () => {
    vi.mocked(getTrades).mockImplementation(() => Promise.resolve([]));
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByText('No trades found')).toBeInTheDocument();
    });
  });
});
