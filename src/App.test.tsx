import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Trade } from '@types'
import { getTrades } from '@api'
import App from './App'

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
]

vi.mock('@api', () => ({
  getTrades: vi.fn(),
}))

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function renderWithProvider() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App', () => {
  beforeEach(() => {
    vi.mocked(getTrades).mockReset()
    vi.mocked(getTrades).mockImplementation(() => Promise.resolve(mockTrades))
  })

  it('renders the dashboard and listed trades after data loads', async () => {
    renderWithProvider()
    expect(screen.getByText('Loading trades...')).toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'React Data Dashboard' }),
      ).toBeInTheDocument()
    })

    expect(screen.getByText(/AAPL/)).toBeInTheDocument()
    expect(screen.getByText(/— Buy —/)).toBeInTheDocument()
    expect(vi.mocked(getTrades)).toHaveBeenCalledTimes(1)
  })
})
