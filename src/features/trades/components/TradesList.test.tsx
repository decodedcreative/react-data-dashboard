import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Trade } from '@types';
import { getTrades } from '@api';

import { TradesList } from './TradesList';

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

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function renderWithProvider() {
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

  it('renders the trades list heading and listed trades after data loads', async () => {
    renderWithProvider();
    expect(screen.getByText('Loading trades...')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Trades' })
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/AAPL/)).toBeInTheDocument();
    expect(screen.getByText(/— Buy —/)).toBeInTheDocument();
    expect(vi.mocked(getTrades)).toHaveBeenCalledTimes(1);
  });

  it('refetches trades when the user clicks Refresh trades', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Refresh trades' })
      ).toBeInTheDocument();
    });

    expect(vi.mocked(getTrades)).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Refresh trades' }));

    await waitFor(() => {
      expect(vi.mocked(getTrades)).toHaveBeenCalledTimes(2);
    });
  });
});
