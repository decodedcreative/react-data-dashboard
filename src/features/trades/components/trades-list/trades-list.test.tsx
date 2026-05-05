import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getTrades } from '@api';
import type { Trade } from '@types';
import { TradesList } from './trades-list';

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

vi.mock('@api', () => ({
  getTrades: vi.fn(),
}));

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const renderWithProvider = () => {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <TradesList />
    </QueryClientProvider>
  );
}

describe('TradesList', () => {
  beforeEach(() => {
    vi.mocked(getTrades).mockReset();
    vi.mocked(getTrades).mockImplementation(() => Promise.resolve(mockTrades));
  });

  it('renders listed trades after data loads', async () => {
    renderWithProvider();
    expect(screen.getByText('Loading trades...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    expect(screen.getByText(/AAPL/)).toBeInTheDocument();
    expect(screen.getByText(/— Buy —/)).toBeInTheDocument();
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
