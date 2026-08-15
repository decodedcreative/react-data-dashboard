import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getTrades, tradesKeys } from '@features/trades/client/trades.queries';
import type { Trade } from '@types';
import type { GridTradesProps } from './trades.grid';
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

const renderWithProvider = (props: GridTradesProps = {}) => {
  const queryClient = createTestQueryClient();

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <GridTrades {...props} />
      </QueryClientProvider>
    ),
    queryClient,
  };
};

/** Simulates a background refetch (window focus, invalidation) that fails. */
const failNextRefetch = async (queryClient: QueryClient) => {
  vi.mocked(getTrades).mockRejectedValue(new Error('trades unavailable'));

  await act(async () => {
    await queryClient.refetchQueries({ queryKey: tradesKeys.all });
  });
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

  it('renders the error state when the load fails and there is no data to show', async () => {
    vi.mocked(getTrades).mockRejectedValue(new Error('trades unavailable'));
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByText('Failed to load trades')).toBeInTheDocument();
    });
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('keeps the grid and warns when a refetch fails but rows are already loaded', async () => {
    const { queryClient } = renderWithProvider({ initialTrades: mockTrades });

    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    await failNextRefetch(queryClient);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Showing last known data');
    });
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.queryByText('Failed to load trades')).not.toBeInTheDocument();
  });

  it('clears the warning when a retry succeeds', async () => {
    const { queryClient } = renderWithProvider({ initialTrades: mockTrades });

    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    await failNextRefetch(queryClient);
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    vi.mocked(getTrades).mockResolvedValue(mockTrades);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});
